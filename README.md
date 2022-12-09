# Mastodon Flock

Mastodon Flock is a web application that looks for Twitter users on
ActivityPub-enabled platforms (the &ldquo;Fediverse&rdquo;), such as Mastodon.

It works by connecting to your Twitter account, reading your contacts profile
information, and checking if they have mentioned any external accounts with a
URL or email.

It is built with [React](https://reactjs.org) using
[React95](https://react95.io) components, bundled with
[Astro](http://astro.build) and deployed with [Vercel](https://vercel.com).

## Installation and development

Make sure you have [Node.js](https://nodejs.dev/en/download/package-manager/)
and enable [pnpm](https://pnpm.io/installation).

```sh
# Install dependencies
pnpm install

# Run development server
pnpm run dev
```

Check the output for the URL.

## LICENSE

MIT, https://wes.dev/LICENSE.txt
