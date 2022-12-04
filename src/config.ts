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
    mastodonAccountFollow: `${origin}/mastodon/account-follow`,
    mastodonAccountFollowing: `${origin}/mastodon/account-following`,
    mastodonAccountLookup: `${origin}/mastodon/account-lookup`,
    mastodonInstance: `${origin}/mastodon/instance`,
    mastodonKnownInstances: `${origin}/mastodon/known-instances`,
    mastodonLogin: `${origin}/mastodon/login`,
    mastodonReturn: `${origin}/mastodon/return`,
    privacy: `${origin}/privacy`,
    results: `${origin}/results`,
    twitterLogin: `${origin}/twitter/login`,
    twitterFollowing: `${origin}/twitter/following`,
    twitterReturn: `${origin}/twitter/return`,
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
  mastodon: {
    minimumUpdateCacheInterval: 60 * 60 * 1000,
  },
  twitter: {
    maxResultsPerPage: 1000,
  },
};
