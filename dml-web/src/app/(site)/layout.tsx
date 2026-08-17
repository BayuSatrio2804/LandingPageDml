import { SmoothScrollProvider } from "@/components/motion/smooth-scroll-provider";
import { SkipLink } from "@/components/layout/skip-link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { organizationJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <SmoothScrollProvider>
        <SiteHeader />
        <main id="konten-utama" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </SmoothScrollProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdString(organizationJsonLd()),
        }}
      />
    </>
  );
}
