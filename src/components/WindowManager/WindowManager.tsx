import { useStore } from "@nanostores/react";
import { createContext, useCallback, useMemo, useState } from "react";
import {
  activeWindowId,
  blinkWindowTitle,
  openWindows,
} from "../../stores/WindowStore";
import { SvgSprite } from "../SvgSprite";
import { WindowRenderer } from "./WindowRenderer";

export const WindowManagerContext = createContext({
  focusedButtonId: undefined,
  setFocusedButtonId: () => {},
} as unknown as {
  focusedButtonId: string | undefined;
  setFocusedButtonId: (id: string | undefined) => void;
});

export function WindowManager({ children }: { children: React.ReactNode }) {
  const $openWindows = useStore(openWindows);
  const $activeWindowId = useStore(activeWindowId);

  const [focusedButtonId, setFocusedButtonId] = useState<string>();

  const contextValue = useMemo(
    () => ({
      focusedButtonId,
      setFocusedButtonId,
    }),
    [focusedButtonId, setFocusedButtonId],
  );

  const handleModalClickOutside = useCallback(
    ({ windowId }: { windowId: string }) => {
      blinkWindowTitle(windowId);
    },
    [],
  );

  return (
    <WindowManagerContext.Provider value={contextValue}>
      {children}
      {Object.values($openWindows).map(
        (window) =>
          window && (
            <WindowRenderer
              key={window.id}
              active={$activeWindowId === window.id}
              modal={window.options.modal}
              onModalClickOutside={handleModalClickOutside}
              window={window}
            />
          ),
      )}
      <SvgSprite>
        <svg xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter
              id="toolbar-disabled-icon"
              x="0"
              y="0"
              width="100%"
              height="100%"
            >
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0 0 0 0 0.23 0 0 0 0 0.23 0 0 0 0 0.23 -10 -10 -10 10 0"
              />
            </filter>
          </defs>
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
