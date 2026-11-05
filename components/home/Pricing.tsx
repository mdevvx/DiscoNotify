import Link from "next/link";
import { site } from "@/lib/site";

const { currency, amount, period } = site.price;
const { freeAccountsPerPlatform, maxAccounts, cryptoMonths } = site.plans;

const freeList = [
  `${freeAccountsPerPlatform} account per platform: 1 YouTube, 1 Twitch, 1 Kick, 1 Instagram, 1 X, 1 TikTok`,
  "Alerts, mentions, custom messages and rich cards",
  "Full dashboard",
  "Free forever, no card needed",
];

const paidList = [
  `Unlimited accounts per platform (up to ${maxAccounts} per server)`,
  "Alerts, mentions, custom messages and rich cards",
  "Full dashboard",
  "Card (monthly, cancel any time) or crypto (3 / 6 / 12 months prepaid)",
];

export function Pricing() {
  return (
    <section className="section" id="pricing">
      <div className="wrap">
        <div className="section-head reveal">
          <p className="eyebrow">Pricing</p>
          <h2>Free to start. {currency}
            {amount} a {period} for more.</h2>
          <p>
            Every server gets the Free plan automatically. Upgrade a server whenever you want to follow more than one
            account on a platform.
          </p>
        </div>

        <div className="plans">
          <div className="plan reveal">
            <div className="plan-top">
              <p className="plan-name">Free</p>
              <p className="plan-price">
                <span className="cur">{currency}</span>0<span className="per">forever</span>
              </p>
              <p className="plan-unit">per Discord server</p>
            </div>
            <ul className="plan-list">
              {freeList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a className="btn btn-ghost btn-lg plan-cta" href={site.inviteUrl}>
              Start free
            </a>
          </div>

          <div className="plan reveal">
            <span className="plan-ribbon">Unlimited accounts</span>
            <div className="plan-top">
              <p className="plan-name">Paid</p>
              <p className="plan-price">
                <span className="cur">{currency}</span>
                {amount}
                <span className="per">/ {period}</span>
              </p>
              <p className="plan-unit">per Discord server</p>
            </div>
            <ul className="plan-list">
              {paidList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a className="btn btn-brand btn-lg plan-cta" href={`${site.dashboardUrl}/billing`}>
              Upgrade a server
            </a>
          </div>
        </div>

        <p className="plans-note reveal">
          No trial, no card needed for Free. If a paid subscription ends, your server goes back to Free: one account
          per platform keeps working and nothing is deleted. Crypto plans ({cryptoMonths.join(" / ")} months) are
          prepaid and never renew. Taxes are calculated at checkout and card payments are processed by Polar. See the{" "}
          <Link href="/refund">Refund Policy</Link>.
        </p>
      </div>
    </section>
  );
}
