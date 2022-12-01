import type { WindowMeta, WindowRecord } from "./WindowManager";

export function getMetaFromWindowRecord(
  windowOrId: WindowRecord | string,
  options: { active: boolean },
): WindowMeta {
  if (typeof windowOrId === "string") {
    return {
      id: windowOrId,
      active: options.active,
      titleBlink: 0,
    };
  }

  return {
    id: windowOrId.id,
    active: options.active,
    titleBlink: windowOrId.animations.titleBlink,
  };
}
