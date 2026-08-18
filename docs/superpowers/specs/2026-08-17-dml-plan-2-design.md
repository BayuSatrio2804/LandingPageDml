# DML Plan 2, Desain: Fondasi Payload dan Halaman Statis

> **SUPERSEDED SEBAGIAN, 18 Agustus 2026.** Sumber data perusahaan sekarang company
> profile resmi klien, `assets/CP DML.pdf`, dan susunan beranda ditulis ulang di Plan 5.
> Setiap angka, rute, dan struktur lini bisnis di dokumen ini yang bertentangan dengan
> `docs/superpowers/specs/2026-08-18-dml-plan-5-profil-dan-beranda-design.md` sudah
> tidak berlaku. Dokumen ini dipertahankan apa adanya sebagai catatan apa yang dibangun
> kapan; jangan dijadikan rujukan data.


Design spec, 17 Agustus 2026. Turunan dari `docs/superpowers/specs/2026-08-16-dml-corporate-design.md`, mengisi bagian yang belum diklaim Plan 1 (Fondasi), Plan 3 (Bisnis dan form inquiry), Plan 4 (CMS artikel), atau Plan 5 (Beranda).

## 1. Ringkasan dan scope

Plan 1 selesai: project Next.js 16.2 tersedia, token warna teruji kontras, motion tergerbang `prefers-reduced-motion`, shell layout, primitif SEO. Plan 2 mengisi tiga route yang tersisa di peta halaman dan tidak diklaim plan lain: `/tentang-kami`, `/karier`, `/kontak`.

Route `/kontak` wajib menyimpan submission ke collection Payload `inquiries` sebelum redirect WhatsApp (spec bagian 11, bukan opsional). Payload sendiri belum ada di codebase. Plan 2 karena itu juga memasang fondasi Payload 3: adapter Postgres, `/admin`, collection `users`, `media`, `inquiries`. Collection `posts` dan alur revalidasi artikel tetap jatah Plan 4.

**Di luar scope Plan 2:**
- Collection `posts`, halaman `/artikel`, `/artikel/[slug]` (Plan 4)
- `/bisnis` dan turunannya, form Permintaan Informasi Bisnis (Plan 3)
- Beranda sinematik (Plan 5)
- Isi lowongan kerja nyata dan PDF profil perusahaan (data klien belum tersedia)

## 2. Restrukturisasi folder `app/`

Spec bagian 4.1 menetapkan `app/(site)/` untuk halaman publik dan `app/(payload)/` untuk admin panel Payload. Struktur `dml-web/src/app/` saat ini masih flat: `page.tsx` dan `layout.tsx` langsung di root, belum ada route group. Ini harus dibereskan sebelum Payload masuk, karena admin panel tidak boleh mewarisi header, footer, `SmoothScrollProvider`, dan skip link milik situs publik.

```
app/
  layout.tsx              tetap di root: html, body, font variables, metadata dasar
  globals.css
  sitemap.ts
  robots.ts
  not-found.tsx
  (site)/
    layout.tsx             BARU: SkipLink, SmoothScrollProvider, SiteHeader, SiteFooter
    page.tsx                pindah dari app/page.tsx
    tentang-kami/
      page.tsx
    karier/
      page.tsx
    kontak/
      page.tsx
  (payload)/
    layout.tsx              BARU: polos, tanpa header/footer/motion provider
    admin/
      [[...segments]]/
        page.tsx
    api/
      [...slug]/
        route.ts
```

Root `layout.tsx` menyusut jadi shell minimal (html lang="id", font variables, `color-scheme: dark`). Isi `<body>` yang sekarang ada di sana (SkipLink, SmoothScrollProvider, SiteHeader/Footer) pindah ke `(site)/layout.tsx`. Tidak ada perubahan URL: route group tidak muncul di path.

## 3. Fondasi Payload

**Versi:** `payload@3.73`, `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`. Editor Lexical wajib dikonfigurasi meski belum ada collection yang memakainya secara aktif di Plan 2, karena Payload 3 menuntutnya di config dasar.

**Database dev:** `docker-compose.yml` di `dml-web/`, satu service `postgres:16`, volume named untuk persistensi, port 5432 di-expose ke host untuk akses lokal. Bukan managed cloud database, supaya `bun run check` tidak pernah bergantung jaringan luar.

**Env baru** (`dml-web/.env.example` dan `.env.local`):
- `DATABASE_URI` - connection string ke Postgres compose
- `PAYLOAD_SECRET` - random string, digenerate sekali saat setup
- `WHATSAPP_NUMBER` - nomor tujuan redirect form, format E.164 tanpa `+` sesuai konvensi `wa.me`

**Struktur:**
```
src/payload/
  payload.config.ts
  collections/
    Users.ts       admin-only, tanpa registrasi publik
    Media.ts        upload + sharp resize + alt text required
    Inquiries.ts     read-only di admin, field sesuai spec bagian 10
```

`Media` disiapkan sekarang meski konsumen pertamanya (cover artikel) baru muncul di Plan 4. Schema-nya kecil dan Payload butuh minimal satu upload collection untuk beberapa fitur admin bekerja penuh; menunda ke Plan 4 berarti migrasi database dua kali untuk hal yang sama.

**Migrasi:** dijalankan manual lewat `payload migrate` saat development, hasil file migrasi dikomit ke `src/payload/migrations/`. Tidak auto-generate saat startup container (kontras dengan catatan "migrasi dijalankan saat startup" di spec bagian 15, yang berlaku untuk deployment produksi, bukan alur dev Plan 2).

## 4. Infrastruktur form bersama

`features/inquiry/` menjadi tempat tunggal untuk pola form-ke-lead, dipakai `/kontak` sekarang dan form Permintaan Informasi Bisnis di Plan 3 nanti.

- `schema.ts` - zod schema dasar `{ name, phone, email, message }`, plus field honeypot `website` yang wajib kosong. Plan 3 meng-extend schema ini dengan `service` dan `company`, bukan menulis schema baru dari nol.
- `rate-limit.ts` - sliding window in-memory (`Map<ip, { count, windowStart }>`), lima submission per sepuluh menit per IP. In-memory cukup karena deployment adalah satu container tanpa horizontal scaling (spec bagian 15). Reset saat restart adalah tradeoff yang diterima, dicatat di komentar kode.
- `actions.ts` - server action `submitInquiry(data)`: validasi zod ulang di server (validasi client adalah UX, bukan boundary keamanan), cek honeypot, cek rate limit dari IP di header request, `payload.create({ collection: 'inquiries', data })` lewat Local API Payload, kembalikan `{ ok: true }` atau `{ ok: false, error }`.
- `contact-form.tsx` - client leaf, react-hook-form terhubung ke schema, tombol submit disabled dengan label berubah saat loading (bukan spinner, sesuai spec bagian 11.1), error inline per field ditambah error tingkat form untuk kegagalan server action atau rate limit.

Honeypot yang terisi ditolak diam-diam: response sukses palsu ke client, tidak ada pesan error spesifik yang membocorkan mekanisme anti-bot.

## 5. Halaman

### `/kontak`

Server Component statis yang merender `<ContactForm />`. Sukses submit mengarahkan ke `wa.me/<WHATSAPP_NUMBER>` dengan pesan terstruktur berisi ringkasan input. Di bawah form: alamat dua kantor dari `COMPANY.offices` (data sudah ada, tidak ada konten baru), masing-masing dengan `<ExternalLink>` (primitif Plan 1) ke `https://www.google.com/maps/search/?api=1&query=<alamat>`. Tidak ada iframe peta tertanam: itu berarti request ke domain pihak ketiga di setiap kunjungan halaman, bertentangan dengan prinsip "tidak ada permintaan jaringan pihak ketiga" yang sudah dipegang untuk font di Plan 1, dan berisiko terhadap anggaran performa (spec bagian 8).

Kontras seluruh elemen form (input, placeholder, focus ring, label, helper text, error text) terhadap `--color-surface-2` diuji lewat `tokens.test.ts`, mengikuti pola Task 3 Plan 1: kontras dijaga oleh gerbang test, bukan review mata.

Spec bagian 5 juga meminta "kontak per divisi" di halaman ini. `COMPANY` cuma punya satu nomor telepon terverifikasi, dan halaman `/bisnis/*` baru dibangun Plan 3, jadi bagian ini ditampilkan sebagai daftar tiga lini bisnis (diambil dari `FOOTER_GROUPS` yang sudah ada, bukan data baru) yang untuk saat ini berbagi satu kanal kontak yang sama, tanpa nomor terpisah yang dikarang dan tanpa tautan ke halaman yang belum ada.

### `/tentang-kami`

Satu halaman, dua section (`#silsilah`, `#profil`) dengan anchor nav sticky yang state aktifnya diatur `IntersectionObserver`, bukan listener `scroll` (Global Constraints Plan 1 tetap berlaku).

`#silsilah` memuat timeline yang hanya berisi data yang benar-benar ada di spec: pendirian 30 November 1985, Herman Chandra, induk SinarAlam Corporation. Timeline sengaja tipis, satu entri, ditandai `unverified`, karena tanggal ekspansi tiap lini bisnis tidak ada di sumber manapun yang tersedia. Menambah entri buatan sendiri adalah risiko: klien bisa mempublikasikan tanggal yang salah tanpa sadar itu tebakan.

`#profil` memuat visi-misi (draft baru, ditandai untuk direview klien karena bukan angka faktual sehingga bukan kandidat `unverified`), legalitas, dan `COMPANY.certifications` (sudah ada). Tombol unduh PDF profil **tidak dirender** - bukan disabled, bukan placeholder - sampai klien mengirim filenya. Ditambahkan di plan terpisah nanti.

### `/karier`

Fungsi `jobPostingJsonLd()` ditambahkan ke `lib/seo/json-ld.ts`, siap dipakai tapi tidak dipanggil di halaman ini karena belum ada data lowongan. Array kosong yang dipaksa jadi JSON-LD adalah markup tidak valid, lebih baik fungsinya menunggu pemanggil pertama di masa depan.

Halaman menampilkan empty state yang digarap serius: penjelasan bahwa belum ada lowongan terbuka, dan tombol `wa.me/<COMPANY.phone>` untuk lamaran spontan. Tidak ada form terpisah untuk karier; kanal WhatsApp konsisten dengan pola redirect yang sudah dipakai form lead.

## 6. Testing dan verifikasi

- `features/inquiry/schema.test.ts`, `rate-limit.test.ts` - vitest, logic murni tanpa DOM
- `tests/e2e/kontak.spec.ts` - submit sukses (redirect WA benar), submit gagal validasi (error inline muncul per field), rate limit kena (error tingkat form), honeypot terisi (ditolak diam-diam)
- `tests/e2e/karier.spec.ts` - empty state tampil, link WA benar
- `tests/e2e/tentang-kami.spec.ts` - anchor nav berfungsi, kedua section terbaca tanpa JavaScript
- Extend `tests/e2e/no-js.spec.ts` (sudah ada dari Plan 1) untuk cover tiga route baru
- Extend `tests/e2e/contrast-tokens.spec.ts` untuk cover elemen form
- `runAxeCheck(page)` - helper axe-core baru dipakai di semua spec e2e route baru, gerbang yang belum ada di Plan 1

## 7. Definition of Done, Plan 2

- `bun run check` lolos penuh
- `bun run test:e2e` lolos penuh
- `docker compose up` diikuti `payload migrate` berhasil dari kondisi bersih
- Login ke `/admin` berhasil, collection `inquiries` terlihat read-only
- Ketiga halaman baru terbaca penuh dengan JavaScript dimatikan
- Kontras seluruh elemen form lolos WCAG AA
- Submit `/kontak` menghasilkan baris baru di collection `inquiries` sebelum redirect WhatsApp

## 8. Keputusan yang sudah diambil

Tiga keputusan berikut diambil bersama pengguna sebelum desain ini ditulis, dicatat di sini supaya rasionalnya tidak hilang:

1. **Payload masuk di Plan 2, bukan ditunda ke Plan 4.** Alasan: `/kontak` butuh persist-before-redirect sesuai spec bagian 11, dan menunda berarti kerja dobel atau menyimpang dari alur spec yang eksplisit.
2. **Postgres dev lewat Docker Compose lokal**, bukan managed cloud, supaya gerbang kualitas tidak bergantung jaringan luar.
3. **Tombol PDF profil disembunyikan total** sampai klien mengirim filenya; **kanal lamaran karier lewat WhatsApp** ke nomor kantor yang sudah ada, bukan email baru yang belum tersedia.
