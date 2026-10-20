import { site } from "@/lib/site";

export class ApiError extends Error {
  constructor(message: string, public code = "error", public status = 0) {
    super(message);
  }
}

/** Calls the billing function. Never sends cookies or a referrer; the function checks our origin itself. */
export async function api<T>(body: Record<string, unknown>): Promise<T> {
  if (!site.billingApi) throw new ApiError("Payments aren't set up yet.", "unavailable");
  let res: Response;
  try {
    res = await fetch(site.billingApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      credentials: "omit",
      referrerPolicy: "no-referrer",
    });
  } catch {
    throw new ApiError("We couldn't reach the server. Check your connection and try again.", "network");
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.error || "Something went wrong. Please try again.", json.code || "error", res.status);
  return json as T;
}

/** Only ever leave the site for Polar, over https. */
export function goToPolar(url: string) {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    throw new ApiError("Something went wrong. Please try again.");
  }
  const host = u.hostname.toLowerCase();
  if (u.protocol !== "https:" || !(host === "polar.sh" || host.endsWith(".polar.sh"))) {
    throw new ApiError("Something went wrong. Please try again.");
  }
  window.location.assign(u.toString());
}

// ── what the page remembers for this tab only (sessionStorage, never localStorage) ──

export type Guild = {
  id: string;
  name: string;
  icon: string | null;
  bot: boolean;
  state: "new" | "trial" | "paid" | "grace" | "expired" | "whitelisted";
  until: string | null;
  trial_days: number;
  card_active: boolean;
};

export type StoredSession = {
  session: string;
  user: { id: string; name: string };
  guilds: Guild[];
  price_usd: number;
  card: boolean;
  crypto: boolean;
  exp: number; // ms
};

const SESSION_KEY = "pn_session";
const LINK_KEY = "pn_link";
const NONCE_KEY = "pn_nonce";

function read(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {}
}
function drop(key: string) {
  try {
    window.sessionStorage.removeItem(key);
  } catch {}
}

export const store = {
  session(): StoredSession | null {
    const raw = read(SESSION_KEY);
    if (!raw) return null;
    try {
      const s = JSON.parse(raw) as StoredSession;
      if (!s || typeof s.session !== "string" || typeof s.exp !== "number" || s.exp < Date.now()) {
        drop(SESSION_KEY);
        return null;
      }
      return s;
    } catch {
      drop(SESSION_KEY);
      return null;
    }
  },
  setSession: (s: StoredSession) => write(SESSION_KEY, JSON.stringify(s)),
  clearSession: () => drop(SESSION_KEY),
  link: () => read(LINK_KEY),
  setLink: (t: string) => write(LINK_KEY, t),
  clearLink: () => drop(LINK_KEY),
  nonce: () => read(NONCE_KEY),
  setNonce: (n: string) => write(NONCE_KEY, n),
  clearNonce: () => drop(NONCE_KEY),
};

export function newNonce(): string {
  const bytes = new Uint8Array(24);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const money = (n: number) => `${site.price.currency}${n.toFixed(2)}`;

export const longDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "";
