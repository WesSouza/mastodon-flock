import { Button } from "react95";

import { WizardWindow } from "./WizardWindow";

export function Welcome({ goNext }: { goNext: () => void }) {
  return (
    <WizardWindow
      footer={
        <Button primary={true} onClick={goNext}>
          Connect Twitter &gt;
        </Button>
      }
      imageAlt="A pixel art drawing of an old school computer and CRT monitor, by its left a set of a yellow old school phone on top of a modem. In front of it, a folded piece of paper with a yellow pencil on top."
      imageSrc="/images/setup.png"
      onClose={() => {}}
      title="Welcome"
    >
      Welcome
    </WizardWindow>
  );
}
