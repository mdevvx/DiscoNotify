import type { Metadata } from "next";
import { site } from "@/lib/site";
import { ContactCard, LegalPage, type LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "DiscoNotify stores server settings, not people. This page explains exactly what we keep, why we keep it and how to have it deleted.",
};

const sections: LegalSection[] = [
  {
    id: "who",
    title: "Who we are",
    body: (
      <>
        <p>DiscoNotify is owned and operated by <strong>{site.legalName}</strong>, {site.legalAddress} (&quot;we&quot;, &quot;us&quot;). We are the data controller for the information described on this page. For any privacy question, contact us at {site.supportEmail}.</p>
      </>
    ),
  },
  {
    id: "summary",
    title: "Summary",
    body: (
      <>
        <ul>
          <li>We store the settings a server needs for alerts to work: which accounts it follows, which channel alerts go to, who gets mentioned and any custom message.</li>
          <li>We don't store chat messages, member lists or any information about the people in your server.</li>
          <li>Card payments are handled by Polar, our Merchant of Record, and crypto payments by NOWPayments. We never see or store your card details or wallet keys.</li>
          <li>The dashboard uses Discord login (<strong>identify</strong> and <strong>guilds</strong> only) to show the servers you manage and check you may manage the one you open. The Discord token is revoked when you log out. We no longer collect an email at sign-up.</li>
          <li>We only read public information from YouTube, Twitch, Kick, Instagram, X and TikTok.</li>
          <li>We don't sell data, share it for advertising or use it to train AI models.</li>
        </ul>
      </>
    ),
  },
  {
    id: "collect",
    title: "What we store",
    body: (
      <>
        <p>Data is stored per Discord server and kept separate from every other server's data.</p>

        <h3>Server configuration</h3>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th scope="col">Data</th><th scope="col">Example</th><th scope="col">Why we need it</th></tr></thead>
            <tbody>
              <tr><td>Server ID</td><td>The numeric Discord ID of your server, and whether DiscoNotify is on or paused there</td><td>To keep each server's settings separate and respect the pause switch on the dashboard</td></tr>
              <tr><td>Followed accounts</td><td>Platform, handle or channel ID, display name, profile link. For TikTok: the public username, numeric ID, display name and avatar link</td><td>To know which accounts to check for your server</td></tr>
              <tr><td>Alert channels</td><td>Channel ID and the webhook created in that channel</td><td>To post alerts where you chose, under the name and avatar you set</td></tr>
              <tr><td>Alert settings</td><td>Which alert types are on, whether full cards are shown</td><td>To send only the alerts you want</td></tr>
              <tr><td>Mention settings</td><td>A role ID, @everyone or none</td><td>To ping the right people</td></tr>
              <tr><td>Custom messages</td><td>Text you write on the dashboard</td><td>To use your wording in alerts</td></tr>
            </tbody>
          </table>
        </div>

        <h3>Monitoring records</h3>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th scope="col">Data</th><th scope="col">Example</th><th scope="col">Why we need it</th></tr></thead>
            <tbody>
              <tr><td>Alert history</td><td>The platform's ID for each video, post or stream already announced, and when</td><td>So the same upload or stream is never announced twice</td></tr>
              <tr><td>Live state</td><td>Whether a followed account is currently live</td><td>So a bot restart doesn't re-announce a stream already in progress</td></tr>
              <tr><td>Last seen content</td><td>The newest upload or post we have seen for an account, including the caption, cover and link for TikTok videos</td><td>To detect what is new on the next check</td></tr>
              <tr><td>Check status</td><td>When an account was last checked, and whether it can still be found</td><td>To show the dashboard and <code>/notify status</code>, and stop checking accounts that no longer exist</td></tr>
            </tbody>
          </table>
        </div>
        <p>All of this information is about public creator accounts and Discord server settings. None of it describes the members of your server.</p>

        <h3>Subscription and billing</h3>
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr><th scope="col">Data</th><th scope="col">Example</th><th scope="col">Why we need it</th></tr></thead>
            <tbody>
              <tr><td>Order records</td><td>Polar customer and subscription IDs (card), or the NOWPayments payment ID, amount and coin (crypto), plus plan, status and renewal date</td><td>To turn alerts on for the server you paid for and handle cancellations and refunds</td></tr>
              <tr><td>Server link</td><td>The Discord server ID, and (for payers) the Discord user ID of the person who paid or started the payment</td><td>To know which server the subscription belongs to, to confirm the payment in Discord and to check who may open the billing portal</td></tr>
              <tr><td>Contact details</td><td>The email address you enter at checkout (stored against your server ID), or one you write to us from for support or a refund</td><td>To send reminders, updates and important notices about your server, answer you and look up your payment</td></tr>
            </tbody>
          </table>
        </div>
        <p>Your name, billing address and card details are collected and processed by Polar, not by us. Crypto payments are processed by NOWPayments, and we receive only the payment details above. Both providers share only what we need with us.</p>

        <h3>Logging in with Discord (dashboard)</h3>
        <p>The dashboard at dashboard.disconotify.com uses Discord login. We ask Discord for two permissions only: <strong>identify</strong> (your Discord ID and name) and <strong>guilds</strong> (the list of servers you are in). We use them to show you the servers you manage that DiscoNotify is in, and to check that you may manage the one you open.</p>
        <ul>
          <li>The session lasts 7 days and is stored in an encrypted cookie. The Discord token is revoked when you log out.</li>
          <li>We don't store your list of servers.</li>
          <li>The login can't post messages, read messages, or change anything in your servers or account.</li>
          <li>We no longer collect an email address at sign-up. For people who pay, we keep the email you enter at checkout. Emails are kept while your server uses the service and deleted on request. They are processed by the mail provider we use to send email from disconotify.com. Billing emails (receipts, failed payments, cancellations) can&apos;t be unsubscribed from while a subscription exists. Reminder emails can, with the link in each one.</li>
        </ul>

        <h3>Legal basis</h3>
        <ul>
          <li><strong>Server configuration, monitoring records and subscription data:</strong> needed to provide the service you asked for (performance of a contract).</li>
          <li><strong>Billing records:</strong> needed to meet our tax and accounting obligations (legal obligation).</li>
          <li><strong>Technical logs and fraud prevention:</strong> needed to keep the service secure and working (our legitimate interests).</li>
        </ul>
      </>
    ),
  },
  {
    id: "not-collected",
    title: "What we don't store",
    body: (
      <>
        <ul>
          <li><strong>Messages.</strong> DiscoNotify works through slash commands. It doesn't read, log or store conversations in your server.</li>
          <li><strong>Members.</strong> We don't store member lists, usernames, roles held by members, avatars or activity.</li>
          <li><strong>Who ran a command.</strong> Discord tells the bot who ran a command so it can check permissions and make sure only that person can press confirmation buttons. This is used in the moment and not saved.</li>
          <li><strong>Card details and wallets.</strong> Card and bank details are entered on Polar's checkout and never reach our servers. For crypto we only see the payment shown to you, never your wallet keys.</li>
          <li><strong>Platform logins.</strong> We never ask for, receive or store your YouTube, Google, Twitch, Kick, Instagram, Facebook or TikTok credentials, and we never access any account on your behalf.</li>
          <li><strong>Private TikTok content.</strong> We don't read private TikTok accounts or private content, and we collect no data about a creator's followers or viewers.</li>
        </ul>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use it",
    body: (
      <>
        <p>We use the data above only to run DiscoNotify: to check the accounts your server follows, decide which alerts to send, post them in the right channel and show your settings back to you. We also keep short-lived technical logs (such as errors and API response codes) to fix problems and stay within each platform's usage limits.</p>
        <p>We don't sell or rent data, share it with advertisers, build profiles of people, or use it to train AI models.</p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Services we rely on",
    body: (
      <>
        <p>We share data with the following services only as far as needed to run DiscoNotify:</p>
        <ul>
          <li><strong>Polar</strong> is our payment provider and Merchant of Record for card payments. It processes your payment, name, email, billing address and tax information to sell you DiscoNotify, collect taxes and prevent fraud. See Polar's privacy policy at <a href="https://polar.sh" rel="noopener">polar.sh</a>.</li>
          <li><strong>NOWPayments</strong> processes crypto payments. See its privacy policy at <a href="https://nowpayments.io" rel="noopener">nowpayments.io</a>.</li>
          <li><strong>Discord</strong> receives the alerts and command replies we post, and provides the optional login described above. See the <a href="https://discord.com/privacy" rel="noopener">Discord Privacy Policy</a>.</li>
          <li><strong>Supabase</strong> hosts our database, where the data listed above is stored, and runs the secure service behind our unsubscribe links. See the <a href="https://supabase.com/privacy" rel="noopener">Supabase Privacy Policy</a>.</li>
          <li><strong>Our hosting provider</strong> runs the bot's servers.</li>
          <li><strong>YouTube API Services</strong> are used to read public channel information, uploads and live status. DiscoNotify uses an API key only and doesn't access any Google account. See the <a href="https://policies.google.com/privacy" rel="noopener">Google Privacy Policy</a> and the <a href="https://www.youtube.com/t/terms" rel="noopener">YouTube Terms of Service</a>.</li>
          <li><strong>Twitch's public API</strong> is used to read public channel information: live status, channel name and avatar. We don't use a Twitch login and collect nothing about viewers. See the <a href="https://www.twitch.tv/p/legal/privacy-notice/" rel="noopener">Twitch Privacy Notice</a>.</li>
          <li><strong>Kick's public API</strong> is used to read public channel and live status information. See the <a href="https://kick.com/privacy-policy" rel="noopener">Kick Privacy Policy</a>.</li>
          <li><strong>Meta's Instagram Graph API</strong> is used to read public posts and Reels from Instagram Business and Creator accounts. See the <a href="https://privacycenter.instagram.com/policy" rel="noopener">Instagram Privacy Policy</a>.</li>
          <li><strong>TikTok</strong> public pages are requested from our hosting provider to read public videos from public accounts, so TikTok sees those requests. We have no partnership with TikTok and don't use a TikTok login. The creator's public username, numeric ID, display name, avatar link, captions, covers and video links are shown in the server's Discord channel and stored only as needed to send alerts and avoid duplicates.</li>
        </ul>
        <p>When we look up an account, we send the platform the handle or ID your server asked us to follow. We don't send them any information about your server or its members.</p>
        <p>We may also disclose information to professional advisers such as accountants, to authorities if the law requires it, or to protect the safety of our users or the service.</p>
        <p>Some of these providers process data outside your country, including outside the UK and EEA. Where that happens, we rely on the provider's safeguards for international transfers, such as Standard Contractual Clauses.</p>
      </>
    ),
  },
  {
    id: "retention",
    title: "Keeping and deleting data",
    body: (
      <>
        <ul>
          <li><strong>Removing an account</strong> on the dashboard (also how a creator can ask to stop being monitored, by asking a server admin or contacting us below) deletes that account's settings, custom message and alert history for your server right away.</li>
          <li><strong>Removing DiscoNotify</strong> from your server keeps its settings so that re-adding the bot restores them. Use "Remove all accounts" on the dashboard, or ask us, to delete them.</li>
          <li><strong>Deleting an alert channel</strong> stops alerts to it. The channel record is marked as unavailable and is deleted with the rest of the server's data.</li>
          <li><strong>Technical logs</strong> are kept for up to 30 days.</li>
          <li><strong>Subscription and billing records</strong> are kept while your subscription is active and afterwards for as long as tax and accounting law requires. Polar and NOWPayments keep their own records under their privacy policies.</li>
        </ul>
        <p>You can ask us to delete your server's data sooner at any time using the contact details below. We'll ask you to confirm that you manage the server.</p>
        <p>YouTube data we store, such as the newest video seen on a channel, is refreshed on every check and deleted when no server follows that channel any more.</p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <>
        <p>Data is stored in a managed database that is only reachable by the bot's servers. API keys and access tokens are kept in server-side environment settings, never in code and never written to logs. Every database query is limited to a single server, so one server's settings can't be read or changed from another.</p>
        <p>No system is perfectly secure. If we learn of a breach that affects your data, we'll notify affected server owners through Discord or our support server.</p>
      </>
    ),
  },
  {
    id: "rights",
    title: "Your choices and rights",
    body: (
      <>
        <p>Server admins can view everything stored for an account on the dashboard and with <code>/notify status</code>, change it on the dashboard, and delete it as described above.</p>
        <p>Depending on where you live, including under the GDPR and UK GDPR, you have the right to access the personal data we hold about you, correct it, have it deleted, restrict or object to how we use it, receive a copy in a portable format, and withdraw consent where we rely on it. To use any of these rights, contact us and we'll respond within one month.</p>
        <p>You also have the right to complain to your local data protection authority. We'd appreciate the chance to resolve your concern first.</p>
      </>
    ),
  },
  {
    id: "website",
    title: "This website",
    body: (
      <>
        <p>This website doesn't use analytics, advertising or tracking cookies, and its fonts are served from our own site. When you pay by card on the dashboard you are sent to Polar's checkout page, which uses cookies and similar storage that are needed to complete your payment and prevent fraud. See Polar's privacy policy at <a href="https://polar.sh" rel="noopener">polar.sh</a>.</p>
        <p>This website sets no cookies and has no login. Accounts, settings and billing are handled on the dashboard, which is described under "Logging in with Discord (dashboard)" above.</p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <>
        <p>DiscoNotify is intended for use under Discord's own age requirements. We don't knowingly collect personal information from children, and the bot doesn't store information about any Discord user.</p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <>
        <p>If we change how DiscoNotify handles data, we'll update this page and the "Last updated" date. For significant changes we'll also post a notice in our support server before they take effect.</p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <>
        <p>For privacy questions or deletion requests, contact us at:</p>
        <ContactCard />
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      page="privacy"
      title="Privacy Policy"
      intro="DiscoNotify stores server settings, not people. This page explains exactly what we keep, why we keep it and how to have it deleted."
      sections={sections}
    />
  );
}
