import { useCallback, useRef } from "react";

import { ErrorWindow } from "../components/Error";
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
      if (newValue) {
        errorWindowIdRef.current = openWindow(
          ErrorWindow,
          { error: newValue },
          {
            onClose: () => {
              errorCloseCallbackRef.current?.(undefined);
            },
          },
        );
      } else if (errorWindowIdRef.current) {
        closeWindowWithId(errorWindowIdRef.current);
        errorWindowIdRef.current = undefined;
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
