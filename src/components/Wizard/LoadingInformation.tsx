import { useEffect } from "react";
import { Button, Frame, ProgressBar } from "react95";
import styled from "styled-components";

import { useMastodonFlock } from "../../hooks/useMastodonFlock";
import type { MastodonFlockResults } from "../../hooks/useResults";
import { Paragraph } from "../React95/Paragraph";

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

const CancelButton = styled(Button)`
  width: 120px;
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
  }, [findBirdsAndMammoths, method]);

  return (
    <FrameStyled>
      <Paragraph>
        {status}
        <br />
        {subStatus}
      </Paragraph>
      <ProgressBar value={progress} shadow={false} />
      <Center>
        <CancelButton primary={true} onClick={cancel}>
          Cancel
        </CancelButton>
      </Center>
    </FrameStyled>
  );
}
