import { useEffect, useRef, useState } from "react";
import {
  Button,
  Window as React95Window,
  WindowContent,
  WindowHeader,
} from "react95";
import styled from "styled-components";

import type { WindowMeta } from "./WindowManager";

const blinkTimerInterval = 100;
const blinkTimerRepeat = 3;

const WindowStyled = styled(React95Window)<{ minWidth: string | undefined }>`
  position: relative;
  width: min(100%, ${({ minWidth }) => minWidth ?? "700px"});
  z-index: 1;
`;

const WindowHeaderStyled = styled(WindowHeader)`
  display: flex;
  align-items: center;
`;

const WindowTitle = styled.span`
  margin-inline-end: auto;
`;

const WindowContentStyled = styled(WindowContent)``;

export const WizardFooterSpacer = styled.span`
  display: inline-block;
  width: 20px;
`;

export const WizardFooterPhantomButton = styled.span`
  display: inline-block;
  width: 120px;
`;

export const WizardFooterButton = styled(Button)`
  width: 120px;
`;

export function Window({
  children,
  minWidth,
  onClose,
  title,
  windowMeta,
}: {
  children: React.ReactNode;
  minWidth?: string;
  onClose: () => void;
  title: string;
  windowMeta: WindowMeta;
}) {
  const [animatedActive, setAnimatedActive] = useState<boolean | null>(null);

  const animatedActiveCounter = useRef(0);
  const animatedActiveTimer = useRef<number>();
  useEffect(() => {
    if (!windowMeta.titleBlink) {
      return;
    }

    function animate() {
      if (animatedActiveCounter.current >= blinkTimerRepeat * 2) {
        window.clearTimeout(animatedActiveTimer.current);
        animatedActiveCounter.current = 0;
        setAnimatedActive(null);
        return;
      }

      setAnimatedActive((value) => (value === null ? false : !value));
      animatedActiveCounter.current += 1;
    }

    window.clearTimeout(animatedActiveTimer.current);
    animatedActiveTimer.current = window.setInterval(
      animate,
      blinkTimerInterval,
    );
  }, [windowMeta.titleBlink]);

  return (
    <WindowStyled minWidth={minWidth}>
      <WindowHeaderStyled active={animatedActive ?? windowMeta.active}>
        <WindowTitle>{title}</WindowTitle>
        <Button onClick={onClose}>&times;</Button>
      </WindowHeaderStyled>
      <WindowContentStyled>{children}</WindowContentStyled>
    </WindowStyled>
  );
}
