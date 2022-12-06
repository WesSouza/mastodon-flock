import { Button, Frame, Separator } from "react95";
import styled from "styled-components";

import { Window } from "../WindowManager/Window";
import type { WindowMeta } from "../WindowManager/WindowManager";

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
  windowMeta: WindowMeta;
};

const WizardWrapper = styled.div`
  gap: 20px;

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
  }

  @media (min-width: 768px) {
    display: grid;
    column-gap: 32px;
    grid-template:
      "Image Content" 293px
      "Separator Separator" 4px
      "Footer Footer" 36px / 150px 1fr;
  }
`;

const WizardImageWell = styled(Frame)`
  grid-area: Image;

  @media (max-width: 767px) {
    display: none;
  }
`;

const WizardImage = styled.img`
  width: 100%;
  height: 100%;
`;

const WizardContent = styled.div`
  min-height: 293px;
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
  display: block;
  width: 120px;

  @media (max-width: 767px) {
    width: 109px;
  }
`;

export const WizardFooterButton = styled(Button)`
  width: 120px;

  @media (max-width: 767px) {
    width: 109px;
  }
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
  windowMeta,
}: WizardWindowProps) {
  return (
    <Window
      onClose={onClose}
      size="medium"
      title={title}
      windowMeta={windowMeta}
    >
      <WizardWrapper>
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
              primary={windowMeta.active}
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
      </WizardWrapper>
    </Window>
  );
}
