# Spec Plan 9 — Artikel, OG image, pengerasan, dan deployment

**Status:** disetujui pemilik repo, 23 Agustus 2026.
**Master spec:** `docs/superpowers/specs/2026-08-16-dml-corporate-design.md`
**Spec induk untuk bagian artikel:** `docs/superpowers/specs/2026-08-23-dml-plan-8-halaman-bisnis-dan-artikel-design.md` bagian 10.

---

## 1. Ringkasan

Plan 8 menutup seluruh cabang `/bisnis` dan menyisakan satu tautan internal yang mati, `/artikel`, plus enam item terbuka yang dilaporkan ke pemilik repo. Spec ini mengerjakan semua yang tersisa dan bisa dikerjakan tanpa klien, dalam satu plan.

Empat fase, dijalankan berurutan:

| Fase | Isi | Kenapa di sini |
|---|---|---|
| A | Artikel: koleksi `posts`, dua route, revalidasi, seksi beranda, sitemap dinamis, seed, spec admin-publish | Satu-satunya link mati yang tersisa. Spec-nya sudah ada di spec 8 bagian 10 |
| B | `metadataBase`, OG image korporat dan artikel, JSON-LD `Service` dan `LocalBusiness` | Diminta master spec bagian 12, tidak pernah masuk plan mana pun |
| C | `error.tsx`, `global-error.tsx`, `staticDir` koleksi media | Utang kecil yang jadi prasyarat fase D |
| D | `output: 'standalone'`, Dockerfile, compose produksi, migrasi saat start | Master spec bagian 15, seluruhnya belum ada. Situs hari ini tidak bisa dideploy |

Setelah plan ini, tidak ada lagi bagian situs yang belum dibangun kecuali yang menunggu data dari klien. Daftar itu ada di bagian 3 dan sengaja ditulis di depan, bukan di kaki dokumen.

**Pemecahan dokumen.** Pemilik repo memilih satu Plan 9 yang memuat keempat fase, bukan dipecah jadi Plan 9 dan Plan 10. Risiko ukurannya sudah disampaikan di muka: Plan 8 menghabiskan 133KB untuk scope yang lebih sempit, jadi Plan 9 kemungkinan besar tidak selesai dalam satu sesi eksekusi. Struktur berfase di atas adalah jawabannya. Tiap fase berakhir di keadaan yang hijau dan bisa di-commit, sehingga eksekusi boleh berhenti di batas fase tanpa meninggalkan repo setengah jadi.

---

## 2. Keputusan yang sudah diambil

Lima keputusan berikut diambil pemilik repo pada 23 Agustus 2026 dan tidak dibuka ulang saat eksekusi.

**Keputusan 1. Satu Plan 9, empat fase.** Lihat bagian 1.

**Keputusan 2. Deployment masuk scope sekarang.** Alasannya bukan karena servernya sudah siap, melainkan karena Dockerfile secara rutin menemukan masalah build yang tidak pernah muncul di `next dev`, dan menemukannya di hari rilis adalah waktu terburuk. Seluruh fase D bisa diverifikasi lokal penuh tanpa menyentuh infra klien.

**Keputusan 3. OG image korporat statis, OG artikel dinamis.** Persis master spec bagian 12. Satu PNG 1200x630 dipakai seluruh halaman korporat, dibangkitkan sekali lewat script dan dikomit. Artikel memakai `next/og` saat request, menampilkan judul artikel itu sendiri.

Alternatif yang ditolak: `next/og` dinamis untuk semua halaman. Ia lebih konsisten, tapi menuntut satu route `opengraph-image` per halaman ditambah font yang di-embed sebagai `ArrayBuffer`, dan mengubah halaman yang selama ini murni statis jadi punya kerja runtime. Halaman korporat judulnya tidak pernah berubah; membangkitkannya ulang tiap dibagikan adalah ongkos tanpa imbalan.

**Keputusan 4. Situs tayang dengan 2 sampai 3 artikel hasil seed, bukan dengan `/artikel` kosong.** Artikelnya disusun dari materi yang sudah terverifikasi di `assets/CP DML.pdf` dan dari isi situs yang sudah tayang, bukan dikarang.

Ini keputusan yang paling perlu dijaga batasnya. Aturan data repo ini melarang mengarang fakta perusahaan, dan larangan itu tetap berlaku penuh di sini: **artikel seed tidak boleh memuat satu pun angka, tanggal, nama, atau klaim yang belum ada di `src/content/` atau di PDF.** Yang disusun adalah kalimat penghubungnya, bukan faktanya. Konsekuensinya dicatat jujur: teks itu tetap tulisan agen, jadi ia masuk daftar menunggu review klien bersama Visi dan Misi. Bagian 4.7 mengatur bagaimana klien bisa mencabut ketiganya dalam satu perintah kalau menolak.

**Keputusan 5. Upload disimpan di volume persisten, bukan S3.** Tidak butuh kredensial pihak ketiga, tidak butuh apa pun dari klien, dan bisa dibuktikan lokal. Adapter S3 tetap terbuka sebagai peningkatan nanti; prosedurnya tidak ditulis di plan ini karena task yang tidak bisa diverifikasi adalah utang yang menyamar jadi pekerjaan selesai.

---

## 3. Yang tidak bisa diselesaikan tanpa klien

Plan ini bertujuan menutup semua yang belum selesai. Tujuh butir di bawah ini **tidak** akan tertutup, dan itu bukan kelalaian eksekusi. Masing-masing menunggu orang di luar repo.

| Butir | Yang dibutuhkan | Dari siapa |
|---|---|---|
| Fasilitas dan jadwal kapal ro-ro | Daftar fasilitas per kapal dan jadwal keberangkatan. Tidak ada di company profile sama sekali | Klien |
| Logo sertifikasi dan status HSSE | Tiga berkas logo resmi, plus konfirmasi apakah HSSE benar dimiliki. Prosedur tukar sudah di README sejak Plan 6 | Klien |
| Selisih 64 vs 66 kapal | Angka mana yang benar. Seluruh selisih ada di sisi BBM | Klien |
| `OB Sahoya 0` | Nama lengkapnya. Terbaca terpotong di PDF, ditandai `belum-terverifikasi`. Jangan ditebak jadi "Sahoya 04" | Klien |
| Dimensi kapal | Panjang, lebar, DWT. Seluruhnya masih estimasi proporsional, dan halaman lini BBM sudah menyatakan itu di bawah tabelnya | Klien |
| Copy Visi dan Misi | Persetujuan teks. Plan 8 hanya membetulkan kontradiksi faktualnya | Klien |
| Logo klien "Trusted by" | Berkas logo terpisah plus izin dari tiap pemilik merek. Di PDF ia satu raster gepeng yang tidak bisa dipisah | Klien dan pemilik merek |

Satu butir lagi berbeda sifatnya:

**`JobPosting` JSON-LD di `/karier` tidak dikembalikan.** Plan 8 menghapusnya sebagai kode mati dan penghapusan itu benar. Master spec bagian 12 menulis "aktif begitu data diisi", dan datanya adalah lowongan nyata yang sampai hari ini nol. Menanam kembali builder yang tidak pernah dipanggil hanya memindahkan kode mati dari satu plan ke plan berikutnya. Halaman `/karier` sudah punya empty state yang jujur dan jalur lamaran spontan lewat WhatsApp. Begitu ada lowongan pertama, JSON-LD-nya lahir bersama data itu, dalam satu perubahan yang bisa diuji.

**Merge `denis` ke `master`** juga tetap terbuka. Repo ini dipakai lebih dari satu orang dan `master` memuat commit yang belum ada di `denis`. Plan ini tidak melakukannya.

---

## 4. Fase A — Artikel

Dasarnya spec 8 bagian 10, yang sudah disetujui dan tidak diulang di sini. Bagian ini hanya mencatat yang **berubah** atau yang **belum diputuskan di sana**.

### 4.1 Koleksi `posts`

Field mengikuti spec 8 bagian 10.1 tanpa penambahan. Tiga hal yang di sana ditulis ringkas dan di sini dipertegas karena masing-masing pernah jadi sumber kegagalan senyap.

**`_status` bukan field.** Spec 8 menampilkannya di tabel field, sejajar dengan `title` dan `slug`. Ia sebenarnya konsekuensi dari `versions: { drafts: true }` pada level koleksi. Perbedaannya bukan kosmetik: mengaktifkan drafts membuat Payload membangkitkan tabel versi terpisah (`_posts_v` beserta tabel anaknya), sehingga migrasi untuk koleksi ini jauh lebih besar daripada migrasi `inquiries` yang sudah ada di repo. Task yang menulis migrasi wajib memeriksa keluaran `payload migrate:create` sebelum mengomitnya, bukan menganggap bentuknya sama dengan migrasi sebelumnya.

**Access control dikunci sejak baris pertama.**

```
read:   ({ req }) => Boolean(req.user) || { _status: { equals: "published" } }
create: ({ req }) => Boolean(req.user)
update: ({ req }) => Boolean(req.user)
delete: ({ req }) => Boolean(req.user)
```

`read` mengembalikan query constraint untuk publik, bukan `false`. Bentuk itu yang membuat draft tidak pernah bocor ke `/artikel` sambil tetap bisa dibaca admin yang login. Pelajarannya dari Plan 2, ketika `Inquiries.access.create` yang terbuka jadi satu dari dua temuan keamanan yang memblokir branch.

Catatan yang harus ikut ditulis sebagai komentar di file koleksi: Local API `payload.find()` default `overrideAccess: true`, sama seperti `payload.create()` yang sudah didokumentasikan di `Inquiries.ts` sejak Plan 8. Artinya query dari Server Component **tidak** otomatis tunduk pada `access.read` di atas. Halaman publik wajib menyaring `_status` secara eksplisit di query-nya, atau meneruskan `overrideAccess: false`. Menganggap access control koleksi cukup untuk melindungi halaman publik adalah kesalahan yang gagal dengan senyap: build hijau, tes hijau, draft tayang.

**Slug.** Auto dari `title` lewat hook `beforeValidate`, tetap bisa diedit, `unique` dan `index`. Slug yang sudah pernah published lalu diubah menyisakan halaman hantu di alamat lama; penanganannya ada di 4.3.

### 4.2 `Users` mendapat field `name`

`Users.fields` hari ini adalah array kosong. Begitu `posts.author` merelasikannya, tiap byline artikel akan menampilkan alamat email penulis kepada seluruh pengunjung situs. Itu kebocoran data kecil sekaligus tampilan yang salah.

Perubahannya satu field:

```ts
fields: [
  {
    name: "name",
    type: "text",
    required: true,
    admin: { description: "Nama yang tampil sebagai penulis artikel." },
  },
],
admin: { useAsTitle: "name" },
```

`useAsTitle` pindah dari `email` ke `name` supaya daftar user dan dropdown relasi di admin terbaca manusiawi.

`required: true` pada koleksi yang sudah punya baris di database menuntut kehati-hatian. Migrasi harus menambahkan kolom dengan default sementara untuk baris yang sudah ada, baru kemudian menegakkan NOT NULL, atau ia gagal di database yang sudah berisi user. Task migrasi wajib mengujinya terhadap database yang **sudah** punya user, bukan database kosong. Database kosong akan lolos dan menyembunyikan bug itu sampai deploy pertama.

### 4.3 Revalidasi

Seluruhnya mengikuti spec 8 bagian 10.2, termasuk alasan panjang kenapa `revalidatePath` menang atas `revalidateTag` dan `unstable_cache` di Next 16. Tidak diulang.

Dua hal dari sana yang jadi kewajiban eksekusi, bukan catatan:

1. **`revalidatePath("/sitemap.xml")` belum terbukti.** Dokumen Next 16 tidak menyebut metadata route sama sekali dalam konteks `revalidatePath`. Pemanggilannya tetap dipasang, tapi task wajib membuktikan secara empiris bahwa sitemap ikut segar setelah publish. Kalau tidak, cadangannya sudah ditentukan di muka: `export const revalidate = 3600` di `sitemap.ts`. Sitemap yang telat satu jam tidak merugikan siapa pun; sitemap yang tidak pernah berubah merugikan.
2. **`dynamicParams` wajib tetap `true`.** Saat `next build` berjalan, koleksi bisa saja kosong, sehingga `generateStaticParams` mengembalikan array kosong. Artikel yang dipublikasikan setelah build hanya muncul karena `dynamicParams` bernilai `true` secara default. Menambahkan `export const dynamicParams = false` mematikan persis alur yang jadi alasan keberadaan seluruh pipeline ini, dan matinya senyap. Larangan itu ditulis sebagai komentar di `/artikel/[slug]/page.tsx`.

Slug yang berubah merevalidasi path lama **dan** baru. Hook `afterChange` menerima `previousDoc`, dan di sanalah slug lama diambil.

### 4.4 `/artikel` dan `/artikel/[slug]`

**Design read.** Pembaca halaman ini bukan pembaca blog konsumen. Ia panel procurement yang sedang menilai apakah operator ini serius, atau kandidat kerja yang mengecek apakah perusahaannya hidup. Bahasanya editorial korporat, bukan majalah gaya hidup dan bukan grid kartu SaaS.

Dial menyesuaikan sistem yang sudah ada, bukan memperkenalkan bahasa baru: `DESIGN_VARIANCE 6`, `MOTION_INTENSITY 4`, `VISUAL_DENSITY 3`. Halaman ini menumpang design system yang sudah lolos audit Plan 6 dan Plan 7. Tidak ada token warna baru, tidak ada keluarga font baru, tidak ada komponen kartu baru kalau `SectionHeader` dan primitif yang ada sudah cukup.

**`/artikel`.** Artikel published, terbaru dulu. Artikel pertama mendapat bobot lebih besar: cover lebar, judul ukuran display, excerpt tampil. Sisanya menyusul sebagai daftar berpembatas (`divide-y`), bukan kartu, dengan cover kecil, judul, kategori, dan tanggal. Bentuk ini dipilih karena tiga kartu identik adalah default LLM yang dilarang master spec bagian 7.11, dan karena dengan dua atau tiga artikel saja grid kartu terlihat seperti halaman yang gagal memuat.

Paginasi **tidak dibangun** kecuali jumlah artikel published melewati satu halaman. Membangun paginasi untuk koleksi berisi tiga artikel adalah kode yang tidak pernah dieksekusi. Ambangnya ditulis sebagai konstanta supaya kelak tinggal dinaikkan.

Empty state tetap dibangun dan tetap wajib, meskipun keputusan 4 memastikan situs tayang dengan isi. Alasannya: klien bisa menghapus seluruh artikel dari `/admin` kapan saja, dan halaman yang kosong tanpa empty state akan tampil rusak, bukan kosong.

**`/artikel/[slug]`.** `generateStaticParams` dari slug published. Slug tidak dikenal memanggil `notFound()`, yang jatuh ke `not-found.tsx` bergaya yang sudah ada.

Richtext dirender dengan komponen resmi `RichText` dari `@payloadcms/richtext-lexical/react`, bukan serializer tangan. Paket itu sudah jadi dependency (versi 3.88 mengekspor `./react`), dan menulis serializer sendiri berarti memelihara pemetaan node Lexical selamanya untuk fitur yang sudah disediakan upstream.

Halaman memuat cover image, kategori, tanggal terbit, dan nama penulis dari relasi `users`. Gambar memakai `next/image`; `<img>` mentah menggagalkan lint.

**Metadata dan JSON-LD.** `generateMetadata` per artikel dengan fallback `seo.metaTitle` ke `title` dan `seo.metaDescription` ke `excerpt`. JSON-LD `Article` dirangkai lewat `safeJsonLdString` yang sudah ada. Docblock di `json-ld.ts` sudah menyebut bahwa escape `<` dipasang di sana justru untuk mengantisipasi JSON-LD artikel dari input admin. Plan ini adalah saat antisipasi itu terpakai, dan tes untuk itu wajib memakai judul artikel yang benar-benar memuat `</script>`.

### 4.5 Seksi Artikel Terbaru di beranda

Master spec bagian 7.9 dan spec 8 bagian 10.4. Tiga artikel terbaru, posisinya setelah `Certifications` dan sebelum `CtaSection`.

Seksi ini **hilang sepenuhnya kalau koleksi kosong**. Tidak ada empty state di beranda. Beranda adalah halaman penjualan; "belum ada artikel" di sana melemahkan tanpa memberi apa pun.

Alasan posisinya sudah tertulis di docblock `page.tsx`: tidak boleh ada dua seksi berurutan dengan keluarga tata letak yang sama. Sertifikasi adalah badge grid, artikel adalah kartu editorial bergambar, CTA adalah bidang teks. Ritmenya tetap utuh.

### 4.6 `sitemap.ts` jadi dinamis

`STATIC_PATHS` mendapat `/artikel` kembali, dan fungsi `sitemap()` berubah jadi `async` untuk menambahkan slug artikel published.

**Ini merombak `sitemap.test.ts` yang baru ditulis Plan 8.** Enam tesnya menganggap `sitemap()` sinkron dan seluruh isinya berasal dari `STATIC_PATHS`. Perombakan itu ditulis sebagai langkah eksplisit di plan, bukan dibiarkan muncul sebagai kegagalan tes yang mengejutkan pengeksekusi. Tes baru harus menjaga dua hal sekaligus: tiap path statis tetap menunjuk berkas `page.tsx` yang benar-benar ada, dan artikel yang belum published tidak pernah masuk sitemap.

### 4.7 Seed dan autentikasi test

Satu berkas, `scripts/seed.ts`, menyelesaikan dua masalah yang berbeda.

**Masalah pertama: spec Playwright admin-publish tidak punya cara login.** Hari ini tidak ada seed script, tidak ada auth fixture di `tests/e2e/`, dan user pertama Payload lahir dari `/admin/create-first-user`. Tanpa keputusan di muka, task yang menulis spec itu akan berhenti di tengah jalan. Ini risiko eksekusi terbesar di seluruh fase A.

**Masalah kedua: keputusan 4** menuntut situs tayang dengan isi.

Bentuknya:

- **Idempoten.** Dijalankan berkali-kali menghasilkan keadaan yang sama. Ia mencari lebih dulu, membuat hanya kalau belum ada, dan tidak pernah menimpa artikel yang sudah disunting klien.
- **Membuat admin pertama** dari `SEED_ADMIN_EMAIL` dan `SEED_ADMIN_PASSWORD` di environment. Keduanya masuk `.env.example` dengan peringatan bahwa nilai contoh tidak boleh dipakai di produksi.
- **Membuat 2 sampai 3 artikel published** beserta media cover-nya, diambil dari aset yang sudah ada di `public/media/`, bukan dari berkas baru.
- Dipanggil `globalSetup` Playwright, sehingga spec admin-publish punya kredensial yang pasti ada.
- Dipanggil manual saat setup fresh clone, dan langkahnya masuk README.

**Sumber isi artikel seed.** Ketiganya hanya boleh menyusun ulang materi yang sudah terverifikasi:

| Artikel | Sumber faktanya |
|---|---|
| Operasi ship-to-ship | `src/features/home/day-cut.tsx` dan seksi alur STS di `/bisnis/transportasi-bbm`, yang keduanya sudah bersumber PDF |
| Sertifikasi ISM Code dan ISO 9001:2015 | `src/content/certifications.ts` dan `COMPANY.standards`, keduanya `cp-pdf` |
| Berdiri 1988 di Banjarmasin | `src/content/timeline.ts` dan `COMPANY`, keduanya `cp-pdf` halaman 01 dan 02 |

Tidak ada angka baru, tidak ada tanggal baru, tidak ada nama orang baru, tidak ada klaim pelanggan. HSSE tidak disebut di artikel mana pun karena statusnya masih `belum-terverifikasi`.

**Jalan keluar kalau klien menolak teksnya.** Ketiga artikel adalah baris database biasa yang bisa dihapus dari `/admin` dalam beberapa klik, dan hook revalidasi akan membersihkan seluruh jejaknya dari `/artikel`, beranda, dan sitemap tanpa deploy ulang. Fakta itu ditulis di README, di bagian yang sama yang mencatat artikel seed sebagai menunggu review. Tidak ada teks agen yang tertanam di kode.

### 4.8 Build mulai membutuhkan Postgres

Begitu `/` melakukan query artikel, `bun run build` membutuhkan database hidup, bukan hanya `bun run test:e2e`. README hari ini hanya memperingatkan untuk `test:e2e`, padahal `bun run check` menjalankan build dan lighthouse.

Tanpa baris tambahan itu, anggota tim pertama yang menjalankan `check` di mesin dingin mendapat kegagalan yang terbaca seperti bug kode. Ini satu task tersendiri, bukan catatan kaki, dan ia menyentuh README bagian setup, README bagian perintah penting, dan urutan perintah yang dipakai gerbang.

---

## 5. Fase B — SEO dan OG image

### 5.1 `metadataBase` lebih dulu

`buildMetadata` hari ini mengembalikan URL absolut lewat `absoluteUrl()`, sehingga canonical dan `openGraph.url` sudah benar. Tapi `metadataBase` tidak pernah diset di mana pun.

Begitu `openGraph.images` diisi dengan path relatif, Next memperingatkan saat build dan me-resolve gambar terhadap `localhost:3000`. Kartu OG yang menunjuk localhost tidak akan pernah tampil di WhatsApp maupun LinkedIn.

Karena itu `metadataBase: new URL(SITE_URL)` diset di metadata root layout **sebelum** task OG mana pun dikerjakan. Urutannya bagian dari desain, bukan preferensi.

### 5.2 OG korporat, satu PNG statis

Satu berkas 1200x630 dipakai seluruh halaman korporat, dibangkitkan sekali oleh script dan dikomit ke repo.

Scriptnya mengikuti pola `scripts/prepare-cert-placeholders.ts` yang sudah ada: `sharp` sudah jadi dependency, jadi tidak ada paket baru. Komposisinya memakai bahan yang sudah dimiliki repo, yaitu foto kapal dari `public/media/`, nama perusahaan, dan token warna dari `src/lib/tokens.ts`. Tidak ada aset baru dari luar.

Berkas hasilnya dikomit, bukan dibangkitkan saat build. Alasannya sama dengan placeholder sertifikasi: aset yang lahir saat build membuat dua mesin menghasilkan situs yang berbeda, dan membuat build gagal karena alasan yang tidak ada hubungannya dengan kode.

`buildMetadata` diperluas menerima `image` opsional yang jatuh ke berkas korporat ini. Tes `metadata` yang ada diperluas untuk menjaga bahwa tiap halaman punya `openGraph.images` yang absolut.

### 5.3 OG artikel, dinamis lewat `next/og`

`src/app/(site)/artikel/[slug]/opengraph-image.tsx` memakai `ImageResponse` dari `next/og`, yang tersedia di Next 16 (`node_modules/next/og.js`).

Isinya: judul artikel, kategori, dan nama perusahaan, di atas cover image artikel itu. Ukuran 1200x630, sama dengan korporat.

Dua jebakan yang wajib ditangani task, bukan ditemukan saat runtime:

1. **Font harus di-embed sebagai `ArrayBuffer`.** `ImageResponse` berjalan di lingkungan yang tidak membaca `next/font`. Berkas fontnya dibaca dari `fonts/` di akar repo yang sudah ada, dan dilewatkan lewat opsi `fonts`. Tanpa itu, hasilnya tetap terbentuk tapi memakai font fallback, dan kegagalannya senyap karena tidak ada error.
2. **Cover image harus URL absolut.** `ImageResponse` tidak punya konteks request untuk me-resolve path relatif.

Artikel tanpa cover tidak mungkin ada karena `coverImage` bersifat required di koleksi. Meski begitu, komponen tetap menangani nilai kosong dengan latar warna solid, karena data lama atau impor manual bisa melanggar constraint yang ditegakkan di lapisan aplikasi.

### 5.4 JSON-LD yang belum pernah dibangun

Master spec bagian 12 mendaftar lima jenis JSON-LD. Yang sudah ada: `Organization` dan `BreadcrumbList`. `Article` lahir di fase A. Dua sisanya lahir di sini.

**`Service`** di `/bisnis/transportasi-bbm` dan `/bisnis/penumpang-roro`. Field-nya diambil dari `src/content/business-lines.ts` yang sudah ada, tidak ada data baru. `provider` menunjuk `Organization` yang sama, dan `areaServed` hanya diisi kalau ada dasarnya di PDF.

**`LocalBusiness`** dipasang di root, berdampingan dengan `Organization`, sesuai master spec bagian 12. Ia membawa dua alamat kantor yang sudah ada di `COMPANY.offices`, plus telepon.

Satu langkah verifikasi wajib menyertainya: hasilnya diperiksa lewat validator structured data, bukan dianggap benar karena strukturnya terlihat wajar. Dua entitas yang mendeskripsikan organisasi yang sama di satu halaman bisa dibaca sebagai duplikat. Kalau validator memang mengeluhkannya, cadangannya sudah ditentukan di muka dan tidak perlu dibahas ulang saat eksekusi: `LocalBusiness` pindah ke `/kontak` saja, tempat kedua alamat kantor memang jadi isi halaman, dan root hanya menyisakan `Organization`.

Keduanya masuk `src/lib/seo/json-ld.ts` dengan tes, mengikuti bentuk `organizationJsonLd` yang sudah ada. Pelajaran dari `jobPostingJsonLd` yang dihapus Plan 8 tetap berlaku: builder yang tidak dipanggil siapa pun adalah kode mati. Keduanya dipanggil di halaman nyata dalam plan yang sama.

---

## 6. Fase C — Pengerasan

### 6.1 Error boundary

Situs ini tidak punya `error.tsx` maupun `global-error.tsx` sama sekali. Error render yang tidak tertangkap hari ini memberi layar error default Next, yang di produksi berupa halaman putih dengan teks generik dalam bahasa Inggris.

Dua berkas:

- `src/app/(site)/error.tsx`, client component, menangani error di seluruh halaman publik. Ia tetap berada di dalam layout situs sehingga header dan footer bertahan. Menyediakan tombol `reset()` dan tautan ke beranda. Bahasa Indonesia, gaya visual mengikuti `not-found.tsx` yang sudah ada.
- `src/app/global-error.tsx`, menangani error yang terjadi di root layout itu sendiri. Ia wajib merender `<html>` dan `<body>` sendiri karena layout yang gagal tidak menyediakannya.

Keduanya tidak menampilkan `error.message` kepada pengunjung. Pesan error Next bisa memuat detail internal. `error.digest` boleh ditampilkan karena ia memang dirancang untuk dikutip pengunjung ke tim teknis.

Satu spec Playwright membuktikan boundary benar-benar menangkap, bukan sekadar ada. Caranya lewat route uji yang sengaja melempar, dan route itu hanya terdaftar di lingkungan test.

### 6.2 `staticDir` koleksi media

Koleksi `media` tidak menyetel `staticDir`, dan sampai hari ini belum pernah ada upload sehingga direktorinya belum lahir. Artinya lokasi penyimpanan hari ini adalah default Payload yang belum pernah diamati siapa pun di repo ini.

Ini bukan detail kosmetik. Di container, upload yang mendarat di lokasi yang tidak dipetakan ke volume akan hilang setiap redeploy, dan hilangnya senyap: admin melihat upload berhasil, gambar tampil, lalu dua minggu kemudian seluruh cover artikel jadi rusak.

Task wajib **mengamati lebih dulu** di mana Payload sebenarnya menulis berkas, dengan melakukan satu upload sungguhan lewat `/admin`, baru kemudian memaku `staticDir` ke path eksplisit. Urutan itu penting; menebak path lalu memakunya menghasilkan konfigurasi yang terlihat benar dan salah.

Path yang dipilih tidak boleh bertabrakan dengan `public/media/`, yang sudah dipakai pipeline aset kurasi (`alur-sts`, `bisnis`, `hari`, `lini-bisnis`) dan isinya dikomit ke git. Upload admin bersifat runtime dan tidak pernah dikomit; menyatukan keduanya di satu direktori membuat `git status` kotor tiap kali klien mengunggah gambar.

---

## 7. Fase D — Deployment

Master spec bagian 15, seluruhnya belum ada.

### 7.1 `output: 'standalone'`

`next.config.ts` hari ini adalah `withPayload({})` telanjang. `output: 'standalone'` membuat Next memancarkan server minimal beserta hanya dependency yang benar-benar dipakai, yang mengecilkan image secara drastis.

Ia berinteraksi dengan `withPayload`, dan interaksi itu wajib diverifikasi, bukan diasumsikan: build harus tetap menghasilkan `/admin` yang berfungsi. Payload memuat berkas config saat runtime, dan `standalone` bekerja dengan menelusuri berkas yang dipakai. Bagian yang paling mungkin hilang dari hasil telusur adalah importMap admin dan berkas migrasi.

### 7.2 Dockerfile

Multi-stage dengan bun, mengikuti bentuk resmi yang direkomendasikan dokumen Next untuk `standalone`:

1. **deps** — `bun install --frozen-lockfile`
2. **builder** — salin sumber, `bun run build`
3. **runner** — image ramping, user non-root, salin `.next/standalone`, `.next/static`, dan `public/`

Empat hal yang khusus untuk repo ini dan tidak ada di template mana pun:

- `sharp` adalah dependency native. Image runner harus punya pustaka sistem yang dibutuhkannya, atau upload gambar gagal saat resize dengan pesan yang menyesatkan.
- Berkas migrasi wajib ikut ke stage runner. `prodMigrations` mengimpornya secara statis, jadi ia seharusnya terbundel, tapi seharusnya bukan bukti.
- Direktori upload dari 6.2 dibuat dan dimiliki user non-root sebelum container start.
- `NEXT_PUBLIC_SITE_URL` dibaca saat build, bukan saat runtime, karena `metadataBase` dan `absoluteUrl` memakainya. Ia harus jadi build arg, bukan hanya environment variable runtime. Salah menempatkannya menghasilkan seluruh canonical dan OG image menunjuk localhost di produksi, dan situs tetap tampak normal.

### 7.3 Compose produksi dan volume

`docker-compose.prod.yml` terpisah dari `docker-compose.yml` yang ada. Yang sekarang hanya menjalankan Postgres untuk pengembangan dan tidak boleh berubah perannya.

Isinya: service aplikasi, service Postgres, named volume untuk upload, named volume untuk data Postgres, dan healthcheck di keduanya. Aplikasi menunggu Postgres sehat sebelum start.

### 7.4 Migrasi saat container start

Entrypoint menjalankan `payload migrate` lalu menyerahkan proses ke server Next.

Dua sifat yang wajib dipenuhi:

- **Non-interaktif.** Docblock di `payload.config.ts` sudah mencatat bahwa baris migrasi bertanda `batch:-1` membuat `migrate()` berhenti di prompt konfirmasi yang menggantung selamanya di proses non-TTY. `push: false` sudah mencegah baris seperti itu lahir, dan entrypoint tidak boleh melemahkannya.
- **Gagal keras.** Migrasi gagal berarti container gagal start. Aplikasi yang tetap naik di atas skema yang salah jauh lebih buruk daripada container yang menolak start dengan log yang jelas.

### 7.5 Bukti yang dituntut fase D

Fase ini tidak dianggap selesai karena image berhasil dibuild. Rangkaian berikut wajib dijalankan dan hasilnya dicatat:

1. Build image dari repo bersih.
2. Jalankan `docker-compose.prod.yml`, tunggu keduanya sehat.
3. Hit sembilan route publik, seluruhnya `200`.
4. Login ke `/admin`, unggah satu gambar, buat satu artikel, publish.
5. Artikel muncul di `/artikel` dan di beranda **tanpa rebuild**.
6. `docker compose restart` pada service aplikasi.
7. Gambar yang diunggah di langkah 4 **masih ada**.

Langkah 7 adalah satu-satunya cara membuktikan `staticDir` dan volume benar-benar bertemu. Langkah 5 membuktikan revalidasi bekerja di produksi, bukan hanya di dev.

### 7.6 Runbook di README

Bagian baru berisi: cara build image, environment variable yang wajib diisi beserta mana yang build arg dan mana yang runtime, cara menjalankan seed pertama kali, cara backup volume upload, dan cara menukar ke S3 kalau klien menyediakan bucket nanti.

Bagian S3 adalah dokumentasi, bukan implementasi. Perbedaannya ditulis eksplisit supaya pembaca berikutnya tidak mengira jalur itu sudah pernah dijalankan.

---

## 8. Testing

Mengikuti master spec bagian 14. Yang baru:

**Vitest**
- Bentuk dan akses koleksi `posts`
- Builder JSON-LD `Article`, `Service`, `LocalBusiness`
- `Article` JSON-LD dengan judul yang memuat `</script>`
- `buildMetadata` memancarkan `openGraph.images` absolut
- `sitemap.ts` versi async: path statis valid, artikel draft tidak pernah masuk
- Render daftar artikel, termasuk empty state
- Seksi Artikel Terbaru menghilang saat koleksi kosong

**Playwright**
- **Alur admin-publish.** Login, buat artikel, publish, lalu pastikan ia muncul di `/artikel` dan beranda tanpa rebuild. Ini tes yang membuktikan revalidasi benar-benar bekerja, dan tanpanya CMS bisa terlihat berfungsi padahal tidak. Ia juga jadi verifikasi browser pertama untuk `/admin`, yang menutup butir 1 dari lima item terbuka Plan 2.
- Draft tidak pernah tampil di `/artikel`, sebagai tes keamanan terhadap jebakan `overrideAccess` di 4.1
- `/artikel` dan `/artikel/[slug]` terbaca tanpa JavaScript
- axe di kedua route baru, di tiga viewport, ditambahkan ke `ROUTES` di `a11y-viewport.spec.ts`
- Error boundary menangkap error yang dilempar sengaja

**Verifikasi manual yang tidak bisa diotomatiskan**
- Kartu OG korporat dan artikel diperiksa lewat validator, dan hasilnya dilihat dengan mata, bukan disimpulkan dari kode yang terlihat benar
- Rangkaian tujuh langkah di 7.5

---

## 9. Urutan dan ketergantungan

Urutannya tidak bebas. Empat ketergantungan keras:

1. **`metadataBase` sebelum OG mana pun.** Bagian 5.1.
2. **`staticDir` sebelum Dockerfile.** Volume tidak bisa dipetakan ke path yang belum ditentukan. Bagian 6.2 dan 7.2.
3. **Koleksi `posts` dan migrasinya sebelum apa pun yang query artikel.** Termasuk sitemap, beranda, dan seed.
4. **Seed sebelum spec admin-publish.** Spec itu butuh kredensial yang pasti ada. Bagian 4.7.

Selain keempatnya, fase B dan C saling bebas dan boleh ditukar urutannya.

Tiap fase berakhir di keadaan yang hijau di seluruh gerbang dan bisa di-commit. Eksekusi boleh berhenti di batas fase.

---

## 10. Risiko

| Risiko | Dampak | Penanganan |
|---|---|---|
| Migrasi `posts` dengan `versions: { drafts: true }` menghasilkan bentuk yang tidak diduga | Migrasi gagal atau kehilangan data | Periksa keluaran `migrate:create` sebelum commit. Uji terhadap database yang sudah berisi, bukan kosong. Bagian 4.1 |
| `Users.name` required pada koleksi berisi | Migrasi gagal di database yang sudah punya user | Default sementara lalu tegakkan NOT NULL. Uji terhadap database berisi. Bagian 4.2 |
| Local API `overrideAccess: true` membuat draft bocor ke halaman publik | Artikel draft tayang. Build hijau, tes hijau | Saring `_status` eksplisit di query. Satu spec Playwright khusus. Bagian 4.1 dan 8 |
| `revalidatePath("/sitemap.xml")` ternyata tidak menyentuh metadata route | Sitemap basi selamanya | Buktikan empiris. Cadangan `revalidate = 3600` sudah ditentukan di muka. Bagian 4.3 |
| `output: 'standalone'` tidak membawa berkas yang dibutuhkan Payload | `/admin` mati di produksi, dev tetap normal | Verifikasi `/admin` dari dalam container, bukan dari `next start` lokal. Bagian 7.1 |
| `NEXT_PUBLIC_SITE_URL` diperlakukan sebagai runtime env | Seluruh canonical dan OG menunjuk localhost. Situs tampak normal | Jadikan build arg. Periksa HTML hasil build dari dalam image. Bagian 7.2 |
| Upload mendarat di luar volume | Gambar hilang tiap redeploy, senyap | Langkah 6 dan 7 di 7.5 |
| Plan tidak selesai dalam satu sesi | Repo tertinggal setengah jadi | Batas fase adalah titik berhenti yang aman. Bagian 1 dan 9 |
| Klien menolak teks artikel seed | Konten agen tayang atas nama klien | Hapus dari `/admin`, revalidasi membersihkan sendiri. Dicatat di README. Bagian 4.7 |

---

## 11. Di luar scope

- Adapter S3. Didokumentasikan, tidak diimplementasikan. Keputusan 5.
- Notifikasi email untuk lead form. Master spec menyebutnya "bila ditambahkan nanti"; sampai sekarang belum diminta.
- `JobPosting` JSON-LD. Bagian 3.
- Rate limiter lintas instance. Yang ada in-memory per instance dan batasnya sudah dicatat di README sejak Plan 8. Menggantinya dengan penyimpanan bersama adalah pekerjaan tersendiri yang butuh Redis atau setara.
- Merge `denis` ke `master`.
- Situs booking `dutabahari.id` dan situs galangan `ptdml.com`. Keduanya sudah di luar scope sejak master spec bagian 16.
- Paginasi artikel, kecuali jumlah artikel melewati ambang satu halaman. Bagian 4.4.
