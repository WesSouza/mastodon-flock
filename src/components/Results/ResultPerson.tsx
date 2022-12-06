import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { useCallback } from "react";
import { Button, Checkbox } from "react95";
import styled, { css } from "styled-components";

import type { AccountWithTwitter, TwitterSearchUser } from "../../types";
import { Anchor } from "../typography/Anchor";

const numberFormatter = new Intl.NumberFormat();

const PersonListItem = styled.li<{ method: string | undefined }>`
  display: grid;

  ${({ method }) => {
    const typical = method === "typical";
    return css`
      @media (max-width: 767px) {
        grid-template:
          "Checkbox Image Account" auto
          ${typical ? `"Checkbox Image Stats" auto` : ""}
          "Checkbox Image Actions" auto
          / 40px 68px 1fr;
      }

      @media (min-width: 768px) {
        grid-template:
          "Checkbox Image Account ${typical ? "Stats " : ""}Actions" 1fr
          / 40px 68px 2fr ${typical ? "2fr " : ""}1fr;
      }
    `;
  }}

  &:not(:last-child) {
    border-bottom: 2px solid ${({ theme }) => theme.flatLight};
  }
`;

const PersonCell = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 10px;

  &:not(:last-child) {
    border-right: 2px solid ${({ theme }) => theme.flatLight};
  }
`;

const PersonCellCheckbox = styled(PersonCell)`
  grid-area: Checkbox;
  align-items: center;
  padding-inline: 0;
`;

const PersonCheckbox = styled(Checkbox)`
  display: block;

  & > div {
    margin: 0;
  }
`;

const PersonCellImage = styled(PersonCell)`
  grid-area: Image;
  align-self: flex-start;

  @media (max-width: 767px) {
    &:not(:last-child) {
      border-right: 0;
    }
  }
`;

const PersonSocialAccountImage = styled.img`
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 5px;
`;

const PersonCellAccount = styled(PersonCell)`
  grid-area: Account;
  overflow: hidden;

  @media (max-width: 767px) {
    padding-inline-start: 0;
    padding-block-end: 0;

    &:not(:last-child) {
      border-right: 0;
    }
  }
`;

const PersonSocialAccountName = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: 500;
`;

const PersonSocialAccountUsernames = styled.div`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 0.9em;
`;

const PersonCellStats = styled(PersonCell)`
  grid-area: Stats;
  overflow: hidden;

  @media (max-width: 767px) {
    padding-inline-start: 0;
    padding-block-end: 0;

    &:not(:last-child) {
      border-right: 0;
    }
  }
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

const PersonCellButtons = styled(PersonCell)`
  grid-area: Actions;
  flex-direction: row;
  gap: 10px;
  justify-content: center;
  align-self: center;

  @media (max-width: 767px) {
    justify-content: flex-start;
    padding-inline-start: 0;
  }
`;

export function ResultPerson({
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
      <PersonCellCheckbox>
        <PersonCheckbox
          disabled={loading}
          checked={selected}
          onChange={handleSelectedChange}
          variant="flat"
        />
      </PersonCellCheckbox>
      <PersonCellImage>
        {account.avatarImageUrl || twitterUser.profileImageUrl ? (
          <PersonSocialAccountImage
            src={account.avatarImageUrl ?? twitterUser.profileImageUrl}
            alt="Profile picture"
          />
        ) : (
          <div />
        )}
      </PersonCellImage>
      <PersonCellAccount>
        <PersonSocialAccountName>
          {account.name || twitterUser.name}
        </PersonSocialAccountName>
        <PersonSocialAccountUsernames>
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
        </PersonSocialAccountUsernames>
      </PersonCellAccount>
      {method === "typical" ? (
        <PersonCellStats>
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
        </PersonCellStats>
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
