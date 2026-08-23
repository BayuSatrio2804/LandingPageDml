import Link from "next/link";

/**
 * TANPA <html>/<body> di sini, disengaja. Berkas ini melayani notFound()
 * yang dilempar dari dalam segmen (site)/** (mis. /artikel/[slug] untuk
 * slug yang tidak ada) -- Next memilih not-found.js terdekat di pohon
 * segmen tempat notFound() dilempar, jadi berkas ini dipakai, BUKAN
 * app/not-found.tsx. Ia dirender di dalam pohon (site)/layout.tsx yang
 * sudah menyuplai <html>/<body>; mendefinisikan ulang keduanya di sini
 * memicu <html>/<body> ganda yang lolos di HTML hasil render server tapi
 * mengosongkan konten setelah hydration React di klien (Next diam-diam
 * menggabungkan pembungkus ganda saat SSR, tapi hydration tidak).
 *
 * app/not-found.tsx tetap ada terpisah untuk URL yang tidak cocok segmen
 * mana pun sama sekali (mis. /halaman-yang-tidak-ada) -- kasus itu tidak
 * dibungkus (site)/layout.tsx, jadi butuh dokumen <html>/<body> sendiri.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface px-4 text-center text-ink">
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
    </div>
  );
}
