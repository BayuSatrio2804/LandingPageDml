import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { SmoothScrollProvider } from "@/components/motion/smooth-scroll-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "PT Dutabahari Menara Line",
  description:
    "Perusahaan pelayaran Banjarmasin sejak 1985. Transportasi BBM, penyeberangan ro-ro, dan galangan kapal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
