import { useCallback, useEffect, useState } from "react";
import { Button, Frame } from "react95";
import styled from "styled-components";

import { AboutDialog } from "../components/dialogs/AboutDialog";
import { Icon, type IconProps } from "../components/Icon";
import { useWinAmp } from "../hooks/useWinAmp";
import { useWindowManager } from "../hooks/useWindowManager";
import { React95 } from "../layouts/React95";

const TaskbarArea = styled(Frame)`
  position: fixed;
  top: auto;
  width: 100%;
  height: auto;
  bottom: 0;
  padding: 4px 2px 2px 2px;
  gap: 4px;
  border-left: none;
  border-right: none;
  border-bottom: none;
  box-shadow: inset 0 2px 0px 0px #fefefe;
  display: flex;
  z-index: 2;

  @media print {
    display: none;
  }
`;

const TaskbarButton = styled(Button)`
  width: min(100%, 250px);
  max-width: 250px;
  justify-content: flex-start;
  overflow: hidden;
`;

const TaskbarIcon = styled.span`
  display: block;
  margin-inline-end: 8px;
`;

const TaskbarStatusButton = styled.button`
  display: block;
  appearance: none;
  background: none;
  border: 0;
  padding: 0;
  margin: 0;
  cursor: pointer;
  margin-inline-end: 8px;

  &:focus-visible {
    outline: 2px dotted #000;
    outline-offset: 1px;
  }
`;

const TaskbarTitle = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: 600;
`;

const TaskbarStatus = styled(Frame).attrs({ variant: "well" })`
  display: flex;
  margin-inline-start: auto;
  align-items: center;
  padding: 4px 8px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`;

const taskbarItems: Record<
  string,
  {
    icon: IconProps["icon"];
    title: string;
  }
> = {
  "/": {
    icon: "toolbarSetup",
    title: "Mastodon Flock Setup",
  },
  "/about": {
    icon: "toolbarSearchWeb",
    title: "About – Web 1.0 Internet Navigator",
  },
  "/privacy": {
    icon: "toolbarSearchWeb",
    title: "Privacy Policy – Web 1.0 Internet Navigator",
  },
  "/results": {
    icon: "toolbarMastodon",
    title: "Mastodon Flock",
  },
};

const dateFormatter = Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "numeric",
});

export function Taskbar() {
  const url = new URL(location.href);
  const activeItem = taskbarItems[url.pathname];
  const [date, setDate] = useState<string>();

  useEffect(() => {
    let timer: number;

    function clock() {
      const date = new Date();
      setDate(dateFormatter.format(date));

      const seconds = date.getSeconds() * 1000 + date.getMilliseconds();
      timer = window.setTimeout(clock, 60000 - seconds);
    }

    clock();

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const { openWindow } = useWindowManager();
  const openAbout = useCallback(() => {
    openWindow(AboutDialog, {}, { modal: true });
  }, [openWindow]);

  const play = useWinAmp("/sounds/DING.mp3");

  return (
    <React95>
      <footer>
        <TaskbarArea>
          {activeItem ? (
            <TaskbarButton active={true} size="lg">
              <TaskbarIcon>
                <Icon icon={activeItem.icon} />
              </TaskbarIcon>
              <TaskbarTitle>{activeItem.title}</TaskbarTitle>
            </TaskbarButton>
          ) : undefined}
          <TaskbarStatus>
            <TaskbarStatusButton onClick={openAbout}>
              <Icon icon="toolbarHelp" />
            </TaskbarStatusButton>
            <TaskbarStatusButton onClick={play}>
              <Icon icon="toolbarSpeaker" />
            </TaskbarStatusButton>
            {date}
          </TaskbarStatus>
        </TaskbarArea>
      </footer>
    </React95>
  );
}
