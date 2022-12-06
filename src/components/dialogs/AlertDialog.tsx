import { Button } from "react95";
import styled from "styled-components";

import { useWindowManager } from "../../hooks/useWindowManager";
import { Icon } from "../Icon";
import { Paragraph } from "../typography/Paragraph";
import { Window } from "../WindowManager/Window";
import type { WindowMeta } from "../WindowManager/WindowManager";

const AlertMessageContents = styled.div`
  display: grid;
  flex-direction: column;
  gap: 16px;
  column-gap: 24px;
  grid-template:
    "Icon Message" 1fr
    "Buttons Buttons" 32px
    / 64px 1fr;
`;

const DialogButtons = styled.div`
  grid-area: Buttons;
  display: flex;
  justify-content: center;
`;

const DialogButton = styled(Button)`
  width: 120px;
`;

export function AlertDialog({
  title,
  messageLines,
  windowMeta,
}: {
  title: string;
  messageLines: string[];
  windowMeta: WindowMeta;
}) {
  const { handleClose } = useWindowManager({
    windowId: windowMeta.id,
  });

  return (
    <Window
      size="small"
      onClose={handleClose}
      title={title}
      windowMeta={windowMeta}
    >
      <AlertMessageContents>
        <div style={{ gridArea: "Icon" }}>
          <Icon icon="dialogWarning" />
        </div>
        <div style={{ gridArea: "Message" }}>
          {messageLines.map((message, index) => (
            <Paragraph key={index}>{message}</Paragraph>
          ))}
        </div>
        <DialogButtons>
          <DialogButton primary={windowMeta.active} onClick={handleClose}>
            Ok
          </DialogButton>
        </DialogButtons>
      </AlertMessageContents>
    </Window>
  );
}
