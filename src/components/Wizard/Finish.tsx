import { Paragraph } from "../React95/Paragraph";
import { WizardWindow } from "./WizardWindow";

export function Finish({
  cancel,
  goNext,
}: { cancel: () => void; goNext: () => void }) {
  return (
    <WizardWindow
      previousAction={{ label: "< Back", disabled: true }}
      imageAlt="A drawing of an old computer besides a phone and a modem in front of a piece of paper and pencil."
      imageSrc="/images/setup.png"
      nextAction={{ label: "Finish", onClick: goNext }}
      onClose={cancel}
      title="Setup Complete"
    >
      <Paragraph>Mastodon Flock Setup is complete.</Paragraph>
      <Paragraph>Click Finish to launch Mastodon Flock.</Paragraph>
    </WizardWindow>
  );
}
