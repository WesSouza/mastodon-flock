import type { APIRoute } from "astro";
import { TwitterApi } from "twitter-api-v2";
import { config } from "../../config";
import { Session } from "../../utils/session";

const nextWizardStep = "chooseMethod";

export const get: APIRoute = async function get(context) {
  const { redirect, request } = context;
  const url = new URL(request.url);
  const session = Session.withAstro(context);
  const sessionToken = session.get("twitterOauthToken");
  const sessionTokenSecret = session.get("twitterOauthTokenSecret");

  if (!sessionToken || !sessionTokenSecret) {
    session.reset();
    return redirect(`${config.urls.home}?error=missingTwitterSessionData`, 302);
  }

  const denied = url.searchParams.get("denied");
  if (denied) {
    session.reset();
    return redirect(config.urls.home, 302);
  }

  const oauthToken = url.searchParams.get("oauth_token");
  const oauthVerifier = url.searchParams.get("oauth_verifier");
  if (!oauthToken || !oauthVerifier) {
    session.reset();
    return redirect(`${config.urls.home}?error=missingTwitterState`, 302);
  }

  if (oauthToken !== sessionToken) {
    session.reset();
    return redirect(`${config.urls.home}?error=invalidTwitterState`, 302);
  }

  try {
    const client = new TwitterApi({
      appKey: import.meta.env.TWITTER_API_KEY,
      appSecret: import.meta.env.TWITTER_API_SECRET,
      accessToken: oauthToken,
      accessSecret: sessionTokenSecret,
    });

    const data = await client.login(oauthVerifier);

    session.set("twitterAccessToken", data.accessToken);
    session.set("twitterAccessSecret", data.accessSecret);

    return redirect(`${config.urls.home}?step=${nextWizardStep}`, 302);
  } catch (error) {
    console.error(error);
    return redirect(`${config.urls.home}?error=twitterAuthError`, 302);
  } finally {
    session.set("twitterOauthToken", null);
    session.set("twitterOauthTokenSecret", null);
  }
};
