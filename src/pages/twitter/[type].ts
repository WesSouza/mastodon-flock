import type { APIRoute } from "astro";
import { TwitterApi } from "twitter-api-v2";

import { config } from "../../config";
import { responseJsonError } from "../../utils/api";
import { Session } from "../../utils/session";

const endpointTypes = new Set(["following", "followers"]);

export const get: APIRoute = async function get(context) {
  const { params, url } = context;
  if (!endpointTypes.has(params["type"] as string)) {
    return responseJsonError(404, "notFound");
  }

  const userId = url.searchParams.get("userId");
  if (!userId) {
    return responseJsonError(400, "missingUserId");
  }

  const session = Session.withAstro(context);
  const accessToken = session.get("twitterAccessToken");
  if (!accessToken) {
    return responseJsonError(403, "notLoggedIn");
  }

  const client = new TwitterApi(accessToken);

  const response = await client.v2[params["type"] as "following" | "followers"](
    userId,
    {
      asPaginator: true,
      max_results: config.twitter.maxResultsPerPage,
      "user.fields": ["name", "description", "url", "location", "entities"],
      expansions: ["pinned_tweet_id"],
      "tweet.fields": ["text", "entities"],
    },
  );

  for await (const user of response) {
    console.log(
      user.username,
      user.pinned_tweet_id,
      response.includes.pinnedTweet(user),
    );
  }

  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify("ok"),
  };
};
