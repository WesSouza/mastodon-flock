import type { APIRoute } from "astro";
import { config } from "../config";
import { Session } from "../utils/session";

export const get: APIRoute = async function get(context) {
  const session = Session.withAstro(context);
  session.deleteCookie();
  return context.redirect(config.urls.desktop, 301);
};
