import type { APIRoute } from "astro";
import mongoose from "mongoose";
import fetch from "node-fetch";
import { config } from "../../config";

import {
  FederatedInstance,
  IFederatedInstance,
} from "../../models/FederatedInstance";
import { responseJsonError } from "../../utils/http-response";

async function crawlUri(uri: string) {
  try {
    const wellKnownNodeInfoResponse = await fetch(
      `https://${uri}/.well-known/nodeinfo`,
      {
        headers: { Accept: "application/json" },
      },
    );
    const wellKnownNodeInfoData = (await wellKnownNodeInfoResponse.json()) as {
      links: { rel: string; href: string }[];
    };

    const nodeInfoLink = wellKnownNodeInfoData.links.find(
      (link) =>
        link.rel.match(
          /http:\/\/nodeinfo\.diaspora\.software\/ns\/schema\/(1.0|1.1|2.0|2.1)/,
        ) && link.href.match(/^https:\/\//),
    );
    if (!nodeInfoLink) {
      console.error(`Unable to find nodeinfo data for ${uri}`);
      console.log(nodeInfoLink);
      return { error: "incompatibleServer" };
    }

    const nodeInfoResponse = await fetch(nodeInfoLink.href, {
      headers: { Accept: "application/json" },
    });
    const nodeInfoData = (await nodeInfoResponse.json()) as {
      software?: { name?: string; version?: string };
      usage?: { users?: { total?: number; activeMonth?: number } };
    };

    if (
      typeof nodeInfoData?.software?.name !== "string" ||
      typeof nodeInfoData?.software?.version !== "string"
    ) {
      console.error(`Invalid nodeinfo data from ${nodeInfoLink.href}`);
      return { error: "badInstanceResponse" };
    }

    if (nodeInfoData.software.name !== "mastodon") {
      console.error(
        `Unsupported software on ${uri}: ${nodeInfoData.software.name} (${nodeInfoData.software.version})`,
      );
      return { error: "incompatibleServerSoftware" };
    }

    const mastodonInstanceURL = new URL("/api/v1/instance", nodeInfoLink.href);
    const mastodonInstanceResponse = await fetch(mastodonInstanceURL.href, {
      headers: { Accept: "application/json" },
    });
    const mastodonInstanceData = (await mastodonInstanceResponse.json()) as {
      title?: string;
      uri?: string;
    };

    if (
      typeof mastodonInstanceData.title !== "string" ||
      typeof mastodonInstanceData.uri !== "string"
    ) {
      console.error(
        `Missing Mastodon title or uri on ${mastodonInstanceURL.href}`,
      );
      return { error: "badInstanceResponse" };
    }

    const data: Omit<IFederatedInstance, "app" | "created"> = {
      name: mastodonInstanceData.title,
      uri: mastodonInstanceData.uri,
      instanceUrl: new URL("/", nodeInfoLink.href).href,
      software: {
        name: nodeInfoData.software.name,
        version: nodeInfoData.software.version,
      },
      usage: {
        usersActiveMonth: nodeInfoData.usage?.users?.activeMonth,
        usersTotal: nodeInfoData.usage?.users?.total,
      },
      updated: new Date(),
    };

    return data;
  } catch (e) {
    console.error(e);
    return { error: "mastodonCrawlError" };
  }
}

export const post: APIRoute = async function post(context) {
  const uri = context.url.searchParams.get("uri");

  if (
    typeof uri !== "string" ||
    !uri.match(/^[a-z0-9]+[a-z0-9\-\.]*\.[a-z0-9]{2,}$/)
  ) {
    return responseJsonError(400, "invalidUri");
  }

  try {
    await mongoose.connect(import.meta.env.MONGODB_URI);
  } catch (e) {
    console.error(e);
    return responseJsonError(500, "databaseConnectionError");
  }

  let query: mongoose.FilterQuery<IFederatedInstance>;
  if (uri.startsWith("www.")) {
    query = { $or: [{ uri: uri }, { uri: uri.replace(/^www\./, "") }] };
  } else {
    query = { $or: [{ uri: uri }, { uri: `www.${uri}` }] };
  }
  let federatedInstance = await FederatedInstance.findOne(query);

  if (
    federatedInstance &&
    federatedInstance.updated.valueOf() >
      Date.now() - config.mastodon.minimumUpdateCacheInterval
  ) {
    return responseJsonError(403, "alreadyUpToDate");
  }

  const data = await crawlUri(uri);

  if ("error" in data) {
    return responseJsonError(500, data.error);
  }

  if (federatedInstance) {
    federatedInstance.set(data);
  } else {
    federatedInstance = new FederatedInstance({
      ...data,
      app: {
        clientId: undefined,
        clientSecret: undefined,
        vapidKey: undefined,
      },
      created: new Date(),
    });
  }

  await federatedInstance.save();

  return new Response(JSON.stringify({ result: "success" }), {
    headers: { "content-type": "application/json" },
  });
};
