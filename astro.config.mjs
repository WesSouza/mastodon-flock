import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless";
import { defineConfig } from "astro/config";

const vite = process.env.VERCEL_URL
  ? {
      build: {
        sourcemap: true,
      },
      plugins: [],
    }
  : {};

export default defineConfig({
  site:
    process.env.VERCEL_ENV === "production"
      ? "https://mastodon-flock.vercel.app/"
      : process.env.VERCEL_GIT_COMMIT_REF === "preview"
      ? "https://mastodon-flock-preview.vercel.app/"
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/`
      : "http://localhost:3000/",
  output: "server",
  adapter: vercel(),
  integrations: [react()],
  vite,
});
