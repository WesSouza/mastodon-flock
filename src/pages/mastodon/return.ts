import type { APIRoute } from "astro";
import mongoose from "mongoose";
import fetch from "node-fetch";

import { config } from "../../config";
import { FederatedInstance } from "../../models/FederatedInstance";
import { Session } from "../../utils/session";
import { createEncryptor } from "../../utils/simple-encryptor";
import { statIncrement } from "../../utils/stats";

const currentWizardStep = "chooseMastodonInstance";
const nextWizardStep = "loadingInformation";

export const get: APIRoute = async function get(context) {
  const { redirect: astroRedirect } = context;

  function redirect(error?: string) {
    const url = new URL(config.urls.home);
    url.searchParams.set("step", error ? currentWizardStep : nextWizardStep);
    url.searchParams.set("method", "typical");
    if (uri) {
      url.searchParams.set("uri", uri);
    }
    if (error) {
      url.searchParams.set("error", error);
    }
    return astroRedirect(url.toString(), 302);
  }

  const session = Session.withAstro(context);
  const uri = session.get("mastodonUri");

  if (!uri) {
    return redirect("missingMastodonSessionData");
  }

  const code = context.url.searchParams.get("code");

  if (typeof code !== "string" || !code.match(/^[\u0020-\u007e]+$/)) {
    return redirect("invalidOauthCode");
  }

  try {
    await mongoose.connect(import.meta.env.MONGODB_URI);
  } catch (e) {
    console.error(e);
    return redirect("databaseConnectionError");
  }

  const federatedInstance = await FederatedInstance.findOne({ uri });
  if (
    !federatedInstance ||
    !federatedInstance.app.clientId ||
    !federatedInstance.app.clientSecret
  ) {
    return redirect("unknownMastodonInstance");
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
      return redirect("badOauthTokenResponse");
    }

    session.set("mastodonAccessToken", oauthTokenData.access_token);

    statIncrement("mastodonLogins");

    return redirect();
  } catch (e) {
    console.error(e);
    return redirect("mastodonAuthError");
  }
};
