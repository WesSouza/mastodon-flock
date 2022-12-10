import { useEffect, useState } from "react";
import { Button as Button95, ScrollView, Separator } from "react95";
import styled from "styled-components";
import { config } from "../../config";

import { useWindowManager } from "../../hooks/useWindowManager";
import type { WindowMeta } from "../../stores/WindowStore";
import { Anchor } from "../typography/Anchor";
import { Paragraph } from "../typography/Paragraph";
import { Window } from "../WindowManager/Window";

const AboutContents = styled.div`
  display: grid;
  flex-direction: column;
  gap: 16px;
  column-gap: 24px;
  grid-template:
    "Image Content" 480px
    "Separator Separator" auto
    "Buttons Buttons" 32px
    / auto 1fr;
`;

const AboutImage = styled.img`
  width: 172px;
  height: 480px;
  image-rendering: pixelated;
  border: 2px solid #000;
  border-bottom: 0;
  object-fit: cover;

  @media (max-width: 767px) {
    width: 86px;
  }
`;

const Acknowledgements = styled(ScrollView)`
  grid-area: Acknowledgements;
  font-family: monospace;
  font-size: 0.8em;
  white-space: pre-wrap;
  height: 350px;
`;

const Buttons = styled.div`
  grid-area: Buttons;
  display: flex;
  justify-content: flex-end;
`;

const Button = styled(Button95)`
  width: 120px;
`;

export function AboutDialog({ windowMeta }: { windowMeta: WindowMeta }) {
  const { handleClose } = useWindowManager({
    windowId: windowMeta.id,
  });
  const [acknowledgements, setAcknowledgements] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetch(config.urls.acknowledgements)
      .then((response) => response.text())
      .then((data) => setAcknowledgements(data));

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <Window
      size="medium"
      onClose={handleClose}
      title={"About Mastodon Flock"}
      windowMeta={windowMeta}
    >
      <AboutContents>
        <div style={{ gridArea: "Image" }}>
          <AboutImage src="/images/about.png" />
        </div>
        <div style={{ gridArea: "Content", overflow: "hidden" }}>
          <Paragraph style={{ wordBreak: "break-word" }}>
            Mastodon Flock&reg; 1.0
            <br />
            Build {import.meta.env.PUBLIC_VERCEL_GIT_COMMIT_SHA ?? "—"}
          </Paragraph>
          <Paragraph>
            Copyright &copy; 1986-2022{" "}
            <Anchor href="https://wes.dev/" target="_blank" rel="noopener">
              Wes&nbsp;Souza
            </Anchor>{" "}
            (
            <Anchor
              href="https://www.buymeacoffee.com/WesSouza"
              target="_blank"
              rel="nofollow noopener noreferrer"
            >
              buy him a coffee
            </Anchor>
            )
          </Paragraph>
          <Acknowledgements>{acknowledgements}</Acknowledgements>
        </div>
        <Separator
          orientation="horizontal"
          size="auto"
          style={{ gridArea: "Separator" }}
        />
        <Buttons>
          <Button primary={windowMeta.active} onClick={handleClose}>
            Ok
          </Button>
        </Buttons>
      </AboutContents>
    </Window>
  );
}
