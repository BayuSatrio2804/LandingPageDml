# Plan 8 — Halaman bisnis, artikel, dan penutupan link mati

Tanggal: 23 Agustus 2026
Status: disetujui pemilik repo, siap masuk `writing-plans`
Ruang lingkup: `dml-web`

---

## 1. Ringkasan

Situs sudah punya beranda sinematik sembilan seksi, `/tentang-kami`, `/kontak`,
dan `/karier`. Yang belum ada adalah seluruh cabang `/bisnis`, seluruh kanal
`/artikel`, dan tabel legalitas di `/tentang-kami#profil`. Akibatnya navigasi
utama memuat dua item yang menuju halaman 404 (`/bisnis` dan `/artikel`), footer
memuat tiga tautan mati, dan `sitemap.ts` mengiklankan enam URL yang tidak ada ke
mesin pencari.

Spec ini menutup semuanya: empat halaman baru di cabang `/bisnis`, dua halaman
artikel dengan koleksi Payload dan jalur revalidasi yang benar-benar diverifikasi,
satu tabel legalitas, lalu sapuan konsistensi yang menyelaraskan sitemap, copy
usang, dan tiga utang teknis yang tercatat sejak Plan 2 dan Plan 6.

Setelah keduanya selesai, tidak ada satu pun tautan internal di situs yang menuju
halaman yang tidak ada, dan `/admin` sudah pernah diverifikasi lewat browser
sungguhan untuk pertama kalinya sejak repo ini dimulai.

**Dieksekusi sebagai dua plan, bukan satu.** Plan 8 mengerjakan cabang bisnis,
legalitas, dan sapuan; Plan 9 mengerjakan artikel. Pembagian, alasan, dan tiga
berkas yang disentuh keduanya ada di bagian 18. Nomor bagian di spec ini dirujuk
langsung oleh kedua plan, jadi penomorannya tidak boleh diubah setelah plan
ditulis.

---

## 2. Keputusan yang sudah diambil

Tujuh keputusan berikut diambil pemilik repo pada sesi brainstorming 23 Agustus
2026. Semuanya sudah final dan tidak dibuka lagi di implementasi.

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Pipeline artikel dibangun penuh | Koleksi `posts`, kedua route, hook revalidasi, sitemap dinamis, seksi beranda, dan spec Playwright admin-publish. Tanpa ini Payload di repo cuma menampung `inquiries`, dan seluruh alasan keberadaan CMS gugur. |
| 2 | `/karier` cukup diwire JSON-LD | `jobPostingJsonLd()` saat ini dead code: diekspor dan dites, tidak pernah dipanggil halaman mana pun. Tidak ada koleksi lowongan. |
| 3 | `/bisnis/galangan-kapal` dicoret | DMLD adalah perusahaan terpisah di Sinar Alam Corporation, bukan lini DML. Sudah diputuskan di docblock `navigation.ts`; yang tersisa cuma `sitemap.ts` yang belum ikut. |
| 4 | Revalidasi pakai `revalidatePath` | Bukan `unstable_cache` + `revalidateTag`, bukan `cacheComponents`. Lihat bagian 10.2. |
| 5 | Subhalaman dalam, beranda tetap ringkas | Subhalaman `/bisnis/*` jadi dokumen operasional, bukan versi panjang beranda. Lihat bagian 12. |
| 6 | Tabel dokumen legal masuk `/tentang-kami#profil` | Datanya lengkap di PDF hal. 06 dan tidak diblokir klien. Heading "Legalitas dan Sertifikasi" sudah ada di sana tapi isinya satu kalimat. |
| 7 | Dieksekusi sebagai dua plan, bisnis lebih dulu | Dua puluh empat task akan jadi plan terbesar di repo ini, kedua cabang tidak saling bergantung, dan separuh artikel membawa satu-satunya risiko tinggi. Lihat bagian 18. |

---

## 3. Peta halaman final

| Route | Status | Isi |
|---|---|---|
| `/` | ada | Ditambah satu seksi: Artikel Terbaru |
| `/tentang-kami` | ada | `#profil` ditambah tabel dokumen legal |
| `/bisnis` | **baru** | Hub. Dua lini utama, tiga afiliasi satu tingkat di bawahnya |
| `/bisnis/transportasi-bbm` | **baru** | Roster armada, alur STS, standar, CTA permintaan informasi |
| `/bisnis/penumpang-roro` | **baru** | Armada Jambo, lima lintasan, CTA pesan tiket |
| `/bisnis/transportasi-bbm/permintaan-informasi` | **baru** | Form inquiry B2B, prefill lewat query param |
| `/artikel` | **baru** | Daftar artikel published dari Payload |
| `/artikel/[slug]` | **baru** | Detail artikel |
| `/karier` | ada | Tidak berubah selain pembersihan `jobPostingJsonLd` |
| `/kontak` | ada | Copy usang diperbaiki |
| `/bisnis/galangan-kapal` | **dicoret** | Dihapus dari `sitemap.ts` |

`BookJambo` tetap bukan route. Ia item navigasi yang keluar ke `dutabahari.id`
lewat `ExternalLink`.

---

## 4. Data baru

### 4.1 `src/content/vessels.ts`

Company profile resmi halaman 04 memuat 66 nama kapal, dikelompokkan per kelas,
dan khusus ro-ro dikelompokkan lagi per lintasan. Sekarang data itu cuma hidup
sebagai komentar di `fleet.ts` untuk dua kelas saja. Plan ini mengeluarkannya jadi
data terstruktur.

Tipe `Vessel` ditulis di `src/content/types.ts` bersama tipe konten lain, bukan di
berkas datanya, mengikuti pola `FleetClass` dan `BusinessLine` yang sudah ada.
`SourceTag` sudah tersedia di sana.

```ts
export type Vessel = {
  name: string;          // apa adanya dari PDF, huruf besar dinormalkan
  classSlug: string;     // menunjuk FleetClass.slug di fleet.ts
  routeId?: string;      // hanya ro-ro, menunjuk RouteLeg.id di ports.ts
  source: SourceTag;
};
```

**Cara ekstraksi, bukan cara transkripsi.** Keluaran `pdftotext -layout` untuk
halaman ini menyisipkan teks tagline ("From Zero to / Hero with / Continuous /
Improvement") di tengah kolom Oil Barge dan SPOB, karena tagline itu memang
tergambar melintang di latar halaman. Ekstraksi dilakukan per kolom dari keluaran
`pdftotext`, bukan diketik ulang dari layar, dan baris tagline dibuang secara
sadar. Tes jumlah per kelas yang jadi wasitnya.

Isi menurut PDF halaman 04:

| Kelas | Jumlah | Catatan |
|---|---|---|
| Ro-Ro | 9 | Jambo VI, VIII, IX, X (Ketapang–Gilimanuk); BSP 1, Salvatore (Merak–Bakauheni); Jambo XII (Jangkar–Lembar); Jambo XIV (Surabaya–Kumai); Jambo XI (Surabaya–Lembar) |
| Motor Tanker | 7 | Royalty, Jazeel, AS Marine Satu, Gonaya VIII, Jefferson, Winston 01, Ocean River |
| Oil Barge | 9 | Wapoga, Rani 68, Fery 04, Sahoya 05, Megapower XI, TS 005, Sahoya 03, Sahoya 0, Utama 18 |
| SPOB | 30 | Daftar penuh di PDF, disalin apa adanya |
| Tug Boat | 11 | Bina Karya, DML 08, Albert, Fawwaz, Fery XX, Gonaya IV, Prioritas, Setia Kawan 27, Arya Candra, Sahoya 02, Teluk Sungkun 08 |

Dua hal wajib dicatat sebagai komentar di berkas itu, bukan diam-diam
dijembatani:

1. **Selisih dua kapal, sekarang bisa ditunjuk persis.** Daftar pengangkut BBM
   berisi 57 kapal (7 + 11 + 9 + 30), sedangkan ringkasan PDF di halaman yang sama
   menulis 55. Ro-ro cocok di angka 9. Jadi selisihnya seluruhnya ada di sisi BBM,
   bukan tersebar. `COMPANY.fleetSummary` tetap memakai angka ringkasan, dan tidak
   ada satu pun tempat di situs yang menjumlahkan daftar nama lalu menampilkannya
   di sebelah angka ringkasan.
2. **`OB SAHOYA 0` tampak terpotong** di PDF. Nama itu disalin apa adanya dan
   ditandai `belum-terverifikasi`, tidak ditebak jadi "Sahoya 04".

Tes `vessels.test.ts` wajib memverifikasi: jumlah per kelas cocok dengan
`vesselCount` di `fleet.ts`, setiap `classSlug` benar-benar ada di
`FLEET_CLASSES`, dan setiap `routeId` benar-benar ada di `ROUTE_LEGS`. Tes inilah
yang membuat data ini tidak bisa melenceng diam-diam dari dua berkas yang sudah
ada.

### 4.2 `src/content/legal-documents.ts`

Sembilan baris dari PDF halaman 06, seluruhnya bersumber `cp-pdf`:

```ts
export type LegalDocument = {
  document: string;   // "Akta Pendirian Perusahaan"
  number: string;     // "No. 3887"
  issuer: string;     // "Notaris Nyonya Bertha Suriati"
  source: SourceTag;
};
```

Isi: Akta Pendirian Perusahaan, Akta Perubahan Terakhir, DOC (Document of
Compliance), NIB, SIUPAL, TDP, Surat Keterangan Domisili Perusahaan, NPWP, dan
Sertifikat Izin Usaha Pengangkutan Kapal. Nomor dan penerbit disalin apa adanya
dari PDF, dengan kapitalisasi dinormalkan dari huruf besar semua.

### 4.3 Aturan data yang tidak bisa ditawar

Apa pun yang tidak ada di `assets/CP DML.pdf` tidak dibuat. Kalau saat
implementasi ternyata sebuah seksi yang dirancang di sini tidak punya data
sumber, seksi itu **dihapus dari halaman**, bukan diisi angka wajar. Ini berlaku
khusus untuk dua hal yang paling menggoda untuk ditebak: jadwal keberangkatan
ro-ro dan daftar fasilitas kapal penumpang. Keduanya tidak ada di PDF, jadi
keduanya tidak ada di desain ini.

Setiap angka baru wajib membawa `SourceTag` dan komentar sumber, mengikuti pola
yang sudah berlaku di seluruh `src/content/`.

### 4.4 Aset foto

Tersedia dan belum pernah dipakai: 53 foto drone kapal di
`assets/_raw/kapal-kapal/`, dan dua set foto operasi ship-to-ship di
`assets/_raw/sts-06-juli/` serta `assets/_raw/sts-sri-yuliani/`. Masuk lewat
`scripts/prepare-assets.ts` yang sudah ada, terdaftar di `MEDIA` manifest, dan
disajikan sebagai AVIF empat lebar seperti aset lain.

Dua set media baru: `bisnis` (tiga frame: `hub-bisnis`, `lini-bbm`, `lini-roro`)
dan `alur-sts` (tiga frame bernomor). Setiap frame wajib punya alt text bahasa
Indonesia yang menyebut apa yang benar-benar terlihat, bukan kalimat pemasaran.

Empat frame yang sudah dipakai beranda tidak boleh dipakai ulang di subhalaman.
Foto yang sama di dua tempat membuat subhalaman terbaca sebagai pengulangan,
yang persis lawan dari pembagian tugas di bagian 12.

---

## 5. `/bisnis` — hub

Halaman pengarah yang tetap punya isi sendiri, bukan indeks kosong.

**Struktur:**

1. Judul halaman dan satu paragraf posisi: DML anak usaha Sinar Alam Corporation,
   dua lini yang dijalankan sendiri, tiga afiliasi di sekitarnya.
2. Dua kartu lini utama dari `MAIN_LINES`. Besar, berfoto, membawa metrik (55
   kapal pengangkut BBM, 9 kapal ro-ro) dan bullet armada atau lintasan. Masing
   masing menaut ke subhalamannya.
3. Tiga afiliasi dari `AFFILIATES`. Secara visual **jelas satu tingkat lebih
   rendah**: tanpa foto, kartu lebih kecil, dan diberi garis penghubung yang
   menyatakan mereka bersandar di bawah dua lini utama, mengikuti kurung siku di
   PDF halaman 03. Ini bukan dekorasi. Menyamakan bobot visual afiliasi dengan
   lini utama berarti mengklaim rute Merak–Bakauheni sebagai rute DML, padahal itu
   dijalankan Tri Sumaja Lines.
4. Ringkasan angka: 64 kapal, lebih dari 300 orang, berdiri 1988.
5. Satu CTA primer ke `/bisnis/transportasi-bbm/permintaan-informasi`.

**Yang tidak boleh ada:** komparator 3D, peta rute, atau seksi STS. Ketiganya
sudah jadi seksi beranda, dan hub yang mengulangnya membuat pengunjung membaca
cerita yang sama dua kali dengan bobot berbeda.

---

## 6. `/bisnis/transportasi-bbm`

Halaman terdalam di situs untuk audiens procurement energi.

**Struktur:**

1. **Pembuka tipis.** Satu foto operasi lebar, judul, dan paragraf cakupan
   ("distribusi bahan bakar cair ke pelabuhan dan pulau utama Indonesia", PDF hal.
   03). Tinggi maksimal sekitar 60vh, bukan panggung sepenuh layar.
2. **Roster armada.** Empat kelas BBM lewat `SpecTable` yang sudah ada di
   `src/features/fleet/spec-table.tsx`, ditambah `BlueprintSvg` per kelas. Kolom:
   jumlah kapal, panjang, lebar, DWT, kapasitas. Setiap angka estimasi tetap
   membawa penanda `belum-terverifikasi` yang terlihat pengguna, bukan hanya di
   komentar kode.
3. **Daftar nama kapal per kelas.** Dari `vessels.ts`. Ini bagian yang membuat
   halaman ini punya kedalaman yang tidak dimiliki beranda: 57 nama kapal nyata,
   dikelompokkan, bisa dibaca dan dicari. Ditampilkan sebagai daftar berkolom,
   bukan tabel kedua.
4. **Alur kerja ship-to-ship.** Langkah demi langkah, disertai galeri foto STS
   asli. Beranda sudah menjelaskan STS sebagai adegan; di sini ia dijelaskan
   sebagai prosedur. Jumlah langkah mengikuti apa yang benar-benar terbaca dari
   foto dan PDF, tidak dikarang jadi angka bulat.
5. **Klaster standar.** Dari `COMPANY.standards`: ISM Code, ISO 9001:2015, Biro
   Klasifikasi Indonesia, SAP. Memakai badge yang sama dengan seksi sertifikasi
   beranda supaya tidak muncul dua bahasa visual untuk hal yang sama.
6. **CTA tunggal** ke `/bisnis/transportasi-bbm/permintaan-informasi`, membawa
   query param `?layanan=transportasi-bbm`.

---

## 7. `/bisnis/penumpang-roro`

**Struktur:**

1. Pembuka tipis dengan foto KMP Jambo.
2. **Tabel lima lintasan.** Kolom: lintasan, kapal yang melayani, operator.
   Kolom operator memisahkan tegas DML dari PT Tri Sumaja Lines. Data dari
   `ROUTE_LEGS` dan `vessels.ts`, yang memang sudah menyimpan `routeId` per kapal
   ro-ro persis untuk keperluan ini.
3. **Armada Jambo.** Sembilan kapal bernama, dengan spesifikasi kelas ro-ro dari
   `FLEET_CLASSES` (68 m, sekitar 400 penumpang) dan penanda bahwa dimensi itu
   berlaku untuk kelas, bukan diukur per kapal.
4. **Satu CTA primer** keluar ke `dutabahari.id` lewat `ExternalLink`, dengan ikon
   external dan `rel="noopener noreferrer"`.

**Tidak ada peta rute di halaman ini.** Peta adalah seksi beranda. Halaman ini
memberi tabel, yang justru lebih berguna untuk orang yang sudah tahu mau
menyeberang ke mana.

**Tidak ada jadwal keberangkatan dan tidak ada daftar fasilitas kapal.** Keduanya
tidak ada di PDF. Kalau klien mengirim datanya nanti, keduanya jadi tambahan yang
rapi di halaman ini, dan prosedurnya dicatat di README.

---

## 8. `/bisnis/transportasi-bbm/permintaan-informasi`

Form inquiry B2B. **Memakai ulang `src/features/inquiry/`**, bukan form kedua dari
nol.

**Perubahan pada fitur inquiry yang sudah ada:**

`inquirySchema` sekarang hanya punya `name`, `phone`, `email`, `message`, dan
honeypot `website`, padahal koleksi `inquiries` sudah punya kolom `company` dan
`service` yang tidak pernah terisi dari form mana pun. Plan ini menutup celah itu.

```ts
// schema.ts
export const inquirySchema = z.object({ /* seperti sekarang */ });

export const businessInquirySchema = inquirySchema.extend({
  company: z.string().trim().min(2, { error: "Nama perusahaan wajib diisi" }),
  service: z.enum(["transportasi-bbm", "penumpang-roro"]),
  cargoType: z.string().trim().optional(),
  route: z.string().trim().optional(),
  volume: z.string().trim().optional(),
});
```

`submitInquiry` menerima hasil parse dari salah satu skema dan mengisi `company`
serta `service` kalau ada. Honeypot, rate limit, dan penanganan galat Postgres
yang sudah ada tetap berlaku apa adanya, termasuk komentar `react-doctor-disable`
yang menjelaskan kenapa server action ini sengaja tanpa auth.

**Prefill.** Query param `?layanan=transportasi-bbm` mengisi field `service`.
Nilai yang tidak dikenali diabaikan diam-diam dan field kembali ke default, bukan
melempar galat. Nilai query tidak pernah dipakai untuk merangkai teks yang
ditampilkan.

**`source`** yang tersimpan: `"permintaan-informasi-bbm"`. Ini yang membedakannya
dari lead `/kontak` di admin.

**Sesudah simpan berhasil**, pengunjung diarahkan ke `wa.me` dengan pesan
terstruktur, persis pola yang sudah dipakai `ContactForm`.

State yang wajib ada dan wajib dites: idle, submitting dengan tombol nonaktif,
sukses, galat validasi per field, dan galat server. Label di atas input,
`autoComplete` terisi, error di bawah input, tidak pernah placeholder sebagai
label.

---

## 9. `/tentang-kami#profil` — legalitas

Heading "Legalitas dan Sertifikasi" sudah ada di sana dan isinya satu kalimat.
Plan ini mengisinya dengan tabel dari `legal-documents.ts`.

Tiga kolom: dokumen, nomor, penerbit. Sembilan baris. Di bawah 768 px tabel jatuh
ke daftar bertingkat, bukan tabel yang menggulir horizontal, karena kolom
penerbit di sini panjang panjang dan tabel gulir horizontal di mobile sudah pernah
jadi temuan aksesibilitas di Plan 6.

Seksi ini memakai `SectionHeader` dan wash, mengikuti keputusan Plan 6 Temuan 6
yang sudah menyeragamkan seluruh halaman ini.

---

## 10. Artikel

### 10.1 Koleksi `posts`

Sesuai master spec bagian 10, tanpa penambahan:

| Field | Tipe | Catatan |
|---|---|---|
| `title` | text | required |
| `slug` | text | unique, indexed, auto dari title, bisa diedit |
| `excerpt` | textarea | maks 200 karakter, dipakai meta description dan kartu |
| `coverImage` | upload ke `media` | required |
| `content` | richText Lexical | |
| `category` | select | Operasi, Armada, Keselamatan, Perusahaan |
| `publishedAt` | date | |
| `author` | relationship ke `users` | |
| `seo.metaTitle` | text | opsional, fallback ke `title` |
| `seo.metaDescription` | textarea | opsional, fallback ke `excerpt` |
| `_status` | draft / published | fitur draft bawaan Payload |

**Access control.** `read` untuk publik hanya mengembalikan dokumen berstatus
published. `create`, `update`, `delete` hanya untuk user terautentikasi. Ini
mengikuti pelajaran Plan 2, ketika `Inquiries.access.create` yang terbuka jadi
satu dari dua temuan keamanan yang memblokir branch: koleksi baru harus dikunci
sejak baris pertama, bukan dikunci belakangan.

**Migrasi.** Satu migrasi baru, terkomit, dan didaftarkan di
`src/migrations/index.ts` supaya `prodMigrations` melihatnya. Tidak ada
ketergantungan pada dev-mode schema push; `push: false` tetap berlaku dan
alasannya sudah tertulis panjang di `payload.config.ts`.

### 10.2 Revalidasi

**Ini bagian yang paling banyak berubah dari master spec, dan alasannya harus
tercatat.**

Master spec bagian 10.1 ditulis sebelum Next 16 dan menetapkan
`revalidateTag('posts')`. Dokumen Next 16 yang terbungkus di
`node_modules/next/dist/docs/` menyatakan dua hal yang membatalkan resep itu:

1. `revalidateTag(tag)` satu argumen **deprecated**. Tanda tangannya sekarang
   `revalidateTag(tag, profile)`, dengan `"max"` sebagai nilai yang
   direkomendasikan.
2. `unstable_cache` ditandai "replaced by `use cache` in Next.js 16". Padahal
   `use cache` dan `cacheTag` hanya tersedia kalau `cacheComponents` menyala, dan
   master spec bagian 10.1 sudah memutuskan `cacheComponents` **mati** untuk rilis
   pertama karena dukungan Payload belum dijamin penuh. Menyalakannya berarti
   mempertaruhkan `/admin`, bukan cuma artikel.

Jalan keluarnya: **`revalidatePath`**, yang tidak deprecated, tidak butuh
`cacheComponents`, dan tidak butuh membungkus query Payload dalam API yang
dokumennya sendiri sudah menyatakan digantikan.

Hook `afterChange` dan `afterDelete` pada `posts` memanggil:

```
revalidatePath("/artikel")
revalidatePath(`/artikel/${slug}`)
revalidatePath("/")            // seksi Artikel Terbaru
revalidatePath("/sitemap.xml")
```

Perubahan draft ke published dan sebaliknya sama-sama memicu hook. Kalau slug
berubah, path lama **dan** path baru sama sama direvalidasi, kalau tidak halaman
di slug lama akan hidup terus sebagai hantu.

**`revalidatePath("/sitemap.xml")` belum terverifikasi.** Dokumen
`revalidatePath` di Next 16 tidak menyebut metadata route sama sekali. Jadi
pemanggilan itu tetap dipasang, tapi task yang mengerjakannya wajib membuktikan
secara empiris bahwa sitemap benar-benar ikut segar setelah publish, bukan
menganggapnya berhasil. Kalau ternyata tidak, cadangannya sudah ditentukan di
muka: `sitemap.ts` diberi `export const revalidate = 3600`, sehingga ia sembuh
sendiri dalam satu jam tanpa bergantung pada hook. Sitemap yang telat satu jam
tidak merugikan siapa pun; sitemap yang tidak pernah berubah merugikan.

**`dynamicParams` wajib tetap `true`, dan ini bukan detail.** Saat `next build`
berjalan di lingkungan tes, koleksi artikel masih kosong, jadi
`generateStaticParams` mengembalikan array kosong. Artikel yang dipublikasikan
sesudah build hanya bisa muncul karena `dynamicParams` bernilai `true` secara
default, yang membuat segment dinamis di luar hasil `generateStaticParams`
dirender saat request. Menambahkan `export const dynamicParams = false` demi
"kerapian" akan mematikan persis alur yang jadi alasan keberadaan seluruh
pipeline ini, dan matinya senyap: build tetap hijau, tes unit tetap hijau, hanya
spec admin-publish yang gagal. Larangan ini ditulis sebagai komentar di
`/artikel/[slug]/page.tsx`, bukan hanya di spec ini.

Catatan terkait: `dynamicParams` **tidak tersedia** saat `cacheComponents`
menyala. Itu satu alasan tambahan, di luar risiko Payload, kenapa keputusan 4
menjauh dari `cacheComponents` untuk rilis ini.

Situs ini punya tepat empat permukaan yang perlu disegarkan. Sistem tag membeli
fleksibilitas yang tidak dipakai, dengan ongkos menanam API yang sudah ditandai
usang. Kalau suatu saat permukaan artikel bertambah banyak, atau
`cacheComponents` sudah aman dipakai bersama Payload, pindah ke `use cache` +
`cacheTag` adalah peningkatan yang jelas dan dicatat di sini sebagai kandidat.

Route korporat lain tetap statis penuh dan tidak pernah direvalidasi CMS:
`/tentang-kami`, `/bisnis` beserta seluruh cabangnya, `/karier`, dan `/kontak`
tidak memuat konten CMS sama sekali, jadi publish artikel tidak menyentuhnya.

Beranda adalah pengecualiannya, dan pengecualian itu disengaja. Sejak seksi
Artikel Terbaru masuk, `/` memuat konten CMS, jadi ia **wajib** ikut
direvalidasi. Master spec bagian 10.1 menyebut route korporat tidak pernah
direvalidasi; sejak seksi artikel ada di beranda, kalimat itu tidak lagi
mencakup `/`.

**Konsekuensi build yang harus dicatat di README.** Begitu `/` melakukan query
artikel, `bun run build` membutuhkan Postgres hidup, bukan hanya `test:e2e`.
README saat ini hanya memperingatkan untuk `test:e2e`, padahal `bun run check`
menjalankan build. Tanpa baris tambahan itu, anggota tim pertama yang menjalankan
`check` di mesin dingin mendapat kegagalan yang terbaca seperti bug kode.

### 10.3 `/artikel` dan `/artikel/[slug]`

`/artikel` menampilkan daftar artikel published, terbaru dulu. Tata letak
editorial: artikel terbaru mendapat bobot lebih besar, sisanya menyusul. Bukan
grid kartu identik.

Kalau belum ada artikel sama sekali, halaman menampilkan empty state yang jujur
("Belum ada artikel"), bukan halaman kosong dan bukan kartu placeholder.

`/artikel/[slug]` memakai `generateStaticParams` dari slug published. Slug yang
tidak ada memanggil `notFound()`. Halaman merender Lexical richtext, cover image,
kategori, tanggal terbit, dan penulis.

**Metadata dan JSON-LD.** `generateMetadata` per artikel dengan fallback
`seo.metaTitle → title` dan `seo.metaDescription → excerpt`. JSON-LD `Article`
dirangkai lewat `safeJsonLdString` yang sudah ada. Docblock di `json-ld.ts` sudah
menyebutkan bahwa escape `<` dipasang di sana justru untuk mengantisipasi JSON-LD
artikel dari input admin. Plan ini adalah saat antisipasi itu terpakai.

Paginasi hanya dibangun kalau jumlah artikel melewati ambang satu halaman.
Membangun paginasi untuk koleksi kosong adalah kode yang tidak pernah dieksekusi.

### 10.4 Seksi Artikel Terbaru di beranda

Master spec bagian 7.9. Tiga artikel terbaru, grid editorial bukan tiga kartu
identik.

**Seksi ini hilang sepenuhnya kalau koleksi kosong.** Tidak ada empty state di
beranda. Beranda adalah halaman penjualan; "belum ada artikel" di sana melemahkan
tanpa memberi apa pun.

Posisinya: setelah `Certifications`, sebelum `CtaSection`. Alasannya tercatat di
docblock `page.tsx` yang sudah ada: tidak boleh ada dua seksi berurutan dengan
keluarga tata letak yang sama. Seksi sertifikasi adalah badge grid, seksi artikel
adalah kartu editorial bergambar, seksi CTA adalah bidang teks. Ritmenya tetap
utuh.

---

## 11. Sapuan konsistensi dan utang teknis

### 11.1 `sitemap.ts`

Sekarang mengiklankan enam URL yang 404. Diperbaiki jadi: daftar statis yang
cocok dengan route yang benar-benar ada, `/bisnis/galangan-kapal` dihapus, dan
slug artikel published ditambahkan secara dinamis. Komentar "Slug artikel
ditambahkan di Plan 4 ketika Payload sudah ada" dihapus karena plan ini yang
akhirnya menepatinya.

Satu tes wajib: setiap path di sitemap dapat diselesaikan ke route yang ada.
Tes inilah yang mencegah sitemap kembali melenceng, dan cacat persis ini sudah
hidup di repo sejak Plan 1.

### 11.2 Copy usang di `/kontak`

Tiga hal di `src/app/(site)/kontak/page.tsx`:

- "Ketiga lini bisnis kami" padahal `BUSINESS_LINES` yang dirender tinggal dua
  sejak Plan 5.
- `sm:grid-cols-3` untuk daftar dua item, yang menyisakan satu kolom menganga.
- "Halaman detail tiap lini menyusul di plan berikutnya." Plan ini adalah plan
  berikutnya itu. Kalimatnya diganti tautan ke kedua subhalaman.

### 11.3 `jobPostingJsonLd`

Dead code: diekspor, dites, tidak pernah dipanggil. Karena tidak ada koleksi
lowongan dan `/karier` sengaja tetap empty state, fungsi ini **dihapus** bersama
tesnya. Kalau lowongan datang nanti, menulis ulang delapan baris itu lebih murah
daripada memelihara fungsi yang tidak pernah jalan dan tidak pernah terbukti
menghasilkan JSON-LD yang valid di halaman sungguhan.

### 11.4 `Reveal` pindah ke `fromTo` + `clearProps`

Audit Plan 6 mencatat ini sebagai "layak jadi task tersendiri kalau pemilik repo
mau menutupnya nanti". `src/components/motion/reveal.tsx` masih memakai
`gsap.from()`, sedangkan hero sudah memakai `fromTo()` + `clearProps`. Guard
`reducedMotion: "reduce"` di dua spec Playwright menutupi gejalanya untuk axe,
tapi akar masalahnya tetap ada: pengguna dengan motion normal yang menggulir cepat
sempat melihat elemen di bawah lipatan dalam keadaan pucat.

Setelah diperbaiki, guard `reducedMotion` di `a11y-viewport.spec.ts` dan
`tentang-kami.spec.ts` diperiksa ulang: kalau ia sudah tidak diperlukan, ia
dilepas, supaya tes kembali menguji keadaan yang benar-benar dilihat mayoritas
pengguna.

### 11.5 Rate limiter tidak lagi hanya percaya `x-forwarded-for`

Tercatat sebagai butir 2 dari lima item Plan 2 yang belum ditriase. Sekarang kunci
rate limit diambil dari header yang bisa dipalsukan siapa pun. Setelah plan ini
ada dua form publik, bukan satu, jadi ongkos membiarkannya naik.

Perbaikannya realistis, bukan sempurna, dan bentuknya konkret:

1. Jumlah proxy tepercaya dibuat eksplisit lewat variabel lingkungan
   `TRUSTED_PROXY_HOPS` (default `1`). Kunci diambil dari entri
   `x-forwarded-for` pada posisi hop itu dihitung dari kanan, bukan dari entri
   paling kiri yang sepenuhnya dikendalikan klien. Ini perubahan terpenting:
   entri paling kiri adalah nilai yang paling mudah dipalsukan, dan itu persis
   yang dipakai kode sekarang.
2. Bucket per-IP dipertahankan, ditambah satu bucket global yang jauh lebih
   longgar sebagai batas atas. Bucket global inilah yang tetap berlaku kalau
   penyerang memutar-mutar header, dan angkanya dipilih supaya tidak pernah
   tersentuh lalu lintas manusia yang wajar.
3. Rate limiter tetap in-memory per instance. Ia tidak tahan terhadap deploy
   multi-instance, dan keterbatasan itu ditulis di komentar kode supaya tidak
   dibaca sebagai jaminan yang lebih kuat dari kenyataannya.

Batas sungguhan terhadap penyalahgunaan tetap ada di lapisan infrastruktur.
Tujuan perubahan ini adalah menutup pemalsuan sepele, bukan mengklaim
perlindungan yang tidak dimiliki proses Node tunggal.

### 11.6 Verifikasi `/admin` lewat browser sungguhan

Butir 1 dari lima item Plan 2: `/admin` login dan UI `inquiries` read-only tidak
pernah diverifikasi browser oleh sesi mana pun. Spec Playwright admin-publish di
bagian 10.2 sekaligus menutup ini, karena ia harus login ke `/admin` lebih dulu
sebelum bisa mempublikasikan apa pun. Ditambah satu asersi kecil: koleksi
`inquiries` terbuka dan tidak menawarkan tombol create.

---

## 12. Design system dan aturan visual

Halaman baru tidak memperkenalkan bahasa visual baru. Token warna, tipografi,
`SectionHeader`, dan sistem wash berselang-seling dari Plan 6 dan Plan 7 dipakai
apa adanya.

**Pembagian tugas beranda dan subhalaman.** Beranda naratif dan sinematik untuk
pengunjung pertama. Subhalaman `/bisnis/*` adalah dokumen operasional untuk
pembaca yang sudah tertarik dan sekarang mau angka. Konsekuensinya tegas:

| Milik beranda saja | Milik subhalaman saja |
|---|---|
| Komparator armada 3D | Tabel spesifikasi dan roster nama kapal |
| Peta rute SVG beranimasi | Tabel lintasan berkolom operator |
| Panggung dipaku dan potong keras | Daftar prosedur dan galeri foto |
| Hero sepenuh layar | Pembuka tipis maksimal sekitar 60vh |

Tidak ada aset WebGL kedua yang dimuat di subhalaman. Ini keputusan performa
sekaligus keputusan naratif.

**Aturan seksi dipaku tetap berlaku** dan tidak dilanggar di halaman baru mana
pun: `pin: true` hanya boleh pada panggung setinggi tepat `h-[100dvh]`, tidak
pernah pada `<section>` pembungkus yang memuat konten tambahan di bawahnya.
Pemetaan progress ke item memakai `segmentAt` dari `src/lib/motion/segments.ts`.
Halaman baru di plan ini sebetulnya tidak butuh pin sama sekali, dan itu hasil
yang diinginkan.

**Larangan beranda berlaku juga di halaman baru:** tanpa marquee, custom cursor,
scroll cue, eyebrow bernomor seksi, dot status dekoratif, strip lokasi atau cuaca,
fake screenshot dari div, em dash, pill yang ditumpuk di atas foto, caption kredit
foto palsu, dan label versi.

`transition-all` tidak boleh muncul kembali. Repo saat ini nol, dan itu
diverifikasi ulang di Plan 6.

---

## 13. SEO

Setiap halaman baru: `buildMetadata` dengan title, description, dan `path`
kanonik; `breadcrumbJsonLd` dengan jejak yang benar. Untuk
`/bisnis/transportasi-bbm/permintaan-informasi`, jejaknya empat tingkat.

`/artikel/[slug]` menambah JSON-LD `Article` dan `generateMetadata` dengan
fallback berlapis seperti di bagian 10.3.

`robots.ts` tidak berubah. `/admin` dan `/api` tetap dilarang.

Audit `seo-audit` dijalankan di akhir plan terhadap seluruh halaman baru.

---

## 14. Aksesibilitas

Aturan yang sudah terbukti jadi temuan di Plan 6 dan tidak boleh terulang:

- Tabel yang menggulir wajib `tabIndex={0}` + `role="region"` + `aria-label`,
  supaya bisa digulir dengan keyboard. Ini persis Temuan 1 Plan 6.
- Setiap input form membawa `autoComplete` yang benar. Ini Temuan 3.
- Setiap heading memakai `text-pretty`. Ini Temuan 5, dan sudah otomatis kalau
  memakai `SectionHeader`.
- Tidak ada elemen interaktif yang tidak terjangkau keyboard selama animasi
  intro. Ini Temuan 4; artinya `autoAlpha` tidak dipakai pada elemen yang memuat
  tautan atau tombol.

Sweep axe tiga viewport (375, 768, 1440) diperluas untuk mencakup lima halaman
baru. `a11y-viewport.spec.ts` sudah jadi bagian permanen gerbang `test:e2e` sejak
Plan 6, jadi halaman baru masuk ke berkas yang sama, bukan berkas terpisah.

Seluruh halaman baru jatuh ke tata letak statis di bawah 768 px dan saat reduced
motion.

---

## 15. Testing dan gerbang

**Unit (vitest).** Data baru (`vessels.test.ts`, `legal-documents.test.ts`) dengan
asersi konsistensi silang yang dijelaskan di bagian 4.1. Skema inquiry B2B, dengan
kasus prefill tidak dikenal. Komponen tabel dan roster. Sitemap.

**E2E (Playwright).** Lima halaman baru masuk sweep axe tiga viewport. Satu spec
alur form permintaan informasi dari isi sampai simpan. Satu spec
`no-js` untuk halaman baru, mengikuti pola `no-js.spec.ts` yang sudah ada.

**Spec admin-publish**, yang paling penting dan paling belum pernah ada:
login ke `/admin`, buat artikel, publish, lalu pastikan artikel itu muncul di
`/artikel` dan di seksi beranda **tanpa rebuild**. Kalau spec ini tidak lulus,
seluruh pipeline CMS di plan ini belum boleh disebut selesai, karena admin yang
menekan publish dan tidak melihat perubahan adalah CMS yang percuma.

**Postgres wajib sehat sebelum `test:e2e`.** Kalau tidak, kegagalannya terbaca
seperti bug UI padahal server action tidak bisa menyentuh database. Prosedurnya
sudah tertulis di README dan tidak diulang di sini.

**Gerbang akhir:** `bun run check` hijau seluruhnya (lint, typecheck, test, build,
doctor, lighthouse), ditambah `test:e2e` dengan Postgres berjalan.

**Catatan Lighthouse.** Angka LCP dari mesin ini tidak dipercaya sebagai bukti
regresi. Plan 4 mencatat run yang lolos sekali dan gagal tiga kali di rentang
5800 sampai 5930 ms karena kontensi CPU desktop, bukan karena perubahan kode.
Ambang 5000 ms di `lighthouserc.json` tidak disentuh plan ini. Kalau LCP memburuk,
yang diperiksa lebih dulu adalah apakah halaman baru memuat aset berat yang
seharusnya tidak ada di sana, bukan langsung menaikkan ambang.

**Audit akhir:** `design-taste-frontend` dan `web-design-guidelines` terhadap lima
halaman baru, `seo-audit`, dan `react-doctor`. `doctor` diharapkan menyisakan
tepat satu temuan, yaitu pengecualian permanen `effect-needs-cleanup` yang sudah
terdokumentasi sejak Plan 6.

---

## 16. Di luar scope

Dinyatakan terbuka, bukan diselesaikan diam-diam:

1. **Selisih 64 vs 66 kapal.** Sekarang bisa ditunjuk persis ada di sisi BBM (57
   terdaftar, 55 di ringkasan). Menunggu konfirmasi klien.
2. **`OB SAHOYA 0`** yang tampak terpotong di PDF. Disalin apa adanya, ditandai
   `belum-terverifikasi`.
3. **Dimensi kapal** (panjang, lebar, DWT per kelas) masih estimasi proporsional.
   Tidak ada di PDF.
4. **Logo sertifikasi asli.** Tiga berkas di `public/assets/cert/` masih
   placeholder. Prosedur tukar sudah tertulis di README dan tidak berubah.
5. **Status HSSE** masih `belum-terverifikasi`.
6. **Logo klien** ("Trusted by Leading Companies", PDF hal. 06). Di PDF ia satu
   gambar raster gepeng 1477x924 yang logo-logonya tidak bisa dipisah, dan memakai
   logo pihak ketiga butuh izin tersendiri dari masing masing pemilik merek.
   Butuh aset dan izin dari klien.
7. **Jadwal dan fasilitas ro-ro.** Tidak ada di PDF, lihat bagian 4.3.
8. **Merge `denis` ke `main` atau `master`.** Repo ini dipakai lebih dari satu
   orang, ada remote `BayuSatrio2804/Landing-Page`, dan `main` memuat satu commit
   yang belum ada di `denis`. Keputusan merge diambil pemilik repo terpisah dari
   plan ini.
9. **`cacheComponents`.** Kandidat peningkatan setelah live dan stabil, lihat
   bagian 10.2.
10. **Koleksi lowongan kerja.** `/karier` tetap empty state, lihat keputusan 2.

**Sudah selesai, dicoret dari daftar terbuka:** butir 3 dari lima item Plan 2
(nomor WhatsApp punya dua sumber kebenaran) ternyata sudah tertutup. Tidak ada
lagi variabel lingkungan WhatsApp di repo; `/kontak` dan `/karier` sama sama
membaca `COMPANY.whatsapp`, dan `company.test.ts` sudah memakukannya ke
`COMPANY.phone`. Form B2B baru di plan ini menjadi konsumen `wa.me` ketiga dan
wajib membaca sumber yang sama, bukan menerima nomor lewat prop dari tempat lain.

---

## 17. Risiko

**Ekstraksi 66 nama kapal dari PDF salah ketik.** Ini risiko paling nyata di plan
ini, karena nama kapal tidak punya pola yang bisa divalidasi mesin. Mitigasi: tes
konsistensi silang di bagian 4.1 menangkap kesalahan jumlah, dan setiap kelas
dicocokkan ulang dengan teks PDF setelah ditulis. Yang tidak tertangkap tes adalah
satu huruf salah di satu nama, jadi ekstraksi dilakukan dari keluaran `pdftotext`
apa adanya, bukan diketik ulang dari layar.

**Pipeline artikel tidak pernah dijalankan sungguhan.** Payload sudah ada di repo
sejak Plan 2, tapi `/admin` belum pernah dibuka browser mana pun. Ada kemungkinan
masalah muncul di sana yang tidak terlihat dari kode. Mitigasi: spec admin-publish
dijadwalkan lebih awal, bukan sebagai task terakhir, supaya kalau ia menemukan
masalah, masih ada ruang untuk menanganinya di dalam plan yang sama.

**Lima halaman baru sekaligus melebarkan permukaan visual.** Setiap halaman baru
adalah kesempatan baru untuk melenceng dari sistem yang sudah rapi setelah Plan 6
dan Plan 7. Mitigasi: aturan pembagian tugas di bagian 12 ditulis sebagai tabel
yang tegas, dan audit design dijalankan terhadap seluruh halaman baru, bukan
sampel.

**Ukuran plan, sudah ditangani lewat pemecahan.** Spec ini dieksekusi sebagai dua
plan, lihat bagian 18. Yang tersisa jadi risiko adalah antarmuka di antara
keduanya, yaitu `sitemap.ts`, `README.md`, dan `page.tsx` beranda. Ketiganya
disentuh dua kali. Mitigasinya ada di bagian 18.

---

## 18. Pemecahan jadi dua plan

Spec ini menggambarkan satu kesatuan desain, tapi dieksekusi sebagai dua plan
berurutan. Keputusan diambil pemilik repo 23 Agustus 2026.

**Plan 8 — cabang bisnis, legalitas, dan sapuan.** Bagian 4 seluruhnya (4.1
sampai 4.4), 5, 6, 7, 8, 9, 11 kecuali 11.6, lalu 12, 13, 14, dan 15 kecuali
spec admin-publish. Tujuh belas task, ditulis di
`docs/superpowers/plans/2026-08-23-dml-plan-8-cabang-bisnis.md`. Keluarannya:
seluruh cabang `/bisnis` hidup, tabel legalitas terisi, dan tidak ada lagi
tautan internal yang menuju halaman tidak ada, kecuali `/artikel` yang masih
menunggu Plan 9.

**Plan 9 — artikel.** Bagian 10 seluruhnya, ditambah entri sitemap dinamis dari
bagian 11.1, bagian 11.6, dan spec admin-publish dari bagian 15. Sekitar 8
sampai 10 task.

**Bagian 11.6 milik Plan 9, bukan Plan 8, meski ia duduk di dalam bagian 11.**
Verifikasi `/admin` lewat browser sungguhan dikerjakan oleh spec admin-publish,
dan spec itu butuh koleksi `posts` untuk bisa mempublikasikan apa pun. Butir 1
dari lima item Plan 2 karena itu tetap terbuka sepanjang Plan 8, dan itu keadaan
yang diketahui, bukan kelalaian.

**Bagian 15 dibelah, bukan diberikan utuh ke salah satu plan.** Tes unit, sweep
axe, spec E2E cabang bisnis, dan seluruh gerbang akhir (`bun run check` plus
`test:e2e`) dikerjakan Plan 8 untuk permukaan yang dibangunnya. Yang menunggu
Plan 9 hanya spec admin-publish beserta bagian gerbang yang menyentuh artikel.

**Kenapa dipecah.** Dua puluh empat task akan jadi plan terbesar di repo ini,
melewati Plan 2 (16 task) dan Plan 6 (19 task). Kedua cabang tidak punya
ketergantungan kode satu sama lain. Dan separuh artikel membawa satu-satunya
risiko yang dinilai tinggi di bagian 17, yaitu `/admin` yang belum pernah dibuka
browser mana pun sejak repo dimulai; risiko itu lebih aman ditangani tanpa
belasan task lain menggantung di belakangnya.

**Kenapa bisnis lebih dulu.** Dua item navigasi utama saat ini menuju 404,
`/bisnis` dan `/artikel`. Cabang bisnis menutup yang pertama beserta tiga tautan
footer, dan tidak bergantung pada apa pun yang belum ada. Cabang artikel
bergantung pada Payload, Postgres, dan alur admin yang belum pernah terbukti.
Mendahulukan yang pasti membuat situs sudah dalam keadaan konsisten sebelum
risiko yang belum diketahui dibuka.

### 18.1 Tiga berkas yang disentuh kedua plan

Ini satu-satunya biaya pemecahan, dan ditangani eksplisit, bukan diserahkan pada
ingatan.

| Berkas | Plan 8 | Plan 9 |
|---|---|---|
| `src/app/sitemap.ts` | Daftar statis disinkronkan, `/bisnis/galangan-kapal` dihapus, tiga route bisnis baru ditambahkan. `/artikel` **tetap tinggal** karena Plan 9 akan mengisinya | Slug artikel published ditambahkan secara dinamis |
| `README.md` | Bagian struktur dan perintah diperbarui untuk halaman bisnis baru | Ditambah peringatan bahwa `bun run build` kini butuh Postgres, lihat bagian 10.2 |
| `src/app/(site)/page.tsx` | Tidak disentuh | Seksi Artikel Terbaru disisipkan antara `Certifications` dan `CtaSection` |

Tes sitemap dari bagian 11.1, yang memastikan setiap path dapat diselesaikan ke
route yang ada, ditulis di Plan 8 dan **wajib diperluas, bukan ditulis ulang**, di
Plan 9. `/artikel` yang masih 404 selama jeda antara kedua plan adalah keadaan
yang diketahui dan diterima; tes di Plan 8 menuliskannya sebagai pengecualian
bertanggal dengan rujukan ke Plan 9, supaya ia tidak lolos diam-diam sebagai
kelalaian.
