import Link from "next/link";
import { site } from "@/lib/site";
import { PulseMark } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#setup", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link className="brand" href="/" aria-label={`${site.name} home`}>
          <PulseMark />
          {site.name}
        </Link>
        <nav className="nav" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} className="nav-link" href={l.href}>
              {l.label}
            </Link>
          ))}
          <ThemeToggle />
          <a className="btn btn-ghost btn-sm nav-secondary" href={site.inviteUrl}>
            Add to Discord
          </a>
          <a className="btn btn-brand btn-sm" href={site.dashboardUrl}>
            Open dashboard
          </a>
          <MobileMenu links={links} supportUrl={site.supportServer} inviteUrl={site.inviteUrl} dashboardUrl={site.dashboardUrl} />
        </nav>
      </div>
    </header>
  );
}
