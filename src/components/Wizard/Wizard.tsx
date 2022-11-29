import { useCallback } from "react";
import { config } from "../../config";
import { useSearchParamsState } from "../../hooks/useSearchParamsState";
import { MastodonFlockResults, useResults } from "../../hooks/useResults";

import { ChooseMastodonInstance } from "./ChooseMastodonInstance";
import { ChooseMethod } from "./ChooseMethod";
import { Finish } from "./Finish";
import { Installer } from "./LoadingInformation";
import { Welcome } from "./Welcome";

export type WizardStep =
  | "welcome"
  | "chooseMethod"
  | "chooseMastodonInstance"
  | "loadingInformation"
  | "error"
  | "finish";

export function Wizard() {
  const [step, setStep] = useSearchParamsState("step", "welcome");
  const [method, setMethod] = useSearchParamsState("method", "typical");
  const [error] = useSearchParamsState("error");

  const navigateTo = useCallback((step: string) => {
    setStep(step);
  }, []);

  const { saveResults } = useResults();

  const handleFlockResults = useCallback(
    (results: MastodonFlockResults) => {
      saveResults(method ?? "", results);
      navigateTo("finish");
    },
    [method, navigateTo],
  );

  const handleFlockError = useCallback(
    (error: string) => {
      console.error(error);
      if (method === "typical") {
        navigateTo("chooseMastodonInstance");
      } else {
        navigateTo("chooseMethod");
      }
    },
    [method, navigateTo],
  );

  const connectTwitter = useCallback(() => {
    location.href = config.urls.twitterLogin;
  }, []);

  const goWelcome = useCallback(() => {
    navigateTo("welcome");
  }, [navigateTo]);

  const goChooseMethod = useCallback(() => {
    navigateTo("chooseMethod");
  }, [navigateTo]);

  const chooseMethod = useCallback(
    (newMethod: string) => {
      setMethod(newMethod);
      if (newMethod === "typical") {
        navigateTo("chooseMastodonInstance");
      } else {
        navigateTo("loadingInformation");
      }
    },
    [navigateTo],
  );

  const loadData = useCallback(
    (mastodonUri: string | undefined) => {
      if (method === "typical" && !mastodonUri) {
        alert("Please enter or select a server.");
        return;
      }

      if (method === "typical" && mastodonUri) {
        location.href = `${config.urls.mastodonLogin}?uri=${encodeURIComponent(
          mastodonUri,
        )}`;
        return;
      }

      navigateTo("loadingInformation");
    },
    [method, navigateTo],
  );

  const closeWizard = useCallback(() => {
    location.href = config.urls.desktop;
  }, []);

  const goResults = useCallback(() => {
    location.href = config.urls.results;
  }, []);

  let stepNode = null;

  switch (step) {
    case "welcome": {
      stepNode = <Welcome cancel={closeWizard} goNext={connectTwitter} />;
      break;
    }
    case "chooseMethod": {
      stepNode = (
        <ChooseMethod
          initialMethod={method ?? "typical"}
          cancel={closeWizard}
          goBack={goWelcome}
          goNext={chooseMethod}
        />
      );
      break;
    }
    case "chooseMastodonInstance": {
      stepNode = (
        <ChooseMastodonInstance
          cancel={closeWizard}
          goBack={goChooseMethod}
          goNext={loadData}
        />
      );
      break;
    }
    case "loadingInformation": {
      stepNode = (
        <Installer
          method={method ?? "advanced"}
          onError={handleFlockError}
          onResults={handleFlockResults}
        />
      );
      break;
    }
    case "finish": {
      stepNode = <Finish cancel={closeWizard} goNext={goResults} />;
      break;
    }
    default:
      stepNode = <div>BSOD</div>;
  }

  return (
    <>
      {error ? <div>error</div> : null}
      {stepNode}
    </>
  );
}
