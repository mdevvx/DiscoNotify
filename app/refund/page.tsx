import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/lib/site";
import { ContactCard, LegalPage, type LegalSection } from "@/components/legal/LegalPage";

const intro =
  "DiscoNotify comes with a 14-day money-back guarantee. This page explains how refunds work and how to ask for one.";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: intro,
};

const sections: LegalSection[] = [
  {
    id: "summary",
    title: "Summary",
    body: (
      <>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Situation</th>
                <th scope="col">What happens</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Using the Free plan</td>
                <td>Nothing to pay, nothing to refund</td>
              </tr>
              <tr>
                <td>Any payment, within 14 days</td>
                <td>Full refund for any reason</td>
              </tr>
              <tr>
                <td>Charged twice or charged the wrong amount</td>
                <td>Incorrect charge refunded in full, at any time</td>
              </tr>
              <tr>
                <td>Renewed after you cancelled</td>
                <td>That renewal refunded in full, at any time</td>
              </tr>
              <tr>
                <td>DiscoNotify down for more than 72 hours in a row</td>
                <td>Refund or credit for the affected days</td>
              </tr>
              <tr>
                <td>A platform you relied on is permanently removed</td>
                <td>Refund for the unused part of the month</td>
              </tr>
              <tr>
                <td>More than 14 days after a payment</td>
                <td>Cancel to stop the next charge. Contact us if something went wrong and we&apos;ll review it</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: "payment",
    title: "Who handles your payment",
    body: (
      <>
        <p>
          Card payments are processed by <a href="https://polar.sh" rel="noopener">Polar</a>, which acts as the Merchant
          of Record for card orders: it takes the payment, collects sales tax and issues the receipt. Refunds are paid back
          to your original payment method. Crypto payments are processed by{" "}
          <a href="https://nowpayments.io" rel="noopener">NOWPayments</a>.
        </p>
        <p>
          DiscoNotify costs {site.price.currency}
          {site.price.amount} per {site.price.period} for each Discord server. Card subscriptions are billed monthly in
          advance and renew automatically each month until you cancel. Crypto plans are prepaid for 3, 6 or 12 months and
          do not renew. The Free plan (one account per platform) costs nothing, and there is no free trial.
        </p>
      </>
    ),
  },
  {
    id: "guarantee",
    title: "14-day money-back guarantee",
    body: (
      <>
        <p>
          If you&apos;re not happy with DiscoNotify for any reason, ask for a refund within <strong>14 days</strong> of a
          payment and you&apos;ll get that payment back in full. This applies to your first payment and to monthly
          renewals.
        </p>
        <p>When a refund is issued, the subscription for that server ends and DiscoNotify stops sending alerts there.</p>
        <h3>Crypto payments</h3>
        <p>
          Crypto payments can&apos;t be reversed by a bank, so we refund them by hand. The same 14-day guarantee applies:
          within 14 days of the payment, we send back the amount in the same coin, to a wallet address you give us, less
          the network fees of the transfer. The value is converted at the time of the refund, so the amount in the coin
          can differ from what you sent.
        </p>
      </>
    ),
  },
  {
    id: "other",
    title: "Other refunds",
    body: (
      <>
        <h3>Billing mistakes</h3>
        <p>
          If you were charged twice for the same month, charged the wrong amount, or charged for a renewal after you had
          already cancelled, the incorrect charge is refunded in full, whenever you notice it.
        </p>
        <h3>Extended outages</h3>
        <p>
          If DiscoNotify stops sending alerts for more than <strong>72 hours in a row</strong> because of a problem on our
          side, you can ask for a refund or credit for the affected days, even after the 14-day window.
        </p>
        <h3>Platforms we remove</h3>
        <p>
          If we permanently remove support for a platform you were using, you can cancel and receive a refund for the
          unused part of your current month.
        </p>
        <h3>After 14 days</h3>
        <p>
          Outside the cases above, payments older than 14 days aren&apos;t normally refunded. You can cancel at any time to
          stop the next charge, and your plan keeps working until the end of the month you paid for. If something went
          wrong, contact us anyway and we&apos;ll review your request fairly. This policy doesn&apos;t affect any rights you
          have under consumer protection law.
        </p>
      </>
    ),
  },
  {
    id: "cancel",
    title: "Cancelling",
    body: (
      <>
        <p>
          Cancel a card subscription any time on the dashboard: Billing, then Manage billing. Only the person who
          subscribed, or the server owner, can open the billing portal. If you cancel, the server stays on the Paid plan
          until the end of the month you paid for, then returns to Free. Crypto plans don&apos;t renew, so there is nothing
          to cancel.
        </p>
        <p>
          Removing DiscoNotify from your server doesn&apos;t cancel a card subscription by itself, so please cancel
          billing as well.
        </p>
      </>
    ),
  },
  {
    id: "request",
    title: "How to request a refund",
    body: (
      <>
        <p>
          Email {site.supportEmail} or open a ticket in our support server with your Discord server ID, the email you
          paid with (card) or the payment ID and coin (crypto), and the date of the payment. We issue card refunds through
          Polar, so the money returns to your original payment method.
        </p>
        <p>
          Requests are reviewed within <strong>5 business days</strong>. Your bank or card provider may take another 5 to
          10 business days to show a card refund on your statement. Crypto refunds are sent once we have your wallet
          address.
        </p>
      </>
    ),
  },
  {
    id: "chargebacks",
    title: "Chargebacks",
    body: (
      <>
        <p>
          Please contact us before disputing a charge with your bank. Refunds within the guarantee are quick and
          simple. If a chargeback is opened, the subscription for that server may be paused until it&apos;s resolved.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <>
        <p>
          We may update this policy from time to time. Changes apply to payments made after the &quot;Last updated&quot;
          date above. Payments made earlier are handled under the version in place when you paid. See also our{" "}
          <Link href="/terms">Terms of Service</Link>.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <>
        <p>For refunds and billing questions, contact us at:</p>
        <ContactCard />
      </>
    ),
  },
];

export default function RefundPage() {
  return <LegalPage page="refund" title="Refund Policy" intro={intro} sections={sections} />;
}
