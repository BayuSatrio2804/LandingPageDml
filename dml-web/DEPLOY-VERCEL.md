# Deploy ke Vercel + Neon + Vercel Blob

Jalur deploy gratis tanpa kartu kredit: Next.js/Payload di **Vercel**,
Postgres di **Neon**, penyimpanan upload di **Vercel Blob**.

Repo tetap mendukung jalur Docker (`docker-compose.prod.yml`) tanpa
perubahan: kalau `BLOB_READ_WRITE_TOKEN` kosong, media disimpan di disk
lokal seperti sebelumnya.

---

## 1. Neon (database)

1. Daftar di <https://neon.tech> (bisa lewat GitHub).
2. **Create project** → region terdekat (Singapore / `ap-southeast-1`).
3. Buka **Connection Details**. Ada dua bentuk string:
   - **Pooled** (`...-pooler.<region>.aws.neon.tech`) → untuk aplikasi di Vercel.
   - **Direct** (tanpa `-pooler`) → untuk migrate & seed dari laptop.
   Keduanya diakhiri `?sslmode=require`. Simpan dua-duanya.

## 2. Vercel: project + Blob store

1. Daftar di <https://vercel.com> lewat GitHub.
2. **Add New… → Project** → import `BayuSatrio2804/LandingPageDml`.
   - **Root Directory**: `dml-web`
   - Framework: Next.js (terdeteksi). Build/install command biarkan default
     (Vercel memakai bun dari `packageManager` + `bun.lock`).
   - **Jangan klik Deploy dulu** — set env dulu (langkah 4). Kalau terlanjur,
     nanti tinggal redeploy.
3. Di project itu: **Storage → Create Database → Blob → Create**. Setelah
   jadi, **Connect Project** ke project ini (semua environment). Vercel
   otomatis menambah `BLOB_READ_WRITE_TOKEN` ke Environment Variables.

## 3. Migrasi + seed dari laptop (sekali, sebelum deploy pertama)

Ambil token Blob: di Vercel **Storage → <blob store> → `.env.local` tab**,
salin `BLOB_READ_WRITE_TOKEN`.

Buat file `dml-web/.env.local` (tidak ikut git):

```
NEXT_PUBLIC_SITE_URL=https://<nama-project>.vercel.app
DATABASE_URI=<Neon DIRECT string>
PAYLOAD_SECRET=<string acak panjang — nilai yang SAMA dipakai di Vercel>
SEED_ADMIN_EMAIL=redaksi@dutabaharimenaraline.co.id
SEED_ADMIN_PASSWORD=<sandi panjang acak>
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxx
```

Lalu:

```bash
cd dml-web
bun install
bun run migrate   # buat skema di Neon
bun run seed      # buat admin + kategori + klien + sertifikasi + armada +
                  # dokumen legal + company profile + navigasi + 3 artikel,
                  # dan meng-upload gambarnya ke Vercel Blob
```

`bun run seed` idempoten — aman diulang, tidak menimpa yang sudah disunting.

Cek: setelah seed, di Vercel **Storage → <blob store> → Browser** harus
muncul file gambar (logo klien, badge sertifikat, 3 cover artikel).

## 4. Vercel: environment variables + deploy

**Settings → Environment Variables** (Production + Preview):

| Nama | Nilai |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://<domain>` — dibaca **saat build**, wajib benar |
| `DATABASE_URI` | Neon **POOLED** string |
| `PAYLOAD_SECRET` | string acak yang **sama** dengan langkah 3 |
| `TRUSTED_PROXY_HOPS` | `1` |
| `BLOB_READ_WRITE_TOKEN` | sudah otomatis dari langkah 2 — pastikan ada |
| `SEED_ADMIN_EMAIL` | sama dengan langkah 3 |
| `SEED_ADMIN_PASSWORD` | sama dengan langkah 3 |

Lalu **Deploy** (atau Redeploy). Setelah hijau:

- buka `/` — beranda, gambar tampil
- buka `/admin` — login pakai kredensial seed
- buka `/artikel` — 3 artikel muncul dengan cover

### Setelah domain sendiri siap

**Settings → Domains** → tambah domain. Lalu ubah `NEXT_PUBLIC_SITE_URL`
ke domain itu dan **redeploy** (nilainya di-inline saat build, tidak cukup
diganti runtime).

---

## Catatan

- **Migrasi saat runtime**: `prodMigrations` di `payload.config.ts` juga
  jalan otomatis saat cold start. Karena langkah 3 sudah menerapkannya, itu
  jadi no-op. Untuk migrasi baru nanti, jalankan `bun run migrate` ke Neon
  lagi sebelum deploy, jangan mengandalkan cold start.
- **Neon auto-suspend**: di free tier, DB tidur setelah beberapa menit idle;
  request pertama setelahnya lambat ~1 detik. Normal.
- **Ukuran function**: Payload admin + `sharp` cukup besar. Kalau deploy
  gagal karena batas 250 MB unzipped, langkah pertama: pastikan dependency
  3D (`three`, `@react-three/*`) tidak ikut ke bundle server — semuanya
  dipakai di komponen client saja.
- **Batalkan Blob**: kosongkan/hapus `BLOB_READ_WRITE_TOKEN` → Payload balik
  ke disk lokal. Berguna untuk menyamakan perilaku dev dengan Docker.
