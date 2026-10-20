import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Forward } from "@/components/billing/Forward";

export const metadata: Metadata = {
  title: "Subscribe",
  robots: { index: false },
};

export default function PayPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Forward to="/subscribe" />
        <section className="pay">
          <div className="wrap narrow">
            <p>
              Taking you to the <Link href="/subscribe">subscribe page</Link>…
            </p>
          </div>
        </section>
      </main>
      <SiteFooter current="subscribe" />
    </>
  );
}
