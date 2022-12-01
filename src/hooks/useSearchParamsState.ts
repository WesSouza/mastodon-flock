import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useSearchParamsState(
  name: string,
  {
    defaultValue,
    onChange,
  }: {
    defaultValue?: string;
    onChange?: (
      newValue: string | undefined,
      previousValue: string | undefined,
    ) => void;
  } = {},
) {
  const valueRef = useRef<string>();
  const [, flip] = useState(false);

  useMemo(() => {
    const url = new URL(location.href);
    const urlStateValue = url.searchParams.get(name);
    if (!urlStateValue && defaultValue) {
      url.searchParams.set(name, defaultValue);
      history.replaceState(null, "", url);
    }
    valueRef.current = urlStateValue ?? defaultValue;
  }, [defaultValue, name]);

  useEffect(() => {
    if (valueRef.current) {
      onChange?.(valueRef.current, undefined);
    }
  }, [onChange]);

  const rerender = useCallback(() => {
    flip((flop) => !flop);
  }, []);

  const handleValueChange = useCallback(
    (newValue: string | undefined) => {
      if (newValue !== valueRef.current) {
        const oldValue = valueRef.current;
        valueRef.current = newValue;
        onChange?.(newValue, oldValue);
        rerender();
      }
    },
    [onChange, rerender],
  );

  const setValue = useCallback(
    (value = defaultValue) => {
      const url = new URL(location.href);
      const urlStateValue = url.searchParams.get(name) ?? undefined;
      if (value !== urlStateValue) {
        if (!value) {
          url.searchParams.delete(name);
        } else {
          url.searchParams.set(name, value);
        }
        history.pushState(null, "", url);
      }

      handleValueChange(value);
    },
    [defaultValue, handleValueChange, name],
  );

  useEffect(() => {
    function handlePopState() {
      const url = new URL(location.href);
      const urlStateValue = url.searchParams.get(name) ?? undefined;

      handleValueChange(urlStateValue);
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [handleValueChange, name]);

  return [valueRef.current, setValue] as [
    typeof defaultValue,
    (value: string | undefined) => void,
  ];
}
