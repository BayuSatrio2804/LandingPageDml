"use client";

import { fontVariables } from "@/lib/fonts";
import "./globals.css";

/**
 * Boundary untuk error yang terjadi DI DALAM root layout itu sendiri. Ia
 * wajib merender <html> dan <body> sendiri, karena layout yang gagal tidak
 * sempat menyediakan keduanya. Bentuknya sengaja mengikuti not-found.tsx,
 * yang punya kendala yang persis sama.
 *
 * Ia tidak bisa memakai SiteHeader atau SiteFooter: keduanya hidup di dalam
 * layout yang barusan gagal.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id" className={`${fontVariables} antialiased`}>
      <body className="flex min-h-dvh flex-col items-center justify-center bg-surface px-4 text-center text-ink">
        <p className="font-mono text-sm text-ink-muted">Galat</p>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
          Situs sedang bermasalah
        </h1>
        <p className="mt-3 max-w-[45ch] text-ink-muted">
          Coba muat ulang beberapa saat lagi.
        </p>
        {error.digest ? (
          <p className="mt-4 font-mono text-xs text-ink-muted">Kode: {error.digest}</p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
        >
          Coba lagi
        </button>
      </body>
    </html>
  );
}
