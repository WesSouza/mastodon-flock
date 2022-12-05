import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { useCallback } from "react";
import { Button, Checkbox } from "react95";
import styled from "styled-components";

import type { AccountWithTwitter, TwitterSearchUser } from "../../types";
import { Anchor } from "../typography/Anchor";

const numberFormatter = new Intl.NumberFormat();

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
