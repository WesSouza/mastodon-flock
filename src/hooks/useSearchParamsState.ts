import { useCallback, useEffect, useMemo, useState } from "react";

export function useSearchParamsState(name: string, defaultValue?: string) {
  const valueFromUrl = useMemo(() => {
    const url = new URL(location.href);
    const urlStateValue = url.searchParams.get(name);
    if (!urlStateValue && defaultValue) {
      url.searchParams.set(name, defaultValue);
      history.replaceState(null, "", url);
    }
    return urlStateValue ?? defaultValue;
  }, [defaultValue, name]);

  const [value, setInternalValue] = useState(valueFromUrl);

  const setValue = useCallback((value = defaultValue) => {
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

    setInternalValue(value);
  }, []);

  useEffect(() => {
    function handlePopState() {
      const url = new URL(location.href);
      const urlStateValue = url.searchParams.get(name) ?? undefined;
      setInternalValue(urlStateValue);
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [name]);

  return [value, setValue] as [
    typeof defaultValue,
    (value: string | undefined) => void,
  ];
}
