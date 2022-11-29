import type { APIRoute } from "astro";
import type { Response as FetchResponse } from "node-fetch";
import fetch from "node-fetch";

import { responseJsonError } from "../../utils/api";
import { Session } from "../../utils/session";

const makeHandler = (operation: "follow" | "unfollow"): APIRoute =>
  async function postOrDelete(context) {
    const session = Session.withAstro(context);
    const uri = session.get("mastodonUri");
    const instanceUrl = session.get("mastodonInstanceUrl");
    const mastodonAccessToken = session.get("mastodonAccessToken");

    if (!uri || !instanceUrl || !mastodonAccessToken) {
      session.reset();
      return responseJsonError(403, "missingMastodonSessionData");
    }

    const { request } = context;
    if (request.headers.get("Content-Type") !== "application/json") {
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

      return new Response(JSON.stringify({ result: "success" }), {
        headers: { "Content-type": "application/json" },
      });
    } catch (e) {
      console.error(e);
      return responseJsonError(500, "accountFollowError");
    }
  };

export const post = makeHandler("follow");

export const del = makeHandler("unfollow");
