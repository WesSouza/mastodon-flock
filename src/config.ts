const isLocal = import.meta.env.SITE?.startsWith("http://localhost:");
const isPreview = import.meta.env.SITE?.startsWith(
  "https://mastodon-flock-preview.",
);

const siteUrl = new URL(import.meta.env.SITE);

const name = isLocal
  ? "Mastodon Flock Development"
  : isPreview
  ? "Mastodon Flock Preview"
  : "Mastodon Flock";

const origin = import.meta.env.SITE.replace(/\/$/, "");

export const config = {
  isLocal,
  isPreview,
  host: siteUrl.hostname,
  name,
  urls: {
    about: `${origin}/about`,
    acknowledgements: `${origin}/acknowledgements.txt`,
    home: origin,
    activityPubApp: !isLocal
      ? `${origin}/app`
      : "https://mastodon-flock-preview.vercel.app/app",
    activityPubAccountLookup: `${origin}/activity-pub/account-lookup`,
    desktop: `${origin}/desktop`,
    logout: `${origin}/logout`,
    mastodonAccountFollow: `${origin}/mastodon/account-follow`,
    mastodonAccountFollowing: `${origin}/mastodon/account-following`,
    mastodonAccountLookup: `${origin}/mastodon/account-lookup`,
    mastodonAppRevoke: `https://{uri}/oauth/authorized_applications#:~:text=${encodeURIComponent(
      name,
    )},-Last%20used%20on`,
    mastodonInstance: `${origin}/mastodon/instance`,
    mastodonKnownInstances: `${origin}/mastodon/known-instances`,
    mastodonLogin: `${origin}/mastodon/login`,
    mastodonReturn: `${origin}/mastodon/return`,
    privacy: `${origin}/privacy`,
    results: `${origin}/results`,
    sentryDsn: isLocal
      ? ""
      : isPreview
      ? "https://b49802d053db46a2aec8730d2eb32b7b@o4504311714676736.ingest.sentry.io/4504311718281216"
      : "https://cd075d5a995043f3bb876a9b38b1a27f@o4504311714676736.ingest.sentry.io/4504311753408512",
    sentryRelease: import.meta.env.VERCEL_URL,
    twitterAppRevoke: `https://twitter.com/settings/connected_apps/${
      isLocal ? "26152973" : isPreview ? "26152969" : "26152908"
    }`,
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
