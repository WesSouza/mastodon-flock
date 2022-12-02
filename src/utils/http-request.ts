import type { APIResult } from "../types";

export async function http<T>({
  accept = "application/json",
  jsonBody,
  method = "get",
  redirect = "follow",
  searchParams,
  signal = null,
  timeout,
  url: urlString,
}: {
  accept?: string;
  jsonBody?: Record<string, any>;
  method?: "get" | "post" | "delete";
  redirect?: RequestInit["redirect"];
  searchParams?: Record<string, string>;
  signal?: AbortSignal | null;
  timeout?: number;
  url: string;
}): Promise<APIResult<T>> {
  if (searchParams) {
    const url = new URL(urlString);
    const newSearchParams = new URLSearchParams(searchParams);
    url.search += `&${newSearchParams.toString()}`;
    urlString = url.toString();
  }

  let body = null;
  const headers = new Headers({
    accept,
  });

  if (jsonBody) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(jsonBody);
  }

  if (timeout && signal) {
    console.warn("Cannot combine a timeout and a signal");
  }

  if (timeout && !signal) {
    signal = AbortSignal.timeout(timeout);
  }

  let response;
  try {
    response = await fetch(urlString, {
      body,
      credentials: "same-origin",
      headers,
      method,
      redirect,
      signal,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return { error: "aborted" };
      }
      if (error.name === "TimeoutError") {
        return { error: "timedOut" };
      }
    }
    return { error: "requestError", reason: String(error) };
  }

  if (!response.headers.get("content-type")?.startsWith(accept)) {
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
