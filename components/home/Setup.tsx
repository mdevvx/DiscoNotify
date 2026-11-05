const placeholders = [
  "{creator}",
  "{title}",
  "{description}",
  "{url}",
  "{platform}",
  "{category}",
  "{viewers}",
  "{mention}",
];

// Example template, split into plain text and {placeholder} parts so placeholders can be highlighted.
const example = "Hey {mention}, {creator} just went live\non {platform} playing {category}!\n{viewers} people are already watching.\n{url}";

function Highlighted({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\{[a-z]+\})/g).map((part, i) =>
        /^\{[a-z]+\}$/.test(part) ? (
          <span key={i} className="ph">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

export function Setup() {
  return (
    <section className="section" id="setup">
      <div className="wrap">
        <div className="section-head reveal">
          <p className="eyebrow">Setup</p>
          <h2>Running in under two minutes</h2>
          <p>Everything is set up on the dashboard. You need the Manage Server permission for the server you configure.</p>
        </div>

        <ol className="steps">
          <li className="step reveal">
            <h3>Add DiscoNotify</h3>
            <p>
              Invite DiscoNotify to your server. Keep the Manage Webhooks permission so alerts can post under your own
              name and avatar.
            </p>
          </li>
          <li className="step reveal">
            <h3>Open the dashboard</h3>
            <p>
              Run <code>/notify dashboard</code> or go to the dashboard, log in with Discord and pick your server.
            </p>
          </li>
          <li className="step reveal">
            <h3>Add accounts</h3>
            <p>
              Add accounts and choose where alerts go. Mentions, messages and alert types are all on the dashboard.
            </p>
          </li>
        </ol>

        <div className="template reveal">
          <div>
            <p className="eyebrow">Custom message</p>
            <h3 className="template-title">Say it your way</h3>
            <p className="template-copy">
              Set this on the dashboard, for every alert or just one type. Leave it
              empty to go back to the default. Unknown placeholders are left as plain text, so a typo never breaks an
              alert.
            </p>
            <div className="chips" aria-label="Available placeholders">
              {placeholders.map((p) => (
                <code key={p}>{p}</code>
              ))}
            </div>
          </div>
          <div className="code-card">
            <div className="code-bar" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>custom message</span>
            </div>
            <pre className="code" aria-label="Example custom message">
              <Highlighted text={example} />
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
