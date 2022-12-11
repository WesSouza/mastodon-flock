import type { APIRoute } from "astro";
import type { Response as FetchResponse } from "node-fetch";
import fetch from "node-fetch";

import type { MastodonFollowAccountResults } from "../../types";
import { responseJsonError } from "../../utils/http-response";
import { getLinkHrefWithRel } from "../../utils/http-headers";
import { APIAccount, mapApiAccount } from "../../utils/mastodon";
import { Session } from "../../utils/session";

export const get: APIRoute = async function get(context) {
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

  const next = context.url.searchParams.get("next");
  if (next && !next.startsWith(instanceUrl)) {
    return responseJsonError(403, "badMastodonFollowingNextUrl");
  }

  try {
    const verifyCredentialsUrl = new URL(
      "/api/v1/accounts/verify_credentials",
      instanceUrl,
    );

    const verifyCredentialsResponse = await fetch(verifyCredentialsUrl.href, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${mastodonAccessToken}`,
      },
    });

    let accountId: string;
    if (verifyCredentialsResponse.status === 200) {
      const verifyCredentialsData =
        (await verifyCredentialsResponse.json()) as { id: string };

      accountId = verifyCredentialsData.id;
    } else {
      console.error(verifyCredentialsResponse);
      return responseJsonError(403, "invalidCredentials");
    }

    const followingURL = new URL(
      next ?? `/api/v1/accounts/${accountId}/following`,
      instanceUrl,
    ).href;

    const result: MastodonFollowAccountResults = { following: [] };

    const followingResponse: FetchResponse = await fetch(followingURL, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${mastodonAccessToken}`,
      },
    });

    if (followingResponse.status === 200) {
      const followingData = (await followingResponse.json()) as APIAccount[];

      result.following = followingData.map((followingAccount) =>
        mapApiAccount(followingAccount, { following: true, uri }),
      );

      const link = followingResponse.headers.get("link");
      result.next = link ? getLinkHrefWithRel(link, "next") : undefined;
    } else {
      return responseJsonError(500, "errorFetchingFollowing");
    }

    return new Response(JSON.stringify(result), {
      headers: {
        "cache-control": "no-cache",
        "content-type": "application/json",
      },
    });
  } catch (e) {
    console.error(e);
    return responseJsonError(500, "accountFollowingError");
  }
};
