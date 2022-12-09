import type { APIRoute } from "astro";
import mongoose from "mongoose";
import fetch from "node-fetch";

import { config } from "../../config";
import {
  FederatedInstance,
  IFederatedInstance,
} from "../../models/FederatedInstance";
import { Session } from "../../utils/session";
import { createEncryptor } from "../../utils/simple-encryptor";
import { statIncrement } from "../../utils/stats";

const currentWizardStep = "chooseMastodonInstance";

export const get: APIRoute = async function get(context) {
  const { redirect } = context;

  function redirectWithError(error: string) {
    const url = new URL(config.urls.home);
    url.searchParams.set("step", currentWizardStep);
    url.searchParams.set("method", "typical");
    if (uri) {
      url.searchParams.set("uri", uri);
    }
    if (error) {
      url.searchParams.set("error", error);
    }
    return redirect(url.toString(), 302);
  }

  const uri = context.url.searchParams.get("uri");

  if (
    typeof uri !== "string" ||
    !uri.match(/^[a-z0-9]+[a-z0-9\-\.]*\.[a-z0-9]{2,}$/)
  ) {
    return redirectWithError("invalidUri");
  }

  try {
    await mongoose.connect(import.meta.env.MONGODB_URI);
  } catch (e) {
    console.error(e);
    return redirectWithError("databaseConnectionError");
  }

  let query: mongoose.FilterQuery<IFederatedInstance>;
  if (uri.startsWith("www.")) {
    query = { $or: [{ uri: uri }, { uri: uri.replace(/^www\./, "") }] };
  } else {
    query = { $or: [{ uri: uri }, { uri: `www.${uri}` }] };
  }
  let federatedInstance = await FederatedInstance.findOne(query);

  const encryptor = createEncryptor(import.meta.env.MONGODB_DATA_SECRET);

  if (
    !federatedInstance ||
    !federatedInstance.app.clientId ||
    !federatedInstance.app.clientSecret
  ) {
    try {
      const wellKnownNodeInfoResponse = await fetch(
        `https://${uri}/.well-known/nodeinfo`,
        {
          headers: { Accept: "application/json" },
        },
      );
      const wellKnownNodeInfoData =
        (await wellKnownNodeInfoResponse.json()) as {
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
        return redirectWithError("incompatibleServer");
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
        return redirectWithError("badInstanceResponse");
      }

      if (nodeInfoData.software.name !== "mastodon") {
        console.error(
          `Unsupported software on ${uri}: ${nodeInfoData.software.name} (${nodeInfoData.software.version})`,
        );
        return redirectWithError("incompatibleServerSoftware");
      }

      const mastodonInstanceURL = new URL(
        "/api/v1/instance",
        nodeInfoLink.href,
      );
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
        return redirectWithError("badInstanceResponse");
      }

      const appDetails = new URLSearchParams();
      appDetails.set("client_name", config.name);
      appDetails.set("redirect_uris", config.urls.mastodonReturn);
      appDetails.set("scopes", "read:accounts read:follows write:follows");
      appDetails.set("website", config.urls.home);

      const mastodonCreateAppURL = new URL("/api/v1/apps", nodeInfoLink.href);
      const mastodonCreateAppResponse = await fetch(mastodonCreateAppURL.href, {
        headers: {
          Accept: "application/json",
        },
        method: "post",
        body: appDetails,
      });
      const mastodonCreateAppData =
        (await mastodonCreateAppResponse.json()) as {
          client_id?: string;
          client_secret?: string;
          vapid_key?: string;
        };

      if (
        typeof mastodonCreateAppData.client_id !== "string" ||
        typeof mastodonCreateAppData.client_secret !== "string" ||
        (mastodonCreateAppData.vapid_key &&
          typeof mastodonCreateAppData.vapid_key !== "string")
      ) {
        console.error(mastodonCreateAppData);
        return redirectWithError("mastodonAppCreationError");
      }

      const data: Omit<IFederatedInstance, "created"> = {
        name: mastodonInstanceData.title,
        uri: mastodonInstanceData.uri,
        instanceUrl: new URL("/", nodeInfoLink.href).href,
        app: {
          clientId: mastodonCreateAppData.client_id,
          clientSecret: encryptor.encrypt(mastodonCreateAppData.client_secret),
          vapidKey: mastodonCreateAppData.vapid_key
            ? encryptor.encrypt(mastodonCreateAppData.vapid_key)
            : undefined,
        },
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

      if (federatedInstance) {
        federatedInstance.set(data);
      } else {
        federatedInstance = new FederatedInstance({
          ...data,
          created: new Date(),
        });
      }

      statIncrement("appOnFederatedInstances");

      await federatedInstance.save();
    } catch (e) {
      console.error(e);
      return redirectWithError("mastodonAppCreationError");
    }
  }

  if (!federatedInstance.app.clientId || !federatedInstance.app.clientSecret) {
    return redirectWithError("theFuckDidMyDataGo");
  }

  const oauthUrl = new URL("/oauth/authorize", federatedInstance.instanceUrl);
  oauthUrl.searchParams.set("client_id", federatedInstance.app.clientId);
  oauthUrl.searchParams.set(
    "scope",
    "read:accounts read:follows write:follows",
  );
  oauthUrl.searchParams.set("redirect_uri", config.urls.mastodonReturn);
  oauthUrl.searchParams.set("response_type", "code");

  const session = Session.withAstro(context);
  session.set("mastodonUri", uri);

  return redirect(oauthUrl.href, 302);
};
