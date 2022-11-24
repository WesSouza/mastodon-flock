import type { APIRoute } from "astro";

import { config } from "../../config";

export const get: APIRoute = async function get({ request }) {
  const url = new URL(request.url);
  const resource = url.searchParams.get("resource");

  console.log(request.url, request.headers);

  if (resource !== `acct:${config.activityPub.appUsername}@${config.host}`) {
    return new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }

  return new Response(
    JSON.stringify({
      subject: `acct:${config.activityPub.appUsername}@${config.host}`,
      aliases: [config.urls.activityPubApp],
      links: [
        {
          rel: "self",
          type: "application/activity+json",
          href: config.urls.activityPubApp,
        },
      ],
    }),
    {
      headers: {
        "Content-Type": "application/jrd+json; charset=utf-8",
      },
    },
  );
};
