# Plan 3 — Beranda final (ditarik maju dari Plan 5)

## 1. Konteks dan keputusan

Roadmap semula (dicatat di `docs/superpowers/specs/2026-08-16-dml-corporate-design.md` dan
`docs/superpowers/plans/2026-08-17-dml-plan-2.md`) menaruh beranda sinematik di Plan 5, setelah
`/bisnis/*` (Plan 3 lama) dan sistem artikel (Plan 4 lama). Keputusan baru: beranda ditarik maju
jadi **Plan 3**, karena semua dependency teknisnya (hook motion, metadata builder, JSON-LD
helper, data perusahaan, komponen `Reveal`) sudah selesai di Plan 1, dan prioritas bisnis adalah
beranda final rilis secepat mungkin. `/bisnis/*` dan sistem artikel (Payload Articles
collection) mundur ke plan setelah ini.

Plan 1 (`docs/superpowers/plans/2026-08-16-dml-foundation.md`) dan Plan 2
(`docs/superpowers/plans/2026-08-17-dml-plan-2.md`) sudah selesai di branch `feat/dml-foundation`
(commit `daeeac6`), lihat `.superpowers/sdd/2026-08-17-dml-plan-2/progress.md` untuk ledger
lengkap.

## 2. Scope

**Masuk scope Plan 3:**
- Task 0: triage 5 item deferred dari Plan 2 (lihat §3).
- 8 dari 9 seksi beranda per master spec §7 (seksi 8 "Artikel" ditunda, lihat §4).
- Pipeline aset gambar/video untuk seksi 1, 2, 3 (belum ada sama sekali, lihat §6).
- Riset/estimasi data spesifikasi 5 kelas kapal untuk 3D fleet comparator (lihat §5).
- Dependency baru: `three`, `@react-three/fiber`, `@react-three/drei`.

**Di luar scope Plan 3** (plan susulan):
- `/bisnis` dan tiga halaman `/bisnis/<slug>`.
- `/bisnis/transportasi-bbm/permintaan-informasi` (form Permintaan Informasi Bisnis, extend
  `inquirySchema`).
- Payload Articles collection dan `/artikel`, `/artikel/[slug]`.
- Seksi 8 beranda ("Artikel terbaru") — ditambahkan begitu Articles collection ada.

## 3. Task 0 — triage Plan 2

Gate wajib sebelum kerja beranda dimulai, sesuai `.superpowers/sdd/2026-08-17-dml-plan-2/progress.md`
baris 51-55 dan Task 16 baris 35:

1. **Satu sumber nomor WhatsApp.** `/kontak` pakai env var `WHATSAPP_NUMBER`, `/karier` pakai
   `COMPANY.phone` — dua sumber yang kebetulan sama, tidak ditegakkan. Satukan jadi satu sumber
   (rekomendasi: `COMPANY.phone` sebagai satu-satunya sumber, `/kontak` membaca dari sana, env
   var `WHATSAPP_NUMBER` dihapus atau diturunkan dari `COMPANY.phone` di build time — implementer
   memutuskan pendekatan teknis persis saat menulis task).
2. **Dokumentasi setup.** `README.md` masih teks stock `create-next-app`. Isi instruksi fresh
   clone: `docker compose up -d`, `.env.local` (variabel apa saja wajib diisi), `bun run payload
   migrate`, `bun run dev`. `docker-compose.yml` dapat healthcheck Postgres supaya
   `docker compose up -d && bun run payload migrate` tidak race start-up container.
3. **404 top-level.** `app/layout.tsx` sudah dihapus (Plan 2, merge multiple-root-layouts). Tidak
   ada `not-found.tsx` di manapun di `src/app/`, jadi 404 bawaan Next render dokumen kosong tanpa
   `lang`, tanpa CSS/font situs. Tambah `src/app/not-found.tsx` dengan `<html lang="id">`/`<body>`
   sendiri (root-level, di luar route group manapun) meniru struktur `(site)/layout.tsx`.
4. **Rate limiter x-forwarded-for.** Accepted tradeoff dari review Plan 2 (spoofable, tapi worst
   case cuma spam row yang masih kena honeypot/zod). **No action** di Plan 3.
5. **Login `/admin` + read-only `inquiries` UI.** Belum pernah diverifikasi lewat browser
   sungguhan di sesi manapun (tidak ada browser tool tersedia). **Bukan task otomatis** — perlu
   kamu verifikasi manual sebelum atau selama Plan 3, dicatat di sini supaya tidak hilang.

## 4. Seksi beranda

Mengikuti `docs/superpowers/specs/2026-08-16-dml-corporate-design.md` §7.1–§7.7 dan §7.9 apa
adanya (hero pinned orbit malam, potong ke siang, tiga lini bisnis sticky-stack, fleet 3D
comparator, peta rute ro-ro, silsilah horizontal-pan, sertifikasi dan angka, CTA dan footer).
§7.10 (larangan: marquee, custom cursor, scroll cue, dst.) dan §7.8 (artikel) dari master spec
tetap berlaku sebagai referensi, dengan delta berikut:

### Delta 1 — seksi 8 (Artikel) ditunda
Tidak ada Payload Articles collection (baru ada `Users`, `Media`, `Inquiries`). Beranda Plan 3
punya 8 seksi aktif: Hero → Siang → Lini Bisnis → Fleet 3D → Peta Rute → Silsilah → Sertifikasi →
CTA/Footer. Seksi Artikel ditambahkan sebagai task terpisah begitu sistem artikel ada, tidak
menunggu re-approval desain beranda.

### Delta 2 — CTA primer sementara ke `/kontak`
Master spec §7.9 dan baris 661 menetapkan CTA primer (hero, seksi lini bisnis, footer) mengarah
ke `/bisnis/transportasi-bbm/permintaan-informasi`, yang belum dibangun. Selama halaman itu belum
ada, seluruh CTA primer beranda mengarah ke `/kontak` (live, form inquiry sudah berfungsi).
Implementer menandai lokasi CTA ini dengan komentar kode yang jelas (mis.
`// TODO(plan-bisnis): arahkan ke /bisnis/transportasi-bbm/permintaan-informasi setelah dibangun`)
supaya penggantian target nanti tinggal satu perubahan string, bukan re-desain.

### Delta 3 — kartu lini bisnis (seksi 3) tanpa link individual
Tiga kartu lini bisnis tampil penuh (foto, judul, deskripsi) tanpa `href` aktif ke
`/bisnis/<slug>` — halaman itu belum ada. Kartu boleh diberi penanda visual "Segera Hadir" kalau
desain butuh, tapi tidak wajib; yang wajib adalah kartu tidak mengarah ke URL yang 404. Diaktifkan
(ditambah link) begitu halaman `/bisnis/<slug>` masing-masing dibangun.

### Silsilah (seksi 6) — tidak ada delta
`/tentang-kami#silsilah` sudah ada dari Plan 2, link section 6 ke sana dipasang apa adanya sesuai
master spec.

## 5. Data fleet untuk seksi 4 (3D Fleet Blueprint Comparator)

Master spec §7.4 minta garis ukur per kelas kapal (panjang, kapasitas, DWT, kapasitas penumpang)
untuk lima kelas. Data yang ada sekarang di `src/content/company.ts` cuma agregat
(`fleetSummary: { vessels: 15, totalDwt: 40546 }`) dan di master spec §1 kategori umum (motor
tanker s.d. 8 juta liter, oil barge s.d. 4,7 juta liter, SPOB s.d. 1,6 juta liter, tugboat, KMP
Jambo ro-ro) — bukan rincian per kelas yang dibutuhkan.

Proses: riset dulu ke sumber publik sejenis yang sudah dipakai (SinarAlam Corporation,
ptdml.com, MagicPort, arsip Banjarmasin Post) untuk data real per kelas. Kalau tidak ditemukan,
isi estimasi wajar dan tandai `// unverified: <alasan/sumber>` di kode, mengikuti konvensi yang
sudah berjalan di `company.ts` — wajib dikonfirmasi klien sebelum situs live, sama seperti
`founder`, `foundedIso`, dan `fleetSummary` sekarang.

Struktur data baru dibutuhkan di `src/content/` (tipe baru di `types.ts`, mis. `FleetClass` array
berisi nama kelas, panjang, kapasitas, DWT, kapasitas penumpang, alt text) — jadi satu sumber yang
dibaca oleh ketiga representasi (geometri R3F desktop, 5 blueprint SVG statis mobile, tabel teks
screen reader), sesuai master spec baris 369-375.

## 6. Pipeline aset

Belum ada sama sekali di repo (`scripts/prepare-assets.ts`, `src/lib/media/manifest.ts`,
`public/media/` kosong). Dibangun di Plan 3 sesuai master spec §9:

1. Ekstrak `assets/*.zip` (`KAPAL KAPAL.zip`, `STS 06 JULI 2025.zip`, `STS SRI YULIANI.zip`, total
   842 MB) ke `assets/_raw/` (masuk `.gitignore`, tidak pernah di-commit).
2. Kurasi manual ~25-30 frame lewat `src/lib/media/manifest.ts` — nama file, peruntukan, alt text
   Indonesia eksplisit per frame, bukan digenerate.
3. Sharp menghasilkan AVIF + WebP di lebar 640/1080/1600/2400.
4. Strip EXIF (koordinat GPS presisi di file DJI — risiko lokasi operasi STS/terminal klien
   terekspos).
5. Commit hanya turunan ke `public/media/`.

Cluster frame yang sudah diverifikasi kontinu (master spec baris 466-469): hero malam
`DJI_0811`–`DJI_0820` (05:36–05:38, dari `STS SRI YULIANI.zip`), cadangan siang
`DJI_0707`–`DJI_0711`. Wide anchorage untuk seksi 2 (`DJI_0710`) dari cluster siang yang sama.

## 7. Dependency baru

`package.json` belum punya `three`, `@react-three/fiber`, `@react-three/drei` — ditambah untuk
seksi 4. `gsap`, `lenis`, komponen `Reveal` (`src/components/motion/reveal.tsx`), dan hook
`usePrefersReducedMotion` sudah tersedia dari Plan 1, dipakai ulang tanpa perubahan.

## 8. Testing dan acceptance

Ikut master spec §14, discope ke 8 seksi aktif (seksi Artikel tidak diuji karena tidak ada):
- Playwright: beranda dengan `prefers-reduced-motion: reduce` — seluruh konten (termasuk 8 seksi
  aktif) tetap tampil tanpa motion.
- Playwright, JavaScript dimatikan — semua teks dan link 8 seksi aktif tetap hadir di HTML server.
- Playwright, kontras token — tidak ada elemen `--color-accent` dengan teks `--color-ink`.
- axe-core di beranda.
- Lighthouse mobile-throttled: LCP < 2,5 detik, CLS < 0,1, skor SEO ≥ 95.
- `bun run doctor` dijalankan per milestone task (bukan cuma di akhir), sesuai catatan master spec
  soal `useEffect`/`ScrollTrigger`/`useFrame` di banyak client leaf.
- Vitest: manifest media, util motion (kalau ada helper baru), builder metadata/JSON-LD kalau
  beranda menambah pemakaian baru.
- `bun run check` (lint, typecheck, test, build, doctor, lighthouse) sebagai gerbang akhir sebelum
  task ditutup, sama seperti Plan 2.

## 9. Follow-up yang tercatat, bukan hilang

- Redirect CTA primer dari `/kontak` ke
  `/bisnis/transportasi-bbm/permintaan-informasi` begitu halaman itu ada (§4 Delta 2).
- Aktifkan link kartu lini bisnis begitu `/bisnis/<slug>` ada (§4 Delta 3).
- Tambah seksi 8 (Artikel) begitu Payload Articles collection ada.
- Verifikasi manual login `/admin` + `inquiries` read-only via browser (§3 item 5).
- Konfirmasi klien atas seluruh data `// unverified` (termasuk data fleet kelas baru di §5).
