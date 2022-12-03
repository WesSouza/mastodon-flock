import type { APIRoute } from "astro";
import fetch from "node-fetch";
import type { MastodonLookupAccountResult } from "../../types";

import { responseJsonError } from "../../utils/http-response";
import { APIAccount, mapApiAccount } from "../../utils/mastodon";
import { Session } from "../../utils/session";

export const get: APIRoute = async function get(context) {
  const { url } = context;

  const session = Session.withAstro(context);
  const uri = session.get("mastodonUri");
  const instanceUrl = session.get("mastodonInstanceUrl");
  const mastodonAccessToken = session.get("mastodonAccessToken");
  const account = url.searchParams.get("account");

  if (!uri || !instanceUrl || !mastodonAccessToken) {
    session.set("mastodonUri", null);
    session.set("mastodonInstanceUrl", null);
    session.set("mastodonAccessToken", null);
    return responseJsonError(403, "missingMastodonSessionData");
  }

  if (!account) {
    return responseJsonError(404, "missingAccount");
  }

  try {
    const lookupURL = new URL("/api/v1/accounts/lookup", instanceUrl);
    lookupURL.searchParams.set("acct", account);
    lookupURL.searchParams.set("skip_webfinger", "false");

    const lookupResponse = await fetch(lookupURL.href, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${mastodonAccessToken}`,
      },
    });

    if (lookupResponse.status === 200) {
      const lookupData = (await lookupResponse.json()) as APIAccount;

      const responseData: MastodonLookupAccountResult = {
        account: mapApiAccount(lookupData, { following: false, uri }),
      };

      return new Response(JSON.stringify(responseData), {
        headers: {
          "cache-control": "no-cache",
          "content-type": "application/json",
        },
      });
    }

    if (lookupResponse.status === 404) {
      return responseJsonError(404, "accountNotFound");
    }

    return responseJsonError(500, "lookupError");
  } catch (e) {
    console.error(e);
    return responseJsonError(500, "lookupError");
  }
};
