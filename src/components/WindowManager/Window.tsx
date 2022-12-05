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
  display: flex;
  flex-direction: column;
  width: min(100%, ${({ minWidth }) => minWidth ?? "700px"});
  max-height: 100%;
  align-self: center;
  z-index: 1;
`;

const WindowHeaderStyled = styled(WindowHeader)`
  display: flex;
  align-items: center;
`;

const WindowTitle = styled.span`
  padding-inline-start: 5px;
  margin-inline-end: auto;
`;

const WindowButton = styled(Button)`
  &:last-child {
    margin-inline-start: 4px;
  }

  & > svg {
    width: 18px;
    height: 15px;
  }
`;

const WindowContentStyled = styled(WindowContent)<{
  noPadding: boolean | undefined;
}>`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  ${({ noPadding }) => (noPadding ? `padding: 2px;` : "")}
`;

export function Window({
  children,
  minWidth,
  noPadding,
  onClose,
  title,
  windowMeta,
}: {
  children: React.ReactNode;
  minWidth?: string;
  noPadding?: boolean;
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
        <WindowButton onClick={onClose}>
          <svg aria-label="Close Window">
            <use href="#window-close"></use>
          </svg>
        </WindowButton>
      </WindowHeaderStyled>
      <WindowContentStyled noPadding={noPadding}>
        {children}
      </WindowContentStyled>
    </WindowStyled>
  );
}
