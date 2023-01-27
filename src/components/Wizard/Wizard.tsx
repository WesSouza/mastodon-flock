import { useCallback, useEffect } from "react";

import { config } from "../../config";
import { useErrorInSearchParams } from "../../hooks/useErrorInSearchParams";
import { MastodonFlockResults, useResults } from "../../hooks/useResults";
import { useSearchParamsState } from "../../hooks/useSearchParamsState";
import { useWindowManager } from "../../hooks/useWindowManager";
import type { SimpleError } from "../../types";
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
      setResults(method ?? "", mastodonHostname ?? "", results);
      navigateTo("finish");
    },
    [mastodonHostname, method, navigateTo, setResults],
  );

  const handleFlockError = useCallback(
    ({ error, reason }: SimpleError) => {
      if (error === "noAccountsFound") {
        handleFlockResults({ accounts: [], twitterUsers: [] });
        return;
      }

      if (error !== "aborted") {
        console.error(reason ?? error);
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

  const connectTwitterWithMethod = useCallback((method: string) => {
    const url = new URL(config.urls.twitterLogin);
    url.searchParams.set("method", method);
    location.href = url.href;
  }, []);

  const welcomeStep = useCallback(() => {
    navigateTo(undefined);
  }, [navigateTo]);

  const chooseMethodStep = useCallback(() => {
    navigateTo("chooseMethod");
  }, [navigateTo]);

  const chooseMethod = useCallback(
    (newMethod: string) => {
      setMethod(newMethod);
      connectTwitterWithMethod(newMethod);
    },
    [connectTwitterWithMethod, setMethod],
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
          goNext={chooseMethodStep}
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
          goBack={welcomeStep}
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
          goBack={chooseMethodStep}
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
