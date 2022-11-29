import { useCallback, useState } from "react";

export type MastodonFlockResults = {};

export function useResults() {
  const [results, setResults] = useState<MastodonFlockResults | undefined>(
    undefined,
  );

  const loadResults = useCallback(() => {
    const resultsString = sessionStorage.getItem("results");
    if (!resultsString) {
      return;
    }
    setResults(JSON.parse(resultsString));
  }, []);

  const saveResults = useCallback((results: MastodonFlockResults) => {
    sessionStorage.setItem("results", JSON.stringify(results));
    setResults(results);
  }, []);

  return {
    results,
    loadResults,
    saveResults,
  };
}
