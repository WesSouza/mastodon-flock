import { useCallback, useContext, useMemo, useRef } from "react";
import { getMetaFromWindowRecord } from "../components/WindowManager/utils";

import {
  WindowManagerContext,
  WindowMeta,
  WindowOpenFn,
} from "../components/WindowManager/WindowManager";

export function useWindowManager({ windowId }: { windowId?: string } = {}) {
  const context = useContext(WindowManagerContext);
  const selfWindowId = useRef<string>();

  const handleClose = useCallback(() => {
    if (!windowId && !selfWindowId.current) {
      throw new Error("Unable to close unregistered window");
    }

    context.closeWindow(windowId ?? (selfWindowId.current as string));
  }, [context, windowId]);

  const openWindow: WindowOpenFn = useCallback(
    (component, props, options) => {
      return context.openWindow(component, props, options);
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
    if (!selfWindowId.current) {
      selfWindowId.current = context.newRenderedWindow();
    }

    return selfWindowId.current;
  }, [context]);

  const active = Boolean(
    context.activeWindowId &&
      (context.activeWindowId === selfWindowId.current ||
        context.activeWindowId === windowId),
  );

  const windowMeta: WindowMeta = useMemo(
    () =>
      getMetaFromWindowRecord(windowId ?? selfWindowId.current ?? "", {
        active,
        modal: false,
      }),
    [active, windowId],
  );

  return {
    handleClose,
    openWindow,
    closeWindowWithId,
    registerSelf,
    windowMeta,
  };
}
