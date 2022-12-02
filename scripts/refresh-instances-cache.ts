import type { APIResult, MastodonInstance } from "../src/types.js";

// Importing config.ts breaks because it expects a lot of Astro stuff
const minimumUpdateCacheInterval = 60 * 60 * 1000;

const [, , environment = "local"] = process.argv;

let serverOrigin: string;
switch (environment) {
  case "local": {
    serverOrigin = "http://localhost:3000";
    break;
  }
  case "preview": {
    serverOrigin = "https://mastodon-flock-preview.vercel.app";
    break;
  }
  case "production": {
    serverOrigin = "https://mastodon-flock.vercel.app";
    break;
  }
  default:
    throw new Error(
      "Invalid environment, use 'local', 'preview' or 'production'",
    );
}

const knownInstancesUrl = new URL("/mastodon/known-instances", serverOrigin);
const knownInstancesResponse = await fetch(knownInstancesUrl.href, {
  headers: { accept: "application/json" },
});
if (knownInstancesResponse.status !== 200) {
  throw new Error(
    `Invalid known-instances response: ${knownInstancesResponse.status} ${knownInstancesResponse.statusText}`,
  );
}

const knownInstancesData = (await knownInstancesResponse.json()) as APIResult<{
  items: MastodonInstance[];
}>;

if ("error" in knownInstancesData) {
  throw new Error(
    `Invalid known-instances response: ${knownInstancesData.error}`,
  );
}

for (const instance of knownInstancesData.items) {
  if (
    new Date(instance.updated).valueOf() >
    Date.now() - minimumUpdateCacheInterval
  ) {
    console.log(`${instance.uri}: already up-to-date, skipped`);
    continue;
  }

  const cacheUrl = new URL("/mastodon/instance-cache", serverOrigin);
  cacheUrl.searchParams.set("uri", instance.uri);
  const cacheResponse = await fetch(cacheUrl.href, {
    method: "post",
    headers: { accept: "application/json" },
  });
  if (cacheResponse.status !== 200) {
    console.log(
      `${instance.uri}: invalid cache response ${cacheResponse.status} ${cacheResponse.statusText}`,
    );
    continue;
  }

  const cacheData = (await cacheResponse.json()) as APIResult<{
    result: string;
  }>;

  if ("error" in cacheData) {
    console.log(`${instance.uri}: cache error ${cacheData.error}`);
    continue;
  }

  console.log(`${instance.uri}: ${cacheData.result}`);
}
