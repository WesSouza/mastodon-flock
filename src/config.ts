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
    desktop: `${origin}/desktop`,
    mastodonInstance: `${origin}/mastodon/instance`,
    mastodonLogin: `${origin}/mastodon/login`,
    mastodonReturn: `${origin}/mastodon/return`,
    mastodonAccountLookup: `${origin}/mastodon/account-lookup`,
    mastodonAccountFollow: `${origin}/mastodon/account-follow`,
    twitterLogin: `${origin}/twitter/login`,
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
