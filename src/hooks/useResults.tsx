import { useCallback, useMemo, useRef } from "react";

import { config } from "../config";
import type { AccountWithTwitter, TwitterSearchUser } from "../types";
import { http } from "../utils/http-request";
import { useRerender } from "./useRerender";
import { useSet } from "./useSet";

export type MastodonFlockResults = {
  accounts: AccountWithTwitter[];
  twitterUsers: TwitterSearchUser[];
};

const currentVersion = 1;

export function useResults() {
  const rerender = useRerender();

  const instanceUri = useRef<string>();
  const method = useRef<string>();
  const results = useRef<MastodonFlockResults>();
  const loadingAccountIds = useSet<string>();

  const deleteResults = useCallback(() => {
    sessionStorage.removeItem("version");
    sessionStorage.removeItem("instanceUri");
    sessionStorage.removeItem("method");
    sessionStorage.removeItem("results");
  }, []);

  const loadResults = useCallback(() => {
    const version = sessionStorage.getItem("version");
    if (version !== "1") {
      deleteResults();
      return false;
    }

    const sessionInstanceUri = sessionStorage.getItem("instanceUri");
    const sessionMethod = sessionStorage.getItem("method");
    const sessionResults = sessionStorage.getItem("results");
    if (
      typeof sessionInstanceUri !== "string" ||
      typeof sessionMethod !== "string" ||
      typeof sessionResults !== "string"
    ) {
      deleteResults();
      return false;
    }

    try {
      instanceUri.current = sessionInstanceUri;
      method.current = sessionMethod;
      results.current = JSON.parse(sessionResults);
      rerender();
    } catch (e) {
      deleteResults();
      return false;
    }

    return true;
  }, [deleteResults, rerender]);

  const saveResults = useCallback(() => {
    sessionStorage.setItem("version", String(currentVersion));
    sessionStorage.setItem("instanceUri", instanceUri.current ?? "");
    sessionStorage.setItem("method", method.current ?? "");
    sessionStorage.setItem("results", JSON.stringify(results.current));
  }, []);

  const setResults = useCallback(
    (
      newMethod: string,
      newInstanceUri: string,
      newResults: MastodonFlockResults,
    ) => {
      instanceUri.current = newInstanceUri;
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
      _: { origin: "internal" | "user" } = { origin: "user" },
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

      return true;
    },
    [loadingAccountIds, saveResults, rerender],
  );

  return useMemo(
    () => ({
      deleteResults,
      followUnfollow,
      get instanceUri() {
        return instanceUri.current;
      },
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
    [
      deleteResults,
      followUnfollow,
      loadResults,
      loadingAccountIds,
      saveResults,
      setResults,
    ],
  );
}
