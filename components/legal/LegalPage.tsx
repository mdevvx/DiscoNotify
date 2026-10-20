import type { ReactNode } from "react";
import { site } from "@/lib/site";
import { SiteHeader } from "../SiteHeader";
import { SiteFooter } from "../SiteFooter";

export type LegalSection = { id: string; title: string; body: ReactNode };

type Props = {
  page: "terms" | "privacy" | "refund";
  title: string;
  intro: string;
  sections: LegalSection[];
};

export function LegalPage({ page, title, intro, sections }: Props) {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <div className="wrap">
          <header className="legal-hero">
            <p className="eyebrow">Legal</p>
            <h1>{title}</h1>
            <p>{intro}</p>
            <div className="legal-meta">
              <span>
                <strong>Effective:</strong> {site.legalUpdated}
              </span>
              <span>
                <strong>Last updated:</strong> {site.legalUpdated}
              </span>
            </div>
          </header>

          <div className="legal">
            <aside className="toc" aria-label="On this page">
              <p className="eyebrow">On this page</p>
              <ol>
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}>{s.title}</a>
                  </li>
                ))}
              </ol>
            </aside>

            <article className="prose">
              {sections.map((s) => (
                <section id={s.id} key={s.id}>
                  <h2>{s.title}</h2>
                  {s.body}
                </section>
              ))}
            </article>
          </div>
        </div>
      </main>
      <SiteFooter current={page} />
    </>
  );
}

/** Contact block shared by every legal page. */
export function ContactCard() {
  return (
    <div className="callout">
      <p>
        <strong>Email:</strong> {site.supportEmail}
      </p>
      <p>
        <strong>Discord:</strong>{" "}
        <a href={site.supportServer} rel="noopener">
          DiscoNotify support server
        </a>
      </p>
    </div>
  );
}
