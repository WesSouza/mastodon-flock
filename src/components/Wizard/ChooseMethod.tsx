import { useCallback, useState } from "react";
import { Radio } from "react95";
import styled from "styled-components";

import { WizardWindow } from "./WizardWindow";

const Option = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-block-start: 24px;
`;

const OptionDescription = styled.div`
  width: 70%;
`;

export function ChooseMethod({
  cancel,
  goBack,
  goNext,
  initialMethod,
}: {
  cancel: () => void;
  goBack: () => void;
  goNext: (method: "typical" | "advanced") => void;
  initialMethod: "typical" | "advanced";
}) {
  const [method, setMethod] = useState(initialMethod);

  const setTypical = useCallback(() => {
    setMethod("typical");
  }, []);

  const setAdvanced = useCallback(() => {
    setMethod("advanced");
  }, []);

  const next = useCallback(() => {
    goNext(method);
  }, [method]);

  return (
    <WizardWindow
      cancelAction={{ label: "Cancel", onClick: cancel }}
      imageAlt="A pixel art drawing of an old school computer and CRT monitor, by its left a set of a yellow old school phone on top of a modem. In front of it, a folded piece of paper with a yellow pencil on top."
      imageSrc="/images/setup.png"
      nextAction={{ label: "Next >", onClick: next }}
      onClose={cancel}
      previousAction={{ label: "< Back", onClick: goBack }}
      title="Installation Method"
    >
      Click the type of Setup you prefer, then click Next.
      <Option>
        <Radio
          checked={method === "typical"}
          onChange={setTypical}
          value='typical'
          label='Typical'
          name='method'
        />
        <OptionDescription>
          Typical setup will connect to your Mastodon instance and use it to
          look for the found contacts in your Twitter accounts. You are able
          then to see who you already follow, and also follow multiple accounts
          from the Mastodon Flock program.
        </OptionDescription>
      </Option>
      <Option>
        <Radio
          checked={method === "advanced"}
          onChange={setAdvanced}
          value='advanced'
          label='Advanced'
          name='method'
        />
        <OptionDescription>
          Advanced setup will search the Fediverse and find contacts on any
          supported service. You will not be able to see who you already follow,
          and will need to manually follow each person on each instance
          individually.
        </OptionDescription>
      </Option>
    </WizardWindow>
  );
}
