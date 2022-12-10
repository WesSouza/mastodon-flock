import { useCallback, useMemo } from "react";
import styled from "styled-components";

import type { WindowMeta, WindowRecord } from "../../stores/WindowStore";
import { getMetaFromWindowRecord } from "./utils";

const ModalOverlay = styled.div`
  top: 0;
  left: 0;
  right: 0;
  padding-block-end: var(--taskbar-height);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;

  @media (max-height: 767px) {
    position: absolute;
    justify-content: flex-start;
  }

  @media (min-height: 768px) {
    position: fixed;
    justify-content: center;
    bottom: 0;
  }
`;

export function WindowRenderer({
  active,
  modal = false,
  onModalClickOutside,
  window,
}: {
  active: boolean;
  modal: boolean | undefined;
  onModalClickOutside: (options: { windowId: string }) => void;
  window: WindowRecord;
}) {
  const handleModalClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      // FIXME: This is not being called when clicking outside of the modal for
      // some nefarious reason
      if (event.target === event.currentTarget) {
        onModalClickOutside({ windowId: window.id });
      }
    },
    [onModalClickOutside, window.id],
  );

  const windowMeta: WindowMeta = useMemo(
    () => getMetaFromWindowRecord(window, { active, modal }),
    [active, modal, window],
  );

  if (modal) {
    return (
      <ModalOverlay onClick={handleModalClick}>
        <window.Component {...window.props} windowMeta={windowMeta} />
      </ModalOverlay>
    );
  }

  return <window.Component {...window.props} windowMeta={windowMeta} />;
}
