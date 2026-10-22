import Link from "next/link";
import { site } from "@/lib/site";

const included = [
  "YouTube, Kick, Instagram, X and TikTok alerts",
  "Uploads, Shorts, posts, Reels, X posts and live streams",
  "As many followed accounts as your server needs",
  "Custom messages and role mentions",
  "Alerts under your own name and avatar",
  "Twitch when it launches, at no extra cost",
  "Support in our Discord server",
];

const cryptoPlans = [3, 6, 12];

export function Pricing() {
  const { currency, amount, period, trialDays } = site.price;
  const money = (n: number) => `${currency}${n.toFixed(2)}`;

  return (
    <section className="section" id="pricing">
      <div className="wrap pricing">
        <div className="section-head reveal">
          <p className="eyebrow">Pricing</p>
          <h2>One plan. Everything included.</h2>
          <p>
            Every feature and every supported platform for one flat price per server. Each server starts with a{" "}
            {trialDays}-day free trial you start with a quick Discord login, with no card needed.
          </p>

          <div className="pay-ways">
            <div className="pay-way">
              <p className="pay-way-name">Card</p>
              <p>
                {money(amount)} a {period}, renews automatically. Subscribe during the trial and you aren&apos;t charged
                until it ends.
              </p>
            </div>
            <div className="pay-way">
              <p className="pay-way-name">Crypto</p>
              <p>
                Prepaid for{" "}
                {cryptoPlans.map((m, i) => (
                  <span key={m}>
                    {i > 0 && (i === cryptoPlans.length - 1 ? " or " : ", ")}
                    {m} months ({money(amount * m)})
                  </span>
                ))}
                . USDT, BTC, ETH, SOL and LTC, at checkout or with <code>/notify subscribe</code>.
              </p>
            </div>
          </div>

          <p className="pricing-assure">
            If a payment lapses you get a 3-day grace period, and your settings are never deleted. Every card payment
            comes with a 14-day money-back guarantee. See the <Link href="/refund">Refund Policy</Link>.
          </p>
        </div>

        <div className="plan reveal">
          <span className="plan-ribbon">{trialDays}-day free trial</span>
          <div className="plan-top">
            <p className="plan-name">{site.name}</p>
            <p className="plan-price">
              <span className="cur">{currency}</span>
              {amount}
              <span className="per">/ {period}</span>
            </p>
            <p className="plan-unit">per Discord server, billed monthly</p>
          </div>
          <ul className="plan-list">
            {included.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link className="btn btn-primary btn-lg plan-cta" href="/subscribe">
            Subscribe
          </Link>
          <p className="plan-note">Cancel anytime. Taxes are calculated at checkout. Card payments are processed by Polar.</p>
        </div>
      </div>
    </section>
  );
}
