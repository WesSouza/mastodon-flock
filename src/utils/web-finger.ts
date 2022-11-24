export type WebFingerResource = {
  subject: string;
  links: { rel: string; type: string; href: string }[];
};

export function splitAccountParts(accountId: string) {
  if (typeof accountId !== "string") {
    return { domain: undefined, username: undefined };
  }

  accountId = accountId.replace(/^@/, "");
  if (!accountId.match(/^[a-z0-9-\.]+@[a-z0-9-][a-z0-9-\.]+[a-z0-9-]+$/i)) {
    return { domain: undefined, username: undefined };
  }

  const [username, domain] = accountId.split("@");
  return { domain, username };
}
