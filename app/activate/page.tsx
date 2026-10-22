import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Activate } from "@/components/billing/Activate";

export const metadata: Metadata = {
  title: "Start your free trial",
  description: "Log in with Discord to start your DiscoNotify free trial.",
  robots: { index: false },
};

export default function ActivatePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Activate />
      </main>
      <SiteFooter current="subscribe" />
    </>
  );
}
