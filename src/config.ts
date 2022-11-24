const isLocal = import.meta.env.SITE?.startsWith("http://localhost:");

const siteUrl = new URL(import.meta.env.SITE);

export const config = {
  isLocal,
  host: siteUrl.hostname,
  urls: {
    home: import.meta.env.SITE,
    activityPubApp: !isLocal
      ? `${import.meta.env.SITE}app`
      : "https://mastodon-flock-preview.vercel.app/app",
    twitterLogin: `${import.meta.env.SITE}twitter/login`,
    twitterReturn: `${import.meta.env.SITE}twitter/return`,
  },
  activityPub: {
    appUsername: "mastodon-flock",
    publicKey: import.meta.env.ACTIVITYPUB_APP_PUBLIC.replace(/\\n/g, "\n"),
    privateKey: import.meta.env.ACTIVITYPUB_APP_PRIVATE.replace(/\\n/g, "\n"),
  },
  twitter: {
    maxResultsPerPage: 1000,
  },
};
