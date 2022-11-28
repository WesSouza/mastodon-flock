import type { APIRoute } from "astro";
import mongoose from "mongoose";
import fetch from "node-fetch";

import { config } from "../../config";
import { FederatedInstance } from "../../models/FederatedInstance";
import { Session } from "../../utils/session";
import { createEncryptor } from "../../utils/simple-encryptor";

const currentWizardStep = "chooseMastodonInstance";
const nextWizardStep = "loadingInformation";

export const get: APIRoute = async function get(context) {
  const { redirect } = context;

  const session = Session.withAstro(context);
  const uri = session.get("mastodonUri");

  if (!uri) {
    session.reset();
    return redirect(
      `${config.urls.home}?step=${currentWizardStep}$errorCode=missingMastodonSessionData`,
      302,
    );
  }

  const code = context.url.searchParams.get("code");

  if (typeof code !== "string" || !code.match(/^[\u0020-\u007e]+$/)) {
    return redirect(
      `${config.urls.home}?step=${currentWizardStep}&errorCode=invalidOauthCode`,
      302,
    );
  }

  try {
    await mongoose.connect(import.meta.env.MONGODB_URI);
  } catch (e) {
    console.error(e);
    return redirect(
      `${config.urls.home}?step=${currentWizardStep}&errorCode=databaseConnectionError`,
      302,
    );
  }

  const federatedInstance = await FederatedInstance.findOne({ uri });
  if (
    !federatedInstance ||
    !federatedInstance.app.clientId ||
    !federatedInstance.app.clientSecret
  ) {
    session.reset();
    return redirect(
      `${config.urls.home}?step=${currentWizardStep}&errorCode=unknownMastodonInstance`,
      302,
    );
  }

  session.set("mastodonInstanceUrl", federatedInstance.instanceUrl);

  const encryptor = createEncryptor(import.meta.env.MONGODB_DATA_SECRET);

  try {
    const oauthTokenRequestURL = new URL(
      "/oauth/token",
      federatedInstance.instanceUrl,
    );

    const oauthTokenRequestData = new URLSearchParams();
    oauthTokenRequestData.set("client_id", federatedInstance.app.clientId);
    oauthTokenRequestData.set(
      "client_secret",
      encryptor.decrypt(federatedInstance.app.clientSecret),
    );
    oauthTokenRequestData.set("redirect_uri", config.urls.mastodonReturn);
    oauthTokenRequestData.set("grant_type", "authorization_code");
    oauthTokenRequestData.set("code", code);
    oauthTokenRequestData.set(
      "scope",
      "read:accounts read:follows write:follows",
    );

    const oauthTokenResponse = await fetch(oauthTokenRequestURL.href, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "post",
      body: oauthTokenRequestData,
    });

    const oauthTokenData = (await oauthTokenResponse.json()) as {
      access_token?: string;
      token_type?: string;
    };

    if (
      typeof oauthTokenData.access_token !== "string" ||
      oauthTokenData.token_type !== "Bearer"
    ) {
      console.error(oauthTokenData);
      return redirect(
        `${config.urls.home}?step=${currentWizardStep}&errorCode=badOauthTokenResponse`,
        302,
      );
    }

    session.set("mastodonAccessToken", oauthTokenData.access_token);

    return redirect(
      `${config.urls.home}?step=${nextWizardStep}&method=typical`,
      302,
    );
  } catch (e) {
    console.error(e);
    return redirect(
      `${config.urls.home}?step=${currentWizardStep}&errorCode=mastodonAuthError`,
      302,
    );
  }
};
