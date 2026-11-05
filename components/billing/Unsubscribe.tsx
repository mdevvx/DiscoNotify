"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { Alert } from "./Alert";
import { api, ApiError } from "./api";

type State =
  | { kind: "loading" }
  | { kind: "invalid" }
  | { kind: "expired" }
  | { kind: "ready"; email: string }
  | { kind: "done"; email: string };

/** The reminder emails' footer link. Opening it changes nothing: only the button does (mail scanners open links). */
export function Unsubscribe() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("t") || "";
    setToken(t);
    if (!t) return setState({ kind: "invalid" });
    api<{ email: string }>({ action: "unsub_info", t })
      .then((r) => setState({ kind: "ready", email: r.email }))
      // a forged or malformed token gets the same neutral page as any other
      .catch((err) => setState({ kind: err instanceof ApiError && err.code === "expired" ? "expired" : "invalid" }));
  }, []);

  async function change(action: "unsubscribe" | "resubscribe") {
    if (state.kind !== "ready" && state.kind !== "done") return;
    setBusy(true);
    setError("");
    try {
      await api({ action, t: token });
      setState({ kind: action === "unsubscribe" ? "done" : "ready", email: state.email });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="pay">
      <div className="wrap narrow">
        <div className="flow-card">
          <div className="step-head">
            <p className="plan-name">Email preferences</p>
            <h1 className="unsub-title">Reminder emails</h1>
          </div>

          {state.kind === "loading" ? (
            <p className="status-line" role="status">
              <span className="spinner" aria-hidden="true" />
              Loading…
            </p>
          ) : state.kind === "expired" ? (
            <div className="pay-form">
              <Alert tone="warning" title="This link has expired">
                Use the link in a more recent email, or write to {site.supportEmail} and we&apos;ll sort it out.
              </Alert>
              <Link className="btn btn-ghost plan-cta" href="/">
                Back to the home page
              </Link>
            </div>
          ) : state.kind === "invalid" ? (
            <div className="pay-form">
              <Alert tone="warning" title="This link isn't valid any more">
                Use the link in a more recent email, or write to {site.supportEmail}.
              </Alert>
              <Link className="btn btn-ghost plan-cta" href="/">
                Back to the home page
              </Link>
            </div>
          ) : state.kind === "ready" ? (
            <div className="pay-form">
              <p>
                Stop reminder emails to <strong>{state.email}</strong>?
              </p>
              {error && <Alert tone="error" title="That didn't work">{error}</Alert>}
              <button type="button" className="btn btn-primary plan-cta" onClick={() => change("unsubscribe")} disabled={busy}>
                {busy ? "Working…" : "Unsubscribe from reminder emails"}
              </button>
              <p className="field-help">
                Billing emails about your subscription (receipts, failed payments) will still reach you.
              </p>
            </div>
          ) : (
            <div className="pay-form">
              <Alert tone="success" title="You're unsubscribed">
                You won&apos;t get reminder emails any more. Billing emails about your subscription (receipts, failed
                payments) will still reach you.
              </Alert>
              {error && <Alert tone="error" title="That didn't work">{error}</Alert>}
              <button type="button" className="btn btn-ghost plan-cta" onClick={() => change("resubscribe")} disabled={busy}>
                {busy ? "Working…" : "Undo"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
