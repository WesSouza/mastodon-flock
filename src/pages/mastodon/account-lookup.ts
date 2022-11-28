import type { APIRoute } from "astro";
import fetch from "node-fetch";

import { responseJsonError } from "../../utils/api";
import { Session } from "../../utils/session";

export const get: APIRoute = async function get(context) {
  const { url } = context;

  const session = Session.withAstro(context);
  const uri = session.get("mastodonUri");
  const instanceUrl = session.get("mastodonInstanceUrl");
  const mastodonAccessToken = session.get("mastodonAccessToken");
  const account = url.searchParams.get("account");

  if (!uri || !instanceUrl || !mastodonAccessToken) {
    session.reset();
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
      const lookupData = (await lookupResponse.json()) as {
        id: string;
        account: string;
        username: string;
        display_name: string;
        followers_count: number;
        following_count: number;
        statuses_count: number;
        url: string;
        avatar: string;
      };

      return new Response(
        JSON.stringify({
          id: lookupData.id,
          account: lookupData.account,
          username: lookupData.username,
          displayName: lookupData.display_name,
          followersCount: lookupData.followers_count,
          followingCount: lookupData.following_count,
          statusesCount: lookupData.statuses_count,
          url: lookupData.url,
          avatarImageUrl: lookupData.avatar,
        }),
        {
          headers: { "Content-type": "application/json" },
        },
      );
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
