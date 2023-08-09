import { config } from "../../config";
import type { WindowMeta } from "../../stores/WindowStore";
import { Anchor } from "../typography/Anchor";
import { Paragraph } from "../typography/Paragraph";
import { WizardWindow } from "./WizardWindow";

export function Welcome({
  cancel,
  windowMeta,
}: {
  cancel: () => void;
  goNext: () => void;
  windowMeta: WindowMeta;
}) {
  const bsod = () => {
    location.href = config.urls.bsod;
  };

  return (
    <WizardWindow
      cancelAction={{ label: "Cancel", onPress: cancel }}
      imageAlt="A drawing of an old computer besides a phone and a modem in front of a piece of paper and pencil."
      imageSrc="/images/setup.png"
      nextAction={{ label: "Next >", onPress: bsod }}
      onClose={cancel}
      title="Welcome"
      windowMeta={windowMeta}
    >
      <Paragraph>Welcome to the Mastodon Flock installation wizard.</Paragraph>
      <Paragraph>
        This program would guide you through finding your Twitter contacts on
        the Fediverse, provided they had added their external contact
        information on their profile name, description, URL or pinned Tweet.
      </Paragraph>
      <Paragraph>
        <Anchor href="/about">
          Click here to learn how this software worked
        </Anchor>
        , and our <Anchor href="/privacy">privacy policy</Anchor>.
      </Paragraph>
      <Paragraph>Click Next to select an installation method.</Paragraph>
    </WizardWindow>
  );
}
