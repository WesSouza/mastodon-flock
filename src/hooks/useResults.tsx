import { useCallback, useState } from "react";
import { config } from "../config";
import type { AccountWithTwitter, TwitterSearchUser } from "../types";

export type MastodonFlockResults = {
  accounts: AccountWithTwitter[];
  twitterUsers: TwitterSearchUser[];
};

const currentVersion = 1;

export function useResults() {
  const [results, setResults] = useState<MastodonFlockResults | undefined>(
    undefined,
  );
  const [loadingAccountIds, setLoadingAccountIds] = useState<string[]>([]);

  const loadResults = useCallback(() => {
    const version = sessionStorage.getItem("version");
    if (version !== "1") {
      sessionStorage.removeItem("version");
      sessionStorage.removeItem("results");
      return;
    }

    const resultsString = sessionStorage.getItem("results");
    if (!resultsString) {
      return;
    }

    setResults(JSON.parse(resultsString));
  }, []);

  const saveResults = useCallback((results: MastodonFlockResults) => {
    sessionStorage.setItem("version", String(currentVersion));
    sessionStorage.setItem("results", JSON.stringify(results));
    setResults(results);
  }, []);

  const followUnfollow = useCallback(
    async (accountId: string, operation: "follow" | "unfollow") => {
      try {
        setLoadingAccountIds((loadingAccountIds) => [
          ...loadingAccountIds,
          accountId,
        ]);
        const response = await fetch(config.urls.mastodonAccountFollow, {
          method: operation === "follow" ? "post" : "delete",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId }),
        });
        const data = (await response.json()) as { result: boolean };

        if (data.result && results) {
          saveResults({
            ...results,
            accounts: results?.accounts.map((account) =>
              account.id === accountId
                ? { ...account, following: operation === "follow" }
                : account,
            ),
          });
        }
      } catch (e) {
        console.error(e);
        alert("Unable to follow account.");
      } finally {
        setLoadingAccountIds((loadingAccountIds) =>
          loadingAccountIds.filter(
            (loadingAccountId) => loadingAccountId !== accountId,
          ),
        );
      }
    },
    [results],
  );

  return {
    followUnfollow,
    loadingAccountIds,
    loadResults,
    results,
    saveResults,
  };
}
