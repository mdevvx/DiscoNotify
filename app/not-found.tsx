import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/lib/site";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PulseMark } from "@/components/Logo";
import { ArrowIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

const shortcuts = [
  { href: "/#platforms", label: "Platforms" },
  { href: "/#setup", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

/** Shown for every address that doesn't exist. The static export also writes it as 404.html for the host. */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="nf">
          <div className="wrap nf-inner">
            <p className="eyebrow">Error 404</p>
            <div className="nf-code" aria-hidden="true">
              <span>4</span>
              <span className="nf-mark">
                <PulseMark />
              </span>
              <span>4</span>
            </div>
            <h1>Signal lost</h1>
            <p className="lede">
              We couldn&apos;t find the page you were looking for. It may have moved, or the link might be mistyped.
            </p>
            <div className="nf-actions">
              <Link className="btn btn-primary btn-lg" href="/">
                Back to home
              </Link>
              <a className="hero-link" href={site.supportServer} rel="noopener">
                Ask in our support server
                <ArrowIcon />
              </a>
            </div>
            <nav className="trust nf-links" aria-label="Popular pages">
              {shortcuts.map((s) => (
                <Link key={s.href} href={s.href}>
                  {s.label}
                </Link>
              ))}
            </nav>
          </div>
        </section>
      </main>
      <SiteFooter current="home" />
    </>
  );
}
