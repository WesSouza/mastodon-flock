import { useCallback, useMemo, useRef } from "react";

import { config } from "../config";
import type { AccountWithTwitter, TwitterSearchUser } from "../types";
import { http } from "../utils/http-request";
import { collect } from "../utils/plausible";
import { useRerender } from "./useRerender";
import { useSet } from "./useSet";

export type MastodonFlockResults = {
  accounts: AccountWithTwitter[];
  twitterUsers: TwitterSearchUser[];
};

const currentVersion = 1;

export function useResults() {
  const rerender = useRerender();

  const method = useRef<string>();
  const results = useRef<MastodonFlockResults>();
  const loadingAccountIds = useSet<string>();

  const loadResults = useCallback(() => {
    const version = sessionStorage.getItem("version");
    if (version !== "1") {
      sessionStorage.removeItem("version");
      sessionStorage.removeItem("method");
      sessionStorage.removeItem("results");
      return;
    }

    const sessionMethod = sessionStorage.getItem("method");
    if (!sessionMethod) {
      return;
    }

    const sessionResults = sessionStorage.getItem("results");
    if (!sessionResults) {
      return;
    }

    method.current = sessionMethod;
    results.current = JSON.parse(sessionResults);
    rerender();
  }, [rerender]);

  const saveResults = useCallback(() => {
    sessionStorage.setItem("version", String(currentVersion));
    sessionStorage.setItem("method", method.current ?? "");
    sessionStorage.setItem("results", JSON.stringify(results.current));
  }, []);

  const setResults = useCallback(
    (newMethod: string, newResults: MastodonFlockResults) => {
      method.current = newMethod;
      results.current = newResults;
      saveResults();
    },
    [saveResults],
  );

  const followUnfollow = useCallback(
    async (
      accountId: string,
      operation: "follow" | "unfollow",
      options: { origin: "internal" | "user" } = { origin: "user" },
    ) => {
      loadingAccountIds.add(accountId);

      const data = await http<{ result: string }>({
        url: config.urls.mastodonAccountFollow,
        method: operation === "follow" ? "post" : "delete",
        jsonBody: { accountId },
      });

      if ("error" in data) {
        console.error(data.error, data.reason);
        loadingAccountIds.delete(accountId);
        return false;
      }

      if (data.result && results.current && method) {
        results.current.accounts = results.current.accounts.map((account) =>
          account.id === accountId
            ? { ...account, following: operation === "follow" }
            : account,
        );
        saveResults();
        rerender();
      }

      loadingAccountIds.delete(accountId);

      if (options.origin !== "internal") {
        collect("Follow One", { Operation: operation });
      }

      return true;
    },
    [loadingAccountIds, saveResults, rerender],
  );

  return useMemo(
    () => ({
      followUnfollow,
      loadingAccountIds,
      loadResults,
      get method() {
        return method.current;
      },
      get results() {
        return results.current;
      },
      saveResults,
      setResults,
    }),
    [followUnfollow, loadResults, loadingAccountIds, saveResults, setResults],
  );
}
