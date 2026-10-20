"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Alert } from "./Alert";
import { api, store, type Guild } from "./api";
import { Stepper } from "./Stepper";

type LoginResult = {
  session: string;
  user: { id: string; name: string };
  guilds: Guild[];
  price_usd: number;
  card: boolean;
  crypto: boolean;
};

/** Discord sends people back here with ?code&state. The code is single-use and leaves the address bar at once. */
export function AuthCallback() {
  const [problem, setProblem] = useState<"cancelled" | "failed" | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // React strict mode would otherwise use the one-time code twice
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const denied = params.get("error");
    const nonce = store.nonce();
    window.history.replaceState(null, "", window.location.pathname);
    store.clearNonce();

    if (denied) return setProblem("cancelled");
    if (!code || !state || !nonce) return setProblem("failed");

    api<LoginResult>({ action: "login", code, state, nonce })
      .then((r) => {
        store.setSession({ ...r, exp: Date.now() + 29 * 60 * 1000 });
        window.location.replace("/subscribe");
      })
      .catch(() => setProblem("failed"));
  }, []);

  return (
    <section className="pay">
      <div className="wrap narrow">
        <div className="flow-card">
          <Stepper current={1} />
          {problem === null ? (
            <p className="status-line" role="status">
              <span className="spinner" aria-hidden="true" />
              Signing you in…
            </p>
          ) : (
            <div className="pay-form">
              <Alert
                tone={problem === "cancelled" ? "warning" : "error"}
                title={problem === "cancelled" ? "Login cancelled" : "We couldn't log you in"}
              >
                {problem === "cancelled"
                  ? "You didn't allow the Discord login, so nothing was changed."
                  : "The login link may have expired. Please try again."}
              </Alert>
              <Link className="btn btn-primary plan-cta" href="/subscribe">
                Back to subscribe
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
