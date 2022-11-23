import preact from "@astrojs/preact";
import vercel from "@astrojs/vercel/serverless";
import { defineConfig } from "astro/config";

export default defineConfig({
  site:
    process.env.VERCEL_ENV === "production"
      ? "https://mastodon-flock.vercel.app"
      : process.env.VERCEL_GIT_COMMIT_REF === "preview"
      ? "https://mastodon-flock-preview.vercel.app"
      : process.env.VERCEL_URL
      ? `https://${VERCEL_URL}`
      : "http://localhost:3000",
  output: "server",
  adapter: vercel(),
  integrations: [preact()],
});
