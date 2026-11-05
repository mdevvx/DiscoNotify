import { site } from "@/lib/site";

export class ApiError extends Error {
  constructor(message: string, public code = "error", public status = 0) {
    super(message);
  }
}

/** Calls the website function (unsubscribe + maintenance status). Never sends cookies or a referrer. */
export async function api<T>(body: Record<string, unknown>): Promise<T> {
  if (!site.billingApi) throw new ApiError("This isn't set up yet.", "unavailable");
  let res: Response;
  try {
    res = await fetch(site.billingApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    if ((err as Error).name === "TimeoutError") throw new ApiError("The server took too long to answer. Please try again.", "timeout");
    throw new ApiError("We couldn't reach the server. Check your connection and try again.", "network");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.error || "Something went wrong. Please try again.", json.code || "error", res.status);
  return json as T;
}
