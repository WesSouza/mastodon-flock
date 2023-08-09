import type { APIRoute } from "astro";
import type { Response as FetchResponse } from "node-fetch";
import fetch from "node-fetch";

import { config } from "../../config";
import { responseJsonError } from "../../utils/http-response";
import { Session } from "../../utils/session";
import { statIncrement } from "../../utils/stats";

const makeHandler = (operation: "follow" | "unfollow"): APIRoute =>
  async function postOrDelete(context) {
    if (Date.now() >= config.timeOfDeath) {
      return responseJsonError(500, "☠️");
    }

    const session = Session.withAstro(context);
    const uri = session.get("mastodonUri");
    const instanceUrl = session.get("mastodonInstanceUrl");
    const mastodonAccessToken = session.get("mastodonAccessToken");

    if (!uri || !instanceUrl || !mastodonAccessToken) {
      session.set("mastodonUri", null);
      session.set("mastodonInstanceUrl", null);
      session.set("mastodonAccessToken", null);
      return responseJsonError(403, "missingMastodonSessionData");
    }

    const { request } = context;
    if (request.headers.get("content-type") !== "application/json") {
      return responseJsonError(400, "badRequest");
    }
    const body = (await request.json()) as { accountId?: string };
    const accountId = body.accountId;
    if (typeof accountId !== "string" || !accountId.match(/^\d+$/)) {
      return responseJsonError(403, "missingAccountId");
    }

    try {
      const followURL = new URL(
        `/api/v1/accounts/${accountId}/${operation}`,
        instanceUrl,
      ).href;

      const followingResponse: FetchResponse = await fetch(followURL, {
        method: "post",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${mastodonAccessToken}`,
        },
      });

      if (followingResponse.status !== 200) {
        console.error(await followingResponse.text());
        return responseJsonError(500, "errorFollowingAccount");
      }

      if (operation === "follow") {
        statIncrement("federatedAccountsFollowed");
      }

      return new Response(JSON.stringify({ result: "success" }), {
        headers: { "content-type": "application/json" },
      });
    } catch (e) {
      console.error(e);
      return responseJsonError(500, "accountFollowError");
    }
  };

export const post = makeHandler("follow");

export const del = makeHandler("unfollow");
