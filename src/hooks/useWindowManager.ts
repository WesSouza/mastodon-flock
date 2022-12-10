import { useStore } from "@nanostores/react";
import { useCallback, useMemo, useRef } from "react";

import { getMetaFromWindowRecord } from "../components/WindowManager/utils";
import type { WindowMeta, WindowOpenFn } from "../stores/WindowStore";
import {
  activeWindowId,
  closeWindow,
  newRenderedWindow,
  openWindow as openWindowOnStore,
} from "../stores/WindowStore";

export function useWindowManager({
  windowId,
}: { windowId?: string | undefined } = {}) {
  const $activeWindowId = useStore(activeWindowId);
  const selfWindowId = useRef<string>();

  const handleClose = useCallback(() => {
    if (!windowId && !selfWindowId.current) {
      throw new Error("Unable to close unregistered window");
    }

    closeWindow(windowId ?? (selfWindowId.current as string));
  }, [windowId]);

  const openWindow: WindowOpenFn = useCallback((component, props, options) => {
    return openWindowOnStore(component, props, options);
  }, []);

  const closeWindowWithId = useCallback((windowId: string | undefined) => {
    if (!windowId) {
      return;
    }

    closeWindow(windowId);
  }, []);

  const registerSelf = useCallback(() => {
    if (!selfWindowId.current) {
      selfWindowId.current = newRenderedWindow();
    }

    return selfWindowId.current;
  }, []);

  const active = Boolean(
    $activeWindowId &&
      ($activeWindowId === selfWindowId.current ||
        $activeWindowId === windowId),
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
