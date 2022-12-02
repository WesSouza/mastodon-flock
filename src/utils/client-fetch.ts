import type { APIResult } from "../types";

export async function http<T>({
  url: urlString,
  method = "get",
  searchParams,
  jsonBody,
  signal = null,
}: {
  url: string;
  method?: "get" | "post" | "delete";
  searchParams?: Record<string, string>;
  jsonBody?: Record<string, any>;
  signal?: AbortSignal | null;
}): Promise<APIResult<T>> {
  if (searchParams) {
    const url = new URL(urlString);
    const newSearchParams = new URLSearchParams(searchParams);
    url.search += `&${newSearchParams.toString()}`;
    urlString = url.toString();
  }

  let body = null;
  const headers = new Headers({
    accept: "application/json",
  });

  if (jsonBody) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(jsonBody);
  }

  let response;
  try {
    response = await fetch(urlString, {
      body,
      credentials: "same-origin",
      headers,
      method,
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return { error: "aborted", reason: error };
    }
    return { error: "requestError", reason: error };
  }

  if (!response.headers.get("content-type")?.startsWith("application/json")) {
    switch (true) {
      case response.status >= 500:
        return { error: "serverError" };
      case response.status === 400:
        return { error: "badRequest" };
      case response.status === 401:
        return { error: "unauthorized" };
      case response.status === 403:
        return { error: "forbidden" };
      case response.status === 404:
        return { error: "notFound" };
      case response.status >= 400:
        return { error: "clientError" };
      case response.status >= 300:
        return { error: "redirectionResponse" };
      case response.status < 200:
        return { error: "informationalResponse" };
    }

    return { error: "unsupportedContentType" };
  }

  let data;
  try {
    data = (await response.json()) as T;
  } catch (error) {
    return { error: "jsonParseError", reason: error };
  }

  return data;
}
