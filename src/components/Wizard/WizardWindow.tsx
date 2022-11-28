import { Frame, Separator, Window, WindowContent, WindowHeader } from "react95";
import styled from "styled-components";

import { Button } from "../React95/Button";

export type WizardWindowAction = {
  label: string;
  onClick: () => void;
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
};

const WindowStyled = styled(Window)`
  max-width: 958px;
`;

const WindowHeaderStyled = styled(WindowHeader)`
  display: flex;
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
    "Image Content" 592px
    "Separator Separator" 4px
    "Footer Footer" 46px / 304px 1fr;
`;

const WizardImageWell = styled(Frame)`
  grid-area: Image
`;

const WizardImage = styled.img`
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
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
  width: 160px;
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
}: WizardWindowProps) {
  return (
    <WindowStyled className="react95">
      <WindowHeaderStyled>
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
            <WizardFooterButton onClick={previousAction.onClick}>
              {previousAction.label}
            </WizardFooterButton>
          ) : (
            <WizardFooterPhantomButton />
          )}
          {nextAction ? (
            <WizardFooterButton primary={true} onClick={nextAction.onClick}>
              {nextAction.label}
            </WizardFooterButton>
          ) : (
            <WizardFooterPhantomButton />
          )}
          <WizardFooterSpacer />
          {cancelAction ? (
            <WizardFooterButton onClick={cancelAction.onClick}>
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
