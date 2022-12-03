import { useCallback, useEffect } from "react";

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
  const { registerSelf, windowMeta } = useWindowManager();

  useEffect(() => {
    registerSelf();
  }, [registerSelf]);

  const { setError } = useErrorInSearchParams();

  const navigateTo = useCallback(
    (step: string | undefined) => {
      setStep(step);
    },
    [setStep],
  );

  const { setResults } = useResults();

  const handleFlockResults = useCallback(
    (results: MastodonFlockResults) => {
      setResults(method ?? "", results);
      navigateTo("finish");
    },
    [method, navigateTo, setResults],
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
      if (error === "missingTwitterSessionData") {
        navigateTo(undefined);
      } else if (method === "typical") {
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
    [navigateTo, setMethod],
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
          windowMeta={windowMeta}
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
          windowMeta={windowMeta}
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
          windowMeta={windowMeta}
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
        <Finish
          cancel={closeWizard}
          goNext={goResults}
          windowMeta={windowMeta}
        />
      );
      break;
    }
    default:
      stepNode = <div>BSOD</div>;
  }

  return stepNode;
}
