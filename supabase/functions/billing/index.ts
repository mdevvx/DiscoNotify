// DiscoNotify website API (Supabase Edge Function).
//
// The website is static and has no accounts, login or checkout (all of that lives on
// dashboard.disconotify.com). This function only does the two things that need a secret:
//
// POST JSON { action, ... }. Every request must come from an allowed website origin.
//   status      {}          -> { maintenance } from the admin panel's switch
//   unsub_info  { t }       -> masked address behind an unsubscribe link (or code "expired" / "bad_link")
//   unsubscribe { t }       -> stop reminder emails for that address
//   resubscribe { t }       -> resume them
//   POST ?unsub=<token>  (no Origin) -> one-click List-Unsubscribe from mail apps
//
// Secret (Supabase secrets only): BILLING_LINK_SECRET. SUPABASE_URL and the service key are provided by Supabase.

import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import { allowedOrigin, nowSeconds, verifyUnsub } from "./security.ts";

const env = (key: string, fallback = "") => Deno.env.get(key) ?? fallback;

const SITE_URL = env("SITE_URL").replace(/\/+$/, "");
const ALLOWED_ORIGINS = [SITE_URL, ...env("ALLOWED_ORIGINS").split(",")]
  .map((s) => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const LINK_SECRET = env("BILLING_LINK_SECRET");
const MAX_BODY = 2_000;

const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
  db: { schema: "disconotify" },
  auth: { persistSession: false, autoRefreshToken: false },
});

class HttpError extends Error {
  constructor(public status: number, message: string, public code = "error") {
    super(message);
  }
}

const GENERIC = "Something went wrong. Please try again.";

// rate limit (best effort, per function instance)

const hits = new Map<string, number[]>();
function rateLimit(ip: string, action: string, perMinute: number) {
  const now = Date.now();
  const key = `${action}|${ip}`;
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= perMinute) throw new HttpError(429, "Too many requests. Please wait a minute and try again.", "rate_limited");
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < 60_000)) hits.delete(k);
}

// unsubscribe from reminder emails

function maskEmail(email: string): string {
  const [name, domain = ""] = email.split("@");
  return `${name.slice(0, 1)}***@${domain}`;
}

// A forged or malformed token gets one neutral answer; a genuine but expired one says so.
async function unsubToken(body: Record<string, unknown>) {
  if (!LINK_SECRET) throw new HttpError(503, "This isn't available right now.", "unavailable");
  const data = await verifyUnsub(body.t, LINK_SECRET);
  if (!data) throw new HttpError(400, "This link isn't valid any more.", "bad_link");
  if (data.x < nowSeconds()) throw new HttpError(400, "This link has expired.", "expired");
  return data;
}

async function unsubInfo(body: Record<string, unknown>) {
  const { e } = await unsubToken(body);
  return { email: maskEmail(e) };
}

async function setUnsubscribed(email: string, on: boolean) {
  const query = db.from("notify_email_contacts").update({ marketing_unsubscribed_at: on ? new Date().toISOString() : null }).eq("email", email);
  const { error } = await (on ? query.is("marketing_unsubscribed_at", null) : query);
  if (error) throw error;
}

async function unsubscribe(body: Record<string, unknown>) {
  await setUnsubscribed((await unsubToken(body)).e, true);
  return { ok: true };
}

async function resubscribe(body: Record<string, unknown>) {
  await setUnsubscribed((await unsubToken(body)).e, false);
  return { ok: true };
}

// maintenance flag (read only; the admin panel is the only writer)

const MAINTENANCE_TTL = 45_000;
let maintenanceCache = { at: 0, on: false };

function flagIsOn(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return v.toLowerCase() === "true";
  if (v && typeof v === "object" && "enabled" in v) return Boolean((v as { enabled: unknown }).enabled);
  return false;
}

/** A failed lookup means "no banner"; the site is never blocked by it. */
async function status() {
  if (Date.now() - maintenanceCache.at > MAINTENANCE_TTL) {
    let on = false;
    try {
      const { data, error } = await db
        .from("notify_bot_state")
        .select("value")
        .eq("key", "maintenance_mode")
        .maybeSingle();
      if (!error && data) on = flagIsOn(data.value);
    } catch { /* leave it off */ }
    maintenanceCache = { at: Date.now(), on };
  }
  return { maintenance: maintenanceCache.on };
}

// entry point

const actions: Record<string, { run: (b: Record<string, unknown>) => Promise<unknown>; perMinute: number }> = {
  status: { run: status, perMinute: 60 },
  unsub_info: { run: unsubInfo, perMinute: 30 },
  unsubscribe: { run: unsubscribe, perMinute: 10 },
  resubscribe: { run: resubscribe, perMinute: 10 },
};

Deno.serve(async (req) => {
  const origin = allowedOrigin(req.headers.get("origin"), ALLOWED_ORIGINS);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    Vary: "Origin",
    ...(origin && {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Max-Age": "600",
    }),
  };
  const reply = (status: number, data: unknown) => new Response(data === null ? null : JSON.stringify(data), { status, headers });
  const clientIp = () => (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";

  // One-click unsubscribe (RFC 8058): mail apps POST here with no Origin, so this runs before the origin check.
  const oneClick = new URL(req.url).searchParams.get("unsub");
  if (req.method === "POST" && oneClick) {
    try {
      rateLimit(clientIp(), "unsub_one_click", 20);
      if (!(await req.text()).includes("List-Unsubscribe=One-Click")) return reply(400, { error: "Bad request" });
      await setUnsubscribed((await unsubToken({ t: oneClick })).e, true);
      return reply(200, { ok: true });
    } catch (err) {
      if (err instanceof HttpError) return reply(err.status, { error: err.message, code: err.code });
      console.error("One-click unsubscribe failed");
      return reply(500, { error: GENERIC, code: "error" });
    }
  }

  // Only our own website may call this (browsers always send Origin on cross-origin requests).
  if (!origin) return reply(403, { error: "Forbidden" });
  if (req.method === "OPTIONS") return reply(204, null);
  if (req.method !== "POST") return reply(405, { error: "Method not allowed" });

  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY) throw new HttpError(413, "Request too large.", "bad_request");
    let body: Record<string, unknown>;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
      body = parsed;
    } catch {
      throw new HttpError(400, GENERIC, "bad_request");
    }

    const name = typeof body.action === "string" ? body.action : "";
    if (!Object.hasOwn(actions, name)) throw new HttpError(400, GENERIC, "bad_request");
    rateLimit(clientIp(), name, actions[name].perMinute);

    return reply(200, await actions[name].run(body));
  } catch (err) {
    if (err instanceof HttpError) return reply(err.status, { error: err.message, code: err.code });
    const detail = (err as { message?: unknown })?.message;
    console.error("Unhandled error:", typeof detail === "string" ? detail : "unknown"); // never the request body
    return reply(500, { error: GENERIC, code: "error" });
  }
});
