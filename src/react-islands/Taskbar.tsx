import { Button, Frame } from "react95";
import styled from "styled-components";

import { React95 } from "../layouts/React95";

const TaskbarComponent = styled(Frame)`
  position: fixed;
  top: auto;
  width: 100%;
  height: 45px;
  bottom: 0;
  padding: 4px;
  border-left: none;
  border-right: none;
  border-bottom: none;
  box-shadow: inset 0 2px 0px 0px #fefefe;

  @media print {
    display: none;
  }
`;

export function Taskbar() {
  const url = new URL(location.href);

  return (
    <React95>
      <footer>
        <TaskbarComponent>
          {url.pathname === "/" ? (
            <Button active={true}>Mastodon Flock</Button>
          ) : undefined}
        </TaskbarComponent>
      </footer>
    </React95>
  );
}
