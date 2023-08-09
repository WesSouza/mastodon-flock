import type { APIRoute } from "astro";
import { TwitterApi } from "twitter-api-v2";

import { config } from "../../config";
import { responseJsonError } from "../../utils/http-response";
import { Session } from "../../utils/session";

const currentWizardStep = "chooseMethod";

export const get: APIRoute = async function get(context) {
  if (Date.now() >= config.timeOfDeath) {
    return responseJsonError(500, "☠️");
  }

  const { redirect, url } = context;
  const client = new TwitterApi({
    appKey: import.meta.env.TWITTER_API_KEY,
    appSecret: import.meta.env.TWITTER_API_SECRET,
  });

  const method = url.searchParams.get("method");
  if (!method) {
    return redirect(
      `${config.urls.home}?step=${currentWizardStep}&error=missingMethod`,
      302,
    );
  }

  const returnUrl = new URL(config.urls.twitterReturn);
  returnUrl.searchParams.set("method", method);

  try {
    const {
      url: authUrl,
      oauth_token: oauthToken,
      oauth_token_secret: oauthTokenSecret,
    } = await client.generateAuthLink(returnUrl.href, {
      linkMode: "authorize",
    });

    const session = Session.withAstro(context);
    session.set("twitterOauthToken", oauthToken);
    session.set("twitterOauthTokenSecret", oauthTokenSecret);

    return redirect(authUrl, 302);
  } catch (e) {
    console.error(e);
    return redirect(
      `${config.urls.home}?step=${currentWizardStep}&error=twitterAuthError`,
      302,
    );
  }
};
