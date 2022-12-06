// Adapted from https://codepen.io/SitePoint/pen/JRaLVR

import { useCallback, useEffect, useMemo, useRef } from "react";
import { collect } from "../utils/plausible";

export function useWinAmp(url: string) {
  const buffer = useRef<AudioBuffer>();
  const context = useRef<AudioContext>();
  const source = useRef<AudioBufferSourceNode>();

  useMemo(() => {
    context.current = new AudioContext();
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    fetch(url, { signal: abortController.signal })
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => context.current?.decodeAudioData(arrayBuffer))
      .then((audioBuffer) => {
        buffer.current = audioBuffer;
      });

    return () => {
      abortController.abort();
    };
  }, [url]);

  return useCallback(() => {
    if (!buffer.current || !context.current) {
      return;
    }

    if (source.current) {
      source.current.stop();
    }

    source.current = context.current.createBufferSource();
    source.current.buffer = buffer.current;
    source.current.connect(context.current.destination);
    source.current.start();

    collect("DING");
  }, []);
}
