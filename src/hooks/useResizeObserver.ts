// Adapted from https://github.com/mantinedev/mantine/blob/master/src/mantine-hooks/src/use-resize-observer/use-resize-observer.ts

import { useCallback, useMemo, useRef, useState } from "react";

type ObserverRect = Omit<DOMRectReadOnly, "toJSON">;

const defaultState: ObserverRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
};

export function useResizeObserver<T extends HTMLElement = any>() {
  const animationFrame = useRef(0);
  const [rect, setRect] = useState<ObserverRect>(defaultState);
  const ref = useRef<T>();

  const resizeObserverCallback = useCallback((entries: any) => {
    const entry = entries[0];

    if (entry) {
      cancelAnimationFrame(animationFrame.current);

      animationFrame.current = requestAnimationFrame(() => {
        if (ref.current) {
          setRect(entry.contentRect);
        }
      });
    }
  }, []);

  const observer = useMemo(
    () =>
      typeof window !== "undefined"
        ? new ResizeObserver(resizeObserverCallback)
        : undefined,
    [resizeObserverCallback],
  );

  const setRef = useCallback(
    (element: T | null) => {
      ref.current = element ?? undefined;

      if (element && typeof window !== "undefined") {
        observer?.observe(element);
      } else {
        observer?.disconnect();

        if (animationFrame.current) {
          cancelAnimationFrame(animationFrame.current);
        }
      }
    },
    [observer],
  );

  return useMemo(() => [rect, setRef] as const, [rect, setRef]);
}
