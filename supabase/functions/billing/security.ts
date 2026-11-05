// Security helpers for the website function. Pure functions (no network, no Deno APIs) so they can be tested
// in Node: signed unsubscribe tokens and origin allow-listing.

const enc = new TextEncoder();
const MAX_TOKEN_LENGTH = 4096;

export const nowSeconds = () => Math.floor(Date.now() / 1000);

export function b64urlDecode(text: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(text)) throw new Error("bad base64url");
  const padded = text.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (text.length % 4)) % 4);
  const bin = atob(padded);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

const key = (secret: string) =>
  crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);

/** Constant-time signature check (WebCrypto verify), never throws. */
async function verifySignature(secret: string, text: string, signature: string): Promise<boolean> {
  try {
    return await crypto.subtle.verify("HMAC", await key(secret), b64urlDecode(signature), enc.encode(text));
  } catch {
    return false;
  }
}

function parseJson(payload: string): Record<string, unknown> | null {
  try {
    const data = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)));
    return data && typeof data === "object" && !Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

/** Splits "payload.signature" and checks the signature over the payload. */
async function openSigned(token: unknown, secret: string): Promise<Record<string, unknown> | null> {
  if (!secret || typeof token !== "string" || token.length > MAX_TOKEN_LENGTH) return null;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  if (!(await verifySignature(secret, parts[0], parts[1]))) return null;
  return parseJson(parts[0]);
}

const isDiscordId = (v: unknown): v is string => typeof v === "string" && /^\d{1,20}$/.test(v);

// Unsubscribe links from the bot's emails (format unchanged):
// {"v":1,"k":"unsub","e":"<email>","g":"<server id>","x":<expiry unix s>}, signed with HMAC-SHA256(secret, payload).
// Returns the data even when expired (the caller checks `x`), or null when the token is not genuine.

export type UnsubData = { e: string; g: string; x: number };

export async function verifyUnsub(token: unknown, secret: string): Promise<UnsubData | null> {
  const data = await openSigned(token, secret);
  if (!data || data.v !== 1 || data.k !== "unsub" || !isDiscordId(data.g)) return null;
  if (typeof data.x !== "number") return null;
  if (typeof data.e !== "string" || data.e.length > 254 || !data.e.includes("@")) return null;
  return { e: data.e.trim().toLowerCase(), g: data.g, x: data.x };
}

export function allowedOrigin(origin: string | null, allowed: string[]): string | null {
  if (!origin) return null;
  const clean = origin.replace(/\/+$/, "");
  return allowed.includes(clean) ? clean : null;
}
