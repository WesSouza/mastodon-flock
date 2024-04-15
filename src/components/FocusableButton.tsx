import { useCallback } from "react";
import { Button, type ButtonProps } from "react95";
import { useFocusableButton } from "../hooks/useFocusableButton";

export function FocusableButton({
  children,
  onBlur,
  onFocus,
  onPress,
  primary,
  ...props
}: Omit<ButtonProps, "onClick"> & {
  onPress?:
    | ((
        event:
          | React.KeyboardEvent<HTMLButtonElement>
          | React.MouseEvent<HTMLButtonElement>,
      ) => void)
    | undefined;
}) {
  const handlePressOrSubmit = useCallback(
    (
      event:
        | React.KeyboardEvent<HTMLButtonElement>
        | React.MouseEvent<HTMLButtonElement>,
    ) => {
      onPress?.(event);
    },
    [onPress],
  );

  const { buttonRef, currentPrimary, handleBlur, handleFocus } =
    useFocusableButton({
      onBlur,
      onFocus,
      onSubmit: handlePressOrSubmit,
      primary,
    });

  return (
    <Button
      onBlur={handleBlur}
      onFocus={handleFocus}
      onClick={handlePressOrSubmit}
      primary={currentPrimary ?? false}
      ref={buttonRef}
      {...props}
    >
      {children}
    </Button>
  );
}
