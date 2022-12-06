import { useCallback, useEffect, useMemo } from "react";
import { Button, Frame, ScrollView, Select, Separator } from "react95";
import styled from "styled-components";

import { useCsvExporter } from "../../hooks/useCsvExporter";
import { useResults } from "../../hooks/useResults";
import { useSearchParamsState } from "../../hooks/useSearchParamsState";
import { useSet } from "../../hooks/useSet";
import { useWindowManager } from "../../hooks/useWindowManager";
import type { AccountWithTwitter } from "../../types";
import { getAccountInstanceUri } from "../../utils/fediverse";
import {
  Toolbar,
  ToolbarButtonIcon,
  ToolbarDivider,
  ToolbarHandle,
  ToolbarLabel,
} from "../Toolbar";
import { Window } from "../WindowManager/Window";
import { ResultPerson } from "./ResultPerson";

const sortOptions = [
  {
    label: "Name",
    value: "name",
    sort: (accountLeft: AccountWithTwitter, accountRight: AccountWithTwitter) =>
      accountLeft.name.localeCompare(accountRight.name),
  },
  {
    label: "Followers",
    value: "followers",
    sort: (accountLeft: AccountWithTwitter, accountRight: AccountWithTwitter) =>
      (accountRight.followersCount ?? 0) - (accountLeft.followersCount ?? 0),
  },
  {
    label: "Following",
    value: "following",
    sort: (accountLeft: AccountWithTwitter, accountRight: AccountWithTwitter) =>
      (accountRight.followingCount ?? 0) - (accountLeft.followingCount ?? 0),
  },
  {
    label: "Instance",
    value: "instance",
    sort: (accountLeft: AccountWithTwitter, accountRight: AccountWithTwitter) =>
      getAccountInstanceUri(accountLeft.account)?.localeCompare(
        getAccountInstanceUri(accountRight.account) ?? "",
      ) ?? 0,
  },
  {
    label: "Last active",
    value: "lastActive",
    sort: (accountLeft: AccountWithTwitter, accountRight: AccountWithTwitter) =>
      (accountRight.lastStatusAt ? Date.parse(accountRight.lastStatusAt) : 0) -
      (accountLeft.lastStatusAt ? Date.parse(accountLeft.lastStatusAt) : 0),
  },
];

const ScrollViewStyled = styled(ScrollView)`
  position: relative;
  overflow: hidden;
  background: #fff;
  width: 100%;
  height: 100%;

  & > div {
    padding: 0;
  }
`;

const PeopleListHeader = styled.div<{ method: string | undefined }>`
  position: sticky;
  top: 0;
  display: grid;
  grid-template-columns: 40px 68px ${({ method }) =>
      method === "typical" ? "2fr" : ""} 2fr 1fr;
  z-index: 2;
`;

const PeopleListHeaderCell = styled(Frame).attrs({
  variant: "button",
})`
  padding: 4px 8px;
`;

const PeopleList = styled.ul`
  z-index: 1;
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

export function Results() {
  const { registerSelf, windowMeta } = useWindowManager();

  useEffect(() => {
    registerSelf();
  }, [registerSelf]);

  const { followUnfollow, loadingAccountIds, loadResults, method, results } =
    useResults();

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const twitterUserMap = useMemo(() => {
    return new Map(
      results?.twitterUsers.map((twitterUser) => [
        twitterUser.username,
        twitterUser,
      ]),
    );
  }, [results?.twitterUsers]);

  const selectedAccountIds = useSet<string>();

  const handleClose = useCallback(() => {
    location.href = "/desktop";
  }, []);

  const handleToggleAccountId = useCallback(
    (accountId: string, value: boolean) => {
      selectedAccountIds[value ? "add" : "delete"](accountId);
    },
    [selectedAccountIds],
  );

  const handleSelectAll = useCallback(() => {
    const operation =
      results?.accounts.length !== selectedAccountIds.size ? "add" : "delete";
    results?.accounts.forEach((account) => {
      selectedAccountIds[operation](account.id);
    });
  }, [results?.accounts, selectedAccountIds]);

  const [sortValue = "name", setSortValue] = useSearchParamsState("sortBy");
  const sortedAccounts = useMemo(() => {
    const sortOption =
      sortOptions.find((sortOption) => sortOption.value === sortValue) ??
      sortOptions[0];
    return results?.accounts.sort(sortOption?.sort) ?? [];
  }, [results?.accounts, sortValue]);

  const handleSortChange = useCallback(
    (option: { value: string }) => {
      setSortValue(option.value);
    },
    [setSortValue],
  );

  const downloadCsv = useCsvExporter();
  const handleExportCsv = useCallback(() => {
    if (
      selectedAccountIds.size === sortedAccounts.length ||
      !selectedAccountIds.size
    ) {
      downloadCsv(sortedAccounts);
      return;
    }

    downloadCsv(
      sortedAccounts.filter((account) => selectedAccountIds.has(account.id)),
    );
  }, [downloadCsv, selectedAccountIds, sortedAccounts]);

  const followUnfollowSelected = useCallback(
    async (operation: "follow" | "unfollow") => {
      for (const account of sortedAccounts) {
        if (
          !selectedAccountIds.has(account.id) ||
          (operation === "follow" && account.following) ||
          (operation === "unfollow" && !account.following)
        ) {
          continue;
        }
        await followUnfollow(account.id, operation);
      }
    },
    [followUnfollow, selectedAccountIds, sortedAccounts],
  );

  const handleFollowSelected = useCallback(() => {
    followUnfollowSelected("follow");
  }, [followUnfollowSelected]);

  const handleUnfollowSelected = useCallback(() => {
    followUnfollowSelected("unfollow");
  }, [followUnfollowSelected]);

  const status = useMemo(
    () =>
      `${results?.accounts.length} account${
        results?.accounts.length === 1 ? "" : "s"
      }${
        selectedAccountIds.size ? `, ${selectedAccountIds.size} selected` : ""
      }`,
    [results?.accounts.length, selectedAccountIds.size],
  );

  const canFollow = method === "typical";
  const isLoading = loadingAccountIds.size > 0;

  if (!results) {
    return null;
  }

  return (
    <Window
      icon="toolbarMastodon"
      noPadding={true}
      onClose={handleClose}
      size="large"
      title="Mastodon Flock"
      windowMeta={windowMeta}
    >
      <Toolbar>
        <ToolbarHandle />
        <Button variant="thin" size="sm">
          File
        </Button>
        <Button variant="thin" size="sm">
          Edit
        </Button>
        <Button variant="thin" size="sm">
          View
        </Button>
        <Button variant="thin" size="sm">
          Help
        </Button>
      </Toolbar>
      <ToolbarDivider />
      <Toolbar>
        <ToolbarHandle />
        <ToolbarButtonIcon
          icon="toolbarSelectAll"
          disabled={!canFollow}
          onClick={handleSelectAll}
          label="Select all"
        />

        <ToolbarButtonIcon
          icon="toolbarFollow"
          disabled={!canFollow || !selectedAccountIds.size || isLoading}
          onClick={handleFollowSelected}
          label="Follow"
        />

        <ToolbarButtonIcon
          icon="toolbarUnfollow"
          disabled={!canFollow || !selectedAccountIds.size || isLoading}
          onClick={handleUnfollowSelected}
          label="Unfollow"
        />

        <ToolbarHandle />
        <ToolbarLabel>
          <label htmlFor="sortOptions">Sort by:</label>{" "}
          <Select
            id="sortOptions"
            options={sortOptions}
            value={sortValue}
            onChange={handleSortChange}
          />
        </ToolbarLabel>
        <Separator orientation="vertical" size="auto" />
        <ToolbarButtonIcon
          icon="toolbarExportMastodon"
          disabled={!canFollow}
          onClick={handleExportCsv}
        />
      </Toolbar>
      <ScrollViewStyled shadow={false}>
        <PeopleListHeader method={method}>
          <PeopleListHeaderCell />
          <PeopleListHeaderCell>Pic</PeopleListHeaderCell>
          <PeopleListHeaderCell>Account</PeopleListHeaderCell>
          {method === "typical" ? (
            <PeopleListHeaderCell>Details</PeopleListHeaderCell>
          ) : undefined}
          <PeopleListHeaderCell>Actions</PeopleListHeaderCell>
        </PeopleListHeader>
        <PeopleList>
          {sortedAccounts.map((account) => (
            <ResultPerson
              key={account.id}
              account={account}
              followUnfollow={followUnfollow}
              method={method}
              loading={loadingAccountIds.has(account.id)}
              onToggle={handleToggleAccountId}
              selected={selectedAccountIds.has(account.id)}
              twitterUsers={twitterUserMap}
            />
          ))}
        </PeopleList>
      </ScrollViewStyled>
      <StatusBar>{status}</StatusBar>
    </Window>
  );
}
