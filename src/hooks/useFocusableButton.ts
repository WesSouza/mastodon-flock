import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import type { ButtonProps } from "react95";
import { WindowManagerContext } from "../components/WindowManager/WindowManager";
import { createKeyboardEvent } from "../utils/react";

export function useFocusableButton({
  onBlur,
  onFocus,
  onSubmit,
  primary,
}: {
  onBlur: ButtonProps["onBlur"];
  onFocus: ButtonProps["onFocus"];
  onSubmit: ButtonProps["onKeyDown"];
  primary: ButtonProps["primary"];
}) {
  const { focusedButtonId, setFocusedButtonId } =
    useContext(WindowManagerContext);

  const buttonId = useRef<string>();
  useMemo(() => {
    buttonId.current = Math.random().toString();
  }, []);

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLButtonElement>) => {
      onBlur?.(event);
      setFocusedButtonId(undefined);
    },
    [onBlur, setFocusedButtonId],
  );

  const handleFocus = useCallback(
    (event: React.FocusEvent<HTMLButtonElement>) => {
      onFocus?.(event);
      setFocusedButtonId(buttonId.current);
    },
    [onFocus, setFocusedButtonId],
  );

  const handleDocumentKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        !primary ||
        !onSubmit ||
        (focusedButtonId && focusedButtonId !== buttonId.current) ||
        event.target instanceof HTMLAnchorElement ||
        (event.target instanceof HTMLButtonElement &&
          !event.target.dataset.focusableButton)
      ) {
        return;
      }
      if (event.code === "Enter") {
        event.preventDefault();
        onSubmit?.(createKeyboardEvent(event));
      }
    },
    [focusedButtonId, onSubmit, primary],
  );

  useEffect(() => {
    if (primary) {
      document.addEventListener("keydown", handleDocumentKeyDown);

      return () => {
        document.removeEventListener("keydown", handleDocumentKeyDown);
      };
    }

    return () => {};
  }, [handleDocumentKeyDown, primary, setFocusedButtonId]);

  const buttonRef = useCallback((element: HTMLButtonElement) => {
    if (element) {
      element.dataset.focusableButton = "focusableButton";
    }
  }, []);

  return useMemo(
    () => ({
      buttonRef,
      currentPrimary:
        focusedButtonId === buttonId.current || (primary && !focusedButtonId),
      handleBlur,
      handleFocus,
    }),
    [buttonRef, focusedButtonId, handleBlur, handleFocus, primary],
  );
}
