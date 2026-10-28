import Link from "next/link";
import { site } from "@/lib/site";
import { PulseMark } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { MobileMenu } from "./MobileMenu";

const links = [
  { href: "/#platforms", label: "Platforms" },
  { href: "/#features", label: "Features" },
  { href: "/#commands", label: "Commands" },
  { href: "/#pricing", label: "Pricing" },
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
          <Link className="btn btn-primary btn-sm nav-cta" href="/activate">
            Avail the trial
          </Link>
          <ThemeToggle />
          <MobileMenu links={links} supportUrl={site.supportServer} />
        </nav>
      </div>
    </header>
  );
}
