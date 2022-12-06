import { useEffect, useState } from "react";

export function useMediaQuery(mediaQueryString: string) {
  const [matches, setMatches] = useState(
    () => window.matchMedia(mediaQueryString).matches,
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mediaQueryString);

    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }
    mediaQueryList.addEventListener("change", handleChange);

    return () => {
      mediaQueryList.removeEventListener("change", handleChange);
    };
  }, [mediaQueryString]);

  return matches;
}
