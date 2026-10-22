import Link from "next/link";
import { site } from "@/lib/site";
import { PulseMark } from "./Logo";

type Page = "home" | "terms" | "privacy" | "refund" | "pay" | "subscribe" | "manage";

const legal: { key: Page; href: string; label: string }[] = [
    { key: "terms", href: "/terms", label: "Terms of Service" },
    { key: "privacy", href: "/privacy", label: "Privacy Policy" },
    { key: "refund", href: "/refund", label: "Refund Policy" },
];

export function SiteFooter({ current }: { current: Page }) {
    return (
        <footer className="site-footer">
            <div className="wrap footer-grid">
                <div className="footer-brand">
                    <Link
                        className="brand"
                        href="/"
                        aria-label={`${site.name} home`}
                    >
                        <PulseMark size={26} />
                        {site.name}
                    </Link>
                    <p>
                        Discord alerts the moment your creators upload, post or
                        go live.
                    </p>
                </div>

                <nav aria-label="Legal" className="footer-col">
                    <p className="eyebrow">Legal</p>
                    {legal.map((p) => (
                        <Link
                            key={p.key}
                            href={p.href}
                            aria-current={
                                current === p.key ? "page" : undefined
                            }
                        >
                            {p.label}
                        </Link>
                    ))}
                </nav>

                <div className="footer-col">
                    <p className="eyebrow">Support</p>
                    <Link
                        href="/manage"
                        aria-current={current === "manage" ? "page" : undefined}
                    >
                        Manage or cancel
                    </Link>
                    <a href={site.supportServer} rel="noopener">
                        Support Server
                    </a>
                    <a href={`mailto:${site.supportEmail}`}>
                        {site.supportEmail}
                    </a>
                </div>
            </div>

            <div className="wrap footer-base">
                <span>
                    &copy; {new Date().getFullYear()} {site.name}. All rights
                    reserved.
                </span>
                <span>Not affiliated with Discord, YouTube, Kick, TikTok, Meta or X.</span>
            </div>
        </footer>
    );
}
