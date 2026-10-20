"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Guild } from "./api";

export function ServerIcon({ g, size = 40 }: { g: Guild; size?: number }) {
  const style = { width: size, height: size, borderRadius: Math.round(size * 0.3) };
  return g.icon ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="server-icon"
      style={style}
      src={`https://cdn.discordapp.com/icons/${encodeURIComponent(g.id)}/${encodeURIComponent(g.icon)}.png?size=64`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  ) : (
    <span className="server-icon server-icon-blank" style={{ ...style, fontSize: size * 0.42 }} aria-hidden="true">
      {g.name.slice(0, 1).toUpperCase()}
    </span>
  );
}

/** One short line under each server's name in the list. */
function shortState(g: Guild): { text: string; tone: "ok" | "wait" | "none" } {
  if (!g.bot) return { text: "DiscoNotify not added yet", tone: "none" };
  if (g.card_active) return { text: "Already subscribed", tone: "ok" };
  if (g.state === "whitelisted") return { text: "Free access", tone: "ok" };
  if (g.state === "paid") return { text: "Active", tone: "ok" };
  if (g.trial_days > 0 && (g.state === "trial" || g.state === "new")) {
    return { text: `Free trial: ${g.trial_days} day${g.trial_days === 1 ? "" : "s"} left`, tone: "wait" };
  }
  return { text: "No subscription", tone: "none" };
}

type Props = { guilds: Guild[]; value: string; onChange: (id: string) => void; labelId?: string };

/**
 * A themed dropdown with server icons, names and a status line, a search box and full keyboard support
 * (arrows, Home/End, Enter, Escape, type to filter). Works on phones: a tap opens it, a tap outside closes it.
 */
export function ServerSelect({ guilds, value, onChange, labelId }: Props) {
  const uid = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const selected = guilds.find((g) => g.id === value) ?? null;
  const q = query.trim().toLowerCase();
  const matches = guilds.filter((g) => !q || g.name.toLowerCase().includes(q));
  const withBot = matches.filter((g) => g.bot);
  const withoutBot = matches.filter((g) => !g.bot);
  const flat = [...withBot, ...withoutBot];
  const optionId = (g: Guild) => `${uid}-opt-${g.id}`;

  function openList() {
    const at = flat.findIndex((g) => g.id === value);
    setActive(at >= 0 ? at : 0);
    setOpen(true);
  }
  function closeList(refocus = true) {
    setOpen(false);
    setQuery("");
    if (refocus) trigger.current?.focus();
  }
  function choose(g: Guild) {
    onChange(g.id);
    closeList();
  }

  // Focus the search box when it opens; close on a click or tap outside.
  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const away = (e: MouseEvent | TouchEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) closeList(false);
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("touchstart", away);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("touchstart", away);
    };
  }, [open]);

  // Keep the highlighted row in view while moving with the keyboard.
  useEffect(() => {
    if (!open || !flat[active]) return;
    document.getElementById(optionId(flat[active]))?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  // The highlighted row must stay inside the filtered list.
  useEffect(() => {
    if (active >= flat.length) setActive(Math.max(0, flat.length - 1));
  }, [flat.length, active]);

  function onSearchKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (flat.length ? (i + 1) % flat.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(Math.max(0, flat.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flat[active]) choose(flat[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeList();
    } else if (e.key === "Tab") {
      closeList(false);
    }
  }

  function row(g: Guild) {
    const index = flat.indexOf(g);
    const st = shortState(g);
    return (
      <li
        key={g.id}
        id={optionId(g)}
        role="option"
        aria-selected={g.id === value}
        className={`opt${index === active ? " is-active" : ""}${g.id === value ? " is-selected" : ""}`}
        onMouseMove={() => index !== active && setActive(index)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => choose(g)}
      >
        <ServerIcon g={g} size={32} />
        <span className="opt-text">
          <span className="opt-name">{g.name}</span>
          <span className={`opt-sub opt-${st.tone}`}>{st.text}</span>
        </span>
        {g.id === value && (
          <svg className="opt-check" viewBox="0 0 24 24" aria-hidden="true">
            <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </li>
    );
  }

  return (
    <div className="select" ref={root}>
      <button
        ref={trigger}
        type="button"
        id={`${uid}-trigger`}
        className="select-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${uid}-list`}
        aria-labelledby={labelId ? `${labelId} ${uid}-trigger` : undefined}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            openList();
          }
        }}
      >
        {selected ? (
          <>
            <ServerIcon g={selected} size={28} />
            <span className="opt-text">
              <span className="opt-name">{selected.name}</span>
              <span className={`opt-sub opt-${shortState(selected).tone}`}>{shortState(selected).text}</span>
            </span>
          </>
        ) : (
          <span className="select-placeholder">Choose a server…</span>
        )}
        <svg className="select-caret" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="select-pop">
          {guilds.length > 6 && (
            <div className="select-search">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
                <path d="m16 16 4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              <input
                ref={search}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onSearchKey}
                placeholder="Search your servers"
                aria-label="Search your servers"
                aria-controls={`${uid}-list`}
                aria-activedescendant={flat[active] ? optionId(flat[active]) : undefined}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          )}
          {/* Without the search box, keep keyboard control on an invisible focus target. */}
          {guilds.length <= 6 && (
            <input
              ref={search}
              className="select-keys"
              readOnly
              aria-label="Servers"
              aria-controls={`${uid}-list`}
              aria-activedescendant={flat[active] ? optionId(flat[active]) : undefined}
              onKeyDown={onSearchKey}
            />
          )}
          <ul id={`${uid}-list`} role="listbox" aria-label="Your servers" className="select-list">
            {withBot.length > 0 && (
              <>
                <li role="presentation" className="opt-group">
                  DiscoNotify is in these
                </li>
                {withBot.map(row)}
              </>
            )}
            {withoutBot.length > 0 && (
              <>
                <li role="presentation" className="opt-group">
                  Add DiscoNotify first
                </li>
                {withoutBot.map(row)}
              </>
            )}
            {flat.length === 0 && (
              <li role="presentation" className="opt-empty">
                No servers match &ldquo;{query}&rdquo;
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
