import { atom, computed, map } from "nanostores";

export interface WindowRecord {
  animations: {
    titleBlink: number;
  };
  Component: React.ElementType<any>;
  id: string;
  props: Record<string, any>;
  options: WindowOpenOptions;
}

export type WindowOpenFn = <T extends React.ElementType<any>>(
  component: T,
  props: Omit<React.ComponentPropsWithoutRef<T>, "windowMeta">,
  options?: WindowOpenOptions,
) => string;

export type WindowMeta = {
  active: boolean;
  id: string;
  modal: boolean;
  titleBlink: number;
};

export type WindowOpenOptions = {
  modal?: boolean;
  onClose?: (event: { windowId: string }) => void;
};

export const openWindows = map<Record<string, WindowRecord | undefined>>({});

export const windowOrder = atom<string[]>([]);

const externalWindowPrefix = "external-";

export const openWindow: WindowOpenFn = function openWindow(
  component,
  props,
  options,
) {
  const windowId = Math.random().toString();
  openWindows.setKey(windowId, {
    animations: {
      titleBlink: 0,
    },
    Component: component,
    id: windowId,
    props,
    options: options ?? {},
  });

  const windowOrderValue = windowOrder.get();
  windowOrderValue.push(windowId);
  windowOrder.set(windowOrderValue);

  return windowId;
};

export function closeWindow(windowId: string) {
  if (windowId.startsWith(externalWindowPrefix)) {
    console.warn("Closing rendered windows has no effect");
    return;
  }

  if (!windowId) {
    throw new Error("Cannot close window without an ID");
  }

  const windowOrderValue = windowOrder.get();
  const orderIndexOf = windowOrderValue.findIndex(
    (orderedWindowId) => orderedWindowId === windowId,
  );
  if (orderIndexOf >= 0) {
    windowOrderValue.splice(orderIndexOf, 1);
    windowOrder.set(windowOrderValue);
  }

  const window = openWindows.get()[windowId];
  if (window) {
    window.options.onClose?.call(null, { windowId });
    openWindows.setKey(windowId, undefined);
  }
}

export function newRenderedWindow() {
  const windowId = `${externalWindowPrefix}${Math.random().toString()}`;

  const windowOrderValue = windowOrder.get();
  windowOrderValue.push(windowId);
  windowOrder.set(windowOrderValue);

  return windowId;
}

// FIXME: This change is not propagating to the windowMeta
export function blinkWindowTitle(windowId: string) {
  const window = openWindows.get()[windowId];
  if (window) {
    window.animations.titleBlink += 1;
    openWindows.setKey(windowId, window);
  }
}

export const activeWindowId = computed(
  windowOrder,
  (order) => order[order.length - 1],
);
