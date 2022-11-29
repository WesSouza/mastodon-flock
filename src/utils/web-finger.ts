export type WebFingerResource = {
  subject: string;
  links: { rel: string; type: string; href: string }[];
};

export function splitAccountParts(account: string) {
  if (typeof account !== "string") {
    return { hostname: undefined, account: undefined };
  }

  if (account.startsWith("https://")) {
    const url = new URL(account);
    return { hostname: url.hostname, account: `${url.origin}${url.pathname}` };
  }

  account = account.replace(/^@/, "");
  if (
    !account.match(/^[a-z0-9\-\._]+@[a-z0-9]+[a-z0-9\-\.]*\.[a-z0-9]{2,}$/i)
  ) {
    return { hostname: undefined, account: undefined };
  }

  const [, hostname] = account.split("@");
  return { hostname, account: `acct:${account}` };
}
