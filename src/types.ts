export type APIResult<T> = T | { error: string };

export type PotentialEmail = {
  twitterUsername: string;
  prefix: string | undefined;
  username: string;
  hostname: string;
};

export type PotentialInstanceProfile = {
  twitterUsername: string;
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

export type MastodonLookupAccount = {
  id: string;
  account: string;
  username: string;
  displayName: string;
  followersCount: number;
  followingCount: number;
  statusesCount: number;
  url: string;
  avatarImageUrl: string;
};

export type MastodonFollowAccount = {
  id: string;
  account: string;
};
