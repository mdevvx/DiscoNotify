"use client";

import { useEffect, useState } from "react";
import { PulseLine } from "../Logo";

type Example = {
  key: string;
  platform: string;
  color: string;
  creator: string;
  avatar: string;
  action: string;
  title: string;
  sub: string;
  thumb: string;
  badge?: string;
  stat?: string;
  button: string;
};

const examples: Example[] = [
  {
    key: "yt",
    platform: "YouTube",
    color: "var(--yt)",
    creator: "Your Creator",
    avatar: "linear-gradient(135deg, #2d3a8c, #8a3cc4)",
    action: "is live now!",
    title: "Ranked grind, day 14 | come hang out",
    sub: "Your Creator is now live on YouTube!",
    thumb:
      "radial-gradient(120% 90% at 80% 10%, #ff7a59 0%, transparent 55%), radial-gradient(90% 80% at 10% 100%, #3b2bd1 0%, transparent 60%), #1b1440",
    badge: "LIVE",
    stat: "1,284 watching",
    button: "Watch on YouTube",
  },
  {
    key: "kick",
    platform: "Kick",
    color: "var(--kick)",
    creator: "StreamerName",
    avatar: "linear-gradient(135deg, #0e7a3a, #b6f23a)",
    action: "started streaming!",
    title: "Late night speedrun practice",
    sub: "StreamerName is now live on Kick!",
    thumb:
      "radial-gradient(110% 90% at 15% 15%, #53fc18 0%, transparent 50%), radial-gradient(90% 80% at 90% 90%, #0b6e4f 0%, transparent 60%), #0b1a12",
    badge: "LIVE",
    stat: "642 watching",
    button: "Watch on Kick",
  },
  {
    key: "ig",
    platform: "Instagram",
    color: "var(--ig)",
    creator: "creator.handle",
    avatar: "linear-gradient(135deg, #feda75, #d62976 55%, #4f5bd5)",
    action: "posted a new Reel!",
    title: "Behind the scenes of this week's shoot",
    sub: "creator.handle posted a new Reel on Instagram",
    thumb:
      "radial-gradient(100% 90% at 85% 15%, #feda75 0%, transparent 50%), radial-gradient(100% 90% at 10% 95%, #962fbf 0%, transparent 60%), #3b0f3a",
    badge: "REEL",
    button: "View on Instagram",
  },
  {
    key: "x",
    platform: "X",
    color: "var(--ink)",
    creator: "@creatorhandle",
    avatar: "linear-gradient(135deg, #3a3f4b, #0f1419)",
    action: "just posted on X!",
    title: "New video drops tonight at 8 PM. Who's ready?",
    sub: "@creatorhandle posted on X",
    thumb:
      "radial-gradient(100% 90% at 80% 20%, #4a5568 0%, transparent 55%), radial-gradient(90% 80% at 15% 90%, #1d2a3a 0%, transparent 60%), #0b0f14",
    badge: "POST",
    button: "View on X",
  },
  {
    key: "tt",
    platform: "TikTok",
    color: "#25f4ee",
    creator: "@creatorhandle",
    avatar: "linear-gradient(135deg, #25f4ee, #fe2c55)",
    action: "posted a new video!",
    title: "Day in my life as a creator #fyp",
    sub: "@creatorhandle posted a new video on TikTok",
    thumb:
      "radial-gradient(100% 90% at 85% 15%, #25f4ee 0%, transparent 50%), radial-gradient(100% 90% at 10% 95%, #fe2c55 0%, transparent 60%), #0b0b10",
    badge: "VIDEO",
    button: "Watch on TikTok",
  },
];

const INTERVAL = 4800;

export function AlertPreview() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % examples.length), INTERVAL);
    return () => window.clearInterval(t);
  }, [paused]);

  const ex = examples[i];

  return (
    <div
      className="preview"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="preview-glow" style={{ background: ex.color }} aria-hidden="true" />
      <div className="dc" aria-label={`Example DiscoNotify alert for ${ex.platform}`} role="group">
        <div className="dc-channel">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M10.9 3 9.8 9H5.9l-.4 2h3.9l-.8 4H4.7l-.4 2h3.9l-1.1 6h2l1.1-6h4l-1.1 6h2l1.1-6h3.9l.4-2h-3.9l.8-4h3.9l.4-2h-3.9l1.1-6h-2l-1.1 6h-4l1.1-6zm.3 8h4l-.8 4h-4z"
            />
          </svg>
          stream-alerts
        </div>
        <div className="dc-msg" key={ex.key}>
          <div className="dc-avatar" aria-hidden="true">
            <PulseLine />
          </div>
          <div className="dc-body">
            <div className="dc-head">
              <span className="dc-name">DiscoNotify</span>
              <span className="dc-tag">APP</span>
              <span className="dc-time">Today at 7:02 PM</span>
            </div>
            <p>
              <span className="dc-role">@Live Alerts</span>{" "}
              <span className="pulse-dot" style={{ color: ex.color }}>
                &#9679;
              </span>{" "}
              <strong>{ex.creator}</strong> {ex.action}
            </p>
            <div className="dc-container" style={{ borderLeftColor: ex.color }}>
              <div className="dc-author">
                <i aria-hidden="true" style={{ background: ex.avatar }} />
                {ex.creator}
              </div>
              <span className="dc-title">{ex.title}</span>
              <p className="dc-sub">{ex.sub}</p>
              <div className="dc-thumb" style={{ background: ex.thumb }} role="img" aria-label={`${ex.platform} thumbnail`}>
                {ex.badge && (
                  <span className="dc-live" data-kind={ex.badge.toLowerCase()}>
                    {ex.badge}
                  </span>
                )}
                {ex.stat && <span className="dc-viewers">{ex.stat}</span>}
              </div>
              <span className="dc-btn">
                {ex.button}
                <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14zM5 5h6v2H5v12h12v-6h2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2"
                  />
                </svg>
              </span>
              <span className="dc-foot">{ex.platform} &middot; Today at 7:02 PM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="preview-tabs" role="tablist" aria-label="Example platform">
        {examples.map((e, n) => (
          <button
            key={e.key}
            type="button"
            role="tab"
            aria-selected={n === i}
            className="preview-tab"
            onClick={() => setI(n)}
          >
            <i className="dot" style={{ background: e.color }} />
            {e.platform}
          </button>
        ))}
      </div>
      <p className="preview-note">Example alerts. The name and avatar are yours to change.</p>
    </div>
  );
}
