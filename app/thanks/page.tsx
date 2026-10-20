import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Thanks } from "@/components/billing/Thanks";

export const metadata: Metadata = {
  title: "Payment",
  robots: { index: false },
};

export default function ThanksPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Thanks />
      </main>
      <SiteFooter current="subscribe" />
    </>
  );
}
