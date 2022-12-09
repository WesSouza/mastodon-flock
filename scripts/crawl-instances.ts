import EventEmitter from "events";
import type { APIResult, MastodonInstance } from "../src/types.js";
import { http } from "../src/utils/http-request.js";

const requestTimeout = 10000;
const parallelRequests = 30;
const trustedServers = new Set(["mastodon.social"]);
const mustKnowServers = new Set(["mastodon.social"]);

const [, , initialUri, environment = "local"] = process.argv;

if (
  typeof initialUri !== "string" ||
  !initialUri.match(/^[a-z0-9]+[a-z0-9\-\.]*\.[a-z0-9]{2,}$/)
) {
  throw new Error(`Invalid initialUri ${initialUri}`);
}

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
knownInstancesUrl.searchParams.set("_vercel_no_cache", "1");
knownInstancesUrl.searchParams.set("allInstances", "1");

const knownInstancesResponse = await fetch(knownInstancesUrl.href, {
  headers: { accept: "application/json" },
});
if (knownInstancesResponse.status !== 200) {
  throw new Error(
    `Invalid known-instances response: ${knownInstancesResponse.status} ${knownInstancesResponse.statusText}`,
  );
}

const knownInstancesData = (await knownInstancesResponse.json()) as APIResult<{
  items: Omit<MastodonInstance, "updated">[];
}>;

if ("error" in knownInstancesData) {
  throw new Error(
    `Invalid known-instances response: ${knownInstancesData.error}`,
  );
}

const knownInstances = new Map(
  knownInstancesData.items.map((instance) => [instance.uri, instance]),
);

async function fetchInstance(uri: string) {
  try {
    let url = `https://${uri}`;

    const instanceWebFingerUrl = new URL(
      `https://${uri}/.well-known/webfinger`,
    );
    instanceWebFingerUrl.searchParams.set("resource", `https://${uri}/actor`);
    const instanceWebFinger = await http<{
      links?: { rel: string; href: string }[];
    }>({
      url: instanceWebFingerUrl.href,
      accept: "application/jrd+json",
      timeout: requestTimeout,
    });
    if (!("error" in instanceWebFinger)) {
      const instanceLink = instanceWebFinger?.links?.find(
        (link) => link.rel === "self",
      );
      if (!instanceLink) {
        return {
          error: "incompatibleServer",
          reason: `Unable to find webfinger data for ${uri}`,
        };
      }

      url = new URL("/", instanceLink.href).href;
    }

    const wellKnownNodeInfoUrl = new URL("/.well-known/nodeinfo", url);

    const wellKnownNodeInfo = await http<{
      links?: { rel: string; href: string }[];
    }>({ url: wellKnownNodeInfoUrl.href, timeout: requestTimeout });
    if ("error" in wellKnownNodeInfo) {
      return {
        error: "invalidWellKnownResponse",
        reason: wellKnownNodeInfo,
      };
    }

    const nodeInfoLink = wellKnownNodeInfo?.links?.find(
      (link) =>
        link.rel.match(
          /http:\/\/nodeinfo\.diaspora\.software\/ns\/schema\/(1.0|1.1|2.0|2.1)/,
        ) && link.href.match(/^https:\/\//),
    );
    if (!nodeInfoLink) {
      return {
        error: "incompatibleServer",
        reason: `Unable to find nodeinfo data for ${uri}`,
      };
    }

    const nodeInfo = await http<{
      software?: { name?: string; version?: string };
      usage?: { users?: { total?: number; activeMonth?: number } };
    }>({ url: nodeInfoLink.href, redirect: "manual", timeout: requestTimeout });
    if ("error" in nodeInfo) {
      return { error: "invalidNodeInfoResponse", reason: nodeInfo };
    }

    if (
      typeof nodeInfo?.software?.name !== "string" ||
      typeof nodeInfo?.software?.version !== "string"
    ) {
      return {
        error: "invalidNodeInfoResponse",
        reason: `Invalid nodeinfo data from ${nodeInfoLink.href}`,
      };
    }

    if (nodeInfo.software.name !== "mastodon") {
      return {
        error: "incompatibleServerSoftware",
        reason: `Unsupported software on ${uri}: ${nodeInfo.software.name} (${nodeInfo.software.version})`,
      };
    }

    const instanceUrl = new URL("/", nodeInfoLink.href).href;

    const mastodonInstanceUrl = new URL("/api/v1/instance", instanceUrl);
    const mastodonInstance = await http<{ title?: string; uri?: string }>({
      url: mastodonInstanceUrl.href,
      redirect: "manual",
    });
    if ("error" in mastodonInstance) {
      return {
        error: "invalidMastodonInstanceResponse",
        reason: mastodonInstance,
      };
    }

    if (
      typeof mastodonInstance.title !== "string" ||
      typeof mastodonInstance.uri !== "string"
    ) {
      return {
        error: "invalidMastodonInstanceResponse",
        reason: `Unsupported URI on ${uri}: ${mastodonInstance.uri})`,
      };
    }

    const mastodonPeersUrl = new URL("/api/v1/instance/peers", instanceUrl);
    const mastodonPeers = await http<string[]>({
      url: mastodonPeersUrl.href,
      redirect: "manual",
    });
    if ("error" in mastodonPeers) {
      return { error: "invalidMastodonPeersResponse", reason: mastodonPeers };
    }

    if (!Array.isArray(mastodonPeers)) {
      return { error: "invalidPeersResponse" };
    }

    const instance: Omit<MastodonInstance, "updated"> = {
      name: mastodonInstance.title,
      uri: mastodonInstance.uri,
      instanceUrl: instanceUrl.replace(/\/+$/, ""),
      software: {
        name: nodeInfo.software.name,
        version: nodeInfo.software.version,
      },
      usage: {
        usersActiveMonth: nodeInfo.usage?.users?.activeMonth,
        usersTotal: nodeInfo.usage?.users?.total,
      },
    };

    return instance;
  } catch (error) {
    return { error: "mastodonCrawlError", reason: String(error) };
  }
}

async function fetchPeers(instanceUrl: string) {
  try {
    const mastodonPeersUrl = new URL("/api/v1/instance/peers", instanceUrl);
    const mastodonPeers = await http<string[]>({
      url: mastodonPeersUrl.href,
      redirect: "manual",
    });
    if ("error" in mastodonPeers) {
      return { error: "invalidMastodonPeersResponse", reason: mastodonPeers };
    }

    if (!Array.isArray(mastodonPeers)) {
      return { error: "invalidPeersResponse" };
    }

    return mastodonPeers;
  } catch (error) {
    return { error: "mastodonCrawlError", reason: String(error) };
  }
}

try {
  const urisCrawled = new Set<string>();
  const urisToCrawl = new Set<string>([initialUri]);

  function crawl(uri: string) {
    return async () => {
      urisToCrawl.delete(uri);

      if (urisCrawled.has(uri)) {
        return;
      }

      let instance = knownInstances.get(uri);
      if (!instance) {
        const instanceData = await fetchInstance(uri);
        if ("error" in instanceData) {
          console.error(
            JSON.stringify({ type: "error", uri, ...instanceData }),
          );
          console.error(
            JSON.stringify({
              type: "progress",
              crawled: urisCrawled.size,
              currentRemaining: urisToCrawl.size,
            }),
          );
          return;
        }

        if (urisCrawled.has(instanceData.uri)) {
          return;
        }
        urisCrawled.add(uri);
        urisCrawled.add(instanceData.uri);

        console.log(JSON.stringify({ type: "instance", ...instanceData }));

        instance = instanceData;
      }

      const peers = await fetchPeers(instance.instanceUrl);

      if ("error" in peers) {
        console.error(JSON.stringify({ type: "error", uri, ...peers }));
        console.error(
          JSON.stringify({
            type: "progress",
            crawled: urisCrawled.size,
            currentRemaining: urisToCrawl.size,
          }),
        );
        return;
      }

      // Only crawl peers from trusted servers or if the server knows commonly known servers
      if (
        !trustedServers.has(uri) &&
        !peers.find((peer) => mustKnowServers.has(peer))
      ) {
        console.error(
          JSON.stringify({
            type: "skipPeers",
            uri,
            count: peers.length,
          }),
        );
      } else {
        peers.forEach((peer) => {
          if (!urisCrawled.has(peer) && !knownInstances.has(peer)) {
            urisToCrawl.add(peer);
          }
        });
      }

      console.error(
        JSON.stringify({
          type: "progress",
          crawled: urisCrawled.size,
          currentRemaining: urisToCrawl.size,
        }),
      );
    };
  }

  const emitter = new EventEmitter();
  let promisesRunning = 0;

  // This feels like a generator... but I don't wan't to use generators.
  async function getFreeRunner() {
    return new Promise(
      (resolve: (value: (promise: () => Promise<any>) => void) => void) => {
        function run() {
          promisesRunning += 1;
          resolve((promise: () => Promise<any>) => {
            promise().finally(() => {
              promisesRunning -= 1;
              if (promisesRunning === 0) {
                emitter.emit("drained");
              } else {
                emitter.emit("next");
              }
            });
          });
        }

        if (promisesRunning <= parallelRequests) {
          run();
          return;
        }

        emitter.once("next", () => {
          run();
        });
      },
    );
  }

  async function feed() {
    const urisToCrawlIterator = urisToCrawl.values();
    for (const uri of urisToCrawlIterator) {
      const runner = await getFreeRunner();
      runner(crawl(uri));
    }
  }

  feed();
  emitter.on("drained", feed);
} catch (e) {
  throw e;
}
