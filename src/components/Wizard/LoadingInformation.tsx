import { useEffect } from "react";
import { Frame, ProgressBar } from "react95";
import styled from "styled-components";
import { Button } from "../React95/Button";

import { Paragraph } from "../React95/Paragraph";
import type { MastodonFlockResults } from "../Results/useResults";
import { useMastodonFlock } from "./useMastodonFlock";

const FrameStyled = styled(Frame)`
  width: min(calc(100% - 4em), 700px);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Center = styled.div`
  align-self: center;
`;

export function Installer({
  method,
  onError,
  onResults,
}: {
  method: string;
  onError: (error: string) => void;
  onResults: (results: MastodonFlockResults) => void;
}) {
  const { cancel, findBirdsAndMammoths, progress, status, subStatus } =
    useMastodonFlock({
      onError,
      onResults,
    });

  useEffect(() => {
    findBirdsAndMammoths({ method });
  }, []);

  return (
    <FrameStyled className="react95">
      <Paragraph>
        {status}
        <br />
        {subStatus}
      </Paragraph>
      <ProgressBar value={progress} shadow={false} />
      <Center>
        <Button primary={true} onClick={cancel}>
          Cancel
        </Button>
      </Center>
    </FrameStyled>
  );
}
