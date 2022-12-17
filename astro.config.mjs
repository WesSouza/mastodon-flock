import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless";
import sentryVitePlugin from "@sentry/vite-plugin";
import { defineConfig } from "astro/config";

const vite = process.env.VERCEL_URL
  ? {
      build: {
        sourcemap: true,
      },
      plugins: [
        sentryVitePlugin({
          org: "wes-souza",
          project:
            process.env.VERCEL_ENV === "production"
              ? "mastodon-flock"
              : "mastodon-flock-preview",
          include: "./.vercel/output/static",
          authToken: process.env.SENTRY_AUTH_TOKEN,
          release: process.env.VERCEL_URL,
        }),
      ],
    }
  : {};

export default defineConfig({
  site:
    process.env.VERCEL_ENV === "production"
      ? "https://mastodon-flock.vercel.app"
      : process.env.VERCEL_GIT_COMMIT_REF === "preview"
      ? "https://mastodon-flock-preview.vercel.app"
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000",
  output: "server",
  adapter: vercel(),
  integrations: [react()],
  vite,
});
