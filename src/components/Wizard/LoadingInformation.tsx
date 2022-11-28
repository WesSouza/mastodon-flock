import { Frame, ProgressBar } from "react95";
import styled from "styled-components";
import { Button } from "../React95/Button";

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

export function LoadingInformation({
  cancel,
  status,
  subStatus,
  progress,
}: {
  cancel: () => void;
  status: string;
  subStatus: string;
  progress: number;
}) {
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
