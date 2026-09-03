# Deploy ke Vercel + Neon + Cloudflare R2

Jalur deploy gratis: Next.js/Payload di **Vercel**, Postgres di **Neon**,
penyimpanan upload di **Cloudflare R2**. Semua punya free tier tanpa kartu
kredit.

Repo tetap mendukung jalur Docker (`docker-compose.prod.yml`) tanpa
perubahan: kalau `R2_BUCKET` kosong, media disimpan di disk lokal seperti
sebelumnya.

---

## 1. Neon (database)

1. Daftar di <https://neon.tech> (bisa lewat GitHub).
2. **Create project** → pilih region terdekat (Singapore / `ap-southeast-1`).
3. Di halaman project, buka **Connection Details**. Ada dua string:
   - **Pooled** (`...-pooler.<region>.aws.neon.tech`) → dipakai aplikasi di Vercel.
   - **Direct** (tanpa `-pooler`) → dipakai untuk migrate & seed dari laptop.
   Keduanya diakhiri `?sslmode=require`. Simpan dua-duanya.

## 2. Cloudflare R2 (penyimpanan upload)

1. Daftar di <https://dash.cloudflare.com>. Buka menu **R2**. Aktivasi R2
   minta kartu tapi tidak menagih selama di bawah 10 GB / bulan. Kalau tidak
   mau sama sekali, lihat catatan "Tanpa kartu" di bawah.
2. **Create bucket**, misalnya `dml-web-media`. Region: Automatic.
3. Bucket → **Settings** → **Public Development URL** → **Enable**. Salin
   URL-nya (`https://pub-<hash>.r2.dev`). Ini `R2_PUBLIC_URL`.
4. R2 → **Manage API Tokens** → **Create API Token**:
   - Permissions: **Object Read & Write**
   - Bucket: batasi ke bucket tadi
   - Buat, lalu salin **Access Key ID**, **Secret Access Key**, dan
     **endpoint** `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.

## 3. Migrasi + seed dari laptop (sekali, sebelum deploy pertama)

Buat file `dml-web/.env.local` (tidak ikut git) berisi:

```
NEXT_PUBLIC_SITE_URL=https://<domain-produksi-atau-nama>.vercel.app
DATABASE_URI=<Neon DIRECT string>
PAYLOAD_SECRET=<string acak panjang — nilai yang SAMA dipakai di Vercel>
SEED_ADMIN_EMAIL=redaksi@dutabaharimenaraline.co.id
SEED_ADMIN_PASSWORD=<sandi panjang acak>
R2_BUCKET=dml-web-media
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<...>
R2_SECRET_ACCESS_KEY=<...>
R2_PUBLIC_URL=https://pub-<hash>.r2.dev
```

Lalu:

```bash
cd dml-web
bun install
bun run migrate   # buat skema di Neon
bun run seed      # buat admin, kategori, klien, sertifikasi, armada,
                  # dokumen legal, company profile, navigasi, 3 artikel;
                  # meng-upload gambarnya ke R2
```

`bun run seed` idempoten — aman diulang, tidak menimpa yang sudah disunting.

## 4. Vercel

1. Daftar di <https://vercel.com> lewat GitHub.
2. **Add New… → Project** → import `BayuSatrio2804/LandingPageDml`.
3. **Root Directory**: `dml-web`. Framework: Next.js (terdeteksi otomatis).
   Build & install command biarkan default (Vercel memakai bun dari
   `packageManager` + `bun.lock`).
4. **Environment Variables** (Production + Preview):

   | Nama | Nilai |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://<domain>` (dibaca **saat build**, wajib benar) |
   | `DATABASE_URI` | Neon **POOLED** string |
   | `PAYLOAD_SECRET` | string acak yang **sama** dengan langkah 3 |
   | `TRUSTED_PROXY_HOPS` | `1` |
   | `R2_BUCKET` | `dml-web-media` |
   | `R2_ENDPOINT` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
   | `R2_ACCESS_KEY_ID` | dari langkah 2 |
   | `R2_SECRET_ACCESS_KEY` | dari langkah 2 |
   | `R2_PUBLIC_URL` | `https://pub-<hash>.r2.dev` |
   | `SEED_ADMIN_EMAIL` | sama dengan langkah 3 (opsional di runtime) |
   | `SEED_ADMIN_PASSWORD` | sama dengan langkah 3 (opsional di runtime) |

5. **Deploy**. Setelah selesai, buka `/` dan `/admin` (login pakai kredensial
   seed).

### Setelah domain sendiri siap

Tambahkan domain di Vercel **Settings → Domains**, lalu ubah
`NEXT_PUBLIC_SITE_URL` ke domain itu dan **redeploy** (nilainya di-inline
saat build, tidak cukup diganti runtime).

---

## Catatan

- **Migrasi saat runtime**: `prodMigrations` di `payload.config.ts` juga
  jalan otomatis saat cold start. Karena langkah 3 sudah menerapkannya, ini
  jadi no-op. Kalau nanti ada migrasi baru, jalankan `bun run migrate` ke
  Neon lagi sebelum deploy supaya tidak mengandalkan cold start.
- **Tanpa kartu sama sekali**: ganti R2 dengan **Vercel Blob** (`Storage →
  Create → Blob`) dan adapter `@payloadcms/storage-vercel-blob`, atau
  **Supabase Storage** (S3-compatible, endpoint `https://<ref>.supabase.co/
  storage/v1/s3`). Struktur env-nya sama; hanya `R2_ENDPOINT` /
  `R2_PUBLIC_URL` yang berbeda.
- **Ukuran function**: Payload admin + `sharp` cukup besar. Kalau deploy
  gagal karena batas 250 MB, pindahkan resize gambar ke `sharp` versi
  layer atau kecilkan dependency 3D yang tidak dipakai di server.
