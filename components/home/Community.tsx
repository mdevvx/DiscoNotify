import { site } from "@/lib/site";
import { DiscordIcon } from "../Icons";

const perks = [
  "Help setting up alerts, messages and mentions",
  "Announcements about new platforms and updates",
  "Request features and report bugs directly",
];

export function Community() {
  return (
    <section className="section" id="support">
      <div className="wrap">
        <div className="community reveal">
          <div className="community-copy">
            <p className="eyebrow">Support</p>
            <h2>Real help, right inside Discord</h2>
            <p>Join the DiscoNotify server to get help with setup, ask questions and talk to us directly.</p>
            <ul>
              {perks.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <div className="hero-actions">
              <a className="btn btn-discord btn-lg" href={site.supportServer} rel="noopener">
                <DiscordIcon />
                Join the support server
              </a>
              <a className="btn btn-ghost btn-lg" href={`mailto:${site.supportEmail}`}>
                Email us
              </a>
            </div>
          </div>
          <div className="community-art" aria-hidden="true">
            <DiscordIcon size={120} />
          </div>
        </div>
      </div>
    </section>
  );
}
