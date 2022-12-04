import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { useCallback, useEffect, useMemo } from "react";
import {
  Button,
  Checkbox,
  Frame,
  ScrollView,
  Select,
  Separator,
} from "react95";
import styled from "styled-components";

import { useCsvExporter } from "../../hooks/useCsvExporter";
import { useResults } from "../../hooks/useResults";
import { useSearchParamsState } from "../../hooks/useSearchParamsState";
import { useSet } from "../../hooks/useSet";
import { useWindowManager } from "../../hooks/useWindowManager";
import type { AccountWithTwitter, TwitterSearchUser } from "../../types";
import { getAccountInstanceUri } from "../../utils/fediverse";
import { Anchor } from "../typography/Anchor";
import { Window } from "../WindowManager/Window";

const numberFormatter = new Intl.NumberFormat();

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

const Toolbar = styled.div`
  position: relative;
  display: flex;
  margin-block-end: 4px;
  justify-content: stretch;
  z-index: 3;
`;

const ToolbarFilter = styled.div`
  margin-inline-start: auto;
`;

const ScrollViewStyled = styled(ScrollView)`
  position: relative;
  background: #fff;
  width: 100%;
  height: 100%;
  flex: 0;
  & > div {
    padding: 0;
  }
`;

const PeopleListHeader = styled.div<{ method: string | undefined }>`
  position: sticky;
  top: 0;
  display: grid;
  grid-template-columns: 40px ${({ method }) =>
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

  const canFollow = method === "typical";
  const isLoading = loadingAccountIds.size > 0;

  if (!results) {
    return null;
  }

  return (
    <Window
      minWidth="1000px"
      noPadding={true}
      onClose={handleClose}
      title="Mastodon Flock"
      windowMeta={windowMeta}
    >
      <Toolbar>
        <Button variant="thin" disabled={!canFollow} onClick={handleSelectAll}>
          Select All
        </Button>
        <Button
          variant="thin"
          disabled={!canFollow || !selectedAccountIds.size || isLoading}
          onClick={handleFollowSelected}
        >
          Follow
        </Button>
        <Button
          variant="thin"
          disabled={!canFollow || !selectedAccountIds.size || isLoading}
          onClick={handleUnfollowSelected}
        >
          Unfollow
        </Button>
        <ToolbarFilter>
          <label htmlFor="sortOptions">Sort by:</label>{" "}
          <Select
            id="sortOptions"
            options={sortOptions}
            value={sortValue}
            onChange={handleSortChange}
          />
        </ToolbarFilter>
        <Separator orientation="vertical" size="auto" />
        <Button variant="thin" disabled={!canFollow} onClick={handleExportCsv}>
          Export CSV
        </Button>
      </Toolbar>
      <ScrollViewStyled shadow={false}>
        <PeopleListHeader method={method}>
          <PeopleListHeaderCell />
          <PeopleListHeaderCell>Account</PeopleListHeaderCell>
          {method === "typical" ? (
            <PeopleListHeaderCell>Details</PeopleListHeaderCell>
          ) : undefined}
          <PeopleListHeaderCell>Actions</PeopleListHeaderCell>
        </PeopleListHeader>
        <PeopleList>
          {sortedAccounts.map((account) => (
            <Person
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
    </Window>
  );
}

const PersonListItem = styled.li<{ method: string | undefined }>`
  display: grid;
  grid-template-columns: 40px ${({ method }) =>
      method === "typical" ? "2fr" : ""} 2fr 1fr;
  &:not(:last-child) {
    border-bottom: 2px solid ${({ theme }) => theme.flatLight};
  }
`;

const PersonCell = styled.div`
  display: grid;
  padding: 10px;

  &:not(:last-child) {
    border-right: 2px solid ${({ theme }) => theme.flatLight};
  }
`;

const PersonCellButtons = styled(PersonCell)`
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  place-content: center;
`;

const PersonSocialAccount = styled.div`
  display: grid;
  grid-template:
    "Image Name" 1fr
    "Image Details" 1fr
    / 48px 1fr;
  column-gap: 10px;
  row-gap: 4px;
  line-height: 1.2;
`;

const PersonSocialAccountImage = styled.img`
  grid-area: Image;
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 5px;
`;

const PersonSocialAccountName = styled.div`
  grid-area: Name;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: 500;
`;

const PersonSocialAccountDetails = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 0.9em;
`;

const PersonSocialStats = styled.div`
  overflow: hidden;
  display: block;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 0.9em;
`;

const PersonSocialStat = styled.span`
  &:not(:last-child) {
    padding-inline-end: 10px;
  }

  & > em {
    font-weight: 600;
  }
`;

function Person({
  account,
  loading,
  followUnfollow,
  method,
  onToggle,
  selected,
  twitterUsers,
}: {
  account: AccountWithTwitter;
  loading: boolean;
  followUnfollow: (accountId: string, operation: "follow" | "unfollow") => void;
  method: string | undefined;
  onToggle: (accountId: string, value: boolean) => void;
  selected: boolean;
  twitterUsers: Map<string, TwitterSearchUser>;
}) {
  const handleSelectedChange = useCallback(() => {
    onToggle(account.id, !selected);
  }, [account.id, onToggle, selected]);

  const handleFollowClick = useCallback(() => {
    followUnfollow(account.id, "follow");
  }, [account.id, followUnfollow]);

  const handleUnfollowClick = useCallback(() => {
    followUnfollow(account.id, "unfollow");
  }, [account.id, followUnfollow]);

  const handleCopyClick = useCallback(() => {
    navigator.clipboard.writeText(account.account);
  }, [account.account]);

  const twitterUser = twitterUsers.get(account.twitterUsername);
  if (!twitterUser) {
    return null;
  }

  return (
    <PersonListItem method={method}>
      <PersonCell>
        <Checkbox
          disabled={loading}
          checked={selected}
          onChange={handleSelectedChange}
          variant="flat"
        />
      </PersonCell>
      <PersonCell>
        <PersonSocialAccount>
          {account.avatarImageUrl || twitterUser.profileImageUrl ? (
            <PersonSocialAccountImage
              src={account.avatarImageUrl ?? twitterUser.profileImageUrl}
              alt="Profile picture"
            />
          ) : (
            <div />
          )}
          <PersonSocialAccountName>
            {account.name || twitterUser.name}
          </PersonSocialAccountName>
          <PersonSocialAccountDetails>
            <Anchor
              href={`https://twitter.com/${twitterUser.username}`}
              rel="noreferrer noopener nofollow"
              target="_blank"
            >
              @{twitterUser.username}
            </Anchor>{" "}
            →{" "}
            <Anchor
              href={account.url}
              rel="noreferrer noopener nofollow"
              target="_blank"
            >
              {account.account.startsWith("https://") ? "" : "@"}
              {account.account}
            </Anchor>
          </PersonSocialAccountDetails>
        </PersonSocialAccount>
      </PersonCell>
      {method === "typical" ? (
        <PersonCell>
          {account.followersCount ||
          account.followingCount ||
          account.statusesCount ? (
            <PersonSocialStats>
              {account.followersCount ? (
                <PersonSocialStat>
                  <em>{numberFormatter.format(account.followersCount)}</em>{" "}
                  Followers
                </PersonSocialStat>
              ) : undefined}
              {account.followingCount ? (
                <PersonSocialStat>
                  <em>{numberFormatter.format(account.followingCount)}</em>{" "}
                  Following
                </PersonSocialStat>
              ) : undefined}
              {account.statusesCount ? (
                <PersonSocialStat>
                  <em>{numberFormatter.format(account.statusesCount)}</em> Posts
                </PersonSocialStat>
              ) : undefined}
            </PersonSocialStats>
          ) : undefined}
          {account.lastStatusAt ? (
            <PersonSocialStats>
              <PersonSocialStat>
                last active{" "}
                <em>
                  {formatDistanceToNow(Date.parse(account.lastStatusAt), {
                    addSuffix: true,
                  })}
                </em>
              </PersonSocialStat>
            </PersonSocialStats>
          ) : undefined}
        </PersonCell>
      ) : undefined}
      <PersonCellButtons>
        {account.following === true ? (
          <Button
            disabled={loading}
            variant="flat"
            onClick={handleUnfollowClick}
          >
            Unfollow
          </Button>
        ) : account.following === false ? (
          <Button disabled={loading} variant="flat" onClick={handleFollowClick}>
            Follow
          </Button>
        ) : (
          <>
            <Button
              variant="flat"
              as="a"
              // @ts-ignore `href` is not part of button's expected properties
              href={account.url}
              rel="noreferrer noopener nofollow"
              target="_blank"
            >
              Open
            </Button>
            <Button variant="flat" onClick={handleCopyClick}>
              Copy
            </Button>
          </>
        )}
      </PersonCellButtons>
    </PersonListItem>
  );
}
