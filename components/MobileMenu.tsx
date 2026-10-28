"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Props = { links: { href: string; label: string }[]; supportUrl: string };

/** Hamburger menu shown under 760px, where the inline nav links are hidden. */
export function MobileMenu({ links, supportUrl }: Props) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) =>
            e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    return (
        <div className="mobile-menu">
            <button
                type="button"
                className="theme-toggle"
                aria-expanded={open}
                aria-controls="mobile-menu-panel"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((o) => !o)}
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                >
                    {open ? (
                        <path d="M6 6l12 12M18 6 6 18" />
                    ) : (
                        <path d="M4 7h16M4 12h16M4 17h16" />
                    )}
                </svg>
            </button>
            <nav
                id="mobile-menu-panel"
                className="menu-panel"
                aria-label="Mobile"
                hidden={!open}
            >
                {links.map((l) => (
                    <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setOpen(false)}
                    >
                        {l.label}
                    </Link>
                ))}
                <a
                    href={supportUrl}
                    rel="noopener"
                    onClick={() => setOpen(false)}
                >
                    Support Server
                </a>
            </nav>
        </div>
    );
}
