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
  windowId,
}: {
  cancel: () => void;
  goBack: () => void;
  goNext: (method: string) => void;
  initialMethod: string;
  windowId: string;
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
  }, [goNext, method]);

  return (
    <WizardWindow
      cancelAction={{ label: "Cancel", onClick: cancel }}
      imageAlt="A pixel art drawing of an old school computer and CRT monitor, by its left a set of a yellow old school phone on top of a modem. In front of it, a folded piece of paper with a yellow pencil on top."
      imageSrc="/images/setup.png"
      nextAction={{ label: "Next >", onClick: next }}
      onClose={cancel}
      previousAction={{ label: "< Back", onClick: goBack }}
      title="Installation Method"
      windowId={windowId}
    >
      Click the type of Setup you prefer, then click Next.
      <Option>
        <Radio
          checked={method === "typical"}
          onChange={setTypical}
          value="typical"
          label="Typical"
          name="method"
        />
        <OptionDescription>
          Connects to your Mastodon instance. You are able to see who you
          already follow, as well as follow people in bulk.
        </OptionDescription>
      </Option>
      <Option>
        <Radio
          checked={method === "advanced"}
          onChange={setAdvanced}
          value="advanced"
          label="Advanced"
          name="method"
        />
        <OptionDescription>
          Searches the Fediverse directly. You must manually follow each account
          externally.
        </OptionDescription>
      </Option>
    </WizardWindow>
  );
}
