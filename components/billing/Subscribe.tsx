"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { DiscordIcon } from "../Icons";
import { Alert } from "./Alert";
import { api, ApiError, Guild, longDate, newNonce, store, StoredSession } from "./api";
import { PayPanel, type Auth, type PayInfo } from "./PayPanel";
import { ServerSelect } from "./ServerSelect";
import { LockIcon, Stepper } from "./Stepper";

type LinkInfo = {
  guild_id: string;
  name: string;
  trial_days: number;
  state: string;
  until: string | null;
  card_active: boolean;
  price_usd: number;
  card: boolean;
  crypto: boolean;
};

type View =
  | { mode: "loading" }
  | { mode: "login"; notice?: "expired" | "failed" }
  | { mode: "link"; token: string; info: LinkInfo }
  | { mode: "servers"; session: StoredSession; chosen: Guild | null };

// What the bot permission link needs; the spec's value for "Add DiscoNotify" on a chosen server.
const addBotUrl = (guildId: string) =>
  `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(site.discordClientId)}` +
  `&scope=bot%20applications.commands&permissions=537021440&guild_id=${encodeURIComponent(guildId)}&disable_guild_select=true`;

function stateText(g: Guild): string {
  if (g.state === "whitelisted") return "Whitelisted. No payment needed.";
  if (g.state === "paid") return `Active until ${longDate(g.until)}`;
  if (g.state === "grace") return `Payment overdue. Alerts run until ${longDate(g.until)}.`;
  if (g.trial_days > 0 && (g.state === "trial" || g.state === "new")) {
    return `Free trial: ${g.trial_days} day${g.trial_days === 1 ? "" : "s"} left`;
  }
  return "No subscription";
}

export function Subscribe() {
  const [view, setView] = useState<View>({ mode: "loading" });
  const [pickId, setPickId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // A signed link from /notify subscribe. Take the token out of the address bar right away.
      const fromUrl = new URLSearchParams(window.location.search).get("t");
      if (fromUrl) {
        store.setLink(fromUrl);
        window.history.replaceState(null, "", window.location.pathname);
      }
      const token = fromUrl || store.link();
      if (token) {
        try {
          const info = await api<LinkInfo>({ action: "link", t: token });
          if (!cancelled) setView({ mode: "link", token, info });
          return;
        } catch (err) {
          store.clearLink();
          if (err instanceof ApiError && (err.code === "link_expired" || err.code === "no_bot")) {
            if (!cancelled) setView({ mode: "login", notice: "expired" });
            return;
          }
          if (!cancelled) {
            setView({ mode: "login", notice: "failed" });
            setError((err as Error).message);
          }
          return;
        }
      }
      const session = store.session();
      if (session) {
        const usable = session.guilds.filter((g) => g.bot && !g.card_active);
        if (usable.length === 1 && !cancelled) setPickId(usable[0].id);
      }
      if (!cancelled) setView(session ? { mode: "servers", session, chosen: null } : { mode: "login" });
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  async function login() {
    setBusy(true);
    setError("");
    try {
      const nonce = newNonce();
      store.setNonce(nonce);
      const { url } = await api<{ url: string }>({ action: "login_url", nonce });
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
    store.clearLink();
    setView({ mode: "login" });
  }

  const step = view.mode === "link" ? 3 : view.mode === "servers" && view.chosen ? 3 : view.mode === "servers" ? 2 : 1;

  return (
    <section className="pay">
      <div className="wrap pay-grid">
        <div className="pay-copy">
          <p className="eyebrow">Subscribe</p>
          <h1>Subscribe to DiscoNotify</h1>
          <p className="lede">
            {site.price.currency}
            {site.price.amount} per {site.price.period} for one Discord server, by card or crypto. Your server switches on
            within about 2 minutes of paying.
          </p>
          <ul className="plan-list">
            <li>YouTube, Kick, Instagram, X and TikTok alerts</li>
            <li>Custom messages, role mentions and your own webhook name</li>
            <li>{site.price.trialDays}-day free trial: pay by card and nothing is charged until it ends</li>
            <li>Cancel anytime, with a 14-day money-back guarantee</li>
          </ul>
          <div className="trust">
            <span>
              <LockIcon /> Encrypted checkout
            </span>
            <span>Card by Polar</span>
            <span>Crypto by NOWPayments</span>
          </div>
        </div>

        <div className="flow-card">
          <Stepper current={step} />
          {!site.billingApi ? (
            <Alert tone="warning" title="Payments aren't set up yet">
              Subscribing opens soon. Meanwhile run <code>/notify subscribe</code> in your server.
            </Alert>
          ) : view.mode === "loading" ? (
            <p className="status-line" role="status">
              <span className="spinner" aria-hidden="true" />
              Loading…
            </p>
          ) : view.mode === "link" ? (
            <PayPanel
              auth={{ t: view.token } as Auth}
              info={
                {
                  name: view.info.name,
                  trialDays: view.info.trial_days,
                  cardActive: view.info.card_active,
                  price: view.info.price_usd,
                  card: view.info.card,
                  crypto: view.info.crypto,
                } as PayInfo
              }
            />
          ) : view.mode === "servers" ? (
            view.chosen ? (
              <PayPanel
                auth={{ session: view.session.session, guild_id: view.chosen.id }}
                info={{
                  name: view.chosen.name,
                  guild: view.chosen,
                  trialDays: view.chosen.trial_days,
                  cardActive: view.chosen.card_active,
                  price: view.session.price_usd,
                  card: view.session.card,
                  crypto: view.session.crypto,
                }}
                onBack={() => setView({ ...view, chosen: null })}
              />
            ) : (
              <div className="pay-form">
                <div className="step-head">
                  <h2>Choose your server</h2>
                  <p>Only servers you manage are shown.</p>
                </div>
                <div className="server-chip">
                  <span className="user-line">
                    <span className="user-avatar" aria-hidden="true">
                      {view.session.user.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span>
                      Logged in as <strong>{view.session.user.name}</strong>
                    </span>
                  </span>
                  <button type="button" className="link-btn" onClick={logout}>
                    Log out
                  </button>
                </div>
                {view.session.guilds.length === 0 ? (
                  <Alert tone="warning" title="No servers found">
                    You don&apos;t manage any Discord server yet. You need the Manage Server permission to subscribe one.
                  </Alert>
                ) : (
                  <ServerPicker
                    guilds={view.session.guilds}
                    pickId={pickId}
                    onPick={setPickId}
                    onContinue={(g) => setView({ ...view, chosen: g })}
                  />
                )}
              </div>
            )
          ) : (
            <div className="pay-form">
              <div className="step-head">
                <h2>Log in with Discord</h2>
                <p>So we can show the servers you manage and tie the payment to your account.</p>
              </div>
              <div className="plan-top">
                <p className="plan-name">{site.name}</p>
                <p className="plan-price">
                  <span className="cur">{site.price.currency}</span>
                  {site.price.amount}
                  <span className="per">/ {site.price.period}</span>
                </p>
                <p className="plan-unit">per Discord server · {site.price.trialDays}-day free trial</p>
              </div>

              {view.notice === "expired" && (
                <Alert tone="warning" title="This link has expired">
                  Run <code>/notify subscribe</code> in your server for a new one, or log in with Discord below.
                </Alert>
              )}
              {error && <Alert tone="error" title="That didn't work">{error}</Alert>}

              <button type="button" className="btn btn-discord btn-lg plan-cta" onClick={login} disabled={busy}>
                <DiscordIcon />
                {busy ? "Opening Discord…" : "Log in with Discord"}
              </button>
              <ul className="perm-list" aria-label="What this login allows">
                <li>See your Discord name and ID</li>
                <li>See the servers you manage</li>
                <li className="perm-no">Can&apos;t post or read your messages</li>
              </ul>
              <p className="field-help">We discard the Discord login as soon as your server list is loaded.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** A dropdown of the servers the person manages, then what they can do with the chosen one. */
function ServerPicker({
  guilds,
  pickId,
  onPick,
  onContinue,
}: {
  guilds: Guild[];
  pickId: string;
  onPick: (id: string) => void;
  onContinue: (g: Guild) => void;
}) {
  const withBot = guilds.filter((g) => g.bot);
  const withoutBot = guilds.filter((g) => !g.bot);
  const picked = guilds.find((g) => g.id === pickId) ?? null;

  return (
    <>
      <div className="field">
        <span className="field-label" id="server-label">
          Server
        </span>
        <ServerSelect guilds={guilds} value={picked ? picked.id : ""} onChange={onPick} labelId="server-label" />
      </div>

      {picked && (
        <p className="server-note">
          {!picked.bot
            ? "DiscoNotify isn't in this server yet. Add it first, then come back."
            : picked.card_active
            ? "Already subscribed. Manage it with /notify cancel in Discord."
            : stateText(picked)}
        </p>
      )}

      {picked && !picked.bot ? (
        <a className="btn btn-discord plan-cta" href={addBotUrl(picked.id)} rel="noopener">
          <DiscordIcon size={16} />
          Add DiscoNotify to this server
        </a>
      ) : (
        <button
          type="button"
          className="btn btn-primary plan-cta"
          disabled={!picked || picked.card_active}
          onClick={() => picked && onContinue(picked)}
        >
          {picked?.card_active ? "Already subscribed" : "Continue"}
        </button>
      )}
    </>
  );
}
