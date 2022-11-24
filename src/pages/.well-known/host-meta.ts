import type { APIRoute } from "astro";

export const get: APIRoute = async function get() {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">
  <Link rel="lrdd" template="${import.meta.env.SITE}.well-known/webfinger?resource={uri}"/>
</XRD>`,
    {
      headers: {
        "Content-Type": "application/xrd+xml; charset=utf-8",
      },
    },
  );
};
