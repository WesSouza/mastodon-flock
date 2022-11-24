import type { APIRoute } from "astro";
import fetch from "node-fetch";
import { config } from "../../config";

import type { APerson } from "../../utils/activity-pub";
import { responseJsonError } from "../../utils/api";
import { sign } from "../../utils/httpSignature";
import type { WebFingerResource } from "../../utils/web-finger";
import { splitAccountParts } from "../../utils/web-finger";

export const get: APIRoute = async function get(context) {
  const { params } = context;
  const { accountId } = params;
  if (typeof accountId !== "string" || !accountId) {
    return responseJsonError(400, "badAccountId");
  }

  const { domain, username } = splitAccountParts(accountId);

  if (!domain || !username) {
    return responseJsonError(400, "badAccountId");
  }

  const resource = encodeURIComponent(`acct:${username}@${domain}`);

  const webFingerResponse = await fetch(
    `https://${domain}/.well-known/webfinger?resource=${resource}`,
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
    (link) => link.rel === "self" && link.type === "application/activity+json",
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
  console.log(signatureHeaders);

  const personDataResponse = await fetch(personSelfLink.href, {
    headers: {
      Accept: "application/activity+json",
      ...signatureHeaders,
    },
  });
  if (personDataResponse.status >= 500) {
    return responseJsonError(500, "remoteUserError");
  } else if (personDataResponse.status >= 300) {
    console.log(personDataResponse);

    return responseJsonError(404, "remoteUserNotFound");
  }

  const personData = (await personDataResponse.json()) as APerson;

  return {
    body: JSON.stringify({
      id: personData.id,
      type: personData.type,
      preferredUsername: personData.preferredUsername,
      name: personData.name,
      icon: personData.icon
        ? {
            type: personData.icon.type,
            mediaType: personData.icon.mediaType,
            url: personData.icon.url,
          }
        : undefined,
    }),
    headers: { "Content-Type": "application/json" },
  };
};
