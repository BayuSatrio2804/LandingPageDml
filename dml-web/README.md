# dml-web

Situs company profile PT Dutabahari Menara Line. Next.js 16.3 App Router, Payload CMS 3 (Postgres), Tailwind v4.

## Setup fresh clone

> Repo ini memakai bun, dan hanya bun. `package.json` menetapkan
> `packageManager: bun@1.3.14`. Jangan menjalankan `npm install` atau `yarn`
> di sini — lockfile yang dihasilkannya diabaikan git dan menghasilkan pohon
> dependency yang berbeda dari yang dipakai anggota tim lain.

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
- `bun run test:e2e`: Playwright. **Postgres harus berjalan lebih dulu**, kalau tidak
  `kontak.spec.ts` gagal dengan timeout yang terbaca seperti bug UI padahal server
  action-nya yang tidak bisa menyentuh database:
  ```bash
  docker compose up -d
  until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
  bun run test:e2e
  ```
  Build dan start dijalankan otomatis oleh `playwright.config.ts`, jadi tidak perlu
  menjalankannya sendiri.
- `bun run lighthouse`: Lighthouse CI mobile-preset terhadap `/`. Ambang `largest-contentful-paint` di `lighthouserc.json` diset 5000ms, bukan target ideal 2500ms dari rencana awal, karena sudah diverifikasi langsung (Plan 3 Task 17) bahwa 2500ms tidak tercapai bahkan dengan seluruh 9 frame crossfade hero dihilangkan (LCP dasar halaman ini ~4100ms di lingkungan sandbox build-time yang dipakai untuk pengujian, dengan throttling mobile-slow-4G simulasi lhci). Artinya bottleneck bukan animasi hero, melainkan lantai performa halaman/lingkungan itu sendiri. Kalau nanti diukur ulang di infra produksi sungguhan dan hasilnya jauh lebih baik, ambang ini boleh diperketat kembali.
- `bun run payload migrate`: jalankan migrasi Payload. Jangan pernah mengandalkan dev-mode schema push, lihat `payload.config.ts` (`push: false`).

## Rate limit dan proxy

Dua form publik (`/kontak` dan `/bisnis/transportasi-bbm/permintaan-informasi`)
memakai rate limiter in-memory yang mengunci per alamat klien. Alamat itu
diambil dari `x-forwarded-for` pada posisi `TRUSTED_PROXY_HOPS` **dihitung dari
kanan**, bukan dari entri paling kiri yang sepenuhnya dikendalikan klien.

Setel `TRUSTED_PROXY_HOPS` sesuai jumlah proxy yang benar-benar berada di depan
aplikasi: `1` untuk satu reverse proxy, `2` kalau ada CDN di depannya. Menyetel
angka terlalu besar membuat kunci jatuh ke nilai yang bisa dipalsukan, yang
mengembalikan persis bug yang diperbaiki Plan 8.

Limiter ini in-memory per instance dan tidak tahan deploy multi-instance.
Batas sungguhan terhadap penyalahgunaan tetap ada di lapisan infrastruktur.

## Struktur

- `src/app/(site)/`: halaman publik — beranda, bisnis (hub, transportasi BBM,
  penyeberangan ro-ro, permintaan informasi), kontak, karier, tentang kami.
- `src/app/(payload)/`: admin panel Payload di `/admin`.
- `src/payload/`: config dan collection Payload.
- `src/features/home/`: seksi beranda, satu file per seksi.
- `src/features/inquiry/`: form kontak, skema validasi, server action, rate limiter.
- `src/features/route-map/`, `src/features/fleet/`: data dan komponen peta rute serta armada.
- `src/content/vessels.ts`: 66 nama kapal dari company profile halaman 04,
  dijaga tes konsistensi silang terhadap `vesselCount` di `fleet.ts` dan
  `ROUTE_LEGS` di `ports.ts`. Kalau ketiganya tidak lagi cocok, yang salah
  hampir pasti data baru, bukan `fleet.ts` yang sudah diverifikasi di Plan 5.
- `src/content/legal-documents.ts`: tabel dokumen legal dari company profile
  halaman 06, tayang di `/tentang-kami#profil`.
- `src/content/`: data korporat hardcoded. Setiap angka wajib menyebut sumbernya di
  komentar; `SourceTag` membedakan `cp-pdf`, `riset-publik`, dan `belum-terverifikasi`.
- `src/lib/`: token warna, manifest media, util motion, SEO.
- `scripts/`: pipeline aset sekali-jalan (foto, peta, model 3D, placeholder sertifikasi).

## Angka armada yang masih menunggu konfirmasi klien

Company profile menulis ringkasan 64 kapal (9 ro-ro + 55 pengangkut BBM), tapi
daftar nama kapal di halaman yang sama memuat 66: ro-ro cocok di angka 9,
sedangkan daftar pengangkut BBM berisi 57, bukan 55. Seluruh selisih dua kapal
ada di sisi BBM.

`COMPANY.fleetSummary` memakai angka ringkasan; `VESSELS` di `vessels.ts`
memakai hasil hitung daftar. Tidak ada satu pun tempat di situs yang
menjumlahkan `VESSELS` lalu menampilkannya bersebelahan dengan angka ringkasan,
jadi kedua angka tidak pernah tampil saling membantah. Begitu klien
mengonfirmasi angka yang benar, samakan keduanya dan perbarui
`vessels.test.ts`.

Satu nama, `OB Sahoya 0`, terbaca terpotong di PDF dan ditandai
`belum-terverifikasi`. Jangan menebaknya jadi "Sahoya 04".

Dimensi kapal (panjang, lebar, DWT) tidak ada di company profile sama sekali
dan seluruhnya masih estimasi proporsional. Halaman lini BBM menyatakan ini di
bawah tabel spesifikasinya, bukan cuma di komentar kode.

## Menukar placeholder sertifikasi dengan logo resmi

Tiga berkas di `public/assets/cert/` saat ini adalah placeholder yang dibangkitkan
`bun run prepare:cert-placeholders`, bukan logo resmi. Begitu klien mengirim asetnya:

1. Timpa `iso-9001.png`, `ism-code.png`, dan `hsse.png` dengan berkas asli. Kalau nama
   berkasnya berbeda, perbarui `assetPath` di `src/content/certifications.ts` — jangan
   menyunting `hero.tsx`, daftar itu tidak lagi tinggal di sana.
2. Sesuaikan `width`/`height` di `hero-copy.tsx` kalau rasio aset asli bukan 3:2.
3. Jalankan `bun run test src/content/certifications.test.ts`. Tes itu menggagalkan build
   kalau ada `assetPath` yang menunjuk berkas yang tidak ada — bug persis itu yang membuat
   tiga gambar rusak tayang di produksi sebelum Plan 6.
4. HSSE masih bertanda `belum-terverifikasi` di `certifications.ts`. Kalau klien
   mengonfirmasi statusnya, ubah `source`-nya jadi `cp-pdf` dan tambahkan entrinya ke
   `COMPANY.standards`; kalau klien mencoretnya, hapus entrinya dari `CERT_BADGES`.
