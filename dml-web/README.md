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
5. `bun run seed` untuk membuat akun admin pertama beserta tiga artikel awal.
   Isi `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD` di `.env.local` lebih dulu.
   Script ini idempoten, jadi menjalankannya ulang aman.
6. `bun run dev`, buka `http://localhost:3000`

## Perintah penting

> **Postgres harus hidup sebelum `bun run build`, bukan hanya sebelum
> `bun run test:e2e`.** Sejak beranda memuat seksi Artikel Terbaru dan
> `sitemap.ts` menarik slug artikel, build melakukan query database. Di mesin
> dingin, `bun run check` akan gagal di tahap build dengan galat koneksi yang
> terbaca seperti bug kode. Jalankan lebih dulu:
> ```bash
> docker compose up -d
> until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
> ```
> `sitemap.ts` sendiri menangkap kegagalan query dan tetap memancarkan path
> statis, jadi build tidak jatuh karenanya. Yang jatuh adalah beranda.

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

## Artikel dan CMS

Artikel tinggal di koleksi `posts` Payload dan disunting lewat `/admin`.
Halaman korporat tidak berada di CMS; editor hanya menyentuh artikel.

Publikasi tidak butuh rebuild. Hook `afterChange` dan `afterDelete` memanggil
`revalidatePath` untuk `/artikel`, `/artikel/<slug>`, `/`, dan `/sitemap.xml`.
Slug lama ikut disegarkan saat slug berubah, supaya alamat lama tidak hidup
terus sebagai halaman hantu.

Seluruh query artikel wajib lewat `src/features/articles/queries.ts`. Local
API `payload.find()` memakai `overrideAccess: true` secara default, jadi
`access.read` di koleksi `posts` **tidak** melindungi Server Component.
Penyaringan `_status` ada di kode aplikasi, dan memusatkannya mencegah satu
pemanggil yang lupa lalu menayangkan draft.

### Tiga artikel awal menunggu review klien

`bun run seed` membuat tiga artikel: operasi ship-to-ship, ISM Code dan
ISO 9001:2015, serta berdirinya perusahaan pada 1988. Seluruh faktanya berasal
dari `src/content/` dan dari `assets/CP DML.pdf`, tapi **kalimatnya disusun
agen, bukan ditulis klien**, jadi teksnya menunggu persetujuan bersama copy
Visi dan Misi.

Kalau klien menolak, hapus artikelnya dari `/admin`. Hook revalidasi
membersihkan jejaknya dari `/artikel`, beranda, dan sitemap tanpa deploy
ulang. Tidak ada teks itu yang tertanam di dalam `src/`.

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

## Deployment

Aplikasi dibungkus image Docker multi-stage berbasis bun, memakai keluaran
`standalone` Next. Coolify menjalankan `docker-compose.prod.yml`.

### Yang wajib diisi

Compose membaca `.env` di `dml-web/`. Yang berbeda dari pengembangan:

- `NEXT_PUBLIC_SITE_URL` adalah **build arg**, bukan sekadar env runtime.
  Nilai `NEXT_PUBLIC_` diinlinekan ke bundle saat build. Menyetelnya hanya
  sebagai env runtime menghasilkan seluruh canonical dan URL gambar OG
  menunjuk localhost, sementara situsnya sendiri tetap terlihat normal. Kalau
  domain berubah, **image harus dibangun ulang**, bukan cuma di-restart.
- `DATABASE_URI` memakai nama service `postgres`, bukan `localhost`.
- `PAYLOAD_UPLOAD_DIR` diset compose ke `/app/uploads` dan dipetakan ke volume
  `payload-uploads`. Jangan mengubahnya tanpa mengubah pemetaan volumenya.

### Urutan deploy

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Service `migrate` berjalan lebih dulu sebagai job satu kali dan harus keluar
dengan status nol sebelum `app` naik. Kalau migrasi gagal, aplikasi tidak
pernah start. Itu perilaku yang disengaja: aplikasi yang hidup di atas skema
yang salah jauh lebih berbahaya daripada container yang menolak start dengan
log yang jelas.

Migrasi berjalan lewat `bun run migrate` (`scripts/migrate.ts`), BUKAN CLI
resmi `payload migrate`. CLI-nya gagal deterministik di image
`oven/bun:1.3.14-slim` karena bug tsx yang tidak tertambal di bawah runtime
bun (payloadcms/payload#16949); `scripts/migrate.ts` memanggil API terprogram
Payload langsung dan dijalankan lewat bundel satu berkas, menghindari bug itu
sekaligus race sirkular `@lexical/react` yang sama dengan `scripts/seed.ts`.

### Seed pertama kali

Di instalasi baru, buka `/admin` dan buat akun pertama lewat
`create-first-user`, atau jalankan `bun run seed` dari dalam image builder
dengan `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD` terisi.

### Backup volume upload

Basis data punya jalur backup sendiri lewat `pg_dump`. Upload tidak, dan ia
tidak pernah ada di git:

```bash
docker run --rm -v dml-web_payload-uploads:/data -v "$PWD":/backup \
  alpine tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

### Pindah ke S3 kalau klien menyediakan bucket

**Ini dokumentasi, bukan jalur yang pernah dijalankan di repo ini.** Langkahnya:
pasang `@payloadcms/storage-s3`, daftarkan plugin-nya di `payload.config.ts`
dengan `collections: { media: true }`, isi kredensial bucket lewat environment,
lalu pindahkan isi volume `payload-uploads` ke bucket sebelum mematikan
pemetaan volumenya. Selama migrasi belum tuntas, jangan mencabut volumenya:
dokumen media menyimpan nama berkas, bukan isinya.

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
