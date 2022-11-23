import type { APIRoute } from "astro";
import { TwitterApi } from "twitter-api-v2";

import { config } from "../../config";
import { Session } from "../../utils/session";

export const get: APIRoute = async function get(context) {
  const { redirect } = context;
  const client = new TwitterApi({
    clientId: import.meta.env.TWITTER_OAUTH_CLIENT_ID,
    clientSecret: import.meta.env.TWITTER_OAUTH_CLIENT_SECRET,
  });

  const {
    url: authUrl,
    codeVerifier,
    state,
  } = client.generateOAuth2AuthLink(`${config.urls.twitterReturn}`, {
    scope: ["tweet.read", "users.read", "follows.read", "offline.access"],
  });

  const session = Session.withAstro(context);
  session.set("twitterOauthCodeVerifier", codeVerifier);
  session.set("twitterOauthState", state);

  return redirect(authUrl, 302);
};
