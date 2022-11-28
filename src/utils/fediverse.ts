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

export function findPotentialInstanceUrls(urls: string[] | undefined) {
  if (!Array.isArray(urls)) {
    return [];
  }

  return urls
    .map((urlString) => {
      const url = new URL(urlString);
      return {
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

export function findPotentialInstanceUrlsFromTwitter(
  urls: { expanded_url: string }[] | undefined,
) {
  if (!Array.isArray(urls)) {
    return [];
  }

  return findPotentialInstanceUrls(urls.map((url) => url.expanded_url));
}

export function findPotentialUserEmails(string: string | undefined) {
  if (!string) {
    return [];
  }

  const matches = string.matchAll(
    /(@?)([a-z0-9\-\._]+)@([a-z0-9]+[a-z0-9\-\.]*\.[a-z0-9]{2,})/gi,
  );
  return Array.from(matches, (match) => ({
    prefix: match[1] ? "@" : undefined,
    username: match[2] as string,
    hostname: match[3]?.toLowerCase() as string,
  }));
}
