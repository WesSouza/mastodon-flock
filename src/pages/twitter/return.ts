import type { APIRoute } from "astro";
import { TwitterApi } from "twitter-api-v2";

import { config } from "../../config";
import { responseJsonError } from "../../utils/http-response";
import { Session } from "../../utils/session";
import { statIncrement } from "../../utils/stats";

const currentWizardStep = "chooseMethod";
const nextWizardSteps: Record<string, string> = {
  typical: "chooseMastodonInstance",
  advanced: "loadingInformation",
};

export const get: APIRoute = async function get(context) {
  if (Date.now() >= config.timeOfDeath) {
    return responseJsonError(500, "☠️");
  }

  const { redirect, request } = context;
  const url = new URL(request.url);
  const session = Session.withAstro(context);
  const sessionToken = session.get("twitterOauthToken");
  const sessionTokenSecret = session.get("twitterOauthTokenSecret");

  if (!sessionToken || !sessionTokenSecret) {
    return redirect(
      `${config.urls.home}?step=${currentWizardStep}&error=missingTwitterSessionData`,
      302,
    );
  }

  const method = url.searchParams.get("method");
  if (!method || !(method in nextWizardSteps)) {
    session.set("twitterOauthToken", null);
    session.set("twitterOauthTokenSecret", null);
    return redirect(
      `${config.urls.home}?step=${currentWizardStep}&error=missingMethod`,
      302,
    );
  }

  const denied = url.searchParams.get("denied");
  if (denied) {
    session.set("twitterOauthToken", null);
    session.set("twitterOauthTokenSecret", null);
    return redirect(`${config.urls.home}?step=${currentWizardStep}`, 302);
  }

  const oauthToken = url.searchParams.get("oauth_token");
  const oauthVerifier = url.searchParams.get("oauth_verifier");
  if (!oauthToken || !oauthVerifier) {
    return redirect(
      `${config.urls.home}?step=${currentWizardStep}&error=missingTwitterState`,
      302,
    );
  }

  if (oauthToken !== sessionToken) {
    session.set("twitterOauthToken", null);
    session.set("twitterOauthTokenSecret", null);
    return redirect(
      `${config.urls.home}?step=${currentWizardStep}&error=invalidTwitterState`,
      302,
    );
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

    statIncrement("twitterLogins");

    return redirect(
      `${config.urls.home}?step=${
        nextWizardSteps[method]
      }&method=${encodeURIComponent(method)}`,
      302,
    );
  } catch (error) {
    console.error(error);
    return redirect(
      `${config.urls.home}?step=${currentWizardStep}&error=twitterAuthError`,
      302,
    );
  } finally {
    session.set("twitterOauthToken", null);
    session.set("twitterOauthTokenSecret", null);
  }
};
