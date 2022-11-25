import { useCallback, useEffect, useState } from "react";
import { config } from "../../config";

import { ChooseMastodonServer } from "./ChooseMastodonServer";
import { ChooseMethod } from "./ChooseMethod";
import { LoadingInformation } from "./LoadingInformation";
import { Welcome } from "./Welcome";

export type WizardStep =
  | "welcome"
  | "chooseMethod"
  | "chooseMastodonServer"
  | "loadingInformation";

export type WizardProps = {
  step: WizardStep | string | undefined;
};

export function Wizard({ step: initialStep }: WizardProps) {
  const [step, setStep] = useState(initialStep ?? "welcome");

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

  const chooseMethod = useCallback(() => {
    navigateTo("chooseMastodonServer");
  }, []);

  const loadData = useCallback(() => {
    navigateTo("loadingInformation");
  }, []);

  const cancelLoad = useCallback(() => {
    navigateTo("chooseMastodonServer");
  }, []);

  switch (step) {
    case "welcome": {
      return <Welcome goNext={connectTwitter} />;
    }
    case "chooseMethod": {
      return <ChooseMethod goBack={goWelcome} goNext={chooseMethod} />;
    }
    case "chooseMastodonServer": {
      return <ChooseMastodonServer goBack={goChooseMethod} goNext={loadData} />;
    }
    case "loadingInformation": {
      return <LoadingInformation cancel={cancelLoad} />;
    }
  }

  return <>BSOD</>;
}
