import { createContext, useCallback, useMemo, useRef, useState } from "react";

const externalWindowId = "external";

type WindowRecord = {
  id: string;
  Component: React.ElementType<any>;
  props: Record<string, any>;
  options: WindowOpenOptions;
};

export type WindowOpenOptions = {
  onClose?: (event: { windowId: string }) => void;
};

export const WindowManagerContext = createContext({
  closeWindow: () => {},
  newRenderedWindow: () => "",
  openWindow: () => {},
} as unknown as {
  closeWindow: (windowId: string) => void;
  newRenderedWindow: () => string;
  openWindow: <T extends React.ElementType<any>>(
    component: T,
    props: Omit<React.ComponentPropsWithoutRef<T>, "windowId">,
    options: WindowOpenOptions,
  ) => string;
});

export function WindowManager({ children }: { children: React.ReactNode }) {
  const windowsRef = useRef<WindowRecord[]>([]);
  const [_, flip] = useState(false);

  const rerender = useCallback(() => {
    flip((flop) => !flop);
  }, []);

  const openWindow = useCallback(
    <T extends React.ElementType<any>>(
      component: T,
      props: Omit<React.ComponentPropsWithoutRef<T>, "windowId">,
      options: WindowOpenOptions,
    ) => {
      const windowId = Math.random().toString();
      windowsRef.current.push({
        Component: component,
        id: windowId,
        props,
        options,
      });

      rerender();

      return windowId;
    },
    [rerender],
  );

  const closeWindow = useCallback(
    (windowId: string) => {
      if (windowId === externalWindowId) {
        console.warn("Closing rendered windows has no effect");
        return;
      }

      if (!windowId) {
        throw new Error("Cannot close window without an ID");
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
    return externalWindowId;
  }, []);

  const contextValue = useMemo(
    () => ({
      closeWindow,
      newRenderedWindow,
      openWindow,
    }),
    [closeWindow, newRenderedWindow, openWindow],
  );

  return (
    <WindowManagerContext.Provider value={contextValue}>
      {children}
      {windowsRef.current.map((window) => (
        <window.Component
          key={window.id}
          {...window.props}
          windowId={window.id}
        />
      ))}
    </WindowManagerContext.Provider>
  );
}
