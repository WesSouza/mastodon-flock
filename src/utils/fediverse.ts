const forbiddenHostnames = new Set([
  "gmail.com",
  "hotmail.com",
  "icloud.com",
  "outlook.com",
  "tiktok.com",
  "www.tiktok.com",
  "www.youtube.com",
  "yahoo.com",
  "youtube.com",
]);

export function findPotentialInstanceProfilesFromUrls(
  urls: string[] | undefined,
) {
  if (!Array.isArray(urls)) {
    return [];
  }

  return urls
    .map((urlString) => {
      const url = new URL(urlString);
      return {
        href: `${url.origin.replace("https://www.", "https://")}${
          url.pathname
        }`,
        protocol: url.protocol.toLowerCase(),
        hostname: url.hostname.toLowerCase(),
        pathname: url.pathname,
      };
    })
    .filter(
      (url) =>
        !forbiddenHostnames.has(url.hostname) &&
        url.protocol === "https:" &&
        url.pathname.startsWith("/@") &&
        !url.pathname.includes("/", 1),
    );
}

export function findPotentialInstanceProfilesFromTwitter(
  urls: { expanded_url: string }[] | undefined,
) {
  if (!Array.isArray(urls)) {
    return [];
  }

  return findPotentialInstanceProfilesFromUrls(
    urls.map((url) => url.expanded_url),
  );
}

export function findPotentialUserEmails(string: string | undefined) {
  if (!string) {
    return [];
  }

  const matches = string.matchAll(
    /(@?)([a-z0-9\-\._]+)@([a-z0-9]+[a-z0-9\-\.]*\.[a-z0-9]{2,})/gi,
  );
  return Array.from(matches, (match) => ({
    email: `${match[2]?.toLowerCase()}@${match[3]?.toLowerCase()}`,
    prefix: match[1] ? "@" : undefined,
    username: match[2] as string,
    hostname: match[3]?.toLowerCase() as string,
  })).filter((email) => !forbiddenHostnames.has(email.hostname));
}
