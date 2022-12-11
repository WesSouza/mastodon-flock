import { useCallback, useMemo, useRef, useState } from "react";
import { config } from "../config";
import type {
  Account,
  AccountWithTwitter,
  MastodonFollowAccountResults,
  MastodonLookupAccountResult,
  SimpleError,
  TwitterSearchResults,
  TwitterSearchUser,
} from "../types";
import { http } from "../utils/http-request";
import { collect } from "../utils/plausible";

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

function removeIrrelevantTwitterUsers(
  twitterUsers: TwitterSearchUser[],
  accounts: AccountWithTwitter[],
) {
  const accountTwitterUsernames = new Set(
    accounts.map((account) => account.twitterUsername),
  );
  return twitterUsers.filter((twitterUser) =>
    accountTwitterUsernames.has(twitterUser.username),
  );
}

export function useMastodonFlock({
  onError,
  onResults,
}: {
  onError: (error: SimpleError) => void;
  onResults: (results: MastodonFlockResults) => void;
}) {
  const [status, setStatus] = useState("");
  const [subStatus, setSubStatus] = useState("");
  const [progress, setProgress] = useState(0);

  const abortController = useRef(new AbortController());
  const finished = useRef(false);

  const findBirdsAndMammoths = useCallback(
    async (options: { method: string }) => {
      try {
        setStatus("Reading Twitter...");
        setSubStatus("twitter.exe");

        const twitterFollowing = await http<TwitterSearchResults>({
          url: config.urls.twitterFollowing,
          signal: abortController.current.signal,
        });

        if ("error" in twitterFollowing) {
          onError(twitterFollowing);
          return;
        }
        setProgress(10);

        const { potentialEmails, potentialInstanceProfiles, twitterUsers } =
          twitterFollowing;

        const foundAccounts: AccountWithTwitter[] = [];
        const accountLookups: { account: string; twitterUsername: string }[] =
          [];

        if (options.method === "typical") {
          setStatus("Reading Mastodon Followers...");
          setSubStatus("mastodon.exe");

          const followingEmails = new Map<string, Account>();
          const followingUrls = new Map<string, Account>();
          const mastodonAccountFollowingUrl = new URL(
            config.urls.mastodonAccountFollowing,
          );

          while (true) {
            const mastodonAccountFollowing =
              await http<MastodonFollowAccountResults>({
                url: mastodonAccountFollowingUrl.href,
                signal: abortController.current.signal,
              });
            if ("error" in mastodonAccountFollowing) {
              onError(mastodonAccountFollowing);
              return;
            }
            setProgress(20);

            const { following, next } = mastodonAccountFollowing;

            following.forEach((followAccount) => {
              followingEmails.set(
                followAccount.account.toLowerCase(),
                followAccount,
              );
              followingUrls.set(followAccount.url.toLowerCase(), followAccount);
            });

            if (next) {
              mastodonAccountFollowingUrl.searchParams.set("next", next);
            } else {
              break;
            }
          }

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

          setStatus("Searching Mastodon Accounts...");

          let count = 0;
          const total = accountLookups.length;
          for (const accountLookup of accountLookups) {
            count += 1;
            setSubStatus(accountLookup.account);

            const mastodonAccountLookup =
              await http<MastodonLookupAccountResult>({
                url: config.urls.mastodonAccountLookup,
                searchParams: { account: accountLookup.account },
                signal: abortController.current.signal,
              });

            setProgress(Math.round(20 + 80 * (count / total)));
            if ("error" in mastodonAccountLookup) {
              if (mastodonAccountLookup.error === "aborted") {
                onError({ error: "aborted" });
                return;
              }
              continue;
            }

            foundAccounts.push({
              ...mastodonAccountLookup.account,
              twitterUsername: accountLookup.twitterUsername,
            });
          }

          finished.current = true;
          const accounts = dedupeAccounts(foundAccounts);
          collect("Finished", {
            "Found Count": accounts.length,
            "Potential Emails Count": potentialEmails.length,
            "Potential URLs Count": potentialInstanceProfiles.length,
          });
          onResults({
            accounts,
            twitterUsers: removeIrrelevantTwitterUsers(
              twitterUsers,
              foundAccounts,
            ),
          });
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
                onError({ error: "aborted" });
                return;
              }
              continue;
            }

            foundAccounts.push({
              ...activityPubAccountLookup.account,
              twitterUsername: accountLookup.twitterUsername,
            });
          }

          setProgress(100);

          if (foundAccounts.length < 1) {
            onError({ error: "noAccountsFound" });
            return;
          }

          finished.current = true;
          const accounts = dedupeAccounts(foundAccounts);
          collect("Finished", {
            "Found Count": accounts.length,
            "Potential Emails Count": potentialEmails.length,
            "Potential URLs Count": potentialInstanceProfiles.length,
          });
          onResults({ accounts, twitterUsers });
        }
      } catch (error) {
        onError({ error: "installationError", reason: error });
      }
    },
    [onError, onResults],
  );

  const cancel = useCallback(() => {
    if (finished.current) {
      return;
    }

    collect("Cancelled");
    abortController.current.abort();
    finished.current = true;
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
