import { useCallback, useEffect, useState } from "react";
import { Frame, ScrollView } from "react95";
import styled, { css } from "styled-components";
import { config } from "../config";
import { useSearchParamsState } from "../hooks/useSearchParamsState";

import { useWindowManager } from "../hooks/useWindowManager";
import type { WindowMeta } from "../stores/WindowStore";
import {
  Toolbar,
  ToolbarButtonIcon,
  ToolbarDivider,
  ToolbarHandle,
  ToolbarInput,
  ToolbarLabel,
} from "./Toolbar";
import { Window } from "./WindowManager/Window";

const WindowContent = styled(ScrollView)<{
  fontSizeModifier: number;
  noPadding: boolean;
}>`
  width: 100%;
  flex: 1 1 0%;
  overflow: hidden;
  font-family: Georgia, "Times New Roman", Times, serif;
  font-size: ${({ fontSizeModifier }) => `${1.2 + fontSizeModifier / 10}em`};
  line-height: 1.8;
  background-color: #fff;

  & > div {
    padding: ${({ noPadding }) => (noPadding ? "2px" : "2em")};
  }

  @media print {
    overflow: visible;

    & > div {
      overflow: visible;
    }
  }
`;

const WebViewWrapper = styled(Frame).attrs({ variant: "field" })<{
  fullscreen: boolean;
}>`
  width: 100%;
  padding: 2px;

  ${({ fullscreen }) =>
    fullscreen
      ? css`
          height: 100%;
        `
      : css`
          height: min(calc(calc(100vh - var(--taskbar-height)) - 192px), 800px);
        `}
`;

const WebView = styled.iframe`
  width: 100%;
  height: 100%;
  border: 0;
`;

const StatusBar = styled(Frame).attrs({
  variant: "well",
})`
  height: calc(calc(1em * 1.5) + 10px);
  padding: 4px 6px;
  width: 100%;
  margin-block-start: 4px;

  @media print {
    & {
      display: none;
    }
  }
`;

export function InternetNavigator({
  children,
  defaultUrl,
  modal = false,
  title,
  windowMeta: windowMetaModal,
}: {
  children: React.ReactNode;
  defaultUrl: string;
  modal?: boolean;
  title: string;
  windowMeta?: WindowMeta;
}) {
  const {
    handleClose: handleCloseModal,
    registerSelf,
    windowMeta,
  } = useWindowManager({ windowId: windowMetaModal?.id });
  const [fontSize, setFontSize] = useState(0);
  const [url, setUrl] = useSearchParamsState("url");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!windowMetaModal) {
      registerSelf();
    }
  }, [registerSelf, windowMetaModal]);

  const handleClose = useCallback(() => {
    if (windowMetaModal) {
      handleCloseModal();
    } else {
      location.href = "/desktop";
    }
  }, [handleCloseModal, windowMetaModal]);

  const handleBack = useCallback(() => {
    history.back();
  }, []);

  const handleForward = useCallback(() => {
    history.forward();
  }, []);

  const handleStop = useCallback(() => {}, []);

  const handleRefresh = useCallback(() => {
    location.reload();
  }, []);

  const handleHome = useCallback(() => {
    setUrl(config.urls.home);
  }, [setUrl]);

  const handleSearchWeb = useCallback(() => {
    location.href =
      "https://web.archive.org/web/19990208011304/http://www.altavista.com/";
  }, []);

  const handleFavorites = useCallback(() => {
    location.href = "https://wes.dev/archive/1999/";
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleIncreaseFont = useCallback(() => {
    setFontSize((fontSize) => fontSize + 1);
  }, []);

  const handleDecreaseFont = useCallback(() => {
    setFontSize((fontSize) => fontSize - 1);
  }, []);

  const handleSendEmail = useCallback(() => {
    location.href = `mailto:?body=${encodeURIComponent(location.href)}`;
  }, []);

  const handleBackMouseEnter = useCallback(() => {
    setStatus("Navigate back");
  }, []);

  const handleForwardMouseEnter = useCallback(() => {
    setStatus("Navigate forward");
  }, []);

  const handleStopMouseEnter = useCallback(() => {
    setStatus("Stop loading");
  }, []);

  const handleRefreshMouseEnter = useCallback(() => {
    setStatus("Reload page");
  }, []);

  const handleHomeMouseEnter = useCallback(() => {
    setStatus("Navigate to the home page");
  }, []);

  const handleSearchWebMouseEnter = useCallback(() => {
    setStatus("Search the web");
  }, []);

  const handleFavoritesMouseEnter = useCallback(() => {
    setStatus("Open favorites");
  }, []);

  const handlePrintMouseEnter = useCallback(() => {
    setStatus("Print the current web site");
  }, []);

  const handleIncreaseFontMouseEnter = useCallback(() => {
    setStatus("Increase the font size");
  }, []);

  const handleDecreaseFontMouseEnter = useCallback(() => {
    setStatus("Decrease the font size");
  }, []);

  const handleSendEmailMouseEnter = useCallback(() => {
    setStatus("Send page as email");
  }, []);

  const handleToolbarMouseLeave = useCallback(() => {
    setStatus("");
  }, []);

  const handleContentMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target instanceof HTMLAnchorElement) {
        setStatus(event.target.href);
      } else {
        setStatus("");
      }
    },
    [],
  );

  return (
    <Window
      icon="toolbarWebDocument"
      fullscreen={!modal}
      noPadding
      onClose={handleClose}
      size={modal ? "medium" : "large"}
      title={`${title} – Web 1.0 Internet Navigator`}
      windowMeta={windowMetaModal ?? windowMeta}
    >
      <Toolbar>
        <ToolbarHandle />
        <ToolbarButtonIcon
          icon="toolbarBack"
          onClick={handleBack}
          onMouseEnter={handleBackMouseEnter}
          onMouseLeave={handleToolbarMouseLeave}
        />
        <ToolbarButtonIcon
          icon="toolbarForward"
          onClick={handleForward}
          onMouseEnter={handleForwardMouseEnter}
          onMouseLeave={handleToolbarMouseLeave}
        />
        <ToolbarButtonIcon
          icon="toolbarStop"
          onClick={handleStop}
          onMouseEnter={handleStopMouseEnter}
          onMouseLeave={handleToolbarMouseLeave}
        />
        <ToolbarButtonIcon
          icon="toolbarRefresh"
          onClick={handleRefresh}
          onMouseEnter={handleRefreshMouseEnter}
          onMouseLeave={handleToolbarMouseLeave}
        />
        <ToolbarButtonIcon
          icon="toolbarHome"
          onClick={handleHome}
          onMouseEnter={handleHomeMouseEnter}
          onMouseLeave={handleToolbarMouseLeave}
        />
        <ToolbarButtonIcon
          icon="toolbarSearchWeb"
          onClick={handleSearchWeb}
          onMouseEnter={handleSearchWebMouseEnter}
          onMouseLeave={handleToolbarMouseLeave}
        />
        <ToolbarButtonIcon
          icon="toolbarFavorites"
          onClick={handleFavorites}
          onMouseEnter={handleFavoritesMouseEnter}
          onMouseLeave={handleToolbarMouseLeave}
        />
        <ToolbarButtonIcon
          icon="toolbarPrint"
          onClick={handlePrint}
          onMouseEnter={handlePrintMouseEnter}
          onMouseLeave={handleToolbarMouseLeave}
        />
        <ToolbarButtonIcon
          icon="toolbarIncreaseFont"
          onClick={handleIncreaseFont}
          onMouseEnter={handleIncreaseFontMouseEnter}
          onMouseLeave={handleToolbarMouseLeave}
        />
        <ToolbarButtonIcon
          icon="toolbarDecreaseFont"
          onClick={handleDecreaseFont}
          onMouseEnter={handleDecreaseFontMouseEnter}
          onMouseLeave={handleToolbarMouseLeave}
        />
        <ToolbarButtonIcon
          icon="toolbarSendEmail"
          onClick={handleSendEmail}
          onMouseEnter={handleSendEmailMouseEnter}
          onMouseLeave={handleToolbarMouseLeave}
        />
      </Toolbar>
      <ToolbarDivider />
      <Toolbar>
        <ToolbarHandle />
        <ToolbarLabel htmlFor="InternetNavigatorAddress">Address:</ToolbarLabel>
        <ToolbarInput
          id="InternetNavigatorAddress"
          value={url ?? defaultUrl}
          readOnly={true}
        />
      </Toolbar>
      {!url ? (
        <WindowContent
          fontSizeModifier={fontSize}
          noPadding={Boolean(url)}
          onMouseMove={handleContentMouseMove}
        >
          {children}
        </WindowContent>
      ) : (
        <WebViewWrapper fullscreen={!modal}>
          <WebView
            src={url}
            referrerPolicy="no-referrer"
            allow="fullscreen picture-in-picture speaker-selection web-share"
            sandbox="allow-forms allow-popups allow-same-origin allow-scripts"
          />
        </WebViewWrapper>
      )}
      <StatusBar>{status || " "}</StatusBar>
    </Window>
  );
}
