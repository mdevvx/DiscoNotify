import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/lib/site";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DiscordIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Manage or cancel",
  description: "Cancel your DiscoNotify subscription, update your card, get receipts or ask for a refund.",
};

export default function ManagePage() {
  const portal = site.polarPortalUrl;

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="pay">
          <div className="wrap">
            <div className="manage-head">
              <p className="eyebrow">Billing</p>
              <h1>Manage or cancel your subscription</h1>
              <p className="lede">
                Cancel anytime in a couple of clicks. Your server keeps working until the end of the period you already
                paid for.
              </p>
            </div>

            <div className="manage-grid">
              <article className="manage-card manage-main">
                <p className="plan-name">Card subscription</p>
                <h2>Cancel or update your card</h2>
                <ol className="manage-steps">
                  <li>
                    In your Discord server, run <code>/notify cancel</code>.
                  </li>
                  <li>Press the button to open your private billing portal.</li>
                  <li>
                    Choose <strong>Cancel subscription</strong>, or update your card and see your receipts.
                  </li>
                </ol>
                <p className="field-help">
                  Only the person who subscribed, or the server owner, can open the portal, so nobody else can cancel your
                  subscription. Cancelled during the free trial? You&apos;re never charged.
                </p>
                {portal && (
                  <p className="field-help">You&apos;ll manage your subscription on Polar, our payment provider.</p>
                )}
                {portal && (
                  <a className="btn btn-ghost btn-lg plan-cta" href={portal} rel="noopener" target="_blank">
                    Open the customer portal
                  </a>
                )}
                {portal && (
                  <p className="field-help">You can also sign in to the portal with the email you paid with.</p>
                )}
              </article>

              <article className="manage-card">
                <p className="plan-name">Crypto</p>
                <h2>Nothing to cancel</h2>
                <p>
                  Crypto plans are prepaid for 3, 6 or 12 months and never renew on their own. Your server simply stops
                  at the end of the paid time, and your settings stay saved.
                </p>
              </article>

              <article className="manage-card">
                <p className="plan-name">Refunds</p>
                <h2>14-day money-back guarantee</h2>
                <p>
                  Email {site.supportEmail} or ask in our support server with your server ID and the email you paid with.
                  We handle it for you. See the <Link href="/refund">Refund Policy</Link> for details.
                </p>
              </article>

              <article className="manage-card">
                <p className="plan-name">Need a hand?</p>
                <h2>We&apos;re in Discord</h2>
                <p>Ask in our support server or email {site.supportEmail} and we&apos;ll sort it out.</p>
                <a className="btn btn-discord" href={site.supportServer} rel="noopener">
                  <DiscordIcon size={16} />
                  Support server
                </a>
              </article>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter current="manage" />
    </>
  );
}
