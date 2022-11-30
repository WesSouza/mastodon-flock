import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Frame, ScrollView, TextInput } from "react95";
import styled from "styled-components";

import { config } from "../../config";
import { Paragraph } from "../React95/Paragraph";
import { WizardWindow } from "./WizardWindow";

type FedifinderKnownInstances = {
  data: Record<
    string,
    {
      local_domain?: string;
      software_name?: string;
      users_total?: number;
    }
  >;
};

type Instance = {
  hostname: string;
  instanceHostname: string;
  softwareName: string;
  statsUserCount: number;
};

function getInstances(data: FedifinderKnownInstances) {
  const instanceEntries = Object.entries(data.data);
  const instances = instanceEntries
    .map(([hostname, data]) => ({
      hostname,
      instanceHostname: data.local_domain ?? "",
      softwareName: data.software_name ?? "",
      statsUserCount: data.users_total ?? 0,
    }))
    .filter(
      (instance) =>
        !instance.instanceHostname ||
        instance.softwareName !== "mastodon" ||
        instance.hostname === instance.instanceHostname,
    )
    .sort((left, right) => right.statsUserCount - left.statsUserCount)
    .slice(0, 200);

  return instances;
}

const ScrollViewStyled = styled(ScrollView)`
  background: #fff;
  width: 100%;
  height: 150px;
  & > div {
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
`;

export function ChooseMastodonInstance({
  cancel,
  goBack,
  goNext,
  initialMastodonHostname = "",
  windowId,
}: {
  cancel: () => void;
  goBack: () => void;
  goNext: (mastodonUri: string | undefined) => void;
  initialMastodonHostname: string | undefined;
  windowId: string;
}) {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [instanceUri, setInstanceUri] = useState(initialMastodonHostname);
  const [filter, setFilter] = useState("");
  const [scrollIntoView, setScrollIntoView] = useState(true);

  useEffect(() => {
    fetch(config.urls.TEMP_fediverseDirectory)
      .then((response) => response.json())
      .then((data: FedifinderKnownInstances) => {
        setInstances(getInstances(data));
      });
  }, []);

  const handleServerChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setScrollIntoView(false);
      setFilter(event.target.value);
      setInstanceUri(event.target.value);
    },
    [],
  );

  const handleServerSelect = useCallback((server: Instance) => {
    setScrollIntoView(false);
    setInstanceUri(server.hostname);
  }, []);

  const serverMatches = useCallback(
    (server: Instance) => {
      return filter === "" || server.hostname.includes(filter);
    },
    [filter],
  );

  const handleGoNext = useCallback(() => {
    const uri = instanceUri
      .replace(/^.*@/, "")
      .replace(/^[a-z]+:\/\//i, "")
      .replace(/\/.*/, "");
    if (!uri.match(/^[a-z0-9]+[a-z0-9\-\.]*\.[a-z0-9]{2,}$/)) {
      alert("Invalid instance URL");
      return;
    }
    goNext(uri);
  }, [instanceUri]);

  return (
    <WizardWindow
      cancelAction={{ label: "Cancel", onClick: cancel }}
      imageAlt="A pixel art drawing of an old school computer and CRT monitor, by its left a set of a yellow old school phone on top of a modem. In front of it, a folded piece of paper with a yellow pencil on top."
      imageSrc="/images/setup.png"
      nextAction={{ label: "Next >", onClick: handleGoNext }}
      onClose={cancel}
      previousAction={{ label: "< Back", onClick: goBack }}
      title="Mastodon Instance"
      windowId={windowId}
    >
      <Paragraph>
        Enter your Mastodon instance URL below or pick from the list, then click
        Next.
      </Paragraph>
      <Paragraph>
        <label htmlFor="mastodon-instance-url">Your instance URL:</label>
        <TextInput
          shadow={false}
          id="mastodon-instance-url"
          type="url"
          placeholder="mastodon.social"
          value={instanceUri}
          onChange={handleServerChange}
        />
      </Paragraph>
      <ScrollViewStyled shadow={false}>
        <InstanceListHeader>
          <InstanceListHeaderCell>Domain</InstanceListHeaderCell>
          <InstanceListHeaderCell>Users</InstanceListHeaderCell>
        </InstanceListHeader>
        <InstanceList>
          {instances.filter(serverMatches).map((instance) => (
            <InstanceItem
              key={instance.hostname}
              instanceURI={instanceUri}
              instance={instance}
              onSelect={handleServerSelect}
              scrollIntoView={scrollIntoView}
            />
          ))}
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
  scrollIntoView = false,
}: {
  instanceURI: string | undefined;
  onSelect: (instance: Instance) => void;
  instance: Instance;
  scrollIntoView: boolean;
}) {
  const checked = useMemo(
    () => instanceURI === instance.hostname,
    [instance.hostname, instanceURI],
  );
  const handleChange = useCallback(() => {
    onSelect(instance);
  }, [onSelect]);

  const setRef = useCallback(
    (element: HTMLLIElement) => {
      if (scrollIntoView && element && checked) {
        element.scrollIntoView({ block: "center" });
      }
    },
    [checked, scrollIntoView],
  );

  return (
    <InstanceItemLI checked={checked} ref={setRef}>
      <InstanceRadio
        checked={checked}
        id={`instance-${instance.hostname}`}
        name={instance.hostname}
        onChange={handleChange}
        type="radio"
        value={instance.hostname}
      />
      <InstanceItemLabel htmlFor={`instance-${instance.hostname}`}>
        <InstanceItemCell>{instance.hostname}</InstanceItemCell>
        <InstanceItemCell textAlign={"right"}>
          {numberFormatter.format(instance.statsUserCount)}
        </InstanceItemCell>
      </InstanceItemLabel>
    </InstanceItemLI>
  );
}
