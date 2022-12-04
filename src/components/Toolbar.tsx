import { Button, Handle, TextInput } from "react95";
import styled from "styled-components";

export const Toolbar = styled.div`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  margin-block: 4px;
  justify-content: stretch;
  align-items: center;
  z-index: 3;

  &:first-child {
    margin-block-start: 0;
  }
`;

export const ToolbarHandle = styled(Handle).attrs({ variant: "thin" })`
  align-self: stretch;
  height: auto;
  margin-inline-end: 4px;
  content: "";
`;

export const ToolbarButtonIcon = styled(Button).attrs({ variant: "thin" })`
  height: 44px;
  padding-inline: 6px;
`;

export const ToolbarLabel = styled.label`
  padding-inline: 6px;
`;

export const ToolbarInput = styled(TextInput)`
  flex-grow: 1;
`;
