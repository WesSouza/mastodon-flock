import { useCallback, useMemo, useRef, useState } from "react";
import { config } from "../config";
import type {
  AccountWithTwitter,
  MastodonFollowAccountResults,
  MastodonLookupAccountResult,
  TwitterSearchResults,
} from "../types";
import { http } from "../utils/client-fetch";

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
      setStatus("Reading Twitter...");
      setSubStatus("twitter.exe");

      const twitterFollowing = await http<TwitterSearchResults>({
        url: config.urls.twitterFollowing,
        signal: abortController.current.signal,
      });

      if ("error" in twitterFollowing) {
        onError(twitterFollowing.error);
        return;
      }
      setProgress(25);

      const { potentialEmails, potentialInstanceProfiles, twitterUsers } =
        twitterFollowing;

      const foundAccounts: AccountWithTwitter[] = [];
      const accountLookups: { account: string; twitterUsername: string }[] = [];

      if (options.method === "typical") {
        setStatus("Searching Mastodon Followers...");
        setSubStatus("mastodon.exe");

        const mastodonAccountFollowing =
          await http<MastodonFollowAccountResults>({
            url: config.urls.mastodonAccountFollowing,
            signal: abortController.current.signal,
          });
        if ("error" in mastodonAccountFollowing) {
          onError(mastodonAccountFollowing.error);
          return;
        }
        setProgress(50);

        const { following } = mastodonAccountFollowing;

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
        const total = accountLookups.length;
        for (const accountLookup of accountLookups) {
          count += 1;
          setSubStatus(accountLookup.account);

          const mastodonAccountLookup = await http<MastodonLookupAccountResult>(
            {
              url: config.urls.mastodonAccountLookup,
              searchParams: { account: accountLookup.account },
              signal: abortController.current.signal,
            },
          );

          setProgress(Math.round(50 + 50 * (count / total)));
          if ("error" in mastodonAccountLookup) {
            if (mastodonAccountLookup.error === "aborted") {
              onError("aborted");
              return;
            }
            continue;
          }

          foundAccounts.push({
            ...mastodonAccountLookup.account,
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
        const total = accountLookups.length;
        for (const accountLookup of accountLookups) {
          count += 1;
          setSubStatus(accountLookup.account);

          const activityPubAccountLookup =
            await http<MastodonLookupAccountResult>({
              url: config.urls.activityPubAccountLookup,
              searchParams: { account: accountLookup.account },
              signal: abortController.current.signal,
            });

          setProgress(Math.round(25 + 75 * (count / total)));
          if ("error" in activityPubAccountLookup) {
            if (activityPubAccountLookup.error === "aborted") {
              onError("aborted");
              return;
            }
            continue;
          }

          foundAccounts.push({
            ...activityPubAccountLookup.account,
            twitterUsername: accountLookup.twitterUsername,
          });
        }

        setStatus("Fingering contacts...");
        setStatus("actipub.exe");
        setProgress(100);

        if (foundAccounts.length < 1) {
          onError("noAccountsFound");
          return;
        }

        onResults({ accounts: dedupeAccounts(foundAccounts), twitterUsers });
      }
    },
    [onError, onResults],
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
