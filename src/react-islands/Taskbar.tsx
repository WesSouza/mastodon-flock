import { Button, Frame } from "react95";
import styled from "styled-components";

import { React95 } from "../layouts/React95";

const TaskbarComponent = styled(Frame)`
  position: absolute;
  top: auto;
  width: 100%;
  bottom: 0;
  padding: 4px;
  border-left: none;
  border-right: none;
  border-bottom: none;
  box-shadow: inset 0 2px 0px 0px #fefefe;
`;

export function Taskbar() {
  return (
    <React95>
      <footer>
        <TaskbarComponent>
          <Button active={true}>Mastodon Flock</Button>
        </TaskbarComponent>
      </footer>
    </React95>
  );
}
