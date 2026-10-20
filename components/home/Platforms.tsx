type Cell = string | null; // text when supported, null when not offered

type Platform = {
  name: string;
  color: string;
  uploads: Cell;
  short: Cell;
  liveStart: Cell;
  liveEnd: Cell;
  speed: string;
};

const available: Platform[] = [
  { name: "YouTube", color: "var(--yt)", uploads: "Videos", short: "Shorts", liveStart: "Yes", liveEnd: "Yes", speed: "From 30s" },
  { name: "Kick", color: "var(--kick)", uploads: null, short: null, liveStart: "Yes", liveEnd: "Yes", speed: "Every 30s" },
  { name: "Instagram", color: "var(--ig)", uploads: "Posts", short: "Reels", liveStart: null, liveEnd: null, speed: "From 30s" },
  { name: "X (Twitter)", color: "var(--ink)", uploads: "Posts", short: null, liveStart: null, liveEnd: null, speed: "From 60s" },
  { name: "TikTok", color: "#25f4ee", uploads: "Videos", short: null, liveStart: null, liveEnd: null, speed: "About 2 min" },
];

const testing: Platform[] = [
  { name: "Twitch", color: "#9146ff", uploads: null, short: null, liveStart: "Yes", liveEnd: "Yes", speed: "Soon" },
];

const notes = [
  {
    title: "YouTube",
    color: "var(--yt)",
    text: "Premieres are announced as new videos when they start. Scheduled streams are tracked quietly and announced the moment they go live.",
    limits: "Community posts (no official API).",
  },
  {
    title: "Instagram",
    color: "var(--ig)",
    text: "Works with public Business and Creator accounts.",
    limits: "Personal accounts, Stories and Instagram Live (not available through the official API).",
  },
  {
    title: "X (Twitter)",
    color: "var(--ink)",
    text: "Original posts and quote posts from any public account.",
    limits: "Reposts, replies, and private or suspended accounts.",
  },
  {
    title: "TikTok",
    color: "#25f4ee",
    text: "New videos from public accounts, with the creator's name and avatar, the caption, the cover image and a Watch on TikTok button. If a creator changes their username, add the account again.",
    limits: "Live streams, slideshows, stories and private accounts.",
  },
  {
    title: "Check speed",
    color: "var(--signal)",
    text: "Kick is always checked every 30 seconds. YouTube and Instagram start at 30 seconds and X at 60 seconds. New TikTok videos usually appear within 2 minutes. Checks stretch as more accounts are followed across all servers, to stay inside each platform's limits.",
    limits: null,
    wide: true,
  },
];

function Td({ value, label }: { value: Cell; label: string }) {
  return value ? (
    <td className="yes" data-label={label}>
      <span className="check" aria-hidden="true" />
      {value}
    </td>
  ) : (
    <td className="nah" data-label={label}>
      Not offered
    </td>
  );
}

function Row({ p, status }: { p: Platform; status: "ok" | "wait" }) {
  return (
    <tr>
      <th scope="row">
        <i className="dot" style={{ background: p.color }} />
        {p.name}
      </th>
      <Td value={p.uploads} label="Uploads and posts" />
      <Td value={p.short} label="Shorts and Reels" />
      <Td value={p.liveStart} label="Stream goes live" />
      <Td value={p.liveEnd} label="Stream ends" />
      <td className="speed" data-label="Checked">
        {p.speed}
      </td>
      <td className="status" data-label="Status">
        {status === "ok" ? (
          <span className="pill pill-ok">Available</span>
        ) : (
          <span className="pill pill-wait">Coming soon</span>
        )}
      </td>
    </tr>
  );
}

export function Platforms() {
  return (
    <section className="section" id="platforms">
      <div className="wrap">
        <div className="section-head reveal">
          <p className="eyebrow">Platforms</p>
          <h2>What DiscoNotify can watch</h2>
          <p>
            Public accounts only, and creators never need to connect anything. Two servers following the same creator
            share one check, so adding servers never slows anyone down.
          </p>
        </div>

        <div className="matrix-wrap reveal">
          <table className="matrix">
            <thead>
              <tr>
                <th scope="col">Platform</th>
                <th scope="col">New uploads and posts</th>
                <th scope="col">Shorts and Reels</th>
                <th scope="col">Stream goes live</th>
                <th scope="col">Stream ends</th>
                <th scope="col">Checked</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {available.map((p) => (
                <Row key={p.name} p={p} status="ok" />
              ))}
              <tr className="grp">
                <th scope="row" colSpan={7}>
                  In testing
                </th>
              </tr>
              {testing.map((p) => (
                <Row key={p.name} p={p} status="wait" />
              ))}
            </tbody>
          </table>
        </div>

        <ul className="matrix-notes reveal">
          {notes.map((n) => (
            <li key={n.title} className={n.wide ? "note-wide" : undefined}>
              <h3>
                <i className="dot" style={{ background: n.color }} />
                {n.title}
              </h3>
              <p>{n.text}</p>
              {n.limits && (
                <p className="note-limit">
                  <span>Not covered</span>
                  {n.limits}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
