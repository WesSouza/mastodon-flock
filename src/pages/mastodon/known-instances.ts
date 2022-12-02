import type { APIRoute } from "astro";
import mongoose from "mongoose";

import { FederatedInstance } from "../../models/FederatedInstance";
import type { MastodonInstance } from "../../types";
import { responseJsonError } from "../../utils/http-response";

export const get: APIRoute = async function get(context) {
  const { request } = context;
  if (!request.headers.get("accept")?.startsWith("application/json")) {
    return responseJsonError(400, "badRequest");
  }

  try {
    await mongoose.connect(import.meta.env.MONGODB_URI);
  } catch (e) {
    console.error(e);
    return responseJsonError(500, "databaseConnectionError");
  }

  // TODO: Paginate once the know Fediverse gets out of hand
  const federatedInstances: MastodonInstance[] = await FederatedInstance.find(
    {},
    {
      _id: 0,
      instanceUrl: 1,
      name: 1,
      software: 1,
      updated: 1,
      uri: 1,
      usage: 1,
    },
    { sort: { "usage.usersTotal": -1 } },
  );

  return new Response(JSON.stringify({ items: federatedInstances }), {
    headers: {
      "cache-control": "s-maxage=600, stale-while-revalidate=3600",
      "content-type": "application/json",
    },
  });
};
