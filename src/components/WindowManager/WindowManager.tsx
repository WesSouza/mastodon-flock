import { createContext, useCallback, useMemo, useRef } from "react";
import { useRerender } from "../../hooks/useRerender";
import { SvgSprite } from "../SvgSprite";
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
  const rerender = useRerender();

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
      <SvgSprite>
        <svg xmlns="http://www.w3.org/2000/svg">
          <symbol id="window-restore" viewBox="0 0 18 15">
            <path
              fill="#000"
              fillRule="evenodd"
              d="M1 5v9h10V9h3V0H4v5H1Zm5-2v2h5v2h1V3H6ZM3 8v4h6V8H3Z"
              clipRule="evenodd"
            />
          </symbol>
          <symbol id="window-close" viewBox="0 0 18 15">
            <path fill="#000" d="M5 2H3v1l10 9h2v-1L5 2Z" />
            <path fill="#000" d="M15 2h-2L3 11v1h2l10-9V2Z" />
          </symbol>
          <symbol id="window-maximize" viewBox="0 0 18 15">
            <path
              fill="#000"
              fillRule="evenodd"
              d="M1 0v14h14V0H1Zm2 3h10v9H3V3Z"
              clipRule="evenodd"
            />
          </symbol>
          <symbol id="window-minimize" viewBox="0 0 18 15">
            <path fill="#000" d="M12 11H3v2h9v-2Z" />
          </symbol>
        </svg>
      </SvgSprite>
    </WindowManagerContext.Provider>
  );
}
