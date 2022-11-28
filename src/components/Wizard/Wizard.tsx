import { useCallback, useEffect, useState } from "react";
import { config } from "../../config";

import { ChooseMastodonInstance } from "./ChooseMastodonInstance";
import { ChooseMethod } from "./ChooseMethod";
import { LoadingInformation } from "./LoadingInformation";
import { Welcome } from "./Welcome";

export type WizardStep =
  | "welcome"
  | "chooseMethod"
  | "chooseMastodonInstance"
  | "loadingInformation";

export type WizardProps = {
  step: WizardStep | string | undefined;
};

export function Wizard({ step: initialStep }: WizardProps) {
  const [step, setStep] = useState(initialStep ?? "welcome");
  const [method, setMethod] = useState<"typical" | "advanced">("typical");

  useEffect(() => {
    const url = new URL(location.href);
    const urlStep = url.searchParams.get("step");
    if (urlStep !== step) {
      if (step) {
        url.searchParams.set("step", step);
      } else {
        url.searchParams.delete("step");
      }
      history.pushState(null, "", url);
    }
  }, [step]);

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

  const connectTwitter = useCallback(() => {
    location.href = config.urls.twitterLogin;
  }, []);

  const goWelcome = useCallback(() => {
    navigateTo("welcome");
  }, []);

  const goChooseMethod = useCallback(() => {
    navigateTo("chooseMethod");
  }, []);

  const chooseMethod = useCallback((newMethod: "typical" | "advanced") => {
    setMethod(newMethod);
    if (newMethod === "typical") {
      navigateTo("chooseMastodonInstance");
    } else {
      navigateTo("loadingInformation");
    }
  }, []);

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
    [method],
  );

  const cancelLoad = useCallback(() => {
    if (method === "typical") {
      navigateTo("chooseMastodonInstance");
    } else {
      navigateTo("chooseMethod");
    }
  }, [method]);

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
          initialMethod={method}
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
        <LoadingInformation
          status={status}
          subStatus={subStatus}
          progress={progress}
          cancel={cancelLoad}
        />
      );
    }
  }

  return <>BSOD</>;
}
