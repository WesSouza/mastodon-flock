import React, { useCallback, useEffect, useState } from "react";
import { Radio, ScrollView, TextInput } from "react95";
import styled from "styled-components";

import { config } from "../../config";
import { Paragraph } from "../React95/Paragraph";
import { WizardWindow } from "./WizardWindow";

const ScrollViewStyled = styled(ScrollView)`
  background: #fff;
  width: 100%;
  height: 150px;
`;

const InstanceList = styled.ul``;

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

export function ChooseMastodonInstance({
  cancel,
  goBack,
  goNext,
}: {
  cancel: () => void;
  goBack: () => void;
  goNext: (mastodonUri: string | undefined) => void;
}) {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [instanceUri, setInstanceUri] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetch(config.urls.TEMP_fediverseDirectory)
      .then((response) => response.json())
      .then((data: FedifinderKnownInstances) => {
        setInstances(getInstances(data));
      });
  }, []);

  const handleServerChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilter(event.target.value);
      setInstanceUri(event.target.value);
    },
    [],
  );

  const handleServerSelect = useCallback((server: Instance) => {
    setInstanceUri(server.hostname);
  }, []);

  const serverMatches = useCallback(
    (server: Instance) => {
      return filter === "" || server.hostname.includes(filter);
    },
    [filter],
  );

  const handleGoNext = useCallback(() => {
    goNext(instanceUri);
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
        <InstanceList>
          {instances.filter(serverMatches).map((instance) => (
            <InstanceItem
              key={instance.hostname}
              instanceURI={instanceUri}
              instance={instance}
              onSelect={handleServerSelect}
            />
          ))}
        </InstanceList>
      </ScrollViewStyled>
    </WizardWindow>
  );
}

const numberFormatter = new Intl.NumberFormat();

const InstanceItemLI = styled.li``;

function InstanceItem({
  instanceURI,
  instance,
  onSelect,
}: {
  instanceURI: string | undefined;
  onSelect: (instance: Instance) => void;
  instance: Instance;
}) {
  const handleChange = useCallback(() => {
    onSelect(instance);
  }, [onSelect]);

  return (
    <InstanceItemLI>
      <Radio
        variant="flat"
        id={`row-${instance.hostname}`}
        value={instance.hostname}
        name={instance.hostname}
        onChange={handleChange}
        checked={instanceURI === instance.hostname}
      />
      <label htmlFor={`row-${instance.hostname}`}>
        {instance.hostname} ({numberFormatter.format(instance.statsUserCount)})
      </label>
    </InstanceItemLI>
  );
}
