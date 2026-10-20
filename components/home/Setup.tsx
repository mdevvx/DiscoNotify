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
          <p>You need the Manage Server permission to configure DiscoNotify.</p>
        </div>

        <ol className="steps">
          <li className="step reveal">
            <h3>Add the bot</h3>
            <p>
              Invite DiscoNotify to your server. Keep the Manage Webhooks permission so alerts can post under your own
              name and avatar.
            </p>
          </li>
          <li className="step reveal">
            <h3>Add an account</h3>
            <p>
              Run <code>/disconotify account-add</code>, pick the platform, paste the handle or link and choose the
              channel. A role to mention is optional.
            </p>
          </li>
          <li className="step reveal">
            <h3>Fine-tune the alerts</h3>
            <p>
              Use <code>/disconotify alerts</code> to pick alert types, and set a custom message or mention whenever you
              like. Each command opens a form with your current settings.
            </p>
          </li>
        </ol>

        <div className="template reveal">
          <div>
            <p className="eyebrow">Custom message</p>
            <h3 className="template-title">Say it your way</h3>
            <p className="template-copy">
              Set this with <code>/disconotify account-set-message</code>, for every alert or just one type. Leave it
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
              <span>account-set-message</span>
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
