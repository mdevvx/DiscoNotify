import { site } from "@/lib/site";
import { ArrowIcon, DiscordIcon } from "../Icons";
import { AlertPreview } from "./AlertPreview";

const facts = [
  { value: "30s", label: "fastest check" },
  { value: "6", label: "platforms live today" },
  { value: "Free", label: "1 account per platform" },
  { value: `${site.price.currency}${site.price.amount}`, label: `per server / ${site.price.period} for more` },
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
            Discord alerts the moment your creators <em>post or go live.</em>
          </h1>
          <p className="lede">
            YouTube, Twitch, Kick, Instagram, X and TikTok. Set it up in a minute on the dashboard, free for one
            account per platform.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary btn-lg" href={site.inviteUrl}>
              <DiscordIcon />
              Add to Discord
            </a>
            <a className="btn btn-brand btn-lg" href={site.dashboardUrl}>
              Open dashboard
            </a>
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
              <i className="dot" style={{ background: "#9146ff" }} />
              Twitch
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
            <span>Free for 1 account per platform, no card needed</span>
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
