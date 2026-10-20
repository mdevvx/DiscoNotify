import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/lib/site";
import {
    ContactCard,
    LegalPage,
    type LegalSection,
} from "@/components/legal/LegalPage";

export const metadata: Metadata = {
    title: "Terms of Service",
    description:
        "These terms apply when you add DiscoNotify to a Discord server or use any of its commands. Please read them before you invite the bot.",
};

const sections: LegalSection[] = [
    {
        id: "agreement",
        title: "Agreement",
        body: (
            <>
                <p>
                    DiscoNotify is a Discord bot that posts alerts when creators
                    publish content or go live on supported platforms.
                    DiscoNotify is owned and operated by{" "}
                    <strong>{site.legalName}</strong> ("we", "us"), and when you
                    use or buy DiscoNotify your agreement is with us. By adding
                    DiscoNotify to a Discord server, buying a subscription or
                    using its commands, you agree to these Terms of Service and
                    to our <Link href="/privacy">Privacy Policy</Link>. Payments
                    for paid plans are covered by our{" "}
                    <Link href="/refund">Refund Policy</Link>.
                </p>
                <p>
                    If you add the bot on behalf of a community or organization,
                    you confirm that you are allowed to accept these terms for
                    it. If you don't agree, don't add or use DiscoNotify.
                </p>
            </>
        ),
    },
    {
        id: "service",
        title: "The service",
        body: (
            <>
                <p>
                    DiscoNotify lets server administrators choose public
                    accounts on supported platforms and a Discord channel where
                    alerts are posted. The bot checks those accounts at regular
                    intervals and posts a
                    message when it detects a new upload, post, Short, Reel, or
                    a stream starting or ending.
                </p>
                <p>
                    Supported platforms and alert types are listed on our{" "}
                    <Link href="/#platforms">homepage</Link> and may change over
                    time. Alerts are sent on a best-effort basis. Their timing
                    depends on how often each platform allows us to check, and
                    on the availability of Discord and the platform involved.
                </p>
            </>
        ),
    },
    {
        id: "payments",
        title: "Subscriptions and payments",
        body: (
            <>
                <p>
                    Card payments are processed by{" "}
                    <a href="https://polar.sh" rel="noopener">
                        Polar
                    </a>
                    , which acts as the Merchant of Record for card orders. Polar
                    takes your payment, calculates and collects applicable sales
                    tax and issues your receipt. Crypto payments are processed
                    by{" "}
                    <a href="https://nowpayments.io" rel="noopener">
                        NOWPayments
                    </a>
                    . Your purchase is also subject to the terms of the provider
                    you pay with.
                </p>
                <ul>
                    <li>
                        <strong>Price:</strong> DiscoNotify costs{" "}
                        {site.price.currency}
                        {site.price.amount} per {site.price.period} for each
                        Discord server. For card payments, applicable taxes,
                        such as VAT or sales tax, are calculated and collected
                        by Polar at checkout.
                    </li>
                    <li>
                        <strong>Free trial:</strong> Each server starts with a{" "}
                        {site.price.trialDays}-day free trial that needs no
                        payment details. If you subscribe by card during the
                        trial, your card is saved and nothing is charged until
                        the trial ends. If you cancel before then, you are not
                        charged.
                    </li>
                    <li>
                        <strong>Card billing and renewal:</strong> Card
                        subscriptions are billed monthly in advance and renew
                        automatically each month until cancelled.
                    </li>
                    <li>
                        <strong>Crypto:</strong> Crypto payments are prepaid for
                        3, 6 or 12 months at the price above multiplied by the
                        number of months. They do not renew automatically, and
                        extra months are added to any time you already have.
                        Send the exact amount, on the network and to the address
                        shown. Network fees are your responsibility, and funds
                        sent to the wrong address or network, or in the wrong
                        amount, may not be recoverable.
                    </li>
                    <li>
                        <strong>Account used to subscribe:</strong> To subscribe
                        from our website you may log in with Discord. We use
                        that login only as described in our{" "}
                        <Link href="/privacy">Privacy Policy</Link>. You must
                        have permission to manage the server you subscribe, and
                        you are responsible for payments made for it.
                    </li>
                    <li>
                        <strong>Cancellation:</strong> You can cancel a card
                        subscription at any time with{" "}
                        <code>/disconotify cancel</code> in Discord or from our{" "}
                        <Link href="/manage">Manage or cancel</Link> page. Your
                        subscription stays active until the end of the month you
                        have paid for and is not charged again. Crypto plans
                        simply end when the prepaid time runs out.
                    </li>
                    <li>
                        <strong>Failed or lapsed payments:</strong> If a renewal
                        fails, or prepaid time runs out, and the server isn't
                        paid up, alerts for that server pause after a 3-day
                        grace period. Your settings are kept, and alerts resume
                        once the server is paid again.
                    </li>
                    <li>
                        <strong>Price changes:</strong> We will give at least 30
                        days' notice before a price change applies to an
                        existing card subscription.
                    </li>
                    <li>
                        <strong>Refunds:</strong> See our{" "}
                        <Link href="/refund">Refund Policy</Link>.
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: "eligibility",
        title: "Who can use",
        body: (
            <>
                <p>
                    You must meet the minimum age required by Discord's{" "}
                    <a href="https://discord.com/terms" rel="noopener">
                        Terms of Service
                    </a>{" "}
                    in your country, and you must follow those terms and
                    Discord's{" "}
                    <a href="https://discord.com/guidelines" rel="noopener">
                        Community Guidelines
                    </a>{" "}
                    while using DiscoNotify.
                </p>
            </>
        ),
    },
    {
        id: "admins",
        title: "Server admin responsibilities",
        body: (
            <>
                <p>
                    Configuration commands require the Discord{" "}
                    <strong>Manage Server</strong> permission. Whoever
                    configures DiscoNotify in a server is responsible for:
                </p>
                <ul>
                    <li>
                        the accounts the server chooses to follow, which
                        should be creators the server has a legitimate reason
                        to follow, and the channels alerts are posted in;
                    </li>
                    <li>
                        any custom alert message they write, including any
                        @everyone, @here or role mentions it contains;
                    </li>
                    <li>
                        the name and avatar given to the alert webhook in that
                        server;
                    </li>
                    <li>
                        making sure alerts are appropriate for the server's
                        members and comply with Discord's rules.
                    </li>
                </ul>
                <p>
                    Alerts can include titles, descriptions and thumbnails
                    written by the creators being followed. We don't write or
                    review that content, and we aren't responsible for it.
                </p>
            </>
        ),
    },
    {
        id: "platforms",
        title: "Third-party platforms",
        body: (
            <>
                <p>
                    DiscoNotify relies on services run by other companies. Your
                    use of DiscoNotify is also subject to their terms:
                </p>
                <ul>
                    <li>
                        <strong>Discord:</strong>{" "}
                        <a href="https://discord.com/terms" rel="noopener">
                            Discord Terms of Service
                        </a>
                    </li>
                    <li>
                        <strong>YouTube:</strong> DiscoNotify uses YouTube API
                        Services. By using DiscoNotify's YouTube features, you
                        agree to be bound by the{" "}
                        <a
                            href="https://www.youtube.com/t/terms"
                            rel="noopener"
                        >
                            YouTube Terms of Service
                        </a>
                        . See also the{" "}
                        <a
                            href="https://policies.google.com/privacy"
                            rel="noopener"
                        >
                            Google Privacy Policy
                        </a>
                        .
                    </li>
                    <li>
                        <strong>Kick:</strong>{" "}
                        <a
                            href="https://kick.com/terms-of-service"
                            rel="noopener"
                        >
                            Kick Terms of Service
                        </a>
                    </li>
                    <li>
                        <strong>Polar and NOWPayments:</strong> payments are
                        also subject to the terms of{" "}
                        <a href="https://polar.sh" rel="noopener">
                            Polar
                        </a>{" "}
                        and{" "}
                        <a href="https://nowpayments.io" rel="noopener">
                            NOWPayments
                        </a>
                        .
                    </li>
                    <li>
                        <strong>Instagram:</strong>{" "}
                        <a
                            href="https://help.instagram.com/581066165581870"
                            rel="noopener"
                        >
                            Instagram Terms of Use
                        </a>{" "}
                        and{" "}
                        <a
                            href="https://developers.facebook.com/terms"
                            rel="noopener"
                        >
                            Meta Platform Terms
                        </a>
                    </li>
                    <li>
                        <strong>X:</strong>{" "}
                        <a href="https://x.com/en/tos" rel="noopener">
                            X Terms of Service
                        </a>
                    </li>
                    <li>
                        <strong>TikTok:</strong> TikTok alerts use publicly
                        available information about public accounts.
                        DiscoNotify has no partnership with TikTok and never
                        asks for TikTok logins.
                    </li>
                </ul>
                <p>
                    We are not affiliated with, endorsed by or sponsored by
                    Discord, Google, YouTube, Kick, Meta, X, TikTok, ByteDance
                    or their affiliates. TikTok is a trademark of its owner,
                    used only to describe compatibility. If one of these
                    platforms changes or restricts access, we may have to
                    change or remove support for it, sometimes without notice.
                    TikTok alerts depend on what TikTok makes publicly
                    available, so they may be delayed, missed or paused if
                    that access changes, and we can't guarantee them.
                </p>
            </>
        ),
    },
    {
        id: "acceptable-use",
        title: "Acceptable use",
        body: (
            <>
                <p>You agree not to:</p>
                <ul>
                    <li>
                        use DiscoNotify to spam, harass or mass-mention people,
                        or to break Discord's rules;
                    </li>
                    <li>
                        use DiscoNotify for anything unlawful or fraudulent, or
                        to send spam;
                    </li>
                    <li>
                        use alerts to promote content that is illegal, infringes
                        anyone's intellectual property, or violates the policies
                        of the platform it comes from;
                    </li>
                    <li>
                        try to overload, probe, scrape, disrupt, reverse
                        engineer or get unauthorized access to the bot, its
                        database or its infrastructure, or introduce malware;
                    </li>
                    <li>
                        run commands automatically or in volume to strain the
                        service or the platforms it relies on;
                    </li>
                    <li>
                        impersonate DiscoNotify, other people or brands through
                        the alert webhook's name or avatar.
                    </li>
                </ul>
                <p>
                    We may limit, pause or remove DiscoNotify from any server
                    that breaks these rules.
                </p>
            </>
        ),
    },
    {
        id: "availability",
        title: "Availability and changes",
        body: (
            <>
                <p>
                    We work to keep DiscoNotify running reliably, but we don't
                    guarantee that it will be uninterrupted or error-free, that
                    it will always be available, that every alert will be
                    delivered or that alerts will arrive within a set time. We
                    may add, change or remove features, platforms and commands
                    at any time.
                </p>
            </>
        ),
    },
    {
        id: "ip",
        title: "Ownership",
        body: (
            <>
                <p>
                    DiscoNotify, including its name, logo, code and design,
                    belongs to us. Content shown in alerts, such as titles,
                    thumbnails and creator names, belongs to its respective
                    owners. Custom messages you write remain yours, and you give
                    us permission to store and post them in your server so the
                    bot can work.
                </p>
            </>
        ),
    },
    {
        id: "disclaimer",
        title: "Disclaimer",
        body: (
            <>
                <p>
                    DiscoNotify is provided "as is" and "as available", without
                    warranties of any kind, whether express or implied,
                    including warranties of merchantability, fitness for a
                    particular purpose and non-infringement, to the fullest
                    extent allowed by law.
                </p>
            </>
        ),
    },
    {
        id: "liability",
        title: "Limitation of liability",
        body: (
            <>
                <p>
                    To the fullest extent allowed by law, we are not liable for
                    any indirect, incidental, special, consequential or punitive
                    damages, or for lost profits, data or goodwill, arising from
                    your use of DiscoNotify, including missed, late, duplicated
                    or incorrect alerts.
                </p>
                <p>
                    Our total liability for any claim relating to the service is
                    limited to the amount you paid for DiscoNotify in the 12
                    months before the claim. Nothing in these terms limits
                    rights you have under consumer protection laws that cannot
                    be excluded.
                </p>
            </>
        ),
    },
    {
        id: "termination",
        title: "Ending your use",
        body: (
            <>
                <p>
                    You can stop using DiscoNotify at any time by removing it
                    from your server. You can stop following individual accounts
                    with <code>/disconotify account-remove</code>. What happens
                    to your server's data afterwards is explained in our{" "}
                    <Link href="/privacy#retention">Privacy Policy</Link>.
                </p>
                <p>
                    We may suspend or end access for any server or user in case
                    of a material or repeated breach of these terms,
                    non-payment, or a security or fraud risk. We may also stop
                    operating DiscoNotify; if we do, we will give at least 30
                    days' notice and refund any unused part of the current
                    month.
                </p>
            </>
        ),
    },
    {
        id: "changes",
        title: "Changes to these terms",
        body: (
            <>
                <p>
                    We may update these terms from time to time. When we do, we
                    will change the "Last updated" date above, and for
                    significant changes we will post a notice in our support
                    server. Continuing to use DiscoNotify after a change means
                    you accept the updated terms.
                </p>
                <p>
                    These terms are governed by the laws of Pakistan, without
                    regard to its conflict of law rules.
                </p>
            </>
        ),
    },
    {
        id: "contact",
        title: "Contact",
        body: (
            <>
                <p>Questions about these terms can be sent to us at:</p>
                <ContactCard />
            </>
        ),
    },
];

export default function TermsPage() {
    return (
        <LegalPage
            page="terms"
            title="Terms of Service"
            intro="These terms apply when you add DiscoNotify to a Discord server or use any of its commands. Please read them before you invite the bot."
            sections={sections}
        />
    );
}
