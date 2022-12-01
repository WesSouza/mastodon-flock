export type Account = {
  id: string;
  account: string;
  username: string;
  name: string;
  createdAt: string | undefined;
  lastStatusAt: string | undefined;
  followersCount: number | undefined;
  followingCount: number | undefined;
  statusesCount: number | undefined;
  url: string;
  avatarImageUrl: string | undefined;
  following: boolean | null;
};

export type AccountWithTwitter = Account & {
  twitterUsername: string;
};

export type APIResult<T> = T | { error: string; reason?: unknown };

export type PotentialEmail = {
  twitterUsername: string;
  email: string;
  prefix: string | undefined;
  username: string;
  hostname: string;
};

export type PotentialInstanceProfile = {
  twitterUsername: string;
  href: string;
  hostname: string;
  pathname: string;
};

export type TwitterSearchResults = {
  twitterUsers: TwitterSearchUser[];
  potentialEmails: PotentialEmail[];
  potentialInstanceProfiles: PotentialInstanceProfile[];
};

export type TwitterSearchUser = {
  name: string;
  profileImageUrl: string | undefined;
  username: string;
};

export type MastodonLookupAccountResult = {
  account: Account;
};

export type MastodonFollowAccountResults = {
  following: Account[];
};
