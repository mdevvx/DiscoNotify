import type { ReactNode } from "react";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const features: { title: string; body: ReactNode; icon: ReactNode }[] = [
  {
    title: "One alert per event",
    body: "Every upload and stream is checked against a record of what was already announced. A restart in the middle of a stream won't post it again.",
    icon: <path {...stroke} d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4" />,
  },
  {
    title: "Your own message",
    body: (
      <>
        Write the alert text yourself with placeholders like <code>{"{creator}"}</code> and <code>{"{url}"}</code>.
        Set one for all alerts or a different one per alert type, right on the dashboard.
      </>
    ),
    icon: <path {...stroke} d="M4 6h16M4 12h10M4 18h7" />,
  },
  {
    title: "Ping the right people",
    body: "Mention a role, @everyone or nobody. Choose differently for uploads and streams on the same account.",
    icon: (
      <>
        <circle cx="12" cy="12" r="4" {...stroke} />
        <path {...stroke} d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1" />
      </>
    ),
  },
  {
    title: "Titles can't ping your server",
    body: 'Text that comes from a platform, like a video title containing "@everyone", is escaped. Only the mentions you configure ever go out.',
    icon: <path {...stroke} d="M12 3 4 6v6c0 4.5 3.4 8.2 8 9 4.6-.8 8-4.5 8-9V6z" />,
  },
  {
    title: "Your name and avatar",
    body: "Alerts post through a channel webhook. Rename it and give it any avatar in Discord's channel settings, and every alert follows.",
    icon: (
      <>
        <circle cx="12" cy="8" r="4" {...stroke} />
        <path {...stroke} d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
      </>
    ),
  },
  {
    title: "Choose what gets announced",
    body: "Turn each alert type on or off per account on the dashboard: new video, Short, post, live start and end with game and viewer count.",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" {...stroke} />
        <path {...stroke} d="M3 10h18M9 4v16" />
      </>
    ),
  },
  {
    title: "Rich alert cards",
    body: "Each alert is a card in the platform's colour with the title, description, full-size thumbnail, a watch button and a timestamp in every viewer's own timezone.",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" {...stroke} />
        <path {...stroke} d="m3 15 5-4 4 3 3-2 6 4" />
      </>
    ),
  },
  {
    title: "No setup commands",
    body: "Add accounts, pick channels and roles, and switch alert types on or off on the dashboard. Sign in securely with Discord.",
    icon: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" {...stroke} />
        <path {...stroke} d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
  },
  {
    title: "Every server kept separate",
    body: "Each server's accounts, channels and settings are isolated from every other server, down to the database.",
    icon: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" {...stroke} />
        <rect x="14" y="3" width="7" height="7" rx="1.5" {...stroke} />
        <rect x="3" y="14" width="7" height="7" rx="1.5" {...stroke} />
        <rect x="14" y="14" width="7" height="7" rx="1.5" {...stroke} />
      </>
    ),
  },
];

export function Features() {
  return (
    <section className="section" id="features">
      <div className="wrap">
        <div className="section-head reveal">
          <p className="eyebrow">Features</p>
          <h2>Built for servers that care about the details</h2>
          <p>Sensible defaults out of the box: uploads, Shorts, posts and stream starts are on; stream-ended alerts are off until you want them.</p>
        </div>
        <div className="features">
          {features.map((f, n) => (
            <article className="feature reveal" key={f.title} style={{ transitionDelay: `${(n % 3) * 70}ms` }}>
              <span className="feature-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {f.icon}
                </svg>
              </span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
