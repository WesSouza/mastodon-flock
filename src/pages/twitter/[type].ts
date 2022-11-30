import type { APIRoute } from "astro";
import { TwitterApi } from "twitter-api-v2";

import { config } from "../../config";
import type {
  PotentialEmail,
  PotentialInstanceProfile,
  TwitterSearchResults,
} from "../../types";
import { responseJsonError } from "../../utils/http-response";
import {
  findPotentialInstanceProfilesFromTwitter,
  findPotentialUserEmails,
} from "../../utils/fediverse";
import { Session } from "../../utils/session";

const endpointTypes = new Set(["following", "followers"]);

export const get: APIRoute = async function get(context) {
  const { params } = context;
  if (!endpointTypes.has(params["type"] as string)) {
    return responseJsonError(404, "notFound");
  }

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
    const userId = (
      await client.v2.me({
        "user.fields": ["id"],
      })
    ).data.id;

    const response = await client.v2[
      params["type"] as "following" | "followers"
    ](userId, {
      asPaginator: true,
      max_results: config.twitter.maxResultsPerPage,
      "user.fields": [
        "name",
        "description",
        "url",
        "location",
        "entities",
        "profile_image_url",
      ],
      expansions: ["pinned_tweet_id"],
      "tweet.fields": ["text", "entities"],
    });

    const result: TwitterSearchResults = {
      twitterUsers: [],
      potentialEmails: [],
      potentialInstanceProfiles: [],
    };

    const potentialEmailsMap = new Map<string, PotentialEmail>();
    const potentialInstanceProfilesMap = new Map<
      string,
      PotentialInstanceProfile
    >();

    for await (const user of response) {
      let foundSomething = false;
      const { description, location, name, username, profile_image_url } = user;
      findPotentialUserEmails(name)
        .concat(findPotentialUserEmails(description))
        .concat(findPotentialUserEmails(location))
        .forEach((potentialEmail) => {
          potentialEmailsMap.set(potentialEmail.email, {
            ...potentialEmail,
            twitterUsername: username,
          });
          foundSomething = true;
        });

      findPotentialInstanceProfilesFromTwitter(user.entities?.url?.urls)
        .concat(
          findPotentialInstanceProfilesFromTwitter(
            user.entities?.description?.urls,
          ),
        )
        .concat(
          findPotentialInstanceProfilesFromTwitter(
            response.includes.pinnedTweet(user)?.entities?.urls,
          ),
        )
        .forEach(({ protocol: _, ...potentialInstance }) => {
          potentialInstanceProfilesMap.set(potentialInstance.href, {
            ...potentialInstance,
            twitterUsername: username,
          });
          foundSomething = true;
        });

      if (foundSomething) {
        result.twitterUsers.push({
          username,
          name,
          profileImageUrl: profile_image_url,
        });
      }
    }

    result.potentialEmails = Array.from(potentialEmailsMap.values());
    result.potentialInstanceProfiles = Array.from(
      potentialInstanceProfilesMap.values(),
    );

    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    };
  } catch (e) {
    console.error(e);
    return responseJsonError(500, "unknownError");
  }
};
