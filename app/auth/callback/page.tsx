import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AuthCallback } from "@/components/billing/AuthCallback";

export const metadata: Metadata = {
  title: "Signing in",
  robots: { index: false },
};

export default function AuthCallbackPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <AuthCallback />
      </main>
      <SiteFooter current="subscribe" />
    </>
  );
}
