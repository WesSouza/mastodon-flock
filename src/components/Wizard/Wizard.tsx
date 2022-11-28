import { useCallback, useEffect, useState } from "react";
import { config } from "../../config";
import { MastodonFlockResults, useResults } from "../Results/useResults";

import { ChooseMastodonInstance } from "./ChooseMastodonInstance";
import { ChooseMethod } from "./ChooseMethod";
import { Installer } from "./LoadingInformation";
import { Welcome } from "./Welcome";

export type WizardStep =
  | "welcome"
  | "chooseMethod"
  | "chooseMastodonInstance"
  | "loadingInformation"
  | "error"
  | "finish";

export type WizardProps = {
  step: WizardStep | string | undefined;
};

export function Wizard({ step: initialStep }: WizardProps) {
  const [step, setStep] = useState(initialStep ?? "welcome");
  const [method, setMethod] = useState<"typical" | "advanced" | undefined>();

  useEffect(() => {
    const url = new URL(location.href);
    const urlStep = url.searchParams.get("step");
    const urlMethod = url.searchParams.get("method");
    if (urlStep !== step || urlMethod !== method) {
      if (step) {
        url.searchParams.set("step", step);
      } else {
        url.searchParams.delete("step");
      }

      if (method) {
        url.searchParams.set("method", method);
      } else {
        url.searchParams.delete("method");
      }

      history.pushState(null, "", url);
    }
  }, [method, step]);

  useEffect(() => {
    function handlePopState() {
      const url = new URL(location.href);
      const urlStep = url.searchParams.get("step") ?? undefined;
      setStep(urlStep ?? "welcome");
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigateTo = useCallback((step: string) => {
    const url = new URL(location.href);
    url.searchParams.set("step", step);
    history.pushState(null, "", url);
    setStep(step);
  }, []);

  const { saveResults } = useResults();

  const handleFlockResults = useCallback(
    (results: MastodonFlockResults) => {
      saveResults(results);
      navigateTo("finish");
    },
    [navigateTo],
  );

  const handleFlockError = useCallback(
    (error: string) => {
      console.error(error);
      navigateTo("error");
    },
    [navigateTo],
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
    (newMethod: "typical" | "advanced") => {
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
    [navigateTo],
  );

  const closeWizard = useCallback(() => {
    location.href = config.urls.desktop;
  }, []);

  switch (step) {
    case "welcome": {
      return <Welcome cancel={closeWizard} goNext={connectTwitter} />;
    }
    case "chooseMethod": {
      return (
        <ChooseMethod
          initialMethod={method ?? "typical"}
          cancel={closeWizard}
          goBack={goWelcome}
          goNext={chooseMethod}
        />
      );
    }
    case "chooseMastodonInstance": {
      return (
        <ChooseMastodonInstance
          cancel={closeWizard}
          goBack={goChooseMethod}
          goNext={loadData}
        />
      );
    }
    case "loadingInformation": {
      return (
        <Installer
          method={method ?? "advanced"}
          onError={handleFlockError}
          onResults={handleFlockResults}
        />
      );
    }
  }

  return <>BSOD</>;
}
