/// <reference types="astro/client" />

interface Plausible {
  (...args: any[]): void;
  q: IArguments[];
}

interface Window {
  plausible: Plausible;
}
