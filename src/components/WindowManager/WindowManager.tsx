import { createContext, useCallback, useMemo, useRef, useState } from "react";
import { WindowRenderer } from "./WindowRenderer";

const externalWindowPrefix = "external-";

export type WindowRecord = {
  animations: {
    titleBlink: number;
  };
  id: string;
  Component: React.ElementType<any>;
  props: Record<string, any>;
  options: WindowOpenOptions;
};

export type WindowOpenFn = <T extends React.ElementType<any>>(
  component: T,
  props: Omit<React.ComponentPropsWithoutRef<T>, "windowMeta">,
  options?: WindowOpenOptions,
) => string;

export type WindowMeta = {
  active: boolean;
  id: string;
  titleBlink: number;
};

export type WindowOpenOptions = {
  modal?: boolean;
  onClose?: (event: { windowId: string }) => void;
};

export const WindowManagerContext = createContext({
  activeWindowId: false,
  closeWindow: () => {},
  newRenderedWindow: () => "",
  openWindow: () => {},
} as unknown as {
  activeWindowId: string | undefined;
  closeWindow: (windowId: string) => void;
  newRenderedWindow: () => string;
  openWindow: WindowOpenFn;
});

export function WindowManager({ children }: { children: React.ReactNode }) {
  const windowsRef = useRef<WindowRecord[]>([]);
  const windowOrderRef = useRef<string[]>([]);
  const [_, flip] = useState(false);

  const rerender = useCallback(() => {
    flip((flop) => !flop);
  }, []);

  const openWindow: WindowOpenFn = useCallback(
    (component, props, options) => {
      const windowId = Math.random().toString();
      windowsRef.current.push({
        animations: {
          titleBlink: 0,
        },
        Component: component,
        id: windowId,
        props,
        options: options ?? {},
      });

      windowOrderRef.current.push(windowId);

      rerender();
      return windowId;
    },
    [rerender],
  );

  const closeWindow = useCallback(
    (windowId: string) => {
      if (windowId.startsWith(externalWindowPrefix)) {
        console.warn("Closing rendered windows has no effect");
        return;
      }

      if (!windowId) {
        throw new Error("Cannot close window without an ID");
      }

      const orderIndexOf = windowOrderRef.current.findIndex(
        (orderedWindowId) => orderedWindowId === windowId,
      );
      if (orderIndexOf >= 0) {
        windowOrderRef.current.splice(orderIndexOf, 1);
      }

      const indexOf = windowsRef.current.findIndex(
        (window) => window.id === windowId,
      );
      if (indexOf >= 0) {
        const window = windowsRef.current.splice(indexOf, 1);
        window[0]?.options?.onClose?.call(null, { windowId });
        rerender();
      }
    },
    [rerender],
  );

  const newRenderedWindow = useCallback(() => {
    const windowId = `${externalWindowPrefix}${Math.random().toString()}`;
    windowOrderRef.current.push(windowId);

    rerender();
    return windowId;
  }, [rerender]);

  const activeWindowId =
    windowOrderRef.current[windowOrderRef.current.length - 1];

  const contextValue = useMemo(
    () => ({
      activeWindowId,
      closeWindow,
      newRenderedWindow,
      openWindow,
    }),
    [activeWindowId, closeWindow, newRenderedWindow, openWindow],
  );

  const handleModalClickOutside = useCallback(
    ({ windowId }: { windowId: string }) => {
      const windowIndex = windowsRef.current.findIndex(
        (window) => window.id === windowId,
      );
      const window = windowsRef.current[windowIndex];
      if (window) {
        windowsRef.current[windowIndex] = {
          ...window,
          animations: {
            ...window.animations,
            titleBlink: window.animations.titleBlink + 1,
          },
        };

        rerender();
      }
    },
    [rerender],
  );

  return (
    <WindowManagerContext.Provider value={contextValue}>
      {children}
      {windowsRef.current.map((window) => (
        <WindowRenderer
          key={window.id}
          active={
            windowOrderRef.current[windowOrderRef.current.length - 1] ===
            window.id
          }
          modal={window.options.modal}
          onModalClickOutside={handleModalClickOutside}
          window={window}
        />
      ))}
    </WindowManagerContext.Provider>
  );
}
