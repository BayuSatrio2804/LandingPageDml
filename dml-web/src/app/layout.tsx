import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { buildMetadata } from "@/lib/seo/metadata";
import "./globals.css";

export const metadata: Metadata = buildMetadata({
  title: "PT Dutabahari Menara Line",
  description:
    "Perusahaan pelayaran Banjarmasin sejak 1985. Transportasi BBM, penyeberangan ro-ro, dan galangan kapal.",
  path: "/",
});

export default function RootLayout({ children }: LayoutProps<"/">) {
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
      <body className="min-h-dvh flex flex-col">{children}</body>
    </html>
  );
}
