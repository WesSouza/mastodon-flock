import { Wizard } from "../components/Wizard/Wizard";
import { React95 } from "../layouts/React95";

export type MastodonFlockProps = {
  step: string | undefined;
};

export function MastodonFlock({ step: initialStep }: MastodonFlockProps) {
  return (
    <React95>
      <Wizard step={initialStep} />
    </React95>
  );
}
