// DiscoNotify website billing API (Supabase Edge Function).
//
// The website is a static site, so everything that needs a secret runs here, as the bot's
// docs/website-integration.md describes: checking the bot's signed links, Discord login for the
// server picker, creating the Polar checkout, reading its result, and crypto payments.
//
// POST JSON { action, ... }. Every request must come from an allowed website origin.
//   status     {}                                      → { maintenance } from the admin panel's switch
//   contact    { t | session+guild_id, email }         → saves the reminder email against that server
//   link       { t }                               → server name, price, trial for a signed link
//   login_url  { nonce }                               → Discord authorize URL (CSRF-bound state)
//   login      { code, state, nonce }                  → signed session + the servers the person manages
//   checkout   { t } | { session, guild_id }           → Polar checkout URL
//   thanks     { checkout_id }                         → what Polar says about a checkout
//   activation { checkout_id }                         → whether the bot has switched the server on
//   crypto     { t | session+guild_id, months, coin }  → NOWPayments address and amount
//   crypto_status { id }                               → progress of a crypto payment started here
//
// Security notes: secrets live only in Supabase secrets; a server ID from the browser is never
// trusted (it must be in the signed link or the signed session); errors are generic and details
// are logged without tokens; requests are rate limited per IP.

import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import {
  allowedOrigin,
  canManage,
  isGuildId,
  makeSession,
  makeState,
  randomId,
  safePolarUrl,
  type Session,
  verifyLink,
  verifySession,
  verifyState,
} from "./security.ts";

const env = (key: string, fallback = "") => Deno.env.get(key) ?? fallback;
const positive = (key: string, fallback: number) => {
  const n = Number(env(key));
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

// Keep these equal to the bot's settings.
const PRICE_USD = positive("BILLING_PRICE_USD", 2.99);
const TRIAL_DAYS = Math.trunc(positive("BILLING_TRIAL_DAYS", 7));
const GRACE_DAYS = Math.trunc(positive("BILLING_GRACE_DAYS", 3));

const SITE_URL = env("SITE_URL").replace(/\/+$/, "");
const ALLOWED_ORIGINS = [SITE_URL, ...env("ALLOWED_ORIGINS").split(",")]
  .map((s) => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const LINK_SECRET = env("BILLING_LINK_SECRET");
const SESSION_SECRET = env("SESSION_SECRET");
const POLAR_TOKEN = env("POLAR_WEB_TOKEN");
const POLAR_PRODUCT_ID = env("POLAR_PRODUCT_ID");
const POLAR_URL = env("POLAR_SANDBOX") === "true" ? "https://sandbox-api.polar.sh" : "https://api.polar.sh";
const DISCORD_ID = env("DISCORD_CLIENT_ID");
const DISCORD_SECRET = env("DISCORD_CLIENT_SECRET");
const NOW_KEY = env("NOWPAYMENTS_API_KEY");
const NOW_URL = env("NOWPAYMENTS_SANDBOX") === "true"
  ? "https://api-sandbox.nowpayments.io/v1"
  : "https://api.nowpayments.io/v1";

// Mirrors the bot's billing/service.py.
const CRYPTO_PLANS = [3, 6, 12];
const CRYPTO_COINS: Record<string, string> = {
  usdtbsc: "USDT (BNB Chain · BEP20)",
  ltc: "Litecoin (LTC)",
  sol: "Solana (SOL)",
  eth: "Ethereum (ETH)",
  usdttrc20: "USDT (TRON · TRC20)",
  btc: "Bitcoin (BTC)",
};
const MINIMUM_MARGIN = 1.05;
const ACTIVE_CARD_STATUSES = new Set(["active", "past_due", "trialing"]);
const MAX_CRYPTO_PER_HOUR = 5;
const MAX_BODY = 8_000;
const DAY = 86_400_000;

const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
  db: { schema: "pulsenotify" },
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── errors ────────────────────────────────────────────────────────────────

class HttpError extends Error {
  constructor(public status: number, message: string, public code = "error") {
    super(message);
  }
}

const GENERIC = "Something went wrong. Please try again.";
const PROVIDER_DOWN = "We couldn't reach the payment provider. Please try again in a moment.";

// ── rate limit (best effort, per function instance) ──────────────────────

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

// ── input helpers ─────────────────────────────────────────────────────────

const str = (v: unknown, max = 500) => (typeof v === "string" && v.length <= max ? v : "");

function need(...values: string[]) {
  if (values.some((v) => !v)) throw new HttpError(503, "This payment option isn't available right now.", "unavailable");
}

function money(n: number): string {
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

// ── database reads (no table names or filters ever come from the browser) ──

type BillingRow = {
  trial_ends_at: string | null;
  paid_until: string | null;
  whitelisted: boolean | null;
  card_status: string | null;
  card_cancels_at: string | null;
};
const BILLING_COLUMNS = "trial_ends_at, paid_until, whitelisted, card_status, card_cancels_at";

async function botPresent(ids: string[]): Promise<Set<string>> {
  const present = new Set<string>();
  for (let i = 0; i < ids.length; i += 100) {
    const { data, error } = await db
      .from("pulsenotify_guilds")
      .select("gid:guild_id::text")
      .in("guild_id", ids.slice(i, i + 100))
      .eq("bot_present", true);
    if (error) throw error;
    for (const row of data ?? []) present.add((row as { gid: string }).gid);
  }
  return present;
}

async function billingRows(ids: string[]): Promise<Map<string, BillingRow>> {
  const rows = new Map<string, BillingRow>();
  for (let i = 0; i < ids.length; i += 100) {
    const { data, error } = await db
      .from("pulsenotify_billing")
      .select(`gid:guild_id::text, ${BILLING_COLUMNS}`)
      .in("guild_id", ids.slice(i, i + 100));
    if (error) throw error;
    for (const row of data ?? []) rows.set((row as unknown as { gid: string }).gid, row as unknown as BillingRow);
  }
  return rows;
}

async function requireBot(guildId: string) {
  if (!(await botPresent([guildId])).has(guildId)) {
    throw new HttpError(404, "DiscoNotify isn't in that server (any more). Add the bot first, then try again.", "no_bot");
  }
}

const cardActive = (row?: BillingRow | null) =>
  Boolean(row?.card_status && ACTIVE_CARD_STATUSES.has(row.card_status) && !row.card_cancels_at);

// Same rules as the bot's billing/access.py.
function access(row?: BillingRow | null): { state: string; until: string | null } {
  if (!row) return { state: "new", until: null };
  if (row.whitelisted) return { state: "whitelisted", until: null };
  const now = Date.now();
  const paid = row.paid_until ? Date.parse(row.paid_until) : null;
  const trial = row.trial_ends_at ? Date.parse(row.trial_ends_at) : null;
  if (paid && now < paid) return { state: "paid", until: row.paid_until };
  if (trial && now < trial) return { state: "trial", until: row.trial_ends_at };
  const graceEnd = paid ? paid + GRACE_DAYS * DAY : null;
  if (graceEnd && now < graceEnd) return { state: "grace", until: new Date(graceEnd).toISOString() };
  return { state: "expired", until: null };
}

// A server the bot hasn't billed yet gets the full trial.
function trialDaysFor(row?: BillingRow | null): number {
  if (!row) return TRIAL_DAYS;
  if (!row.trial_ends_at) return 0;
  return Math.max(0, Math.ceil((Date.parse(row.trial_ends_at) - Date.now()) / DAY));
}

// ── who is asking: a signed link from the bot, or a signed login session ──

type Who = { guildId: string; userId?: string; channelId?: string; trialDays?: number; viaLink: boolean };

async function whoIs(body: Record<string, unknown>): Promise<Who> {
  if (body.t !== undefined) {
    const link = await verifyLink(body.t, LINK_SECRET);
    if (!link) throw new HttpError(400, "This link has expired.", "link_expired");
    return { guildId: link.g, userId: link.u, channelId: link.c, trialDays: link.d, viaLink: true };
  }
  const session = await verifySession(body.session, SESSION_SECRET);
  if (!session) throw new HttpError(401, "Your login has expired. Please log in with Discord again.", "session_expired");
  const guildId = body.guild_id;
  // Never trust a server ID from the browser: it must be one this person was shown at login.
  if (!isGuildId(guildId) || !session.g.includes(guildId)) {
    throw new HttpError(403, "You can't subscribe that server.", "forbidden");
  }
  return { guildId, userId: session.u, viaLink: false };
}

// ── provider calls ────────────────────────────────────────────────────────

async function call(url: string, init: RequestInit, who: string) {
  let res: Response;
  try {
    res = await fetch(url, { ...init, signal: AbortSignal.timeout(15_000) });
  } catch (err) {
    console.error(`${who} request failed:`, (err as Error).name);
    throw new HttpError(502, PROVIDER_DOWN, "provider");
  }
  const text = await res.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch { /* not JSON */ }
  return { res, json, text };
}

async function polar(method: string, path: string, body?: unknown) {
  const { res, json, text } = await call(POLAR_URL + path, {
    method,
    headers: { Authorization: `Bearer ${POLAR_TOKEN}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }, "Polar");
  if (!res.ok) {
    console.error("Polar error", res.status, text.slice(0, 500)); // never includes the token
    // The code (e.g. polar_401) is safe to show: it says what kind of failure it was, nothing more.
    throw new HttpError(res.status === 404 ? 404 : 502, PROVIDER_DOWN, res.status === 404 ? "not_found" : `polar_${res.status}`);
  }
  return json;
}

async function nowpayments(method: string, path: string, body?: unknown) {
  const { res, json, text } = await call(NOW_URL + path, {
    method,
    headers: { "x-api-key": NOW_KEY, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  }, "NOWPayments");
  if (!res.ok) {
    console.error("NOWPayments error", res.status, text.slice(0, 500));
    throw new HttpError(502, PROVIDER_DOWN, "provider");
  }
  return json;
}

// ── actions ───────────────────────────────────────────────────────────────

async function link(body: Record<string, unknown>) {
  need(LINK_SECRET);
  const data = await verifyLink(body.t, LINK_SECRET);
  if (!data) throw new HttpError(400, "This link has expired.", "link_expired");
  await requireBot(data.g);
  const row = (await billingRows([data.g])).get(data.g);
  return {
    guild_id: data.g,
    name: data.n ?? "",
    trial_days: data.d,
    ...access(row),
    card_active: cardActive(row),
    price_usd: PRICE_USD,
    card: Boolean(POLAR_TOKEN && POLAR_PRODUCT_ID),
    crypto: Boolean(NOW_KEY),
  };
}

async function loginUrl(body: Record<string, unknown>) {
  need(DISCORD_ID, DISCORD_SECRET, SESSION_SECRET, SITE_URL);
  const nonce = str(body.nonce, 64);
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(nonce)) throw new HttpError(400, GENERIC, "bad_request");
  const params = new URLSearchParams({
    client_id: DISCORD_ID,
    response_type: "code",
    scope: "identify guilds",
    redirect_uri: `${SITE_URL}/auth/callback`,
    state: await makeState(nonce, SESSION_SECRET),
    prompt: "none",
  });
  return { url: `https://discord.com/oauth2/authorize?${params}` };
}

async function login(body: Record<string, unknown>) {
  need(DISCORD_ID, DISCORD_SECRET, SESSION_SECRET, SITE_URL);
  const code = str(body.code, 512);
  if (!code || !(await verifyState(body.state, body.nonce, SESSION_SECRET))) {
    throw new HttpError(400, "The login couldn't be verified. Please try again.", "bad_login");
  }

  const tokenRes = await call("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: DISCORD_ID,
      client_secret: DISCORD_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: `${SITE_URL}/auth/callback`,
    }),
  }, "Discord");
  const accessToken = tokenRes.json?.access_token;
  if (!tokenRes.res.ok || typeof accessToken !== "string") {
    console.error("Discord token exchange failed", tokenRes.res.status);
    throw new HttpError(400, "The login couldn't be completed. Please try again.", "bad_login");
  }

  try {
    const auth = { headers: { Authorization: `Bearer ${accessToken}` } };
    const [me, guilds] = await Promise.all([
      call("https://discord.com/api/users/@me", auth, "Discord"),
      call("https://discord.com/api/users/@me/guilds", auth, "Discord"),
    ]);
    if (!me.res.ok || !guilds.res.ok || !isGuildId(me.json?.id) || !Array.isArray(guilds.json)) {
      throw new HttpError(502, PROVIDER_DOWN, "provider");
    }

    // Only servers they manage, the same rule the bot applies.
    const manageable = (guilds.json as Array<Record<string, unknown>>)
      .filter((g) => isGuildId(g.id) && canManage({ owner: g.owner === true, permissions: String(g.permissions ?? "0") }))
      .slice(0, 200);
    const ids = manageable.map((g) => g.id as string);
    const present = await botPresent(ids);
    const billing = await billingRows([...present]);

    const list = manageable.map((g) => {
      const id = g.id as string;
      const row = billing.get(id);
      return {
        id,
        name: str(g.name, 100) || "Server",
        icon: typeof g.icon === "string" && /^[a-z0-9_]{1,64}$/i.test(g.icon) ? g.icon : null,
        bot: present.has(id),
        ...access(row),
        trial_days: trialDaysFor(row),
        card_active: cardActive(row),
      };
    }).sort((a, b) => Number(b.bot) - Number(a.bot) || a.name.localeCompare(b.name));

    const name = str(me.json.global_name, 80) || str(me.json.username, 80) || "Discord user";
    return {
      session: await makeSession({ id: me.json.id, name }, [...present], SESSION_SECRET),
      user: { id: me.json.id, name },
      guilds: list,
      price_usd: PRICE_USD,
      card: Boolean(POLAR_TOKEN && POLAR_PRODUCT_ID),
      crypto: Boolean(NOW_KEY),
    };
  } finally {
    // The Discord token is only needed for the calls above; discard it straight away.
    await call("https://discord.com/api/oauth2/token/revoke", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: DISCORD_ID,
        client_secret: DISCORD_SECRET,
        token: accessToken,
        token_type_hint: "access_token",
      }),
    }, "Discord").catch(() => undefined);
  }
}

async function checkout(body: Record<string, unknown>) {
  need(POLAR_TOKEN, POLAR_PRODUCT_ID, SITE_URL);
  const who = await whoIs(body);
  if (who.viaLink) need(LINK_SECRET);
  await requireBot(who.guildId);
  const row = (await billingRows([who.guildId])).get(who.guildId);
  // Two subscriptions would mean double charges.
  if (cardActive(row)) {
    throw new HttpError(409, "This server already has a card subscription. Manage it with /disconotify cancel in Discord.", "already_subscribed");
  }

  const trialDays = who.viaLink ? who.trialDays ?? 0 : trialDaysFor(row);
  const metadata: Record<string, string> = { guild_id: who.guildId }; // exact keys the bot reads
  if (who.userId) metadata.user_id = who.userId;
  if (who.channelId) metadata.channel_id = who.channelId;

  const created = await polar("POST", "/v1/checkouts/", {
    products: [POLAR_PRODUCT_ID],
    metadata,
    allow_trial: trialDays > 0,
    ...(trialDays > 0 && { trial_interval: "day", trial_interval_count: trialDays }),
    success_url: `${SITE_URL}/thanks?checkout_id={CHECKOUT_ID}`, // Polar fills in {CHECKOUT_ID}
    return_url: `${SITE_URL}/subscribe`,
  });
  const url = safePolarUrl(created?.url);
  if (!url) {
    console.error("Polar returned an unexpected checkout URL");
    throw new HttpError(502, PROVIDER_DOWN, "provider");
  }
  return { url };
}

const CHECKOUT_ID = /^[A-Za-z0-9_-]{8,80}$/;

async function readCheckout(id: unknown) {
  need(POLAR_TOKEN);
  const checkoutId = str(id, 80);
  if (!CHECKOUT_ID.test(checkoutId)) throw new HttpError(400, GENERIC, "bad_request");
  return await polar("GET", `/v1/checkouts/${encodeURIComponent(checkoutId)}`);
}

async function thanks(body: Record<string, unknown>) {
  try {
    const c = await readCheckout(body.checkout_id);
    return {
      status: str(c?.status, 30) || "unknown",
      trial_end: str(c?.trial_end, 40) || null,
    };
  } catch (err) {
    if (err instanceof HttpError && err.code === "bad_request") throw err;
    return { status: "error", trial_end: null }; // Polar 404 / unreachable → the page shows its error alert
  }
}

async function activation(body: Record<string, unknown>) {
  const c = await readCheckout(body.checkout_id);
  // Only a checkout Polar confirms as paid can reveal anything, and only a few fields of one server.
  const guildId = c?.metadata?.guild_id;
  if (c?.status !== "succeeded" || !isGuildId(guildId)) return { active: false };
  const row = (await billingRows([guildId])).get(guildId);
  const active = row?.card_status === "trialing" || row?.card_status === "active";
  return { active, ...(active ? access(row) : {}) };
}

async function crypto_(body: Record<string, unknown>) {
  need(NOW_KEY);
  const who = await whoIs(body);
  if (who.viaLink) need(LINK_SECRET);
  const months = Number(body.months);
  const coin = str(body.coin, 20);
  if (!CRYPTO_PLANS.includes(months) || !Object.hasOwn(CRYPTO_COINS, coin)) {
    throw new HttpError(400, "Choose a plan and a coin.", "bad_request");
  }
  await requireBot(who.guildId);

  const since = new Date(Date.now() - 3_600_000).toISOString();
  const { count, error: countError } = await db
    .from("pulsenotify_payments")
    .select("id", { count: "exact", head: true })
    .eq("guild_id", who.guildId)
    .eq("provider", "nowpayments")
    .contains("metadata", { source: "website" })
    .gte("created_at", since);
  if (countError) throw countError;
  if ((count ?? 0) >= MAX_CRYPTO_PER_HOUR) {
    throw new HttpError(429, "Too many payments started for this server. Please wait an hour and try again.", "rate_limited");
  }

  // Same rule as the bot: the plan must clear the coin's current minimum payment.
  const amount = Math.round(months * PRICE_USD * 100) / 100;
  const min = await nowpayments("GET", `/min-amount?currency_from=${coin}&currency_to=${coin}&fiat_equivalent=usd`);
  const minimum = Number(min?.fiat_equivalent || 0) * MINIMUM_MARGIN;
  if (amount < minimum) {
    const longer = CRYPTO_PLANS.find((m) => m * PRICE_USD >= minimum);
    throw new HttpError(
      400,
      `${CRYPTO_COINS[coin]} payments need at least ${money(Math.round(minimum * 100) / 100)} right now. ` +
        (longer ? `Choose the ${longer}-month plan, or ` : "") +
        "pay with USDT (BNB Chain) or Litecoin, which have much lower minimums.",
      "below_minimum",
    );
  }

  const payment = await nowpayments("POST", "/payment", {
    price_amount: amount,
    price_currency: "usd",
    pay_currency: coin,
    order_id: `${who.guildId}-${randomId(6)}`, // the bot requires the "<guild_id>-" prefix
    order_description: `DiscoNotify — ${months} months for server ${who.guildId}`,
  });

  const { data, error } = await db
    .from("pulsenotify_payments")
    .insert({
      guild_id: who.guildId,
      provider: "nowpayments",
      external_id: String(payment.payment_id),
      months,
      amount_usd: amount,
      requested_by: who.userId ?? null,
      channel_id: who.channelId ?? null,
      metadata: {
        pay_currency: payment.pay_currency,
        pay_amount: payment.pay_amount,
        pay_address: payment.pay_address,
        payin_extra_id: payment.payin_extra_id ?? null,
        source: "website",
      },
    })
    .select("id")
    .single();
  if (error) throw error;

  return {
    id: data.id as string,
    months,
    amount_usd: amount,
    coin: CRYPTO_COINS[coin],
    pay_currency: String(payment.pay_currency ?? coin),
    pay_amount: payment.pay_amount,
    pay_address: String(payment.pay_address ?? ""),
    payin_extra_id: payment.payin_extra_id ?? null,
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function cryptoStatus(body: Record<string, unknown>) {
  const id = str(body.id, 40);
  if (!UUID.test(id)) throw new HttpError(400, GENERIC, "bad_request");
  const { data, error } = await db
    .from("pulsenotify_payments")
    .select("status, provider, external_id, gid:guild_id::text")
    .eq("id", id)
    .eq("provider", "nowpayments")
    .contains("metadata", { source: "website" })
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(404, "Unknown payment.", "not_found");

  const result: Record<string, unknown> = { status: data.status };
  if (data.status === "paid") {
    Object.assign(result, access((await billingRows([data.gid as string])).get(data.gid as string)));
  } else if (data.status === "pending" && NOW_KEY) {
    try {
      const remote = await nowpayments("GET", `/payment/${encodeURIComponent(String(data.external_id))}`);
      result.payment_status = str(remote?.payment_status, 30);
      result.confirmed = ["confirmed", "sending", "finished"].includes(String(remote?.payment_status));
    } catch { /* progress is optional; the bot decides when it counts */ }
  }
  return result;
}

// ── contact email (for renewal reminders, tied to the server) ─────────────

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

async function contact(body: Record<string, unknown>) {
  const who = await whoIs(body); // the server ID comes from the signed link or session, never the browser
  if (who.viaLink) need(LINK_SECRET);
  const email = str(body.email, 254).trim().toLowerCase();
  if (!EMAIL.test(email)) throw new HttpError(400, "Enter a valid email address.", "bad_email");
  await requireBot(who.guildId);

  const { error } = await db.from("pulsenotify_contact_emails").upsert(
    { guild_id: who.guildId, email, discord_user_id: who.userId ?? null, updated_at: new Date().toISOString() },
    { onConflict: "guild_id" },
  );
  if (error) throw error;
  return { ok: true };
}

// ── maintenance flag (read only; the admin panel is the only writer) ──────

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
        .from("pulsenotify_bot_state")
        .select("value")
        .eq("key", "maintenance_mode")
        .maybeSingle();
      if (!error && data) on = flagIsOn(data.value);
    } catch { /* leave it off */ }
    maintenanceCache = { at: Date.now(), on };
  }
  return { maintenance: maintenanceCache.on };
}

// ── entry point ───────────────────────────────────────────────────────────

const actions: Record<string, { run: (b: Record<string, unknown>) => Promise<unknown>; perMinute: number }> = {
  status: { run: status, perMinute: 60 },
  contact: { run: contact, perMinute: 10 },
  link: { run: link, perMinute: 30 },
  login_url: { run: loginUrl, perMinute: 20 },
  login: { run: login, perMinute: 15 },
  checkout: { run: checkout, perMinute: 10 },
  thanks: { run: thanks, perMinute: 30 },
  activation: { run: activation, perMinute: 40 },
  crypto: { run: crypto_, perMinute: 10 },
  crypto_status: { run: cryptoStatus, perMinute: 40 },
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
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
    rateLimit(ip, name, actions[name].perMinute);

    return reply(200, await actions[name].run(body));
  } catch (err) {
    if (err instanceof HttpError) return reply(err.status, { error: err.message, code: err.code });
    const detail = (err as { message?: unknown })?.message;
    console.error("Unhandled error:", typeof detail === "string" ? detail : "unknown"); // never the request body
    return reply(500, { error: GENERIC, code: "error" });
  }
});
