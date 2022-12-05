import { useEffect, useState } from "react";
import { Button, Frame } from "react95";
import styled from "styled-components";

import { Icon, IconProps } from "../components/Icon";
import { useWinAmp } from "../hooks/useWinAmp";
import { React95 } from "../layouts/React95";

const TaskbarArea = styled(Frame)`
  position: fixed;
  top: auto;
  width: 100%;
  height: auto;
  bottom: 0;
  padding: 4px;
  border-left: none;
  border-right: none;
  border-bottom: none;
  box-shadow: inset 0 2px 0px 0px #fefefe;
  display: flex;

  @media print {
    display: none;
  }
`;

const TaskbarButton = styled(Button)`
  width: min(100%, 250px);
  justify-content: flex-start;
`;

const TaskbarIcon = styled.span`
  margin-inline-end: 8px;
  cursor: pointer;
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
            <TaskbarIcon forwardedAs="button" onMouseDown={play}>
              <Icon icon="toolbarSpeaker" />
            </TaskbarIcon>
            {date}
          </TaskbarStatus>
        </TaskbarArea>
      </footer>
    </React95>
  );
}
