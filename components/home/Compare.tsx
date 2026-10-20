import { site } from "@/lib/site";

// Left column: what alert bots commonly do. Right column: what DiscoNotify does (from the bot's README).
const rows: { them: string; us: string }[] = [
  {
    them: "Checks every 5 to 15 minutes",
    us: "Checks as often as every 30 seconds",
  },
  {
    them: "Can repeat an alert after a restart",
    us: "One alert per event, remembered across restarts",
  },
  {
    them: "A video titled \"@everyone\" can ping your whole server",
    us: "Titles are escaped. Only the mentions you set ever go out",
  },
  {
    them: "Posts under the bot's own name and avatar",
    us: "Posts under your own name and avatar",
  },
  {
    them: "One fixed message for every alert",
    us: "Your own text with placeholders, per alert type",
  },
  {
    them: "Platforms split into separate paid tiers",
    us: `Every platform included for ${site.price.currency}${site.price.amount} a ${site.price.period}`,
  },
  {
    them: "Card only, and paying means a long form",
    us: "Card or crypto, with a free 7-day trial and no card needed",
  },
];

function Cross() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="cmp-icon cmp-no">
      <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

function Tick() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="cmp-icon cmp-yes">
      <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Compare() {
  return (
    <section className="section" id="compare">
      <div className="wrap">
        <div className="section-head reveal">
          <p className="eyebrow">Why DiscoNotify</p>
          <h2>Faster than the usual alert bots</h2>
          <p>
            Most alert bots check slowly, repeat themselves and lock you into their branding. DiscoNotify was built to
            fix each of those.
          </p>
        </div>

        <div className="cmp reveal">
          <div className="cmp-col cmp-them">
            <p className="cmp-title">Typical alert bots</p>
            <p className="cmp-sub">Slow, generic, locked in</p>
            <ul>
              {rows.map((r) => (
                <li key={r.them}>
                  <Cross />
                  <span>{r.them}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="cmp-col cmp-us">
            <p className="cmp-title">DiscoNotify</p>
            <p className="cmp-sub">Fast, yours, flat price</p>
            <ul>
              {rows.map((r) => (
                <li key={r.us}>
                  <Tick />
                  <span>{r.us}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="cmp-note">Comparison reflects common behaviour of alert bots and varies by product.</p>
      </div>
    </section>
  );
}
