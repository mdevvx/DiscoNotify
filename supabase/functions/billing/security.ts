// Security helpers for the billing function. Pure functions (no network, no Deno APIs) so they can be tested
// in Node: signed tokens, signed login state and session, Discord permission check, URL allow-listing.

const enc = new TextEncoder();
const MAX_TOKEN_LENGTH = 4096;

export const nowSeconds = () => Math.floor(Date.now() / 1000);

export function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function b64urlDecode(text: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) throw new Error("bad base64url");
  const padded = text.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (text.length % 4)) % 4);
  const bin = atob(padded);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

const key = (secret: string) =>
  crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);

export async function sign(secret: string, text: string): Promise<string> {
  return b64url(new Uint8Array(await crypto.subtle.sign("HMAC", await key(secret), enc.encode(text))));
}

/** Constant-time signature check (WebCrypto verify), never throws. */
export async function verifySignature(secret: string, text: string, signature: string): Promise<boolean> {
  try {
    return await crypto.subtle.verify("HMAC", await key(secret), b64urlDecode(signature), enc.encode(text));
  } catch {
    return false;
  }
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(text)));
  return Array.from(digest, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function randomId(bytes = 12): string {
  const raw = new Uint8Array(bytes);
  crypto.getRandomValues(raw);
  return Array.from(raw, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ── generic signed payloads ──────────────────────────────────────────────

function parseJson(payload: string): Record<string, unknown> | null {
  try {
    const data = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)));
    return data && typeof data === "object" && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

/** Splits "payload.signature" and checks the signature over `${label}${payload}`. */
async function openSigned(token: unknown, secret: string, label: string): Promise<Record<string, unknown> | null> {
  if (!secret || typeof token !== "string" || token.length > MAX_TOKEN_LENGTH) return null;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  if (!(await verifySignature(secret, label + parts[0], parts[1]))) return null;
  return parseJson(parts[0]);
}

async function seal(data: Record<string, unknown>, secret: string, label: string): Promise<string> {
  const payload = b64url(enc.encode(JSON.stringify(data)));
  return `${payload}.${await sign(secret, label + payload)}`;
}

const DISCORD_ID = /^\d{1,20}$/;
const isDiscordId = (v: unknown): v is string => typeof v === "string" && DISCORD_ID.test(v);

// ── links from the bot (/notify subscribe) ──────────────────────────
// Format is fixed by the bot (billing/links.py): signature = HMAC-SHA256(secret, payload), no label.

export type LinkData = { g: string; u?: string; c?: string; n?: string; d: number; e: number };

export async function verifyLink(token: unknown, secret: string): Promise<LinkData | null> {
  const data = await openSigned(token, secret, "");
  if (!data || data.v !== 1 || !isDiscordId(data.g)) return null;
  if (typeof data.e !== "number" || data.e < nowSeconds()) return null;
  const days = Number(data.d ?? 0);
  return {
    g: data.g,
    u: isDiscordId(data.u) ? data.u : undefined,
    c: isDiscordId(data.c) ? data.c : undefined,
    n: typeof data.n === "string" ? data.n.slice(0, 100) : undefined,
    d: Number.isFinite(days) ? Math.min(Math.max(Math.trunc(days), 0), 365) : 0,
    e: data.e,
  };
}

// ── Discord login: state (CSRF) and session ──────────────────────────────

const STATE_LABEL = "pn-state:";
const SESSION_LABEL = "pn-session:";
export const STATE_TTL = 600;
export const SESSION_TTL = 1800;

/** The browser keeps `nonce`; the state carries only its hash, so a stolen state alone is useless. */
export async function makeState(nonce: string, secret: string): Promise<string> {
  return seal({ n: await sha256Hex(nonce), e: nowSeconds() + STATE_TTL }, secret, STATE_LABEL);
}

export async function verifyState(state: unknown, nonce: unknown, secret: string): Promise<boolean> {
  const data = await openSigned(state, secret, STATE_LABEL);
  if (!data || typeof data.e !== "number" || data.e < nowSeconds() || typeof nonce !== "string") return false;
  return data.n === (await sha256Hex(nonce));
}

export type Session = { u: string; n: string; g: string[]; e: number };

export async function makeSession(user: { id: string; name: string }, guildIds: string[], secret: string) {
  return seal({ v: 1, u: user.id, n: user.name.slice(0, 80), g: guildIds, e: nowSeconds() + SESSION_TTL }, secret, SESSION_LABEL);
}

export async function verifySession(token: unknown, secret: string): Promise<Session | null> {
  const data = await openSigned(token, secret, SESSION_LABEL);
  if (!data || data.v !== 1 || !isDiscordId(data.u) || typeof data.e !== "number" || data.e < nowSeconds()) return null;
  if (!Array.isArray(data.g) || !data.g.every(isDiscordId)) return null;
  return { u: data.u, n: String(data.n ?? ""), g: data.g as string[], e: data.e };
}

// ── Discord permissions: owner, Manage Server or Administrator (same rule as the bot) ──

const MANAGE_GUILD = 0x20n;
const ADMINISTRATOR = 0x8n;

export function canManage(guild: { owner?: boolean; permissions?: string }): boolean {
  if (guild.owner === true) return true;
  try {
    return (BigInt(guild.permissions ?? "0") & (MANAGE_GUILD | ADMINISTRATOR)) !== 0n;
  } catch {
    return false;
  }
}

// ── URLs ──────────────────────────────────────────────────────────────────

/** Only ever send people to Polar over https (the bot applies the same rule to Polar's links). */
export function safePolarUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || !(host === "polar.sh" || host.endsWith(".polar.sh"))) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function allowedOrigin(origin: string | null, allowed: string[]): string | null {
  if (!origin) return null;
  const clean = origin.replace(/\/+$/, "");
  return allowed.includes(clean) ? clean : null;
}

export const isGuildId = (v: unknown): v is string => isDiscordId(v);
