import { useEffect } from "react";

import { config } from "../../config";
import { useResults } from "../../hooks/useResults";
import { Anchor } from "../typography/Anchor";
import { Heading } from "../typography/Heading";
import { Paragraph } from "../typography/Paragraph";

export function RevokeAccessContent({
  headingLevel = 1,
}: {
  headingLevel?: 1 | 2 | 3 | 4;
}) {
  const { instanceUri, loadResults } = useResults();

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  return (
    <>
      <Heading level={headingLevel} anchorName="revoking-access">
        Revoking Access from Twitter and Mastodon
      </Heading>
      <Paragraph>
        If you&rsquo;d like to remove our application from your Twitter account,
        navigate to &ldquo;Settings&rdquo;, &ldquo;Security and account
        access&rdquo;, &ldquo;Apps and sessions&rdquo;, &ldquo;Connected
        apps&rdquo;,{" "}
        <Anchor
          href={config.urls.twitterAppRevoke}
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          &ldquo;{config.name}&rdquo;
        </Anchor>{" "}
        then click &ldquo;Revoke app permissions&rdquo;.
      </Paragraph>
      <Paragraph>
        If you&rsquo;d like to remove our application from your Mastodon
        account, navigate to &ldquo;Preferences&rdquo;, &ldquo;Account&rdquo;,{" "}
        {instanceUri ? (
          <>
            <Anchor
              href={config.urls.mastodonAppRevoke.replace("{uri}", instanceUri)}
              target="_blank"
              rel="nofollow noopener noreferrer"
            >
              &ldquo;Authorized apps&rdquo;, find &ldquo;{config.name}&rdquo;
            </Anchor>
          </>
        ) : (
          <>&ldquo;Authorized apps&rdquo;, find &ldquo;{config.name}&rdquo;</>
        )}{" "}
        then click &ldquo;Revoke&rdquo;.
      </Paragraph>
    </>
  );
}
