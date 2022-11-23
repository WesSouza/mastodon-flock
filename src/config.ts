export const config = {
  isLocal: import.meta.env.SITE?.startsWith("http://localhost:"),
  urls: {
    home: `${import.meta.env.SITE}`,
    twitterLogin: `${import.meta.env.SITE}twitter/login`,
    twitterReturn: `${import.meta.env.SITE}twitter/return`,
  },
  twitter: {
    maxResultsPerPage: 1000,
  },
};

console.log(import.meta.env);
