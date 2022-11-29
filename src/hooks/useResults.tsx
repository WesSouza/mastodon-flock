import { useCallback, useState } from "react";
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

  return {
    results,
    loadResults,
    saveResults,
  };
}
