import EventEmitter from "events";
import { readFileSync } from "fs";
import type { MastodonInstance } from "../src/types.js";
import { http } from "../src/utils/http-request.js";

const requestTimeout = 10000;
const parallelRequests = 30;
const bigServer = "mastodon.social";

const [, , initialUri, skipUrisJsonPath] = process.argv;
if (
  typeof initialUri !== "string" ||
  !initialUri.match(/^[a-z0-9]+[a-z0-9\-\.]*\.[a-z0-9]{2,}$/)
) {
  throw new Error(`Invalid initialUri ${initialUri}`);
}

if (skipUrisJsonPath && typeof skipUrisJsonPath !== "string") {
  throw new Error(`Invalid skipUrisJsonPath ${skipUrisJsonPath}`);
}

let skipUris = new Set<string>();
if (skipUrisJsonPath) {
  try {
    skipUris = new Set(
      JSON.parse(readFileSync(skipUrisJsonPath, "utf-8")) as string[],
    );
    skipUris.delete(initialUri);
  } catch (error) {
    console.error(`Unable to load and parse ${skipUrisJsonPath}`);
    console.error(error);
    process.exit(1);
  }
}

async function crawlUri(uri: string) {
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

    const crawledData: {
      instance: Omit<MastodonInstance, "updated">;
      peers: string[];
    } = {
      instance: {
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
      },
      peers: mastodonPeers,
    };

    return crawledData;
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

      if (urisCrawled.has(uri) || skipUris.has(uri)) {
        return;
      }

      const crawledData = await crawlUri(uri);
      if ("error" in crawledData) {
        console.log(JSON.stringify({ type: "error", uri, ...crawledData }));
        console.log(
          JSON.stringify({
            type: "progress",
            crawled: urisCrawled.size,
            currentRemaining: urisToCrawl.size,
          }),
        );
        return;
      }

      if (
        urisCrawled.has(crawledData.instance.uri) ||
        skipUris.has(crawledData.instance.uri)
      ) {
        return;
      }
      urisCrawled.add(uri);
      urisCrawled.add(crawledData.instance.uri);

      console.log(
        JSON.stringify({ type: "instance", ...crawledData.instance }),
      );
      if (uri !== bigServer && !crawledData.peers.includes(bigServer)) {
        // Everybody knows mastodon.social, so this is potentially garbage
        console.log(
          JSON.stringify({
            type: "skipPeers",
            uri,
            count: crawledData.peers.length,
          }),
        );
      } else {
        crawledData.peers.forEach((peer) => {
          if (!urisCrawled.has(peer) && !skipUris.has(peer)) {
            urisToCrawl.add(peer);
          }
        });
      }

      console.log(
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
