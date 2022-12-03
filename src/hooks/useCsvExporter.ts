import { useCallback } from "react";
import type { AccountWithTwitter } from "../types";

export function useCsvExporter() {
  const generateCsv = useCallback((accounts: AccountWithTwitter[]) => {
    return [["Account address,Show boosts,Notify on new posts,Languages"]]
      .concat(accounts.map((account) => `${account.account},true,false,`))
      .join("\n");
  }, []);

  return useCallback(
    (accounts: AccountWithTwitter[]) => {
      const csvText = generateCsv(accounts);
      const blobConfig = new Blob([csvText], {
        type: "text/plain;charset=utf-8",
      });
      const blobUrl = URL.createObjectURL(blobConfig);

      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.target = "_blank";
      anchor.download = "mastodon-finder-following-accounts.csv";
      anchor.click();

      URL.revokeObjectURL(blobUrl);
    },
    [generateCsv],
  );
}
