import type { Account } from "../types";

export type APIPerson = {
  id: string;
  type: "Person";
  preferredUsername?: string;
  name?: string;
  icon?: APIImage;
  image?: APIImage;
  url?: string;
};

export type APIImage = {
  type: "Image";
  mediaType?: string;
  url?: string;
};

export function mapApiPerson(
  apiPerson: APIPerson,
  options: { lookedUpAccount?: string } = {},
) {
  const email = options.lookedUpAccount ?? apiPerson.id;
  const account: Account = {
    id: apiPerson.id,
    account: email,
    username: apiPerson.preferredUsername ?? email,
    name: apiPerson.name ?? email,
    followersCount: undefined,
    followingCount: undefined,
    statusesCount: undefined,
    url: apiPerson.url ?? apiPerson.id,
    avatarImageUrl: apiPerson.icon?.url,
    following: false,
  };

  return account;
}
