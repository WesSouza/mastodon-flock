import type { APIRoute } from "astro";
import fetch from "node-fetch";
import { config } from "../../config";

import { APIPerson, mapApiPerson } from "../../utils/activity-pub";
import { responseJsonError } from "../../utils/http-response";
import { sign } from "../../utils/http-signature";
import type { WebFingerResource } from "../../utils/web-finger";
import { splitAccountParts } from "../../utils/web-finger";

export const get: APIRoute = async function get(context) {
  const { url } = context;
  const accountId = url.searchParams.get("account");
  if (typeof accountId !== "string" || !accountId) {
    return responseJsonError(400, "badAccountId");
  }

  const { hostname, account, email } = splitAccountParts(accountId);

  if (!hostname || !account) {
    return responseJsonError(400, "badAccountId");
  }

  const resource = encodeURIComponent(account);

  try {
    const webFingerResponse = await fetch(
      `https://${hostname}/.well-known/webfinger?resource=${resource}`,
      {
        headers: { Accept: "application/jrd+json" },
      },
    );
    if (webFingerResponse.status >= 500) {
      return responseJsonError(500, "remoteUserError");
    } else if (webFingerResponse.status >= 300) {
      return responseJsonError(404, "remoteUserNotFound");
    }

    const webFingerData = (await webFingerResponse.json()) as WebFingerResource;

    const personSelfLink = webFingerData?.links?.find(
      (link) =>
        link.rel === "self" && link.type === "application/activity+json",
    );

    if (
      !personSelfLink ||
      !personSelfLink.href ||
      !personSelfLink.href.startsWith("https://")
    ) {
      return responseJsonError(404, "remoteUserNotFound");
    }

    const signatureHeaders = sign({
      url: personSelfLink.href,
      keyId: `${config.urls.activityPubApp}#main-key`,
      method: "get",
      privateKey: config.activityPub.privateKey,
    });

    const personDataResponse = await fetch(personSelfLink.href, {
      headers: {
        Accept: "application/activity+json",
        ...signatureHeaders,
      },
    });
    if (personDataResponse.status >= 500) {
      return responseJsonError(500, "remoteUserError");
    } else if (personDataResponse.status >= 300) {
      return responseJsonError(404, "remoteUserNotFound");
    }

    const personData = (await personDataResponse.json()) as APIPerson;

    return new Response(
      JSON.stringify({
        account: mapApiPerson(personData, {
          lookedUpAccount: email ?? account,
        }),
      }),
      {
        headers: { "Content-type": "application/json" },
      },
    );
  } catch (e) {
    console.error(e);
    return responseJsonError(500, "unknownError");
  }
};
