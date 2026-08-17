# dml-web

Situs company profile PT Dutabahari Menara Line. Next.js 16.3 App Router, Payload CMS 3 (Postgres), Tailwind v4.

## Setup fresh clone

1. `bun install`
2. Salin `.env.example` jadi `.env.local`, isi setiap variabel (lihat komentar di file itu).
3. `docker compose up -d` dan tunggu healthcheck Postgres lolos sebelum lanjut:
   ```bash
   docker compose up -d
   until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
   ```
4. `bun run payload migrate`
5. `bun run dev`, buka `http://localhost:3000`

## Perintah penting

- `bun run check`: lint, typecheck, test, build, doctor berurutan. Gerbang wajib sebelum deploy.
- `bun run test:e2e`: Playwright, butuh `bun run build && bun run start` (otomatis lewat `playwright.config.ts`).
- `bun run payload migrate`: jalankan migrasi Payload. Jangan pernah mengandalkan dev-mode schema push, lihat `payload.config.ts` (`push: false`).

## Struktur

- `src/app/(site)/`: halaman publik.
- `src/app/(payload)/`: admin panel Payload di `/admin`.
- `src/payload/`: config dan collection Payload.
- `src/features/`: logika per fitur (form inquiry; seksi beranda menyusul).
- `src/content/`: data korporat hardcoded, wajib ditandai `// unverified: <sumber>` untuk angka yang belum dikonfirmasi klien.
