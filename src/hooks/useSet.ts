import { useCallback, useMemo, useRef } from "react";
import { useRerender } from "./useRerender";

export function useSet<T>(initialSet?: Set<T> | T[]) {
  const rerender = useRerender();

  const set = useRef<Set<T>>();
  useMemo(() => {
    set.current = new Set(initialSet);
  }, [initialSet]);

  const add = useCallback(
    (element: T) => {
      if (set.current?.has(element)) {
        return;
      }
      set.current?.add(element);
      rerender();
    },
    [rerender],
  );

  const deleteFn = useCallback(
    (element: T) => {
      if (!set.current?.has(element)) {
        return;
      }

      set.current?.delete(element);
      rerender();
    },
    [rerender],
  );

  const has: Set<T>["has"] = useCallback((element) => {
    return set.current?.has(element) ?? false;
  }, []);

  const forEach: Set<T>["forEach"] = useCallback((callbackfn, thisArg) => {
    return set.current?.forEach(callbackfn, thisArg);
  }, []);

  return useMemo(
    () => ({
      add,
      delete: deleteFn,
      forEach,
      has,
      get size() {
        return set.current?.size ?? 0;
      },
    }),
    [add, deleteFn, forEach, has],
  );
}
