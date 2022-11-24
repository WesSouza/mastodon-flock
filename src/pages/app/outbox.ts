import type { APIRoute } from "astro";

export const get: APIRoute = async function get({ request }) {
  console.log(request.url, request.headers);

  return new Response(null, {
    status: 404,
    statusText: "Not Found",
  });
};

export const post: APIRoute = async function post({ request }) {
  console.log(request.url, request.headers);

  return new Response(null, {
    status: 405,
    statusText: "Method Not Allowed",
  });
};
