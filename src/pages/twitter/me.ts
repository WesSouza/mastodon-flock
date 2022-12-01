import type { APIRoute } from "astro";
import { TwitterApi } from "twitter-api-v2";

import { responseJsonError } from "../../utils/http-response";
import {
  findPotentialInstanceProfilesFromTwitter,
  findPotentialUserEmails,
} from "../../utils/fediverse";
import { Session } from "../../utils/session";

export const get: APIRoute = async function get(context) {
  const session = Session.withAstro(context);
  const accessToken = session.get("twitterAccessToken");
  const accessSecret = session.get("twitterAccessSecret");
  if (!accessToken || !accessSecret) {
    return responseJsonError(403, "notLoggedIn");
  }

  const client = new TwitterApi({
    appKey: import.meta.env.TWITTER_API_KEY,
    appSecret: import.meta.env.TWITTER_API_SECRET,
    accessToken,
    accessSecret,
  });

  try {
    const response = await client.v2.me({
      "user.fields": ["name", "description", "url", "location", "entities"],
    });

    const { data: user } = response;
    const { description, location, name, username } = user;
    const potentialEmails = findPotentialUserEmails(name)
      .concat(findPotentialUserEmails(description))
      .concat(findPotentialUserEmails(location));

    const potentialInstances = findPotentialInstanceProfilesFromTwitter(
      user.entities?.url?.urls,
    ).concat(
      findPotentialInstanceProfilesFromTwitter(
        user.entities?.description?.urls,
      ),
    );

    return new Response(
      JSON.stringify({
        item: {
          username,
          potentialEmails,
          potentialInstances,
        },
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (e) {
    console.error(e);
    return responseJsonError(500, "unknownError");
  }
};
