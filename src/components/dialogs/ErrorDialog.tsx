import { useCallback, useState } from "react";
import { Button, Frame } from "react95";
import styled from "styled-components";

import { useWindowManager } from "../../hooks/useWindowManager";
import type { WindowMeta } from "../../stores/WindowStore";
import { Icon } from "../Icon";
import { Paragraph } from "../typography/Paragraph";
import { Window } from "../WindowManager/Window";

const twitterLoginError = [
  "There was a problem logging into Twitter.",
  "Please try again.",
];

const mastodonLoginError = [
  "There was a problem logging into Mastodon.",
  "Please try again.",
];

const mastodonIncompatibleError = [
  "There was a problem talking to the Mastodon instance.",
  "Please make sure the instance URL is a supported Mastodon server and try again.",
];

const impossibleError = ["Impossible error."];

const defaultError = ["There was an unknown error.", "Please try again."];

const errorMessagesByError: Record<string, string[]> = {
  badInstanceResponse: mastodonIncompatibleError,
  badOauthTokenResponse: mastodonLoginError,
  databaseConnectionError: [
    "There was a problem connecting to the database.",
    "Please wait a minute and try again.",
  ],
  incompatibleServer: mastodonIncompatibleError,
  incompatibleServerSoftware: mastodonIncompatibleError,
  invalidOauthCode: mastodonIncompatibleError,
  invalidTwitterState: twitterLoginError,
  invalidUri: [
    "The Mastodon instance URL entered is invalid.",
    "Please correct it and try again.",
  ],
  mastodonAppCreationError: mastodonIncompatibleError,
  mastodonAuthError: mastodonIncompatibleError,
  missingMastodonSessionData: mastodonLoginError,
  missingTwitterSessionData: twitterLoginError,
  missingTwitterState: twitterLoginError,
  theFuckDidMyDataGo: impossibleError,
  twitterAuthError: twitterLoginError,
  unknownMastodonInstance: impossibleError,
};

const ErrorMessageContents = styled.div`
  display: grid;
  flex-direction: column;
  gap: 16px;
  column-gap: 24px;
  grid-template:
    "Icon Message Button1" 36px
    "Icon Message Button2" 1fr
    / 64px 1fr 120px;

  @media (max-width: 767px) {
    grid-template:
      "Icon Message Message Message" 1fr
      "Button1 Button1 Button2 Button2" 36px
      / 64px 1fr 1fr 1fr;
  }
`;

const Details = styled(Frame)`
  width: 100%;
  margin-top: 32px;
  padding: 16px;
  background-color: ${({ theme }) => theme.material};
  font-family: monospace;
`;

export function ErrorDialog({
  error,
  windowMeta,
}: {
  error: string | undefined;
  windowMeta: WindowMeta;
}) {
  const { handleClose } = useWindowManager({
    windowId: windowMeta.id,
  });

  const [detailsVisible, setDetailsVisible] = useState(false);

  const showDetails = useCallback(() => {
    setDetailsVisible(true);
  }, []);

  const messageLines = errorMessagesByError[error as string] ?? defaultError;

  return (
    <Window
      size="small"
      onClose={handleClose}
      title="Error"
      windowMeta={windowMeta}
    >
      <ErrorMessageContents>
        <div style={{ gridArea: "Icon" }}>
          <Icon icon="dialogError" />
        </div>
        <div style={{ gridArea: "Message" }}>
          {messageLines.map((message, index) => (
            <Paragraph key={index}>{message}</Paragraph>
          ))}
        </div>
        <Button
          style={{ gridArea: "Button1" }}
          primary={windowMeta.active}
          onClick={handleClose}
        >
          Close
        </Button>
        <Button
          style={{ gridArea: "Button2" }}
          disabled={detailsVisible}
          onClick={showDetails}
        >
          Details&gt;&gt;
        </Button>
      </ErrorMessageContents>
      {detailsVisible ? (
        <Details variant="field">
          Error Code: {error}
          <br />
          Time: {new Date().toUTCString()}
        </Details>
      ) : undefined}
    </Window>
  );
}
