const commands = [
    {
        cmd: "dashboard",
        desc: "Open the dashboard for this server: accounts, alert channel, mentions, alert types, custom messages and billing.",
        perm: "Manage Server",
    },
    {
        cmd: "status",
        desc: "See the plan and health of every followed account: its channel, whether it's live, and when it was last checked and last alerted.",
        perm: "Everyone",
    },
    { cmd: "help", desc: "Show what DiscoNotify can do and where to set it up.", perm: "Everyone" },
];

export function Commands() {
    return (
        <section className="section" id="commands">
            <div className="wrap">
                <div className="section-head reveal">
                    <p className="eyebrow">Commands</p>
                    <h2>Just three commands</h2>
                    <p>
                        Everything else is configured on the dashboard.
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
