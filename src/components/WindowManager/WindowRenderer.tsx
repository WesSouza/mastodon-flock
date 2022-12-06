import { useCallback, useMemo } from "react";
import styled from "styled-components";
import { getMetaFromWindowRecord } from "./utils";
import type { WindowMeta, WindowRecord } from "./WindowManager";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1;
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
