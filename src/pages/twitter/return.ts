import type { APIRoute } from "astro";
import { TwitterApi } from "twitter-api-v2";
import { config } from "../../config";
import { Session } from "../../utils/session";

export const get: APIRoute = async function get(context) {
  const { redirect, request } = context;
  const url = new URL(request.url);
  const client = new TwitterApi({
    clientId: import.meta.env.TWITTER_OAUTH_CLIENT_ID,
    clientSecret: import.meta.env.TWITTER_OAUTH_CLIENT_SECRET,
  });

  const session = Session.withAstro(context);
  const sessionCodeVerifier = session.get("twitterOauthCodeVerifier");
  const sessionState = session.get("twitterOauthState");

  if (!sessionCodeVerifier || !sessionState) {
    session.reset();
    return redirect(`${config.urls.home}?error=invalidSession`, 302);
  }

  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  if (!state || !code) {
    session.reset();
    return redirect(`${config.urls.home}?error=missingStateOrCode`, 302);
  }

  if (state !== sessionState) {
    session.reset();
    return redirect(`${config.urls.home}?error=invalidState`, 302);
  }

  try {
    const data = await client.loginWithOAuth2({
      code,
      codeVerifier: sessionCodeVerifier,
      redirectUri: config.urls.twitterReturn,
    });

    session.set("twitterAccessToken", data.accessToken);
    session.set("twitterOauthCodeVerifier", null);
    session.set("twitterOauthState", null);

    return redirect(`${config.urls.home}?state=twitterConnected`, 302);
  } catch (error) {
    console.error(error);
  }

  return redirect(`${config.urls.home}?error=authError`, 302);
};
