import { useEffect, useRef } from "react";
import { Frame, ProgressBar } from "react95";
import styled from "styled-components";

import { useMastodonFlock } from "../../hooks/useMastodonFlock";
import type { MastodonFlockResults } from "../../hooks/useResults";
import { FocusableButton } from "../FocusableButton";
import { Paragraph } from "../typography/Paragraph";

const FillHeight = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: calc(100vh - var(--taskbar-height));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const FrameStyled = styled(Frame)`
  width: min(calc(100vw - 4em), 700px);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Center = styled.div`
  align-self: center;
`;

const CancelButton = styled(FocusableButton)`
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

  const debounceTimer = useRef<number>();
  useEffect(() => {
    let started = false;
    window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => {
      started = true;
      findBirdsAndMammoths({ method });
    }, 100);

    return () => {
      if (started) {
        cancel();
      }
    };
  }, [cancel, findBirdsAndMammoths, method]);

  return (
    <FillHeight>
      <FrameStyled>
        <Paragraph>
          {status ?? " "}
          <br />
          {subStatus ?? " "}
        </Paragraph>
        <ProgressBar value={progress} shadow={false} />
        <Center>
          <CancelButton primary={true} onPress={cancel}>
            Cancel
          </CancelButton>
        </Center>
      </FrameStyled>
    </FillHeight>
  );
}
