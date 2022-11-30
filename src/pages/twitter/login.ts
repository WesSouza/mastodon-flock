import type { APIRoute } from "astro";
import { TwitterApi } from "twitter-api-v2";

import { config } from "../../config";
import { Session } from "../../utils/session";

export const get: APIRoute = async function get(context) {
  const { redirect } = context;
  const client = new TwitterApi({
    appKey: import.meta.env.TWITTER_API_KEY,
    appSecret: import.meta.env.TWITTER_API_SECRET,
  });

  try {
    const {
      url: authUrl,
      oauth_token: oauthToken,
      oauth_token_secret: oauthTokenSecret,
    } = await client.generateAuthLink(config.urls.twitterReturn, {
      linkMode: "authorize",
    });

    const session = Session.withAstro(context);
    session.set("twitterOauthToken", oauthToken);
    session.set("twitterOauthTokenSecret", oauthTokenSecret);

    return redirect(authUrl, 302);
  } catch (e) {
    console.error(e);
    return redirect(`${config.urls.home}?error=twitterAuthError`, 302);
  }
};
