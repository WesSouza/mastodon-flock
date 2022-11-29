const isLocal = import.meta.env.SITE?.startsWith("http://localhost:");
const isPreview = import.meta.env.SITE?.startsWith(
  "http://mastodon-flock-preview.",
);

const siteUrl = new URL(import.meta.env.SITE);

const origin = import.meta.env.SITE.replace(/\/$/, "");

export const config = {
  isLocal,
  isPreview,
  host: siteUrl.hostname,
  name: isLocal
    ? "Mastodon Flock Development"
    : isPreview
    ? "Mastodon Flock Preview"
    : "Mastodon Flock",
  urls: {
    home: origin,
    activityPubApp: !isLocal
      ? `${origin}/app`
      : "https://mastodon-flock-preview.vercel.app/app",
    activityPubAccountLookup: `${origin}/activity-pub/account-lookup`,
    desktop: `${origin}/desktop`,
    mastodonInstance: `${origin}/mastodon/instance`,
    mastodonLogin: `${origin}/mastodon/login`,
    mastodonReturn: `${origin}/mastodon/return`,
    mastodonAccountLookup: `${origin}/mastodon/account-lookup`,
    mastodonAccountFollowing: `${origin}/mastodon/account-following`,
    results: `${origin}/results`,
    twitterLogin: `${origin}/twitter/login`,
    twitterFollowing: `${origin}/twitter/following`,
    twitterReturn: `${origin}/twitter/return`,
    TEMP_fediverseDirectory: `${origin}/data/fedifinder_known_instances.json`,
  },
  activityPub: {
    appUsername: "mastodon-flock",
    publicKey: (import.meta.env.ACTIVITYPUB_APP_PUBLIC ?? "").replace(
      /\\n/g,
      "\n",
    ),
    privateKey: (import.meta.env.ACTIVITYPUB_APP_PRIVATE ?? "").replace(
      /\\n/g,
      "\n",
    ),
  },
  twitter: {
    maxResultsPerPage: 1000,
  },
};
