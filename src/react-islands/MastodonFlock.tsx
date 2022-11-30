import { WindowManager } from "../components/WindowManager/WindowManager";
import { Wizard } from "../components/Wizard/Wizard";
import { React95 } from "../layouts/React95";

export function MastodonFlock() {
  return (
    <React95>
      <WindowManager>
        <Wizard />
      </WindowManager>
    </React95>
  );
}
