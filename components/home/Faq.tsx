import Link from "next/link";
import type { ReactNode } from "react";
import { site } from "@/lib/site";

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "Is it really free?",
    a: "Yes. Every server gets the Free plan: one monitored account per platform (one YouTube, one Twitch, one Kick, one Instagram, one X and one TikTok), forever. There is no trial and no card is needed. Upgrade a server only if you want more accounts per platform.",
  },
  {
    q: "What counts as a platform?",
    a: "YouTube, Twitch, Kick, Instagram, X and TikTok each count separately. On Free you can follow one account on each of the six at the same time.",
  },
  {
    q: "Do I need to run commands?",
    a: (
      <>
        No. Setup happens on the <a href={site.dashboardUrl}>dashboard</a>. The only commands are{" "}
        <code>/notify dashboard</code> (opens the dashboard), <code>/notify status</code> (shows health) and{" "}
        <code>/notify help</code>.
      </>
    ),
  },
  {
    q: "Who can change settings?",
    a: "People with the Manage Server permission in that server. Log in to the dashboard with Discord and pick the server.",
  },
  {
    q: "How fast are alerts?",
    a: "Kick is checked every 30 seconds. YouTube and Instagram start at 30 seconds and X at 60 seconds, and they slow down as more accounts are followed across all servers, so each platform's limits are respected. Instagram accounts that posted recently are checked fastest. New TikTok videos usually appear within 2 minutes.",
  },
  {
    q: "Do the creators need to approve anything?",
    a: "No. DiscoNotify only reads public information: public YouTube channels, Twitch and Kick channels, Instagram Business or Creator accounts, X accounts and TikTok accounts.",
  },
  {
    q: "What happens if I stop paying?",
    a: "Your server goes back to Free. The oldest account of each platform keeps working, the others pause, and all your settings are kept. They resume the moment you subscribe again.",
  },
  {
    q: "Can I pay with crypto?",
    a: `Yes. On the dashboard's Billing page choose Crypto, then pick ${site.plans.cryptoMonths.join(", ")} months, paid up front. Crypto can't renew automatically, so it's prepaid, and extra months stack.`,
  },
  {
    q: "How do I cancel?",
    a: "Dashboard, then Billing, then Manage billing. Your plan keeps working until the end of the month you already paid for. There are no contracts or cancellation fees.",
  },
  {
    q: "Which permissions does the bot need?",
    a: "Administrator, View Channels, Send Messages, Embed Links, Attach Files, Read Message History, Add Reactions and Manage Webhooks. Manage Webhooks lets alerts post under your own name and avatar. Administrator is included so setup never fails on a missing permission.",
  },
  {
    q: "Can I get a refund?",
    a: (
      <>
        Card payments come with a 14-day money-back guarantee. See the <Link href="/refund">Refund Policy</Link>.
      </>
    ),
  },
  {
    q: "Can two servers follow the same creator?",
    a: "Yes. Each server keeps its own channels, messages and mentions, completely separate from every other server.",
  },
  {
    q: "What happens if I delete the alert channel?",
    a: (
      <>
        DiscoNotify marks the channel as unavailable and stops trying to post there. Run{" "}
        <code>/notify status</code> or open the dashboard to see which accounts need a new channel.
      </>
    ),
  },
  {
    q: "Is Instagram limited?",
    a: "Yes. Only Instagram Business and Creator accounts can be followed, because Instagram doesn't let apps read personal accounts. A renamed account shows as unavailable: remove it and add it again with the new handle.",
  },
  {
    q: "How do I add a Twitch channel?",
    a: "On the dashboard, add an account, choose Twitch and enter the channel name or a twitch.tv link. The channel doesn't need to be live yet: the alert posts when the stream starts, with the title, game, viewer count and a Watch on Twitch button, and a second message when it ends if that alert type is on.",
  },
  {
    q: "Do I need to set anything up for TikTok?",
    a: "No. Add the account on the dashboard with @username or the profile link. Live streams and private accounts aren't supported. If a creator changes their username, add the account again.",
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
