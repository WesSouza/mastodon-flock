const errorStatusTexts = {
  400: "Bad Request",
  403: "Forbidden",
  404: "Not Found",
  500: "Internal Server Error",
};

export function responseJsonError(
  status: keyof typeof errorStatusTexts,
  error: string,
) {
  return new Response(JSON.stringify({ error }), {
    status,
    statusText: errorStatusTexts[status] ?? errorStatusTexts[500],
    headers: {
      "Content-Type": "application/json",
    },
  });
}
