import type { WindowMeta } from "../../stores/WindowStore";
import { Paragraph } from "../typography/Paragraph";
import { WizardWindow } from "./WizardWindow";

export function Finish({
  cancel,
  goNext,
  windowMeta,
}: {
  cancel: () => void;
  goNext: () => void;
  windowMeta: WindowMeta;
}) {
  return (
    <WizardWindow
      previousAction={{ label: "< Back", disabled: true }}
      imageAlt="A drawing of an old computer besides a phone and a modem in front of a piece of paper and pencil."
      imageSrc="/images/setup.png"
      nextAction={{ label: "Finish", onPress: goNext }}
      onClose={cancel}
      title="Setup Complete"
      windowMeta={windowMeta}
    >
      <Paragraph>Mastodon Flock Setup is complete.</Paragraph>
      <Paragraph>Click Finish to launch Mastodon Flock.</Paragraph>
    </WizardWindow>
  );
}
