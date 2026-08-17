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

- `bun run check`: lint, typecheck, test, build, doctor, lighthouse berurutan. Gerbang wajib sebelum deploy. Menjalankan `next build && next start` penuh plus satu run Lighthouse CI, jadi berdurasi beberapa menit, bukan loop cepat harian.
- `bun run test:e2e`: Playwright, butuh `bun run build && bun run start` (otomatis lewat `playwright.config.ts`).
- `bun run lighthouse`: Lighthouse CI mobile-preset terhadap `/`. Ambang `largest-contentful-paint` di `lighthouserc.json` diset 5000ms, bukan target ideal 2500ms dari rencana awal — diverifikasi langsung (Plan 3 Task 17) bahwa 2500ms tidak tercapai bahkan dengan seluruh 9 frame crossfade hero dihilangkan (LCP dasar halaman ini ~4100ms di lingkungan sandbox build-time yang dipakai untuk pengujian, dengan throttling mobile-slow-4G simulasi lhci). Artinya bottleneck bukan animasi hero, melainkan lantai performa halaman/lingkungan itu sendiri. Kalau nanti diukur ulang di infra produksi sungguhan dan hasilnya jauh lebih baik, ambang ini boleh diperketat kembali.
- `bun run payload migrate`: jalankan migrasi Payload. Jangan pernah mengandalkan dev-mode schema push, lihat `payload.config.ts` (`push: false`).

## Struktur

- `src/app/(site)/`: halaman publik.
- `src/app/(payload)/`: admin panel Payload di `/admin`.
- `src/payload/`: config dan collection Payload.
- `src/features/`: logika per fitur (form inquiry; seksi beranda menyusul).
- `src/content/`: data korporat hardcoded, wajib ditandai `// unverified: <sumber>` untuk angka yang belum dikonfirmasi klien.
