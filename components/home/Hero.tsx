import Link from "next/link";
import { site } from "@/lib/site";
import { ArrowIcon, DiscordIcon } from "../Icons";
import { AlertPreview } from "./AlertPreview";

const facts = [
  { value: "30s", label: "fastest check" },
  { value: "5", label: "platforms live today" },
  { value: `${site.price.trialDays} days`, label: "free trial" },
  { value: `${site.price.currency}${site.price.amount}`, label: `per server / ${site.price.period}` },
];

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true" />
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <p className="hero-badge">
            <span className="live-dot" aria-hidden="true" />
            Discord alerts for creators
          </p>
          <h1>
            The moment your creators <em>upload, post or go live.</em>
          </h1>
          <p className="lede">
            DiscoNotify watches YouTube, Kick, Instagram, X and TikTok accounts and posts an alert in your Discord channel when
            they upload, post a Reel or start a stream. Built for speed, with checks as often as every 30 seconds. Set it up with one slash command.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary btn-lg" href={site.inviteUrl}>
              <DiscordIcon />
              Add to Discord
            </a>
            <Link className="btn btn-brand btn-lg" href="/activate">
              Start free trial
            </Link>
            <a className="hero-link" href="#setup">
              See how it works
              <ArrowIcon />
            </a>
          </div>
          <div className="hero-meta">
            <span>
              <i className="dot" style={{ background: "var(--yt)" }} />
              YouTube
            </span>
            <span>
              <i className="dot" style={{ background: "var(--kick)" }} />
              Kick
            </span>
            <span>
              <i className="dot" style={{ background: "var(--ig)" }} />
              Instagram
            </span>
            <span>
              <i className="dot" style={{ background: "var(--ink)" }} />
              X
            </span>
            <span>
              <i className="dot" style={{ background: "#25f4ee" }} />
              TikTok
            </span>
            <span>{site.price.trialDays}-day free trial, no card needed</span>
          </div>
        </div>

        <AlertPreview />
      </div>

      <div className="wrap">
        <dl className="facts">
          {facts.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
