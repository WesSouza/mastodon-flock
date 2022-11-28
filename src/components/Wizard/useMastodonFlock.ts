import { useCallback, useMemo, useRef, useState } from "react";
import { config } from "../../config";
import type { APIResult, TwitterSearchResults } from "../../types";

import type { MastodonFlockResults } from "../Results/useResults";

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
    async (options: { method: "typical" | "advanced" }) => {
      setStatus("Reading Twitter...");
      setStatus("twitter.exe");
      const twitterFollowingResponse = await fetch(
        config.urls.twitterFollowing,
      );
      const twitterFollowingData =
        (await twitterFollowingResponse.json()) as APIResult<TwitterSearchResults>;
      if ("error" in twitterFollowingData) {
        onError(twitterFollowingData.error);
        return;
      }
      setProgress(100 / 3);

      const { potentialEmails, potentialInstanceProfiles, twitterUsers } =
        twitterFollowingData;

      if (options.method === "typical") {
        setStatus("Searching Mastodon Followers...");
        setStatus("mastodon.exe");
        onResults({});
      } else {
        setStatus("Fingering contacts...");
        setStatus("actipub.exe");
        setProgress(100);
        onResults({});
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
