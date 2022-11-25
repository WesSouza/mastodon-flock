import {
  Button,
  Frame,
  Separator,
  Window,
  WindowContent,
  WindowHeader,
} from "react95";
import styled from "styled-components";

export type WizardWindowProps = {
  children: React.ReactNode;
  footer: React.ReactNode;
  imageAlt: string;
  imageSrc: string;
  onClose: () => void;
  title: string;
};

const WindowHeaderStyled = styled(WindowHeader)`
  display: flex;
`;

const WindowTitle = styled.span`
  margin-inline-end: auto;
`;

const WindowContentStyled = styled(WindowContent)`
  display: grid;
  flex-direction: column;
  gap: 24px;
  grid-template:
    "Image Content" 297px
    "Separator Separator" 4px
    "Footer Footer" 37px / 154px 1fr;
`;

const WizardImage = styled(Frame)`grid-area: Image`;
const WizardContent = styled.div`grid-area: Content`;

const WizardFooter = styled.div`grid-area: Footer`;

export function WizardWindow({
  children,
  footer,
  imageAlt,
  imageSrc,
  onClose,
  title,
}: WizardWindowProps) {
  return (
    <Window
      style={{ maxWidth: 958, maxHeight: 714, width: "100%", height: "100%" }}
    >
      <WindowHeaderStyled>
        <WindowTitle>{title}</WindowTitle>
        <Button onClick={onClose}>&times;</Button>
      </WindowHeaderStyled>
      <WindowContentStyled>
        <WizardImage variant="well">
          <img src={imageSrc} alt={imageAlt} />
        </WizardImage>
        <WizardContent>{children}</WizardContent>
        <Separator style={{ gridArea: "Separator" }} orientation="horizontal" />
        <WizardFooter>{footer}</WizardFooter>
      </WindowContentStyled>
    </Window>
  );
}
