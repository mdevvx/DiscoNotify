const commands = [
    {
        cmd: "account-add",
        desc: "Start following a YouTube, Kick, Instagram, X or TikTok account and choose where its alerts go.",
        perm: "Manage Server",
    },
    {
        cmd: "account-remove",
        desc: "Stop following an account. Asks you to confirm first, and nothing is deleted if you don't.",
        perm: "Manage Server",
    },
    {
        cmd: "account-list",
        desc: "List the accounts this server follows.",
        perm: "Everyone",
    },
    {
        cmd: "account-info",
        desc: "Show every alert setting for one account, including its custom message.",
        perm: "Everyone",
    },
    {
        cmd: "alerts",
        desc: "Turn alert types and full cards on or off for an account.",
        perm: "Manage Server",
    },
    {
        cmd: "account-set-message",
        desc: "Write your own alert text with placeholders.",
        perm: "Manage Server",
    },
    {
        cmd: "account-set-mention",
        desc: "Choose a role, @everyone or nobody to ping.",
        perm: "Manage Server",
    },
    {
        cmd: "status",
        desc: "See your subscription and every followed account: its channel, who gets pinged, whether it's live, and when it was last checked and last alerted.",
        perm: "Everyone",
    },
    {
        cmd: "subscribe",
        desc: "See your trial or subscription and get a link to subscribe on the website, by card or crypto.",
        perm: "Manage Server",
    },
    {
        cmd: "cancel",
        desc: "See what cancelling means for this server and get a link to cancel on the website.",
        perm: "Manage Server",
    },
    {
        cmd: "toggle",
        desc: "Pause or resume all monitoring and alerts in this server.",
        perm: "Manage Server",
    },
    { cmd: "help", desc: "List every command.", perm: "Everyone" },
];

export function Commands() {
    return (
        <section className="section" id="commands">
            <div className="wrap">
                <div className="section-head reveal">
                    <p className="eyebrow">Commands</p>
                    <h2>Everything lives under /notify</h2>
                    <p>
                        Run <code>/notify help</code> in your server for
                        the full list.
                    </p>
                </div>
                <div className="cmd-wrap reveal">
                    <table className="cmds">
                        <thead>
                            <tr>
                                <th scope="col">Command</th>
                                <th scope="col">What it does</th>
                                <th scope="col">Who can use</th>
                            </tr>
                        </thead>
                        <tbody>
                            {commands.map((c) => (
                                <tr key={c.cmd}>
                                    <td>
                                        <code>/notify {c.cmd}</code>
                                    </td>
                                    <td>{c.desc}</td>
                                    <td
                                        className="perm"
                                        data-label="Who can use"
                                    >
                                        {c.perm}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
