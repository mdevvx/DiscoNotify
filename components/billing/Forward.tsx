"use client";

import { useEffect } from "react";

/** Sends old /pay links to the new page, keeping a signed link token if there is one. */
export function Forward({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to + window.location.search);
  }, [to]);
  return null;
}
