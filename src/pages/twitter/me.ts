import type { APIRoute } from "astro";
import { TwitterApi } from "twitter-api-v2";

import { responseJsonError } from "../../utils/api";
import { Session } from "../../utils/session";

export const get: APIRoute = async function get(context) {
  const session = Session.withAstro(context);
  const accessToken = session.get("twitterAccessToken");
  const accessSecret = session.get("twitterAccessSecret");
  if (!accessToken || !accessSecret) {
    return {
      status: 403,
      statusText: "Forbidden",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "notLoggedIn" }),
    };
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
      expansions: ["pinned_tweet_id"],
      "tweet.fields": ["text", "entities"],
    });

    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response.data),
    };
  } catch (e) {
    console.error(e);
    return responseJsonError(500, "unknownError");
  }
};
