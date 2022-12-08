import type { WindowMeta, WindowRecord } from "../../stores/WindowStore";

export function getMetaFromWindowRecord(
  windowOrId: WindowRecord | string,
  options: { active: boolean; modal: boolean },
): WindowMeta {
  if (typeof windowOrId === "string") {
    return {
      id: windowOrId,
      active: options.active,
      modal: options.modal,
      titleBlink: 0,
    };
  }

  return {
    id: windowOrId.id,
    active: options.active,
    modal: options.modal,
    titleBlink: windowOrId.animations.titleBlink,
  };
}
