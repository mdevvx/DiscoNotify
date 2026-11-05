import { site } from "@/lib/site";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Reveal } from "@/components/Reveal";
import { DiscordIcon } from "@/components/Icons";
import { Hero } from "@/components/home/Hero";
import { Platforms } from "@/components/home/Platforms";
import { Features } from "@/components/home/Features";
import { Compare } from "@/components/home/Compare";
import { Setup } from "@/components/home/Setup";
import { Commands } from "@/components/home/Commands";
import { Pricing } from "@/components/home/Pricing";
import { Faq } from "@/components/home/Faq";
import { Community } from "@/components/home/Community";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Platforms />
        <Features />
        <Compare />
        <Setup />
        <Commands />
        <Pricing />
        <Faq />
        <Community />
        <section className="cta">
          <div className="wrap">
            <div className="cta-card reveal">
              <div>
                <h2>Never miss a stream your community cares about.</h2>
                <p>
                  Set up in under two minutes. Free for one account per platform, or {site.price.currency}
                  {site.price.amount} a {site.price.period} per server for unlimited.
                </p>
              </div>
              <div className="hero-actions">
                <a className="btn btn-light btn-lg" href={site.inviteUrl}>
                  <DiscordIcon />
                  Add to Discord
                </a>
                <a className="btn btn-brand btn-lg" href={site.dashboardUrl}>
                  Open dashboard
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter current="home" />
      <Reveal />
    </>
  );
}
