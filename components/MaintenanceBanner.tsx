"use client";

import { useEffect, useState } from "react";
import { api } from "./billing/api";
import { site } from "@/lib/site";

/** Shows a notice while the admin panel's Maintenance switch is on. Any failure means no banner. */
export function MaintenanceBanner() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!site.billingApi) return;
    let live = true;
    api<{ maintenance?: boolean }>({ action: "status" })
      .then((r) => live && setOn(r.maintenance === true))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  // Always mounted so it can slide open (and closed) instead of popping in and shifting the page.
  return (
    <div className={`maintenance-wrap${on ? " is-open" : ""}`} role="status" aria-hidden={!on}>
      <div className="maintenance-clip">
        <div className="maintenance">
          DiscoNotify is undergoing maintenance. Alerts may be delayed. We will be back shortly.
        </div>
      </div>
    </div>
  );
}
