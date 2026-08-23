"use client";

import Link from "next/link";

/**
 * Boundary untuk seluruh halaman publik. Ia tetap berada di dalam layout
 * situs, jadi header dan footer bertahan dan pengunjung tidak terdampar di
 * halaman tanpa navigasi.
 *
 * error.message TIDAK ditampilkan. Pesan error Next bisa memuat path berkas
 * dan detail internal. digest justru dirancang untuk dikutip pengunjung ke
 * tim teknis, jadi itu yang ditampilkan.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[1400px] flex-col items-center justify-center px-4 py-16 text-center md:px-8">
      <p className="font-mono text-sm text-ink-muted">Galat</p>
      <h1 className="mt-2 font-display text-pretty text-3xl font-bold text-ink md:text-4xl">
        Ada yang salah di halaman ini
      </h1>
      <p className="mt-3 max-w-[50ch] text-ink-muted">
        Kami sudah mencatatnya. Coba muat ulang halaman ini, atau kembali ke beranda.
      </p>
      {error.digest ? (
        <p className="mt-4 font-mono text-xs text-ink-muted">Kode: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
        >
          Coba lagi
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-line px-6 py-3 text-sm font-medium text-accent transition-colors hover:border-accent hover:bg-accent-soft"
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
