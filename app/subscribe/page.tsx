import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Subscribe } from "@/components/billing/Subscribe";

export const metadata: Metadata = {
  title: "Subscribe",
  description: "Subscribe your Discord server to DiscoNotify by card or crypto.",
  robots: { index: false },
};

export default function SubscribePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Subscribe />
      </main>
      <SiteFooter current="subscribe" />
    </>
  );
}
