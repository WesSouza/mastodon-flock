import { useCallback, useState } from "react";

export function useRerender() {
  const [, add] = useState(0);

  return useCallback(() => {
    add((number) => number + 1);
  }, []);
}
