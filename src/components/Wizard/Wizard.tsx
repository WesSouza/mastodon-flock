import { useCallback } from "react";

import { config } from "../../config";
import { useErrorInSearchParams } from "../../hooks/useErrorInSearchParams";
import { MastodonFlockResults, useResults } from "../../hooks/useResults";
import { useSearchParamsState } from "../../hooks/useSearchParamsState";
import { useWindowManager } from "../../hooks/useWindowManager";
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
  const [step, setStep] = useSearchParamsState("step");
  const [method, setMethod] = useSearchParamsState("method");
  const [mastodonHostname] = useSearchParamsState("uri");
  const { registerSelf } = useWindowManager();
  const windowId = registerSelf();

  const { setError } = useErrorInSearchParams();

  const navigateTo = useCallback((step: string | undefined) => {
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
      if (error === "noAccountsFound") {
        handleFlockResults({ accounts: [], twitterUsers: [] });
        return;
      }

      if (error !== "aborted") {
        console.error(error);
        setError(error);
      }
      if (method === "typical") {
        navigateTo("chooseMastodonInstance");
      } else {
        navigateTo("chooseMethod");
      }
    },
    [handleFlockResults, method, navigateTo, setError],
  );

  const connectTwitter = useCallback(() => {
    location.href = config.urls.twitterLogin;
  }, []);

  const goWelcome = useCallback(() => {
    navigateTo(undefined);
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
    case undefined: {
      stepNode = (
        <Welcome
          cancel={closeWizard}
          goNext={connectTwitter}
          windowId={windowId}
        />
      );
      break;
    }
    case "chooseMethod": {
      stepNode = (
        <ChooseMethod
          initialMethod={method ?? "typical"}
          cancel={closeWizard}
          goBack={goWelcome}
          goNext={chooseMethod}
          windowId={windowId}
        />
      );
      break;
    }
    case "chooseMastodonInstance": {
      stepNode = (
        <ChooseMastodonInstance
          initialMastodonHostname={mastodonHostname}
          cancel={closeWizard}
          goBack={goChooseMethod}
          goNext={loadData}
          windowId={windowId}
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
      stepNode = (
        <Finish cancel={closeWizard} goNext={goResults} windowId={windowId} />
      );
      break;
    }
    default:
      stepNode = <div>BSOD</div>;
  }

  return stepNode;
}
