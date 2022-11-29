import { useCallback, useMemo, useRef, useState } from "react";
import { config } from "../config";
import type {
  AccountWithTwitter,
  APIResult,
  MastodonFollowAccountResults,
  MastodonLookupAccountResult,
  TwitterSearchResults,
} from "../types";

import type { MastodonFlockResults } from "./useResults";

function dedupeAccounts(accounts: AccountWithTwitter[]) {
  const ids = new Set<string>();
  return accounts.filter((account) => {
    if (ids.has(account.id)) {
      return false;
    }
    ids.add(account.id);
    return true;
  });
}

export function useMastodonFlock({
  onError,
  onResults,
}: {
  onError: (error: string) => void;
  onResults: (results: MastodonFlockResults) => void;
}) {
  const [status, setStatus] = useState("");
  const [subStatus, setSubStatus] = useState("");
  const [progress, setProgress] = useState(0);

  const abortController = useRef(new AbortController());

  const findBirdsAndMammoths = useCallback(
    async (options: { method: string }) => {
      try {
        setStatus("Reading Twitter...");
        setSubStatus("twitter.exe");
        const twitterFollowingResponse = await fetch(
          config.urls.twitterFollowing,
          {
            credentials: "same-origin",
            signal: abortController.current.signal,
          },
        );

        const twitterFollowingData =
          (await twitterFollowingResponse.json()) as APIResult<TwitterSearchResults>;
        if ("error" in twitterFollowingData) {
          onError(twitterFollowingData.error);
          return;
        }
        setProgress(25);

        const { potentialEmails, potentialInstanceProfiles, twitterUsers } =
          twitterFollowingData;

        const foundAccounts: AccountWithTwitter[] = [];
        const accountLookups: { account: string; twitterUsername: string }[] =
          [];

        if (options.method === "typical") {
          setStatus("Searching Mastodon Followers...");
          setSubStatus("mastodon.exe");

          const mastodonAccountFollowingResponse = await fetch(
            config.urls.mastodonAccountFollowing,
            {
              credentials: "same-origin",
              signal: abortController.current.signal,
            },
          );
          const mastodonAccountFollowingData =
            (await mastodonAccountFollowingResponse.json()) as APIResult<MastodonFollowAccountResults>;
          if ("error" in mastodonAccountFollowingData) {
            onError(mastodonAccountFollowingData.error);
            return;
          }
          setProgress(50);

          const { following } = mastodonAccountFollowingData;

          const followingEmails = new Map(
            following.map((followAccount) => [
              followAccount.account.toLowerCase(),
              followAccount,
            ]),
          );
          const followingUrls = new Map(
            following.map((followAccount) => [
              followAccount.url.toLowerCase(),
              followAccount,
            ]),
          );

          potentialEmails.forEach(({ email, twitterUsername }) => {
            const followingEmail = followingEmails.get(email.toLowerCase());
            if (followingEmail) {
              foundAccounts.push({
                ...followingEmail,
                twitterUsername,
              });
            } else {
              accountLookups.push({
                account: email,
                twitterUsername,
              });
            }
          });

          potentialInstanceProfiles.forEach(({ href, twitterUsername }) => {
            const followingUrl = followingUrls.get(href.toLowerCase());
            if (followingUrl) {
              foundAccounts.push({
                ...followingUrl,
                twitterUsername,
              });
            } else {
              accountLookups.push({
                account: href,
                twitterUsername,
              });
            }
          });

          setStatus("Searching Mastodon Account...");

          let count = 0;
          let total = accountLookups.length;
          for (const accountLookup of accountLookups) {
            count += 1;
            setSubStatus(accountLookup.account);

            const mastodonAccountLookupUrl = new URL(
              config.urls.mastodonAccountLookup,
            );
            mastodonAccountLookupUrl.searchParams.set(
              "account",
              accountLookup.account,
            );

            const mastodonAccountLookupResponse = await fetch(
              mastodonAccountLookupUrl,
              {
                credentials: "same-origin",
                signal: abortController.current.signal,
              },
            );
            const mastodonAccountLookupData =
              (await mastodonAccountLookupResponse.json()) as APIResult<MastodonLookupAccountResult>;

            setProgress(Math.round(50 + 50 * (count / total)));
            if ("error" in mastodonAccountLookupData) {
              continue;
            }

            foundAccounts.push({
              ...mastodonAccountLookupData.account,
              twitterUsername: accountLookup.twitterUsername,
            });
          }

          onResults({ accounts: dedupeAccounts(foundAccounts), twitterUsers });
        } else {
          potentialEmails.forEach(({ email, twitterUsername }) => {
            accountLookups.push({
              account: email,
              twitterUsername,
            });
          });

          potentialInstanceProfiles.forEach(({ href, twitterUsername }) => {
            accountLookups.push({
              account: href,
              twitterUsername,
            });
          });

          setStatus("Searching the Fediverse...");

          let count = 0;
          let total = accountLookups.length;
          for (const accountLookup of accountLookups) {
            count += 1;
            setSubStatus(accountLookup.account);

            const activityPubAccountLookupUrl = new URL(
              config.urls.activityPubAccountLookup,
            );
            activityPubAccountLookupUrl.searchParams.set(
              "account",
              accountLookup.account,
            );

            const activityPubAccountLookupResponse = await fetch(
              activityPubAccountLookupUrl,
              {
                credentials: "same-origin",
                signal: abortController.current.signal,
              },
            );
            const activityPubAccountLookupData =
              (await activityPubAccountLookupResponse.json()) as APIResult<MastodonLookupAccountResult>;

            setProgress(Math.round(25 + 75 * (count / total)));
            if ("error" in activityPubAccountLookupData) {
              continue;
            }

            foundAccounts.push({
              ...activityPubAccountLookupData.account,
              twitterUsername: accountLookup.twitterUsername,
            });
          }

          setStatus("Fingering contacts...");
          setStatus("actipub.exe");
          setProgress(100);

          onResults({ accounts: dedupeAccounts(foundAccounts), twitterUsers });
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") {
          onError("aborted");
        } else {
          console.error(e);
          onError("error");
        }
      }
    },
    [setStatus, setSubStatus, setProgress],
  );

  const cancel = useCallback(() => {
    abortController.current.abort();
  }, []);

  return useMemo(
    () => ({
      cancel,
      findBirdsAndMammoths,
      progress,
      status,
      subStatus,
    }),
    [cancel, findBirdsAndMammoths, progress, status, subStatus],
  );
}
