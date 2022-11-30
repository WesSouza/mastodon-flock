import { Results } from "../components/Results/Results";
import { WindowManager } from "../components/WindowManager/WindowManager";
import { React95 } from "../layouts/React95";

export function People() {
  return (
    <React95>
      <WindowManager>
        <Results />
      </WindowManager>
    </React95>
  );
}
