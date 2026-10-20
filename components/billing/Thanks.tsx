"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { Alert } from "./Alert";
import { api, longDate } from "./api";

type Outcome =
  | { kind: "loading" }
  | { kind: "none" }
  | { kind: "result"; status: string; trialEnd: string | null };

const POLL_EVERY = 5_000;
const POLL_FOR = 2 * 60_000;

/** Never trusts the URL: it asks Polar (through the billing function) what really happened. */
export function Thanks() {
  const [outcome, setOutcome] = useState<Outcome>({ kind: "loading" });
  const [checkoutId, setCheckoutId] = useState("");
  const [active, setActive] = useState<"waiting" | "active" | "slow">("waiting");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("checkout_id") || "";
    if (!id) return setOutcome({ kind: "none" });
    setCheckoutId(id);
    api<{ status: string; trial_end: string | null }>({ action: "thanks", checkout_id: id })
      .then((r) => setOutcome({ kind: "result", status: r.status, trialEnd: r.trial_end }))
      .catch(() => setOutcome({ kind: "result", status: "error", trialEnd: null }));
  }, []);

  const succeeded = outcome.kind === "result" && outcome.status === "succeeded";

  // After a paid checkout the bot needs up to a minute to notice: poll until the server is active.
  useEffect(() => {
    if (!succeeded || !checkoutId) return;
    let stopped = false;
    const started = Date.now();
    const tick = async () => {
      try {
        const r = await api<{ active: boolean }>({ action: "activation", checkout_id: checkoutId });
        if (!stopped && r.active) return setActive("active");
      } catch {
        // keep trying
      }
      if (stopped) return;
      if (Date.now() - started > POLL_FOR) return setActive("slow");
      timer = window.setTimeout(tick, POLL_EVERY);
    };
    let timer = window.setTimeout(tick, 1500);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [succeeded, checkoutId]);

  let alert;
  if (outcome.kind === "loading") {
    alert = (
      <p className="status-line" role="status">
        <span className="spinner" aria-hidden="true" />
        Checking your payment…
      </p>
    );
  } else if (outcome.kind === "none" || outcome.status === "open") {
    alert = (
      <Alert tone="warning" title="The payment wasn't completed">
        If you closed the checkout, run <code>/disconotify subscribe</code> again.
      </Alert>
    );
  } else if (outcome.status === "succeeded") {
    alert = (
      <>
        <Alert tone="success" title="Payment received">
          Your server will be switched on within about 2 minutes, and the bot confirms in your Discord channel.
          {outcome.trialEnd && <> Your card is saved. The first charge is on {longDate(outcome.trialEnd)}.</>}
        </Alert>
        {active === "waiting" && (
          <p className="status-line" role="status">
            <span className="spinner" aria-hidden="true" />
            Activating your server…
          </p>
        )}
        {active === "active" && (
          <Alert tone="success" title="Active">
            Your server is switched on. Check it anytime with <code>/disconotify status</code>.
          </Alert>
        )}
        {active === "slow" && (
          <Alert tone="warning" title="Activation is taking longer than usual">
            Your payment is confirmed. The server will switch on automatically, or contact {site.supportEmail}.
          </Alert>
        )}
      </>
    );
  } else if (outcome.status === "confirmed") {
    alert = (
      <Alert tone="warning" title="Your payment is being processed">
        Don&apos;t pay again. Check Discord in a few minutes.
      </Alert>
    );
  } else if (outcome.status === "expired") {
    alert = (
      <Alert tone="warning" title="This checkout expired">
        Run <code>/disconotify subscribe</code> in Discord for a new link.
      </Alert>
    );
  } else if (outcome.status === "failed") {
    alert = (
      <Alert tone="error" title="The payment didn't go through">
        Nothing was charged. Try another card from <code>/disconotify subscribe</code>, or contact {site.supportEmail}.
      </Alert>
    );
  } else {
    alert = (
      <Alert tone="error" title="We couldn't confirm your payment">
        If you were charged, contact {site.supportEmail} with your email. Your payment is safe.
      </Alert>
    );
  }

  return (
    <section className="pay">
      <div className="wrap narrow">
        <div className="plan">
          <div className="pay-form">
            <p className="plan-name">Payment</p>
            {alert}
            <Link className="btn btn-ghost plan-cta" href="/">
              Back to the home page
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
