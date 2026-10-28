import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/lib/site";

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "How fast are alerts?",
    a: "Kick is checked every 30 seconds. YouTube and Instagram start at 30 seconds and X at 60 seconds, and they slow down as more accounts are followed across all servers, so each platform's limits are respected. Instagram accounts that posted recently are checked fastest. New TikTok videos usually appear within 2 minutes.",
  },
  {
    q: "Do the creators need to approve anything?",
    a: "No. DiscoNotify only reads public information: public YouTube channels, Twitch and Kick channels, Instagram Business or Creator accounts, X accounts and TikTok accounts.",
  },
  {
    q: "How does the free trial work?",
    a: `Every server gets ${site.price.trialDays} days free, with no card needed. After you add the bot, activate your trial with a quick Discord login on our website and alerts switch on right away. If you subscribe by card during the trial, you aren't charged until the trial ends, and cancelling before then means you're never charged.`,
  },
  {
    q: "Can I pay with crypto?",
    a: (
      <>
        Yes. Choose Crypto on the <Link href="/subscribe">subscribe page</Link> or run <code>/notify subscribe</code>, then pick 3, 6 or 12 months, paid up front in USDT,
        BTC, ETH, SOL or LTC. Crypto can&apos;t renew automatically, so it&apos;s prepaid, and extra months stack.
      </>
    ),
  },
  {
    q: "What happens if a payment fails or I stop paying?",
    a: "You get a 3-day grace period, then monitoring pauses and the server owner gets a reminder in Discord. Your accounts, channels and messages are kept, and alerts resume the moment the server is paid again.",
  },
  {
    q: "Can two servers follow the same creator?",
    a: "Yes. Each server keeps its own channels, messages and mentions, completely separate from every other server.",
  },
  {
    q: "Can I cancel anytime?",
    a: (
      <>
        Yes, in a couple of clicks on the <Link href="/manage">Manage or cancel</Link> page. Your plan keeps working
        until the end of the month you already paid for. There are no contracts or cancellation fees.
      </>
    ),
  },
  {
    q: "What happens if I delete the alert channel?",
    a: (
      <>
        DiscoNotify marks the channel as unavailable and stops trying to post there. Run{" "}
        <code>/notify status</code> to see which accounts need a new channel.
      </>
    ),
  },
  {
    q: "An Instagram creator changed their handle. What now?",
    a: "Instagram only lets apps look accounts up by username, so a renamed account shows as unavailable. Remove it and add it again with the new handle.",
  },
  {
    q: "Do I need to set anything up for TikTok?",
    a: (
      <>
        No. Run <code>/notify account-add</code>, choose TikTok and enter <code>@username</code> or the profile
        link. Live streams and private accounts aren&apos;t supported, and TikTok counts toward your server&apos;s
        account limit like any other platform.
      </>
    ),
  },
  {
    q: "How do I add a Twitch channel?",
    a: (
      <>
        Run <code>/notify account-add</code>, choose Twitch and enter the channel name or a <code>twitch.tv/…</code>{" "}
        link. The channel doesn&apos;t need to be live yet: the alert posts when the stream starts, with the title, game,
        viewer count and a Watch on Twitch button, and a second message when it ends if that alert type is on.
      </>
    ),
  },
  {
    q: "A TikTok creator changed their username. What now?",
    a: "The account stops working after a rename. Remove it and add it again with the new username.",
  },
];

export function Faq() {
  return (
    <section className="section" id="faq">
      <div className="wrap faq-grid">
        <div className="section-head reveal">
          <p className="eyebrow">Questions</p>
          <h2>Good to know</h2>
          <p>
            Can&apos;t find your answer?{" "}
            <a href={site.supportServer} rel="noopener">
              Ask in our support server
            </a>
            .
          </p>
        </div>
        <div className="faq reveal">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
