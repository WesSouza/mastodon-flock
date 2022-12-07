import { FixedSizeList, ListChildComponentProps } from "react-window";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Frame, ScrollView, TextInput } from "react95";
import styled from "styled-components";

import { config } from "../../config";
import { useWindowManager } from "../../hooks/useWindowManager";
import type { MastodonInstance } from "../../types";
import { http } from "../../utils/http-request";
import { collect } from "../../utils/plausible";
import { AlertDialog } from "../dialogs/AlertDialog";
import { Paragraph } from "../typography/Paragraph";
import type { WindowMeta } from "../WindowManager/WindowManager";
import { WizardWindow } from "./WizardWindow";
import { useResizeObserver } from "../../hooks/useResizeObserver";

const ScrollViewStyled = styled(ScrollView)`
  background: #fff;
  width: 100%;
  height: 150px;

  & > div {
    display: flex;
    flex-direction: column;
    padding: 0;
  }
`;

const InstanceListHeader = styled.div`
  position: sticky;
  top: 0;
  display: grid;
  grid-template-columns: 2fr 1fr;
  z-index: 2;
`;

const InstanceListHeaderCell = styled(Frame).attrs({
  variant: "button",
})`
  padding: 1px 8px;
`;

const InstanceList = styled.ul`
  margin: 2px;
  flex-grow: 1;
`;

export function ChooseMastodonInstance({
  cancel,
  goBack,
  goNext,
  initialMastodonHostname = "",
  windowMeta,
}: {
  cancel: () => void;
  goBack: () => void;
  goNext: (mastodonUri: string | undefined) => void;
  initialMastodonHostname: string | undefined;
  windowMeta: WindowMeta;
}) {
  const [instances, setInstances] = useState<MastodonInstance[]>([]);
  const [instanceUri, setInstanceUri] = useState(initialMastodonHostname);
  const [filter, setFilter] = useState("");

  const { openWindow } = useWindowManager();

  const selectionMode = useRef<string>("Preset");

  useEffect(() => {
    http<{ items: MastodonInstance[] }>({
      url: config.urls.mastodonKnownInstances,
    }).then((result) => {
      if ("error" in result) {
        console.error(result.error, result.reason);
        return;
      }

      setInstances(result.items);
    });
  }, []);

  const handleServerChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilter(event.target.value);
      setInstanceUri(event.target.value);
      selectionMode.current = "Manual";
    },
    [],
  );

  const handleServerSelect = useCallback((server: MastodonInstance) => {
    setInstanceUri(server.uri);
    if (selectionMode.current === "Manual") {
      selectionMode.current = "Filtered";
    } else {
      selectionMode.current = "Selected";
    }
  }, []);

  const serverMatches = useCallback(
    (server: MastodonInstance) => {
      return filter === "" || server.uri.includes(filter);
    },
    [filter],
  );

  const handleGoNext = useCallback(() => {
    if (!instanceUri) {
      openWindow(
        AlertDialog,
        {
          messageLines: [
            "Please enter your mastodon instance URL or select one from the list.",
          ],
          title: "No Instance Chosen",
        },
        { modal: true },
      );
      return;
    }
    const uri = instanceUri
      .replace(/^.*@/, "")
      .replace(/^[a-z]+:\/\//i, "")
      .replace(/\/.*/, "");
    if (!uri.match(/^[a-z0-9]+[a-z0-9\-\.]*\.[a-z0-9]{2,}$/)) {
      openWindow(
        AlertDialog,
        {
          messageLines: [
            "The provided instance is not a valid domain, URL or email address.",
            "Please verify the information and try again.",
          ],
          title: "Invalid Instance URL",
        },
        { modal: true },
      );
      return;
    }
    goNext(uri);

    collect("Instance Selection", { Mode: selectionMode.current });
  }, [goNext, instanceUri, openWindow]);

  const filteredInstances = useMemo(
    () => instances.filter(serverMatches),
    [instances, serverMatches],
  );

  const listRef = useRef<FixedSizeList<HTMLUListElement>>();
  const setListRef = useCallback(
    (element: FixedSizeList<HTMLUListElement> | null) => {
      listRef.current = element ?? undefined;
    },
    [],
  );

  const [instancesListRect, setInstancesListRef] =
    useResizeObserver<HTMLUListElement>();

  const ListItem = useCallback(
    ({ index, style }: ListChildComponentProps<any>) => {
      const instance = filteredInstances[index];
      if (!instance) {
        return null;
      }

      return (
        <InstanceItem
          key={instance.uri}
          instanceURI={instanceUri}
          instance={instance}
          onSelect={handleServerSelect}
          style={style}
        />
      );
    },
    [filteredInstances, handleServerSelect, instanceUri],
  );

  useEffect(() => {
    if (initialMastodonHostname) {
      const index = filteredInstances.findIndex(
        (instance) => instance.uri === initialMastodonHostname,
      );
      if (index >= 0) {
        listRef.current?.scrollToItem(index, "center");
      }
    }
  }, [filteredInstances, initialMastodonHostname]);

  return (
    <WizardWindow
      cancelAction={{ label: "Cancel", onPress: cancel }}
      imageAlt="A pixel art drawing of an old school computer and CRT monitor, by its left a set of a yellow old school phone on top of a modem. In front of it, a folded piece of paper with a yellow pencil on top."
      imageSrc="/images/setup.png"
      nextAction={{ label: "Next >", onPress: handleGoNext }}
      onClose={cancel}
      previousAction={{ label: "< Back", onPress: goBack }}
      title="Mastodon Instance"
      windowMeta={windowMeta}
    >
      <Paragraph>
        Enter your Mastodon instance URL below or pick from the list, then click
        Next.
      </Paragraph>
      <Paragraph>
        <label htmlFor="mastodon-instance-url">Your instance URL:</label>
        <TextInput
          autoFocus={true}
          shadow={false}
          id="mastodon-instance-url"
          type="url"
          placeholder="example.com"
          value={instanceUri}
          onChange={handleServerChange}
        />
      </Paragraph>
      {/* FIXME: Mix React95 ScrollViewStyled and FixedSizeList SOMEHOW */}
      <ScrollViewStyled shadow={false}>
        <InstanceListHeader>
          <InstanceListHeaderCell>Domain</InstanceListHeaderCell>
          <InstanceListHeaderCell>Users</InstanceListHeaderCell>
        </InstanceListHeader>
        <InstanceList ref={setInstancesListRef}>
          <FixedSizeList
            ref={setListRef}
            itemSize={26}
            height={instancesListRect.height}
            itemCount={filteredInstances.length}
            width={instancesListRect.width}
          >
            {ListItem}
          </FixedSizeList>
        </InstanceList>
      </ScrollViewStyled>
    </WizardWindow>
  );
}

const numberFormatter = new Intl.NumberFormat();

const InstanceItemLI = styled.li<{ checked: boolean }>`
  position: relative;

  ${({ checked, theme }) =>
    checked
      ? `
          background-color: ${theme.hoverBackground};
          color: ${theme.canvasTextInvert};
        `
      : ""}

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackground};
    color: ${({ theme }) => theme.canvasTextInvert};
  }
`;

const InstanceRadio = styled.input`
  pointer-events: none;
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
`;

const InstanceItemLabel = styled.label`
  display: grid;
  grid-template-columns: 2fr 1fr;
  z-index: 1;
`;

const InstanceItemCell = styled.span<{ textAlign?: string }>`
  padding: 1px 8px;
  text-align: ${({ textAlign }) => textAlign ?? "left"};
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

function InstanceItem({
  instanceURI,
  instance,
  onSelect,
  style,
}: {
  instanceURI: string | undefined;
  onSelect: (instance: MastodonInstance) => void;
  instance: MastodonInstance;
  style: React.CSSProperties;
}) {
  const checked = useMemo(
    () => instanceURI === instance.uri,
    [instance.uri, instanceURI],
  );

  const handleChange = useCallback(() => {
    onSelect(instance);
  }, [instance, onSelect]);

  return (
    <InstanceItemLI checked={checked} style={style}>
      <InstanceRadio
        checked={checked}
        id={`instance-${instance.uri}`}
        name={"uri"}
        onChange={handleChange}
        type="radio"
        value={instance.uri}
      />
      <InstanceItemLabel htmlFor={`instance-${instance.uri}`}>
        <InstanceItemCell>{instance.uri}</InstanceItemCell>
        <InstanceItemCell textAlign={"right"}>
          {instance.usage?.usersTotal
            ? numberFormatter.format(instance.usage.usersTotal)
            : "—"}
        </InstanceItemCell>
      </InstanceItemLabel>
    </InstanceItemLI>
  );
}
