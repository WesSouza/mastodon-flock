import type { APIRoute } from "astro";

import { config } from "../../config";

export const get: APIRoute = async function get({ redirect, request }) {
  console.log(request.url, request.headers);

  const acceptList = (request.headers.get("Accept") ?? "").split(/\s*,\s*/);
  if (
    !acceptList.some((accept) => accept.startsWith("application/activity+json"))
  ) {
    return redirect("/", 302);
  }

  return new Response(
    JSON.stringify({
      "@context": [
        "https://www.w3.org/ns/activitystreams",
        "https://w3id.org/security/v1",
        {
          manuallyApprovesFollowers: "as:manuallyApprovesFollowers",
          schema: "http://schema.org#",
        },
      ],
      id: config.urls.activityPubApp,
      type: "Application",
      inbox: `${config.urls.activityPubApp}/inbox`,
      outbox: `${config.urls.activityPubApp}/outbox`,
      preferredUsername: config.activityPub.appUsername,
      url: config.urls.home,
      manuallyApprovesFollowers: true,
      publicKey: {
        id: `${config.urls.activityPubApp}#main-key`,
        owner: config.urls.activityPubApp,
        publicKeyPem: config.activityPub.publicKey,
      },
    }),
    {
      headers: {
        "content-type": "application/activity+json; charset=utf-8",
      },
    },
  );
};
