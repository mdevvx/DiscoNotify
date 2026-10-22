"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { DiscordIcon } from "../Icons";
import { Alert } from "./Alert";
import { api, ApiError, Guild, longDate, newNonce, store, StoredSession } from "./api";
import { ServerIcon } from "./ServerSelect";
import { Stepper } from "./Stepper";

type View =
  | { mode: "loading" }
  | { mode: "login"; notice?: "expired" }
  | { mode: "servers"; session: StoredSession; pickId: string }
  | { mode: "done"; session: StoredSession; guild: Guild; status: string; trialEndsAt: string | null };

type Activated = { status: string; trial_ends_at: string | null; whitelisted: boolean; email: string };

const STEPS = ["Log in", "Choose server", "Start trial"];

/** What each server's row says and which action it offers, following the activation page's state table. */
function describe(g: Guild): { text: string; action: "start" | "save" | "subscribe" | "none" } {
  if (g.state === "whitelisted") return { text: "Whitelisted. Nothing to pay.", action: "none" };
  if (g.state === "paid") return { text: `Active until ${longDate(g.until)}`, action: "none" };
  if (g.state === "trial" && g.trial_days > 0) {
    return { text: `Free trial: ${g.trial_days} day${g.trial_days === 1 ? "" : "s"} left`, action: "save" };
  }
  if (g.state === "new") return { text: "Free trial not started", action: "start" };
  return { text: "Trial ended", action: "subscribe" };
}

export function Activate() {
  const [view, setView] = useState<View>({ mode: "loading" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Only a login made for activation carries the verified email this page needs.
    const session = store.session();
    if (!session || !session.email) return setView({ mode: "login" });
    const usable = session.guilds.filter((g) => g.bot);
    const fresh = usable.filter((g) => g.state === "new");
    setView({ mode: "servers", session, pickId: fresh.length === 1 ? fresh[0].id : usable.length === 1 ? usable[0].id : "" });
  }, []);

  async function login() {
    setBusy(true);
    setError("");
    try {
      const nonce = newNonce();
      store.setNonce(nonce);
      store.setPurpose("activate");
      const { url } = await api<{ url: string }>({ action: "login_url", nonce, purpose: "activate" });
      const u = new URL(url);
      if (u.protocol !== "https:" || u.hostname !== "discord.com") throw new ApiError("Something went wrong. Please try again.");
      window.location.assign(u.toString());
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  function logout() {
    store.clearSession();
    setView({ mode: "login" });
  }

  async function activate(session: StoredSession, guild: Guild) {
    setBusy(true);
    setError("");
    try {
      const r = await api<Activated>({ action: "activate", session: session.session, guild_id: guild.id });
      const updated: StoredSession = {
        ...session,
        guilds: session.guilds.map((g) =>
          g.id === guild.id && r.status === "activated"
            ? { ...g, state: "trial", until: r.trial_ends_at, trial_days: site.price.trialDays }
            : g,
        ),
      };
      store.setSession(updated);
      setView({ mode: "done", session: updated, guild, status: r.status, trialEndsAt: r.trial_ends_at || guild.until });
    } catch (err) {
      if (err instanceof ApiError && err.code === "session_expired") {
        store.clearSession();
        setView({ mode: "login", notice: "expired" });
      } else {
        setError((err as Error).message);
      }
    } finally {
      setBusy(false);
    }
  }

  const step = view.mode === "done" ? 3 : view.mode === "servers" ? 2 : 1;

  return (
    <section className="pay">
      <div className="wrap pay-grid">
        <div className="pay-copy">
          <p className="eyebrow">Activate</p>
          <h1>Start your free trial</h1>
          <p className="lede">
            DiscoNotify&apos;s {site.price.trialDays}-day free trial starts when you activate it, and no card is needed. Log
            in with Discord, pick your server and alerts switch on straight away.
          </p>
          <ul className="plan-list">
            <li>
              {site.price.trialDays} days free, then {site.price.currency}
              {site.price.amount} a {site.price.period} per server
            </li>
            <li>Billing and reminder emails go to your Discord email</li>
            <li>Until you activate, the bot&apos;s commands send you here and monitoring is paused</li>
          </ul>
        </div>

        <div className="flow-card">
          <Stepper current={step as 1 | 2 | 3} steps={STEPS} />

          {!site.billingApi ? (
            <Alert tone="warning" title="Activation isn't set up yet">
              Please try again soon, or ask in our support server.
            </Alert>
          ) : view.mode === "loading" ? (
            <p className="status-line" role="status">
              <span className="spinner" aria-hidden="true" />
              Loading…
            </p>
          ) : view.mode === "login" ? (
            <div className="pay-form">
              <div className="step-head">
                <h2>Log in with Discord</h2>
                <p>So we can show your servers and save the email Discord has verified for you.</p>
              </div>
              {view.notice === "expired" && (
                <Alert tone="warning" title="Your login expired">
                  Log in again to continue.
                </Alert>
              )}
              {error && <Alert tone="error" title="That didn't work">{error}</Alert>}
              <button type="button" className="btn btn-discord btn-lg plan-cta" onClick={login} disabled={busy}>
                <DiscordIcon />
                {busy ? "Opening Discord…" : "Log in with Discord"}
              </button>
              <ul className="perm-list" aria-label="What this login allows">
                <li>See your Discord name and ID</li>
                <li>See your verified Discord email</li>
                <li>See the servers you manage</li>
                <li className="perm-no">Can&apos;t post or read your messages</li>
              </ul>
              <p className="field-help">We discard the Discord login as soon as your server list is loaded.</p>
            </div>
          ) : view.mode === "done" ? (
            <div className="pay-form">
              {view.status === "activated" ? (
                <Alert tone="success" title="Your free trial has started">
                  It runs until <strong>{longDate(view.trialEndsAt)}</strong>. We&apos;ve emailed you a confirmation. Alerts
                  work in <strong>{view.guild.name}</strong> right away.
                </Alert>
              ) : (
                <Alert tone="success" title="Email saved">
                  Thanks, we&apos;ll email you about your trial and billing.
                  {view.trialEndsAt && <> Your trial runs until {longDate(view.trialEndsAt)}.</>}
                </Alert>
              )}
              <button
                type="button"
                className="btn btn-ghost plan-cta"
                onClick={() => setView({ mode: "servers", session: view.session, pickId: "" })}
              >
                Back to my servers
              </button>
              <Link className="link-btn" href="/manage">
                Manage billing
              </Link>
            </div>
          ) : (
            <Servers
              session={view.session}
              pickId={view.pickId}
              busy={busy}
              error={error}
              onPick={(id) => setView({ ...view, pickId: id })}
              onActivate={(g) => activate(view.session, g)}
              onLogout={logout}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function Servers({
  session,
  pickId,
  busy,
  error,
  onPick,
  onActivate,
  onLogout,
}: {
  session: StoredSession;
  pickId: string;
  busy: boolean;
  error: string;
  onPick: (id: string) => void;
  onActivate: (g: Guild) => void;
  onLogout: () => void;
}) {
  // The new-server case first, as the activation flow expects.
  const rank = (g: Guild) => (g.state === "new" ? 0 : g.state === "trial" ? 1 : 2);
  const guilds = session.guilds.filter((g) => g.bot).sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
  const picked = guilds.find((g) => g.id === pickId) ?? null;
  const what = picked ? describe(picked) : null;

  return (
    <div className="pay-form">
      <div className="step-head">
        <h2>Choose your server</h2>
        <p>Servers you manage that DiscoNotify has joined.</p>
      </div>
      <div className="server-chip">
        <span className="user-line">
          <span className="user-avatar" aria-hidden="true">
            {session.user.name.slice(0, 1).toUpperCase()}
          </span>
          <span>
            Logged in as <strong>{session.user.name}</strong>
          </span>
        </span>
        <button type="button" className="link-btn" onClick={onLogout}>
          Log out
        </button>
      </div>

      {guilds.length === 0 ? (
        <>
          <Alert tone="warning" title="DiscoNotify isn't in any of your servers yet">
            Add the bot to the server first, then come back to activate your trial.
          </Alert>
          <a className="btn btn-discord plan-cta" href={site.inviteUrl} rel="noopener">
            <DiscordIcon size={16} />
            Add DiscoNotify to a server
          </a>
        </>
      ) : (
        <>
          <div className="server-list" role="radiogroup" aria-label="Server">
            {guilds.map((g) => (
              <button
                key={g.id}
                type="button"
                role="radio"
                aria-checked={g.id === pickId}
                className="server-option"
                onClick={() => onPick(g.id)}
              >
                <ServerIcon g={g} size={36} />
                <span className="server-info">
                  <strong>{g.name}</strong>
                  <small>{describe(g).text}</small>
                </span>
              </button>
            ))}
          </div>

          {picked && what?.action === "start" && (
            <p className="field-help">
              Your trial starts now and lasts {site.price.trialDays} days. We&apos;ll use <strong>{session.email}</strong> for
              billing and reminder emails. You can unsubscribe from reminders any time.
            </p>
          )}
          {picked && what?.action === "save" && (
            <p className="field-help">
              This server already has a trial, and its dates won&apos;t change. We&apos;ll use <strong>{session.email}</strong> for
              billing and reminder emails.
            </p>
          )}

          {error && <Alert tone="error" title="That didn't work">{error}</Alert>}

          {what?.action === "subscribe" ? (
            <Link className="btn btn-primary plan-cta" href="/subscribe">
              Subscribe
            </Link>
          ) : what?.action === "none" ? (
            <Link className="btn btn-ghost plan-cta" href="/manage">
              Manage billing
            </Link>
          ) : (
            <button type="button" className="btn btn-primary plan-cta" disabled={!picked || busy} onClick={() => picked && onActivate(picked)}>
              {busy ? "Working…" : what?.action === "save" ? "Save my email" : "Start free trial"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
