import type { Account } from "../types";

export type APIAccount = {
  id: string;
  acct: string;
  username: string;
  display_name: string;
  created_at: string;
  last_status_at: string;
  followers_count: number;
  following_count: number;
  statuses_count: number;
  url: string;
  avatar: string;
};

export function mapApiAccount(
  apiAccount: APIAccount,
  options: { following: boolean; uri: string },
) {
  const account: Account = {
    id: apiAccount.id,
    account: apiAccount.acct.includes("@")
      ? apiAccount.acct
      : `${apiAccount.acct}@${options.uri}`,
    username: apiAccount.username,
    name: apiAccount.display_name,
    createdAt: apiAccount.created_at,
    lastStatusAt: apiAccount.last_status_at,
    followersCount: apiAccount.followers_count,
    followingCount: apiAccount.following_count,
    statusesCount: apiAccount.statuses_count,
    url: apiAccount.url,
    avatarImageUrl: apiAccount.avatar,
    following: options.following,
  };

  return account;
}
