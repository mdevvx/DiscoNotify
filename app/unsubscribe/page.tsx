import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Unsubscribe } from "@/components/billing/Unsubscribe";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false },
};

export default function UnsubscribePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Unsubscribe />
      </main>
      <SiteFooter current="subscribe" />
    </>
  );
}
