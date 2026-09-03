import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { buildMetadata } from "@/lib/seo/metadata";
import { SmoothScrollProvider } from "@/components/motion/smooth-scroll-provider";
import { SkipLink } from "@/components/layout/skip-link";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { localBusinessJsonLd, organizationJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { getCompanyProfile } from "@/lib/cms/company";
import { getAccentRamp } from "@/lib/cms/appearance";
import { themeStyleBlock } from "@/lib/theme-presets";
import "../globals.css";

export const metadata: Metadata = buildMetadata({
  title: "PT Dutabahari Menara Line",
  description:
    "Perusahaan pelayaran Banjarmasin sejak 1988. Transportasi BBM, penyeberangan ro-ro, dan perawatan kapal.",
  path: "/",
});

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [company, accentRamp] = await Promise.all([getCompanyProfile(), getAccentRamp()]);
  const themeCss = themeStyleBlock(accentRamp);
  return (
    <html lang="id" className={`${fontVariables} h-full antialiased`}>
      {/*
        min-h-dvh, bukan min-h-full. Task 6 mengeset "html.lenis, html.lenis
        body { height: auto }" (globals.css) begitu Lenis aktif. Aturan itu
        selektornya lebih spesifik dari utility h-full milik <html>, jadi
        tinggi <html> jatuh ke auto begitu Lenis mount, dan min-height
        berbasis persentase (min-h-full) pada body kehilangan containing
        block yang definit untuk dihitung. Satuan viewport (dvh) langsung
        merujuk ke viewport, tidak lewat rantai tinggi <html>, jadi tidak
        kena efek itu. Footer terbukti tidak terkunci ke dasar viewport
        dengan min-h-full begitu class "lenis" nempel di <html>.
      */}
      <body className="min-h-dvh flex flex-col">
        {themeCss ? (
          /*
            Override CSS var keluarga aksen sesuai preset global `appearance`.
            Datang setelah globals.css jadi menang atas nilai @theme bawaan
            pada spesifisitas :root yang sama. Tidak dirender untuk preset
            navy (nilainya sudah sama dengan bawaan).
          */
          <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        ) : null}
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
            __html: safeJsonLdString(organizationJsonLd(company)),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLdString(localBusinessJsonLd(company)),
          }}
        />
      </body>
    </html>
  );
}
