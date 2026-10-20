"use client";

import { useEffect } from "react";

/** Fades `.reveal` elements in as they scroll into view. Content stays visible without JS (see `html.js` in globals.css). */
export function Reveal() {
  useEffect(() => {
    const pending = new Set(document.querySelectorAll<HTMLElement>(".reveal:not(.in)"));
    const show = (el: Element) => {
      el.classList.add("in");
      pending.delete(el as HTMLElement);
    };

    // Backup for the observer: reveal anything already on (or above) the screen,
    // e.g. after jumping to an anchor link or a fast scroll.
    let frame = 0;
    const sweep = () => {
      frame = 0;
      const limit = window.innerHeight * 0.95;
      pending.forEach((el) => {
        if (el.getBoundingClientRect().top < limit) show(el);
      });
      if (pending.size === 0) cleanup();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sweep);
    };

    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              for (const e of entries) {
                if (e.isIntersecting) {
                  show(e.target);
                  io?.unobserve(e.target);
                }
              }
            },
            { rootMargin: "0px 0px -5% 0px", threshold: 0 }
          )
        : null;
    pending.forEach((el) => io?.observe(el));

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("hashchange", onScroll);
    const timer = window.setTimeout(sweep, 400);
    sweep();

    function cleanup() {
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("hashchange", onScroll);
      window.clearTimeout(timer);
      if (frame) cancelAnimationFrame(frame);
    }
    return cleanup;
  }, []);

  return null;
}
