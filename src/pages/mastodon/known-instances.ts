import type { APIRoute } from "astro";
import mongoose from "mongoose";

import { config } from "../../config";
import {
  FederatedInstance,
  IFederatedInstance,
} from "../../models/FederatedInstance";
import type { MastodonInstance } from "../../types";
import { responseJsonError } from "../../utils/http-response";

export const get: APIRoute = async function get(context) {
  if (Date.now() >= config.timeOfDeath) {
    return responseJsonError(500, "☠️");
  }

  const { request, url } = context;
  if (!request.headers.get("accept")?.startsWith("application/json")) {
    return responseJsonError(400, "badRequest");
  }

  const allInstances = Boolean(url.searchParams.get("allInstances"));

  try {
    await mongoose.connect(import.meta.env.MONGODB_URI);
  } catch (e) {
    console.error(e);
    return responseJsonError(500, "databaseConnectionError");
  }

  const query: mongoose.FilterQuery<IFederatedInstance> = allInstances
    ? {}
    : { "usage.usersTotal": { $gte: 50 } };

  // TODO: Paginate once the know Fediverse gets out of hand
  const federatedInstances: MastodonInstance[] = await FederatedInstance.find(
    query,
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
