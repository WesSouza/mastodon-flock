import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Frame,
  ScrollView,
  Window,
  WindowContent,
  WindowHeader,
} from "react95";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import styled from "styled-components";

import { useResults } from "../../hooks/useResults";
import type { AccountWithTwitter, TwitterSearchUser } from "../../types";

const numberFormatter = new Intl.NumberFormat();

const WindowStyled = styled(Window)`
  width: min(calc(100% - 72px), 1000px);
  margin-inline: auto;
`;

const WindowHeaderStyled = styled(WindowHeader)`
  display: flex;
  align-items: center;
`;

const WindowTitle = styled.h1`
  margin-inline-end: auto;
`;

const WindowContentStyled = styled(WindowContent)`
  display: flex;
  flex-direction: column;
`;

const ScrollViewStyled = styled(ScrollView)`
  position: relative;
  background: #fff;
  width: 100%;
  height: calc(100vh - 500px);
  flex: 0;
  & > div {
    padding: 0;
  }
`;

const PeopleListHeader = styled.div`
  position: sticky;
  top: 0;
  display: grid;
  grid-template-columns: 40px 2fr 2fr 1fr;
  z-index: 2;
`;

const PeopleListHeaderCell = styled(Frame).attrs({
  variant: "button",
})``;

const PeopleList = styled.ul`
  z-index: 1;
`;

export function Results() {
  const { loadResults, results } = useResults();

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

  const [allSelected, setAllSelected] = useState(false);

  const handleSelectAllChange = useCallback(() => {
    setAllSelected((allSelected) => !allSelected);
  }, []);

  if (!results) {
    return null;
  }

  return (
    <WindowStyled>
      <WindowHeaderStyled>
        <WindowTitle>Mastodon Flock</WindowTitle>
        <Button>&times;</Button>
      </WindowHeaderStyled>
      <WindowContentStyled>
        <ScrollViewStyled shadow={false}>
          <PeopleListHeader>
            <PeopleListHeaderCell>
              <Checkbox
                checked={allSelected}
                onChange={handleSelectAllChange}
              />
            </PeopleListHeaderCell>
            <PeopleListHeaderCell>Account</PeopleListHeaderCell>
            <PeopleListHeaderCell>Details</PeopleListHeaderCell>
            <PeopleListHeaderCell>Actions</PeopleListHeaderCell>
          </PeopleListHeader>
          <PeopleList>
            {results.accounts.map((account) => (
              <Person
                key={account.id}
                account={account}
                twitterUsers={twitterUserMap}
              />
            ))}
          </PeopleList>
        </ScrollViewStyled>
      </WindowContentStyled>
    </WindowStyled>
  );
}

const PersonListItem = styled.li`
  display: grid;
  grid-template-columns: 40px 2fr 2fr 1fr;
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

const Anchor = styled.a`
  color: ${({ theme }) => theme.anchor};
  text-decoration: underline;
`;

function Person({
  account,
  twitterUsers,
}: {
  account: AccountWithTwitter;
  twitterUsers: Map<string, TwitterSearchUser>;
}) {
  const [selected, setSelected] = useState(false);

  const handleSelectedChange = useCallback(() => {
    setSelected((selected) => !selected);
  }, []);

  const twitterUser = twitterUsers.get(account.twitterUsername);
  if (!twitterUser) {
    return null;
  }

  return (
    <PersonListItem>
      <PersonCell>
        <Checkbox
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
              @{account.account}
            </Anchor>
          </PersonSocialAccountDetails>
        </PersonSocialAccount>
      </PersonCell>
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
      <PersonCell>
        <Button variant="flat">Follow</Button>
      </PersonCell>
    </PersonListItem>
  );
}
