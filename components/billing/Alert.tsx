import type { ReactNode } from "react";

type Tone = "success" | "warning" | "error";

const icons: Record<Tone, ReactNode> = {
  success: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  warning: <path d="M12 8v5M12 16.5v.5" />,
  error: <path d="M7 7l10 10M17 7 7 17" />,
};

/** Success, warning or error message, the same three states the bot's spec asks for. */
export function Alert({ tone, title, children }: { tone: Tone; title: string; children?: ReactNode }) {
  return (
    <div className={`alert alert-${tone}`} role={tone === "error" ? "alert" : "status"}>
      <span className="alert-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          {icons[tone]}
        </svg>
      </span>
      <div className="alert-body">
        <p className="alert-title">{title}</p>
        {children && <div className="alert-text">{children}</div>}
      </div>
    </div>
  );
}
