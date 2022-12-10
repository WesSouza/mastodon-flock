import { Button, ButtonProps, Handle, Separator, TextInput } from "react95";
import styled from "styled-components";
import { Icon, IconProps } from "./Icon";

export const Toolbar = styled.div`
  position: relative;
  display: flex;
  overflow: hidden;
  flex-shrink: 0;
  margin-block: 4px;
  justify-content: stretch;
  align-items: center;
  z-index: 3;

  &:first-child {
    margin-block-start: 0;
  }

  @media print {
    display: none;
  }
`;

export const ToolbarDivider = styled(Separator).attrs({
  orientation: "horizontal",
})`
  @media print {
    display: none;
  }
`;

export const ToolbarHandle = styled(Handle).attrs({ variant: "thin" })`
  align-self: stretch;
  height: auto;
  margin-inline-end: 4px;
  content: "";

  &:not(:first-child) {
    margin-inline-start: auto;
  }
`;

export const ToolbarLabel = styled.label`
  padding-inline: 6px;
`;

export const ToolbarInput = styled(TextInput)`
  flex-grow: 1;
`;

export const ToolbarButtonIconWrapper = styled(Button).attrs({
  variant: "thin",
})`
  height: 44px;
  padding-inline: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ToolbarButtonLabel = styled.span``;

export function ToolbarButtonIcon({
  icon,
  label,
  ...buttonProps
}: {
  icon: IconProps["icon"];
  label?: string;
} & Omit<ButtonProps, "children">) {
  return (
    <ToolbarButtonIconWrapper {...buttonProps}>
      <Icon icon={icon} disabled={buttonProps.disabled ?? false} />
      {label ? <ToolbarButtonLabel>{label}</ToolbarButtonLabel> : undefined}
    </ToolbarButtonIconWrapper>
  );
}

export const ToolbarIconWrapper = styled.div`
  height: 32px;
  padding: 6px;
`;

export function ToolbarIcon(props: IconProps) {
  return (
    <ToolbarIconWrapper>
      <Icon {...props} />
    </ToolbarIconWrapper>
  );
}
