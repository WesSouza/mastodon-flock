import { useCallback, useState } from "react";
import { config } from "../config";
import type { AccountWithTwitter, TwitterSearchUser } from "../types";
import { http } from "../utils/client-fetch";

export type MastodonFlockResults = {
  accounts: AccountWithTwitter[];
  twitterUsers: TwitterSearchUser[];
};

const currentVersion = 1;

export function useResults() {
  const [method, setMethod] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<MastodonFlockResults | undefined>(
    undefined,
  );
  const [loadingAccountIds, setLoadingAccountIds] = useState<string[]>([]);

  const loadResults = useCallback(() => {
    const version = sessionStorage.getItem("version");
    if (version !== "1") {
      sessionStorage.removeItem("version");
      sessionStorage.removeItem("method");
      sessionStorage.removeItem("results");
      return;
    }

    const method = sessionStorage.getItem("method");
    if (!method) {
      return;
    }

    const resultsString = sessionStorage.getItem("results");
    if (!resultsString) {
      return;
    }

    setMethod(method);
    setResults(JSON.parse(resultsString));
  }, []);

  const saveResults = useCallback(
    (method: string, results: MastodonFlockResults) => {
      sessionStorage.setItem("version", String(currentVersion));
      sessionStorage.setItem("method", method);
      sessionStorage.setItem("results", JSON.stringify(results));
      setResults(results);
    },
    [],
  );

  const setLoadingAccountId = useCallback(
    (accountId: string, loading: boolean) => {
      if (loading) {
        setLoadingAccountIds((loadingAccountIds) => [
          ...loadingAccountIds,
          accountId,
        ]);
      } else {
        setLoadingAccountIds((loadingAccountIds) =>
          loadingAccountIds.filter(
            (loadingAccountId) => loadingAccountId !== accountId,
          ),
        );
      }
    },
    [],
  );

  const followUnfollow = useCallback(
    async (accountId: string, operation: "follow" | "unfollow") => {
      setLoadingAccountId(accountId, true);

      const data = await http<{ result: string }>({
        url: config.urls.mastodonAccountFollow,
        method: operation === "follow" ? "post" : "delete",
        jsonBody: { accountId },
      });

      if ("error" in data) {
        console.error(data.error, data.reason);
        setLoadingAccountId(accountId, false);
        return false;
      }

      if (data.result && results && method) {
        saveResults(method, {
          ...results,
          accounts: results?.accounts.map((account) =>
            account.id === accountId
              ? { ...account, following: operation === "follow" }
              : account,
          ),
        });
      }

      setLoadingAccountId(accountId, false);
      return true;
    },
    [method, results, saveResults, setLoadingAccountId],
  );

  return {
    followUnfollow,
    loadingAccountIds,
    loadResults,
    method,
    results,
    saveResults,
  };
}
