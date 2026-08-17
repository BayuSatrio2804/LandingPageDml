import Link from "next/link";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export default function NotFound() {
  return (
    <html lang="id" className={`${fontVariables} antialiased`}>
      <body className="flex min-h-dvh flex-col items-center justify-center bg-surface px-4 text-center text-ink">
        <p className="font-mono text-sm text-ink-muted">404</p>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-3 max-w-[45ch] text-ink-muted">
          Halaman yang dicari mungkin sudah pindah atau alamatnya salah ketik.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
        >
          Kembali ke beranda
        </Link>
      </body>
    </html>
  );
}
