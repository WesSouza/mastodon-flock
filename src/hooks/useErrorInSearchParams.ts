import { useCallback, useRef } from "react";

import { ErrorDialog } from "../components/dialogs/ErrorDialog";
import { collect } from "../utils/plausible";
import { useSearchParamsState } from "./useSearchParamsState";
import { useWindowManager } from "./useWindowManager";

export function useErrorInSearchParams() {
  const { openWindow, closeWindowWithId } = useWindowManager();

  const errorWindowIdRef = useRef<string>();
  const errorCloseCallbackRef = useRef<(newValue: string | undefined) => void>(
    () => {},
  );

  const handleErrorChange = useCallback(
    (newValue: string | undefined) => {
      // handleErrorChange is triggered from inside an useEffect at first if
      // there is a value in the URL, which is an anti pattern for the call
      // below which is not supposed to happen while React is rendering. Because
      // of that, I elevate the openWindow call to another tick.
      setTimeout(() => {
        if (newValue) {
          errorWindowIdRef.current = openWindow(
            ErrorDialog,
            { error: newValue },
            {
              modal: true,
              onClose: () => {
                errorCloseCallbackRef.current?.(undefined);
              },
            },
          );
        } else if (errorWindowIdRef.current) {
          closeWindowWithId(errorWindowIdRef.current);
          errorWindowIdRef.current = undefined;
        }
      });
      if (newValue) {
        collect("Wizard Error", { Error: newValue });
      }
    },
    [openWindow, closeWindowWithId],
  );

  const [_, setError] = useSearchParamsState("error", {
    onChange: handleErrorChange,
  });

  errorCloseCallbackRef.current = setError;

  return {
    setError,
  };
}
