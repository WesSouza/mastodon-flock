import React, { useCallback, useContext, useMemo, useRef } from "react";

import {
  WindowManagerContext,
  WindowOpenOptions,
} from "../components/WindowManager/WindowManager";

export function useWindowManager({ windowId }: { windowId?: string } = {}) {
  const context = useContext(WindowManagerContext);
  const selfWindowId = useRef<string>();

  const active = useMemo(() => true, []);

  const handleClose = useCallback(() => {
    if (!windowId && !selfWindowId.current) {
      throw new Error("Unable to close unregistered window");
    }

    context.closeWindow(windowId ?? (selfWindowId.current as string));
  }, [context, windowId]);

  const openWindow = useCallback(
    <T extends React.ElementType<any>>(
      component: T,
      props: Omit<React.ComponentPropsWithoutRef<T>, "windowId">,
      options?: WindowOpenOptions,
    ) => {
      return context.openWindow(component, props, options ?? {});
    },
    [context],
  );

  const closeWindowWithId = useCallback(
    (windowId: string | undefined) => {
      if (!windowId) {
        return;
      }

      context.closeWindow(windowId);
    },
    [context],
  );

  const registerSelf = useCallback(() => {
    if (windowId) {
      return windowId;
    }

    if (!selfWindowId.current) {
      selfWindowId.current = context.newRenderedWindow();
    }

    return selfWindowId.current;
  }, [context, windowId]);

  return {
    active,
    handleClose,
    openWindow,
    closeWindowWithId,
    registerSelf,
  };
}
