import Link from "next/link";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

/**
 * Ini fallback GLOBAL untuk URL yang tidak cocok segmen mana pun (mis.
 * /halaman-yang-tidak-ada), bukan untuk notFound() yang dilempar dari dalam
 * (site)/**. Repo ini tidak punya satu app/layout.tsx tunggal -- (payload)
 * dan (site) masing-masing punya root layout sendiri -- jadi persis skenario
 * yang didokumentasikan Next 16 (not-found.md) untuk kenapa file ini tetap
 * mendefinisikan <html>/<body> sendiri: tidak ada satu layout yang bisa
 * membungkusnya untuk path yang benar-benar tidak cocok segmen mana pun.
 *
 * notFound() yang dilempar dari dalam (site)/** (mis. slug artikel yang
 * tidak ada) dilayani oleh (site)/not-found.tsx, BUKAN berkas ini -- Next
 * memilih not-found.js terdekat di pohon segmen tempat notFound() dilempar.
 * Lihat komentar di (site)/not-found.tsx untuk kenapa berkas itu sengaja
 * TIDAK mendefinisikan <html>/<body> sendiri.
 */
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
