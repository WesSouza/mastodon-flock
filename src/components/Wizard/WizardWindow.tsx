import {
  Button,
  Frame,
  Separator,
  Window,
  WindowContent,
  WindowHeader,
} from "react95";
import styled from "styled-components";

import { useWindowManager } from "../../hooks/useWindowManager";

export type WizardWindowAction = {
  disabled?: boolean;
  label: string;
  onClick?: () => void;
};

export type WizardWindowProps = {
  cancelAction?: WizardWindowAction;
  children: React.ReactNode;
  imageAlt: string;
  imageSrc: string;
  nextAction?: WizardWindowAction;
  onClose: () => void;
  previousAction?: WizardWindowAction;
  title: string;
  windowId: string;
};

const WindowStyled = styled(Window)`
  width: min(100%, 700px);
`;

const WindowHeaderStyled = styled(WindowHeader)`
  display: flex;
  align-items: center;
`;

const WindowTitle = styled.span`
  margin-inline-end: auto;
`;

const WindowContentStyled = styled(WindowContent)`
  display: grid;
  flex-direction: column;
  gap: 20px;
  column-gap: 32px;
  padding: 20px;
  grid-template:
    "Image Content" 293px
    "Separator Separator" 4px
    "Footer Footer" 36px / 150px 1fr;
`;

const WizardImageWell = styled(Frame)`
  grid-area: Image
`;

const WizardImage = styled.img`
  width: 100%;
  height: 100%;
`;

const WizardContent = styled.div`
  grid-area: Content;
  display: flex;
  flex-direction: column;
`;

const WizardFooter = styled.div`
  grid-area: Footer;
  display: flex;
  justify-content: flex-end;
`;

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

export function WizardWindow({
  cancelAction,
  children,
  imageAlt,
  imageSrc,
  nextAction,
  onClose,
  previousAction,
  title,
  windowId,
}: WizardWindowProps) {
  const { active } = useWindowManager({ windowId });

  return (
    <WindowStyled>
      <WindowHeaderStyled active={active}>
        <WindowTitle>{title}</WindowTitle>
        <Button onClick={onClose}>&times;</Button>
      </WindowHeaderStyled>
      <WindowContentStyled>
        <WizardImageWell variant="well">
          <WizardImage src={imageSrc} alt={imageAlt} />
        </WizardImageWell>
        <WizardContent>{children}</WizardContent>
        <Separator style={{ gridArea: "Separator" }} orientation="horizontal" />
        <WizardFooter>
          {previousAction ? (
            <WizardFooterButton
              disabled={previousAction.disabled ?? false}
              onClick={previousAction.onClick}
            >
              {previousAction.label}
            </WizardFooterButton>
          ) : (
            <WizardFooterPhantomButton />
          )}
          {nextAction ? (
            <WizardFooterButton
              disabled={nextAction.disabled ?? false}
              primary={true}
              onClick={nextAction.onClick}
            >
              {nextAction.label}
            </WizardFooterButton>
          ) : (
            <WizardFooterPhantomButton />
          )}
          <WizardFooterSpacer />
          {cancelAction ? (
            <WizardFooterButton
              disabled={cancelAction.disabled ?? false}
              onClick={cancelAction.onClick}
            >
              {cancelAction.label}
            </WizardFooterButton>
          ) : (
            <WizardFooterPhantomButton />
          )}
        </WizardFooter>
      </WindowContentStyled>
    </WindowStyled>
  );
}
