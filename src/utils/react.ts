import type React from "react";

export function createKeyboardEvent<T extends Element, E extends KeyboardEvent>(
  event: E,
): React.KeyboardEvent<T> {
  let isDefaultPrevented = false;
  let isPropagationStopped = false;
  const preventDefault = () => {
    isDefaultPrevented = true;
    event.preventDefault();
  };
  const stopPropagation = () => {
    isPropagationStopped = true;
    event.stopPropagation();
  };
  return {
    altKey: event.altKey,
    bubbles: event.bubbles,
    cancelable: event.cancelable,
    charCode: event.charCode,
    code: event.code,
    ctrlKey: event.ctrlKey,
    currentTarget: event.currentTarget as EventTarget & T,
    defaultPrevented: event.defaultPrevented,
    detail: event.detail,
    eventPhase: event.eventPhase,
    getModifierState: event.getModifierState,
    isDefaultPrevented: () => isDefaultPrevented,
    isPropagationStopped: () => isPropagationStopped,
    isTrusted: event.isTrusted,
    key: event.key,
    keyCode: event.keyCode,
    location: event.location,
    metaKey: event.metaKey,
    nativeEvent: event,
    persist: () => {},
    preventDefault,
    repeat: event.repeat,
    shiftKey: event.shiftKey,
    stopPropagation,
    target: event.target as EventTarget & T,
    timeStamp: event.timeStamp,
    type: event.type,
    which: event.which,
    get locale(): string {
      throw new Error("Not implemented");
    },
    get view(): React.AbstractView {
      throw new Error("Not implemented");
    },
  };
}
