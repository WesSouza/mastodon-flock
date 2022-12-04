import { About } from "../components/About";
import { PrivacyPolicy } from "../components/PrivacyPolicy";
import { Results } from "../components/Results/Results";
import { WindowManager } from "../components/WindowManager/WindowManager";
import { Wizard } from "../components/Wizard/Wizard";
import { React95 } from "../layouts/React95";

const mainWindows = {
  About: About,
  PrivacyPolicy: PrivacyPolicy,
  Results: Results,
  Wizard: Wizard,
};

export function Windows({
  mainWindow,
}: {
  mainWindow: keyof typeof mainWindows;
}) {
  const MainWindow = mainWindows[mainWindow];
  return (
    <React95>
      <WindowManager>
        <MainWindow />
      </WindowManager>
    </React95>
  );
}
