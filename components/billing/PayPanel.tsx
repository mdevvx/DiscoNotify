"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { site } from "@/lib/site";
import { Alert } from "./Alert";
import { api, ApiError, goToPolar, longDate, money, type Guild } from "./api";
import { ServerIcon } from "./ServerSelect";
import { LockIcon } from "./Stepper";

export type Auth = { t: string } | { session: string; guild_id: string };

export type PayInfo = {
  name: string;
  guild?: Guild; // set when the server was picked from the list, so its icon can be shown
  trialDays: number;
  cardActive: boolean;
  price: number;
  card: boolean;
  crypto: boolean;
};

type CryptoPayment = {
  id: string;
  months: number;
  amount_usd: number;
  coin: string;
  pay_currency: string;
  pay_amount: number;
  pay_address: string;
  payin_extra_id: string | null;
};

type CryptoStatus = {
  status: "pending" | "paid" | "failed" | "expired";
  payment_status?: string;
  confirmed?: boolean;
  until?: string | null;
};

const PLANS = [3, 6, 12];
const COINS = [
  { code: "usdtbsc", label: "USDT (BNB Chain · BEP20)" },
  { code: "ltc", label: "Litecoin (LTC)" },
  { code: "sol", label: "Solana (SOL)" },
  { code: "eth", label: "Ethereum (ETH)" },
  { code: "usdttrc20", label: "USDT (TRON · TRC20)" },
  { code: "btc", label: "Bitcoin (BTC)" },
];

export function PayPanel({ auth, info, onBack }: { auth: Auth; info: PayInfo; onBack?: () => void }) {
  const [method, setMethod] = useState<"card" | "crypto">(info.card && !info.cardActive ? "card" : "crypto");
  const [months, setMonths] = useState(3);
  const [coin, setCoin] = useState(COINS[0].code);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState<CryptoPayment | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  /** Saves the reminder email against this server before any payment starts. Returns false if it can't. */
  async function saveEmail(): Promise<boolean> {
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setEmailError("Enter a valid email address.");
      return false;
    }
    setEmailError("");
    try {
      await api({ action: "contact", ...auth, email: value });
      return true;
    } catch (err) {
      setEmailError((err as Error).message);
      return false;
    }
  }

  async function payByCard() {
    setBusy(true);
    setError("");
    if (!(await saveEmail())) return setBusy(false);
    try {
      const { url } = await api<{ url: string }>({ action: "checkout", ...auth, email: email.trim() });
      goToPolar(url);
    } catch (err) {
      const code = err instanceof ApiError ? err.code : "";
      setError(code.startsWith("polar_") ? `${(err as Error).message} (ref: ${code})` : (err as Error).message);
      setBusy(false);
    }
  }

  async function payByCrypto() {
    setBusy(true);
    setError("");
    if (!(await saveEmail())) return setBusy(false);
    try {
      setPayment(await api<CryptoPayment>({ action: "crypto", ...auth, months, coin }));
    } catch (err) {
      const code = err instanceof ApiError ? err.code : "";
      setError(code.startsWith("nowpayments_") ? `${(err as Error).message} (ref: ${code})` : (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (payment) return <CryptoInstructions payment={payment} onCancel={() => setPayment(null)} />;

  return (
    <div className="pay-form">
      <div className="server-chip">
        <span style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
          {info.guild && <ServerIcon g={info.guild} size={28} />}
          <strong>{info.name || "your server"}</strong>
        </span>
        {onBack && (
          <button type="button" className="link-btn" onClick={onBack}>
            Change
          </button>
        )}
      </div>

      <div className="step-head">
        <h2>Review and pay</h2>
        <p>One server, billed per month. Cancel anytime.</p>
      </div>

      <dl className="summary" aria-label="Order summary">
        <div>
          <dt>DiscoNotify · 1 server</dt>
          <dd>
            {money(info.price)}
            <small> / {site.price.period}</small>
          </dd>
        </div>
        {method === "crypto" && info.crypto && (
          <div>
            <dt>
              Prepaid {months} months
            </dt>
            <dd>{money(Math.round(info.price * months * 100) / 100)}</dd>
          </div>
        )}
        {method === "card" && info.trialDays > 0 && !info.cardActive && (
          <div className="summary-free">
            <dt>
              Free trial · {info.trialDays} day{info.trialDays === 1 ? "" : "s"} left
            </dt>
            <dd>Due today {money(0)}</dd>
          </div>
        )}
      </dl>

      {info.trialDays > 0 && (
        <Alert tone="success" title={`Free trial: ${info.trialDays} more day${info.trialDays === 1 ? "" : "s"}`}>
          Pay by card now and your card is saved, but <strong>nothing is charged for {info.trialDays} more day
          {info.trialDays === 1 ? "" : "s"}</strong>. Cancel before then with <code>/notify cancel</code> and you
          pay nothing.
        </Alert>
      )}

      <div className="field">
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          maxLength={254}
          value={email}
          aria-invalid={emailError ? true : undefined}
          aria-describedby="contact-email-help"
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError("");
          }}
        />
        {emailError ? (
          <p className="field-error" id="contact-email-help" role="alert">{emailError}</p>
        ) : (
          <p className="field-help" id="contact-email-help">
            Only enter an email you can check later. We use it to send you reminders, updates and other important
            notices about your server. It&apos;s never shared.
          </p>
        )}
      </div>

      <div className="tabs" role="tablist" aria-label="Payment method">
        <button type="button" role="tab" aria-selected={method === "card"} className="tab" onClick={() => setMethod("card")}>
          <span className="tab-title">Card</span>
          <span className="tab-sub">Renews monthly</span>
        </button>
        <button type="button" role="tab" aria-selected={method === "crypto"} className="tab" onClick={() => setMethod("crypto")}>
          <span className="tab-title">Crypto</span>
          <span className="tab-sub">Prepay 3–12 months</span>
        </button>
      </div>

      {method === "card" ? (
        !info.card ? (
          <p className="field-help">Card payments aren&apos;t available right now. Try crypto instead.</p>
        ) : info.cardActive ? (
          <Alert tone="warning" title="Already subscribed">
            This server already has a card subscription. Manage it with <code>/notify cancel</code> in Discord, or
            see the <Link href="/manage">Manage or cancel</Link> page.
          </Alert>
        ) : (
          <>
            <p className="field-help">{money(info.price)} a month, renews automatically. Cancel anytime.</p>
            <button type="button" className="btn btn-primary plan-cta" onClick={payByCard} disabled={busy || !emailOk}>
              <LockIcon />
              {busy ? "Opening checkout…" : "Continue to secure checkout"}
            </button>
          </>
        )
      ) : !info.crypto ? (
        <p className="field-help">Crypto payments aren&apos;t available right now. Try card instead.</p>
      ) : (
        <>
          <fieldset className="choices">
            <legend>Plan</legend>
            {PLANS.map((m) => (
              <label key={m} className="choice">
                <input type="radio" name="months" checked={months === m} onChange={() => setMonths(m)} />
                <span>
                  <strong>{m} months</strong>
                  {money(Math.round(info.price * m * 100) / 100)}
                </span>
              </label>
            ))}
          </fieldset>
          <div className="field">
            <label htmlFor="coin">Coin</label>
            <select id="coin" value={coin} onChange={(e) => setCoin(e.target.value)}>
              {COINS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="field-help">USDT on BNB Chain and Litecoin have the lowest network minimums.</p>
          </div>
          <button type="button" className="btn btn-primary plan-cta" onClick={payByCrypto} disabled={busy || !emailOk}>
            <LockIcon />
            {busy ? "Creating payment…" : "Get payment address"}
          </button>
        </>
      )}

      {error && <Alert tone="error" title="That didn't work">{error}</Alert>}

      <p className="plan-note">
        Card payments are processed by Polar, our Merchant of Record. Crypto payments are processed by NOWPayments. See
        our <Link href="/terms">Terms</Link>, <Link href="/privacy">Privacy Policy</Link> and{" "}
        <Link href="/refund">Refund Policy</Link>.
      </p>
      <p className="plan-note">Questions? {site.supportEmail}</p>
    </div>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {}
  }
  return (
    <div className="copy-field">
      <span className="copy-label">{label}</span>
      <div className="copy-row">
        <code>{value}</code>
        <button type="button" className="copy-btn" onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function CryptoInstructions({ payment, onCancel }: { payment: CryptoPayment; onCancel: () => void }) {
  const [status, setStatus] = useState<CryptoStatus | null>(null);

  const poll = useCallback(async () => {
    try {
      setStatus(await api<CryptoStatus>({ action: "crypto_status", id: payment.id }));
    } catch (err) {
      if (err instanceof ApiError && err.code === "not_found") return;
    }
  }, [payment.id]);

  useEffect(() => {
    if (status?.status === "paid" || status?.status === "failed" || status?.status === "expired") return;
    poll();
    const t = window.setInterval(poll, 10_000);
    return () => window.clearInterval(t);
  }, [poll, status?.status]);

  if (status?.status === "paid") {
    return (
      <Alert tone="success" title="Payment received">
        Your server is switched on{status.until ? ` until ${longDate(status.until)}` : ""}. The server owner also gets
        a confirmation in Discord.
      </Alert>
    );
  }
  if (status?.status === "failed" || status?.status === "expired") {
    return (
      <div className="pay-form">
        <Alert tone="warning" title={status.status === "expired" ? "This payment expired" : "This payment failed"}>
          Start a new one, or contact {site.supportEmail} if you sent funds.
        </Alert>
        <button type="button" className="btn btn-primary plan-cta" onClick={onCancel}>
          Start again
        </button>
      </div>
    );
  }

  const seen = status?.payment_status && status.payment_status !== "waiting";
  const line = !seen
    ? "Waiting for your payment…"
    : status?.confirmed
    ? "Payment confirmed. Activating your server, this takes up to a minute…"
    : status?.payment_status === "partially_paid"
    ? "We received less than the full amount. Send the rest to the same address."
    : "Payment seen. Waiting for blockchain confirmations…";

  return (
    <div className="pay-form">
      <div className="plan-top">
        <p className="plan-name">Crypto payment</p>
        <h2 className="crypto-title">
          {payment.months} months · {money(payment.amount_usd)}
        </h2>
        <p className="plan-unit">{payment.coin}</p>
      </div>
      <CopyField label="Send exactly" value={`${payment.pay_amount} ${payment.pay_currency.toUpperCase()}`} />
      <CopyField label="To this address" value={payment.pay_address} />
      {payment.payin_extra_id && <CopyField label="Memo / tag (required)" value={payment.payin_extra_id} />}
      <p className="status-line" role="status">
        <span className="spinner" aria-hidden="true" />
        {line}
      </p>
      <p className="field-help">
        Send on the network shown above. Network fees are on top of this amount. Keep this page open, or come back
        later: your server is credited automatically once the payment confirms.
      </p>
      {!seen && (
        <button type="button" className="link-btn" onClick={onCancel}>
          Choose a different plan or coin
        </button>
      )}
    </div>
  );
}
