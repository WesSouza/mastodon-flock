import { Paragraph } from "../React95/Paragraph";
import type { WindowMeta } from "../WindowManager/WindowManager";
import { WizardWindow } from "./WizardWindow";

export function Welcome({
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
      cancelAction={{ label: "Cancel", onClick: cancel }}
      imageAlt="A drawing of an old computer besides a phone and a modem in front of a piece of paper and pencil."
      imageSrc="/images/setup.png"
      nextAction={{ label: "Next >", onClick: goNext }}
      onClose={cancel}
      title="Welcome"
      windowMeta={windowMeta}
    >
      <Paragraph>Welcome to the Mastodon Flock installation wizard.</Paragraph>
      <Paragraph>
        This program will guide you through finding your Twitter contacts on the
        Fediverse, provided they have added their external contact information
        on their profile name, description, URL or pinned Tweet.
      </Paragraph>
      <Paragraph>
        Click Next to authorize this program to read your Twitter information.
      </Paragraph>
    </WizardWindow>
  );
}
