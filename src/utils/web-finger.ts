export type WebFingerResource = {
  subject: string;
  links: { rel: string; type: string; href: string }[];
};

export function splitAccountParts(account: string) {
  if (typeof account !== "string") {
    return { type: undefined, hostname: undefined, account: undefined };
  }

  if (account.startsWith("https://")) {
    const url = new URL(account);
    return {
      type: "url",
      hostname: url.hostname,
      account: `${url.origin}${url.pathname}`,
    };
  }

  account = account.replace(/^@/, "");
  if (
    !account.match(/^[a-z0-9\-\._]+@[a-z0-9]+[a-z0-9\-\.]*\.[a-z0-9]{2,}$/i)
  ) {
    return { type: undefined, hostname: undefined, account: undefined };
  }

  const [, hostname] = account.split("@");
  return {
    type: "email",
    hostname,
    account: `acct:${account}`,
    email: account,
  };
}
