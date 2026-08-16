# Company Profile PT Dutabahari Menara Line

Design spec, 16 Agustus 2026.

## 1. Ringkasan

Situs company profile grup PT Dutabahari Menara Line: perusahaan pelayaran Banjarmasin
berdiri 1985, bagian SinarAlam Corporation, dengan tiga lini bisnis. Dibangun dari nol
sebagai project Next.js baru di subfolder `dml-web/`. Tiga folder yang sudah ada di
repo (`dml-corporate-old-1`, `dml-corporate-old-2`, `reference-jeskojets`) tidak dipakai
dan sudah masuk `.gitignore`.

Tujuan situs, berurutan berdasarkan prioritas:

1. Kredibilitas di mata charterer korporat dan tim procurement energi.
2. Menangkap lead B2B untuk lini transportasi BBM.
3. Mengarahkan penumpang ro-ro ke kanal booking existing di `dutabahari.id`.
4. Membangun trafik organik jangka panjang lewat artikel.
5. Menampung lowongan kerja (struktur disiapkan sekarang, konten menyusul).

## 2. Data perusahaan

Sumber: SinarAlam Corporation, ptdml.com, MagicPort, arsip berita Banjarmasin Post.
Semua angka di bawah berasal dari sumber publik dan **wajib diverifikasi klien**
sebelum situs live. Tandai setiap angka yang belum diverifikasi dengan komentar
`{/* unverified: sumber */}` di file konten.

**Identitas**
- Nama: PT Dutabahari Menara Line
- Berdiri: 30 November 1985
- Pendiri: Herman Chandra
- Induk: SinarAlam Corporation
- Kantor: Jl. Kapten Piere Tendean 174, Banjarmasin 70123, Kalimantan Selatan
- Kantor kedua: Jl. AES Nasution, Gadang, Banjarmasin Tengah 70122
- Telepon: +62 511 326 8280

**Lini 1, Transportasi BBM**
- Motor tanker hingga 8 juta liter
- Oil barge hingga 4,7 juta liter
- SPOB hingga 1,6 juta liter
- Tugboat pendamping
- Kontrak sewa jangka panjang dengan PT Pertamina Patra Niaga
- Cakupan: hampir seluruh wilayah Kalimantan
- Standar: ISM Code, ISPS Code, SIRE
- Armada total 15 kapal, 40.546 DWT

**Lini 2, Penumpang Ro-Ro**
- Armada KMP Jambo VI, VIII, IX, X, XII, XIV
- Panjang: Jambo VIII 68 m, Jambo IX 62,7 m, Jambo X 68 m
- Kapasitas Jambo X sekitar 400 penumpang
- Rute: Ketapang ke Lembar (sejak 20 Desember 2020), Tanjung Perak Surabaya ke Lembar
  (25 sampai 28 jam), Kumai ke Surabaya (ekspansi Juni 2025)
- Fasilitas: kabin ber-AC, kafe, musala, ruang medis, kabin VIP, lounge
- Booking: `dutabahari.id`, situs terpisah, di luar scope project ini

**Lini 3, Galangan Kapal (DMLD)**
- Nama: PT Dutabahari Menara Line Dockyard
- Lokasi: Jl. Ir. H.P.M Noor, Kuin Cerucuk, Banjarmasin 70129
- Fasilitas Pasir Mas: sekitar 9 hektar, kapasitas lebih dari 6 tongkang dan 6 tugboat
  bersamaan; fasilitas kedua di Bakut
- Tenaga kerja: sekitar 150 orang
- Layanan: bangun kapal baru, konversi, perawatan, perbaikan komponen
- Standar: ISO 9001:2015, diakui biro klasifikasi anggota IACS
- Situs sendiri: ptdml.com

## 3. Tech stack

| Layer | Pilihan | Versi minimum |
|---|---|---|
| Framework | Next.js App Router | 16.2.0 |
| Runtime UI | React | 19 |
| Bahasa | TypeScript strict | 5.9 |
| Styling | Tailwind CSS v4, CSS-first `@theme` | 4.3 |
| CMS | Payload CMS, adapter Postgres, editor Lexical | 3.73 |
| Database | PostgreSQL | 16 |
| Smooth scroll | Lenis | 1.3 |
| Animasi | GSAP core, ScrollTrigger, SplitText | 3.13 |
| 3D | three, @react-three/fiber, @react-three/drei | three 0.185 |
| Ikon | @phosphor-icons/react | 2.x |
| Validasi | zod | 4.x |
| Form | react-hook-form | 7.x |
| Gambar | next/image, sharp | sharp 0.35 |
| Package manager | bun | 1.3 |
| Test unit | Vitest, Testing Library | 4.x |
| Test e2e | Playwright | 1.62 |
| Audit | Lighthouse CI, axe-core | |
| Deploy | Docker output standalone di Coolify | |

**Next 16.2.0 adalah lantai keras.** Payload 3 tidak mendukung Next 15.5 sampai 16.1.x
dan tidak akan mendukungnya.

**GSAP 3.13 gratis penuh** termasuk penggunaan komersial dan semua plugin premium,
setelah akuisisi GreenSock oleh Webflow. SplitText dan ScrollTrigger tidak butuh lisensi.

**Sengaja tidak dipakai:**
- ScrollSmoother, bentrok dengan Lenis. Pilih satu, Lenis menang karena lebih ringan.
- Motion (framer-motion), akan jadi library animasi ketiga tanpa kemampuan tambahan.
  Hook `usePrefersReducedMotion` ditulis sendiri sebagai gantinya.
- shadcn/ui, situs ini bukan dashboard dan Payload sudah punya admin UI sendiri.
- lucide-react, diganti Phosphor.
- globe.gl dan react-globe.gl, lihat bagian 7.4 untuk alasannya.

## 4. Arsitektur

### 4.1 Struktur folder

```
dml-web/
  src/
    app/
      (site)/            route group publik, pakai layout situs
        page.tsx         beranda
        tentang-kami/
        bisnis/
          transportasi-bbm/
          penumpang-roro/
          galangan-kapal/
        karier/
        artikel/
          [slug]/
        kontak/
      (payload)/         admin panel dan REST/GraphQL Payload
      sitemap.ts
      robots.ts
      opengraph-image.tsx
    components/
      layout/            header, footer, nav
      ui/                primitif dipakai ulang
      motion/            client leaf: reveal, split-text, parallax
    features/
      home/              seksi beranda, satu file per seksi
        fleet-3d/        R3F, dynamic import saja
        sequence/        scrubber sekuens foto
      fleet/
      timeline/
      route-map/
      inquiry/
    content/             copy korporat hardcoded, TypeScript
    lib/
      motion/            lenis provider, gsap registry, reduced-motion
      seo/               metadata helper, JSON-LD builder
      media/             manifest gambar hasil pipeline
    payload/
      collections/
      payload.config.ts
    styles/
  scripts/
    prepare-assets.ts    pipeline foto drone
  public/
    media/               turunan hasil pipeline, ini yang di-commit
```

### 4.2 Batas komponen

- **Server Component adalah default.** Setiap komponen yang menyentuh GSAP, Lenis,
  R3F, atau pointer harus jadi client leaf terisolasi dengan `'use client'` di baris
  pertama, dan tidak boleh membungkus konten teks apa pun.
- **Konten tidak pernah dikirim dari client.** Teks dan link selalu render di server,
  animasi hanya membungkus atau mengubah transform elemen yang sudah ada di HTML.
- **Satu seksi beranda sama dengan satu file** di `features/home/`. Tidak ada file
  `page.tsx` raksasa.
- **R3F dan GSAP tidak boleh berada di tree komponen yang sama.** Keduanya berebut
  frame yang sama. Seksi 3D hanya memakai R3F, seksinya sendiri dipin oleh
  ScrollTrigger dari komponen pembungkus di luar canvas.

### 4.3 Aturan arsitektur yang tidak bisa ditawar

1. **Motion adalah progressive enhancement.** Matikan JavaScript, situs tetap terbaca
   utuh, semua link bisa diklik, semua konten hadir. Tidak ada satu pun kalimat atau
   tautan yang tersembunyi menunggu animasi selesai.
2. **`prefers-reduced-motion` adalah requirement.** Lenis tidak diinisialisasi, semua
   timeline GSAP langsung ke state akhir, sekuens foto jadi satu still, canvas 3D jadi
   gambar statis.
3. **CMS hanya untuk artikel.** Halaman korporat hardcoded di `src/content/`. Editor
   tidak pernah menyentuh struktur halaman.
4. **Beban sinematik hanya di `/`.** Delapan route lain memakai anggaran motion yang
   jauh lebih tenang. Halaman layanan tugasnya menjual, bukan tampil.

## 5. Peta halaman

| Route | Isi | Motion |
|---|---|---|
| `/` | Sembilan seksi sinematik, lihat bagian 7 | 9 |
| `/tentang-kami` | Satu halaman, dua bagian, anchor nav sticky. `#silsilah` berisi timeline 1985 sampai kini, Herman Chandra, posisi dalam SinarAlam. `#profil` berisi visi misi, legalitas, sertifikasi, unduh PDF profil | 6 |
| `/bisnis` | Hub, tiga kartu lini bisnis | 6 |
| `/bisnis/transportasi-bbm` | Armada tanker, oil barge, SPOB, tugboat. Cakupan Kalimantan. Standar ISM, ISPS, SIRE. Studi kasus operasi STS. CTA Permintaan Informasi Bisnis | 6 |
| `/bisnis/penumpang-roro` | Armada KMP Jambo, rute, fasilitas kapal. CTA Pesan Tiket keluar ke `dutabahari.id` | 6 |
| `/bisnis/galangan-kapal` | DMLD: docking, repair, konversi, newbuild. Fasilitas Pasir Mas dan Bakut. ISO 9001:2015 | 6 |
| `/bisnis/transportasi-bbm/permintaan-informasi` | Form inquiry B2B, prefill lewat query param | 4 |
| `/karier` | Scaffold penuh dengan empty state. JSON-LD `JobPosting` siap dipakai. Data kosong | 4 |
| `/artikel` | Daftar artikel dari Payload, paginasi | 4 |
| `/artikel/[slug]` | Detail artikel | 4 |
| `/kontak` | Form umum, peta, alamat dua kantor, kontak per divisi | 4 |

**BookJambo bukan route.** Item navigasi yang langsung keluar ke `dutabahari.id`
dengan ikon external dan `rel="noopener noreferrer"`.

## 6. Design system

### 6.1 Design read

Company profile grup untuk tiga audiens sekaligus: charterer korporat dan procurement
energi, penumpang ro-ro, dan pelamar kerja. Bahasa visual dokumenter-industrial,
dibangun di atas Tailwind v4 dengan token native dan scrollytelling berbasis fotografi.

Dial global: `DESIGN_VARIANCE 7`, `MOTION_INTENSITY 6`, `VISUAL_DENSITY 3`.
Dial beranda: `DESIGN_VARIANCE 8`, `MOTION_INTENSITY 9`, `VISUAL_DENSITY 2`.

Perusahaan berumur 40 tahun dengan kontrak Pertamina harus terbaca kredibel, bukan
eksperimental, jadi variance tidak dinaikkan ke 9. Density rendah karena fotografi
drone yang jadi bintangnya, bukan teks.

### 6.2 Palet, "Deep Water", dark-locked

Halaman dikunci gelap. Tidak ada seksi yang berbalik jadi terang di tengah scroll.
Ini keputusan brand yang disetujui klien, bukan default.

```css
@theme {
  --color-surface:     #0A1418;  /* petrol near-black, latar utama   */
  --color-surface-2:   #111E24;  /* seksi bertingkat                 */
  --color-surface-3:   #18292F;  /* border, garis pemisah            */
  --color-ink:         #F2EFE9;  /* bone, teks utama                 */
  --color-ink-muted:   #8FA1A8;  /* teks sekunder                    */
  --color-accent:      #FF5A1F;  /* signal orange                    */
  --color-accent-dim:  #C44416;  /* hover, state tertekan            */
}
```

Oranye dipilih karena itu warna keselamatan maritim asli: life raft, hi-vis kru,
marker buoy. Jujur terhadap industrinya, dan bukan navy korporat yang dipakai hampir
semua perusahaan pelayaran Indonesia. Air biru di foto drone menyala di atas petrol
gelap, dan oranye jadi satu-satunya titik panas di halaman.

**Color consistency lock:** aksen oranye dipakai identik di seluruh halaman. Tidak ada
CTA biru, tidak ada badge teal. Satu aksen, dikunci.

**Shape consistency lock:** radius 12px untuk kartu dan panel, 8px untuk input,
full-pill untuk tombol. Aturan ini berlaku di semua halaman tanpa kecuali.

### 6.3 Tipografi

- Display: **Cabinet Grotesk** (Fontshare, gratis, self-host lewat `next/font/local`)
- Body: **Satoshi** (Fontshare, gratis, self-host)
- Angka teknis, DWT, kapasitas liter, dimensi kapal: **Geist Mono**

Tidak ada serif di mana pun. Ini perusahaan pelayaran, bukan majalah. Tidak ada Inter.

Skala display default `text-4xl md:text-5xl lg:text-6xl`. Ukuran `text-6xl md:text-7xl`
hanya untuk headline tiga sampai lima kata. Body `max-w-[65ch] leading-relaxed`.

### 6.4 Ikon

Phosphor Icons, `weight="regular"` dikunci global lewat `IconContext`. Satu keluarga
ikon untuk seluruh project. Tidak ada SVG ikon yang digambar tangan.

## 7. Beranda

Sembilan seksi. Setiap animasi punya alasan yang bisa dinyatakan dalam satu kalimat.
Anggaran eyebrow: maksimal tiga di seluruh halaman, hero terhitung satu.

### 7.1 Seksi 1, Hero pinned, orbit malam

Frame `DJI_0811` sampai `DJI_0820` dari `STS SRI YULIANI.zip`, direkam 05:36 sampai
05:38 tanggal 28 Februari 2025. Sudah diverifikasi sebagai orbit drone kontinu: dua
lambung berputar mantap di dalam frame dengan pergeseran heading progresif. Latar
hitam pekat dengan lampu deck menyala, artinya kapal bisa mengambang langsung di atas
`--color-surface` tanpa tepi foto yang terlihat.

Perilaku:
- Poster frame tengah (`DJI_0815`) render sebagai LCP dengan `priority`. Tidak ada
  WebGL dan tidak ada sekuens di atas fold.
- Setelah LCP selesai, sisa sembilan frame dimuat di belakang layar.
- Seksi dipin oleh ScrollTrigger, `start: "top top"`, `pin: true`, `scrub: 1`,
  panjang scroll sekitar 2,5 layar. Progress scroll memilih frame terdekat yang
  sudah siap. Frame yang belum termuat tidak pernah menyebabkan flash.
- Headline mask-reveal dengan SplitText, berganti tiap beat.

Alasan: menyampaikan skala operasi sebelum satu kata pun dibaca.

Disiplin hero: headline maksimal dua baris, subteks maksimal 20 kata, `pt-24` maksimal,
maksimal empat elemen teks, CTA terlihat tanpa scroll. Tidak ada scroll cue, tidak ada
strip dekorasi di bawah hero, tidak ada label versi.

### 7.2 Seksi 2, Potong keras ke siang

Wide anchorage `DJI_0710` dengan parallax lambat. Satu paragraf pendek menjelaskan apa
itu ship-to-ship transfer dan kenapa itu penting bagi distribusi BBM Kalimantan.

Alasan: kontras malam ke siang berfungsi sebagai potongan film, memberi jeda sebelum
halaman berpindah dari suasana ke informasi.

### 7.3 Seksi 3, Tiga lini bisnis

Sticky-stack sesuai skeleton kanonik: `start: "top top"`, `pin: true`,
`pinSpacing: false`, setiap kartu kecuali yang terakhir dipin, transform scale dan
opacity kartu digerakkan oleh ScrollTrigger kartu berikutnya. Masing-masing kartu
punya fotonya sendiri.

Alasan: hierarki, satu lini bisnis mendapat perhatian penuh dalam satu waktu.

### 7.4 Seksi 4, Fleet Blueprint Comparator, 3D

Komponen 3D satu-satunya di situs.

**Kenapa bukan globe rute.** Seluruh operasi mereka muat dalam sekitar 8 derajat
lintang. Bola berputar akan menghabiskan hampir seluruh geometrinya menampilkan
samudra dan benua yang tidak relevan, dan gerakan "bumi berputar masuk dari luar
angkasa lalu berhenti di Indonesia" adalah gerakan template. Membayar sekitar 150 kB
three.js untuk shot yang isinya 4% relevan tidak masuk akal. Geografi rute ditangani
peta SVG di seksi 5, yang memang alat yang tepat untuk empat pelabuhan.

**Kenapa 3D di sini justru benar.** Skala relatif armada adalah pertanyaan pertama
setiap charterer, dan perbandingan volume antar kelas kapal sulit disampaikan dengan
gambar datar.

Implementasi:
- Lima kelas kapal dibangun dari primitif: profil lambung lewat `ExtrudeGeometry`,
  superstruktur lewat box dan lathe. **Tidak ada model GLB unduhan.** Nol risiko
  lisensi, nol risiko model berkualitas buruk.
- Estetika wireframe blueprint: garis oranye di atas petrol gelap. Karena tampilannya
  memang skematik, tidak ada jurang uncanny valley antara model murah dan realisme.
  Skematik adalah pilihan desain, bukan kompromi teknis.
- Rotasi otomatis lambat pada sumbu Y. Drag untuk memutar manual. Scroll mengganti
  kelas kapal dengan morph antar geometri.
- Garis ukur dengan angka menempel: panjang, kapasitas, DWT, kapasitas penumpang.
  Semua dalam Geist Mono.

Alasan rotasi: geometri kapalnya sendiri yang menuntut dilihat dari beberapa sudut,
bukan rotasi yang ditempel supaya terlihat 3D.

### 7.5 Seksi 5, Peta rute ro-ro

SVG path yang menggambar dirinya sendiri mengikuti progress scroll, menghubungkan
Ketapang, Lembar, Tanjung Perak Surabaya, dan Kumai. Label pelabuhan muncul saat path
mencapainya.

Alasan: menggambar rute secara harfiah adalah cara paling langsung menjelaskan
jaringan penyeberangan.

### 7.6 Seksi 6, Silsilah

Horizontal pan sesuai skeleton kanonik: wrapper dipin, track digeser
`x: -distance`, `end: "+=distance"`, `scrub: 1`, `invalidateOnRefresh: true`.
Dari 1985 sampai 2025. Link ke `/tentang-kami#silsilah` untuk versi lengkap.

Alasan: kronologi memang bergerak menyamping. **Ini satu-satunya scroll hijack
horizontal di seluruh situs.**

### 7.7 Seksi 7, Sertifikasi dan angka

ISM Code, ISPS Code, SIRE, ISO 9001:2015, biro klasifikasi IACS. Angka armada dengan
counter yang menghitung naik saat masuk viewport. Reveal stagger biasa, tanpa GSAP.

Alasan: umpan balik visual bahwa angkanya bergerak membantu pembaca menyadari ini
data, bukan dekorasi.

### 7.8 Seksi 8, Artikel terbaru

Tiga post terbaru dari Payload. Grid editorial, bukan tiga kartu identik.

### 7.9 Seksi 9, CTA dan footer

Satu CTA primer. Tidak ada dua CTA dengan intent sama di seluruh halaman.

### 7.10 Yang dilarang di beranda

Marquee, custom cursor, scroll cue, eyebrow bernomor seksi, dot status dekoratif,
strip lokasi atau cuaca, fake screenshot dari div, em dash, pill yang ditumpuk di atas
foto, caption kredit foto palsu, label versi.

## 8. Anggaran performa

| Item | Aturan |
|---|---|
| LCP | Poster AVIF 1600w, `priority`, target di bawah 2,5 detik |
| CLS | Di bawah 0,1. Semua gambar dan canvas punya ruang yang direservasi |
| INP | Di bawah 200 ms |
| Sekuens malam desktop | 10 frame AVIF, target total di bawah 700 kB. Latar hitam membuat AVIF sangat efisien |
| Sekuens malam mobile | 6 frame pada 1080w, target di bawah 300 kB |
| R3F | `next/dynamic` dengan `ssr: false`, dipicu IntersectionObserver saat seksi 4 mendekat |
| 3D di bawah 768px | Diganti blueprint SVG statis. Bukan WebGL yang diturunkan kualitasnya |
| Reduced motion | Lenis tidak diinisialisasi, sekuens jadi satu still, canvas jadi gambar statis |
| Preloader | Tidak ada. Hero tampil instan, sisanya menyusul di belakang |
| `will-change` | Hanya pada elemen yang benar-benar dianimasikan |
| Grain atau noise | Hanya pada pseudo-element `fixed` dengan `pointer-events-none`. Tidak pernah di container yang scroll |

Mayoritas trafik akan datang dari perangkat seluler lewat data seluler. Halaman
sinematik yang memakan 3 MB justru menghukum audiens terbesarnya.

**Larangan keras:** `window.addEventListener('scroll')`. Gunakan ScrollTrigger,
IntersectionObserver, atau CSS scroll-driven animation. Tidak pernah menyimpan nilai
scroll atau posisi pointer di React state.

## 9. Pipeline aset

Sumber: tiga arsip di `assets/`, total 842 MB, 202 foto DJI 4000x2250.

- `KAPAL KAPAL.zip`, 53 file, armada termasuk ro-ro di ramp pelabuhan
- `STS 06 JULI 2025.zip`, 36 file, operasi STS siang
- `STS SRI YULIANI.zip`, 113 file, operasi STS 27 sampai 28 Februari 2025, enam jam
  dalam tiga penerbangan terpisah

Script `scripts/prepare-assets.ts` dijalankan offline dengan bun:

1. Ekstrak zip ke `assets/_raw/`, folder ini masuk `.gitignore`.
2. Kurasi menurut manifest eksplisit di `src/lib/media/manifest.ts`. Sekitar 25 sampai
   30 frame dipakai, bukan 202. Manifest menyebut nama file, peruntukan, dan alt text
   bahasa Indonesia.
3. Sharp menghasilkan AVIF dan WebP pada lebar 640, 1080, 1600, 2400.
4. **Strip seluruh EXIF secara default.** File DJI menyimpan koordinat GPS presisi.
   Mempublikasikan lokasi persis operasi STS dan terminal klien adalah risiko nyata
   bagi klien pelayaran.
5. Tulis turunannya ke `public/media/`. Hanya turunan yang di-commit, tidak pernah
   file mentah.

Cluster frame yang sudah diverifikasi sebagai orbit kontinu:
- **Malam, dipakai hero:** `DJI_0811` sampai `DJI_0820`, 05:36 sampai 05:38
- **Siang, cadangan:** `DJI_0707` sampai `DJI_0711`, 00:22 sampai 00:23, turun ke
  ketinggian air lalu memutari haluan

Frame di luar cluster rapat tidak bisa dipakai untuk scrub. Arsip 113 file itu enam
jam operasi dalam tiga penerbangan, bukan satu orbit panjang.

**Catatan hak pakai:** kapal kedua di seluruh foto STS adalah MT AS MARINE SATU, milik
pihak lain, dengan nama lambung terbaca jelas. Klien menyatakan status ini aman.

## 10. CMS

Payload 3 dengan adapter Postgres, dipasang di route group `(payload)` dalam aplikasi
Next yang sama. Admin panel di `/admin`.

**Collection `posts`**

| Field | Tipe | Catatan |
|---|---|---|
| `title` | text | required |
| `slug` | text | unique, indexed, auto dari title, bisa diedit |
| `excerpt` | textarea | maks 200 karakter, dipakai untuk meta description dan kartu |
| `coverImage` | upload | relasi ke `media`, required |
| `content` | richText Lexical | |
| `category` | select | Operasi, Armada, Keselamatan, Perusahaan |
| `publishedAt` | date | |
| `author` | relationship ke `users` | |
| `seo.metaTitle` | text | opsional, fallback ke `title` |
| `seo.metaDescription` | textarea | opsional, fallback ke `excerpt` |
| `_status` | draft atau published | fitur draft bawaan Payload |

**Collection `media`**: upload dengan sharp resize, alt text required.

**Collection `users`**: admin saja. Tidak ada registrasi publik.

**Collection `inquiries`**: menyimpan lead dari form, read-only di admin.
Field: `name`, `company`, `phone`, `email`, `service`, `message`, `createdAt`,
`source`. Lihat bagian 11.

Halaman korporat tidak berada di CMS. Editor hanya menyentuh artikel.

## 11. Form dan lead

**Permintaan Informasi Bisnis** di `/bisnis/transportasi-bbm/permintaan-informasi`.

Alur:
1. Pengunjung mengisi form. Validasi zod di client dan server, react-hook-form untuk
   state form. Label di atas input, helper text opsional tapi hadir di markup, error
   di bawah input. Tidak pernah placeholder sebagai label.
2. Server action menyimpan submission ke collection `inquiries`.
3. Setelah simpan berhasil, pengunjung diarahkan ke `wa.me` dengan pesan terstruktur
   yang sudah terisi.

Alasan alur ini: WhatsApp adalah kanal yang paling cepat direspons di pasar Indonesia,
tapi WhatsApp saja berarti tidak ada arsip lead dan tidak ada data konversi. Menyimpan
lebih dulu memberi klien rekaman tanpa menambah friksi bagi pengunjung sama sekali.

Rate limit per IP di server action. Honeypot field, bukan CAPTCHA.

**Form kontak umum** di `/kontak` memakai alur yang sama.

**Kontras form wajib lolos WCAG AA** untuk input, placeholder, focus ring, label,
helper text, dan error text terhadap latar seksi yang gelap.

## 12. SEO

- Metadata lewat `generateMetadata` per route. Tidak ada metadata yang dirakit di client.
- `sitemap.ts` dinamis, menarik slug artikel dari Payload.
- `robots.ts`.
- OG image dinamis lewat `next/og` untuk artikel, statis untuk halaman korporat.
- JSON-LD:
  - `Organization` dan `LocalBusiness` di root, dengan dua alamat kantor
  - `BreadcrumbList` di semua halaman dalam
  - `Article` di `/artikel/[slug]`
  - `Service` di tiap halaman lini bisnis
  - `JobPosting` di `/karier`, aktif begitu data diisi
- Canonical URL absolut di semua halaman.
- Bahasa Indonesia saja, `lang="id"`. Tidak ada hreflang, tidak ada route `/en`.
- Semua konten render di server. Tidak ada teks yang hanya muncul setelah animasi.
- Alt text bahasa Indonesia untuk setiap gambar, ditulis di manifest media, bukan
  digenerate.

## 13. Aksesibilitas

- Kontras WCAG AA minimum untuk body, AAA sebagai target untuk copy hero.
- Setiap CTA diverifikasi kontrasnya terhadap latarnya, termasuk tombol ghost di atas
  foto. Label CTA tidak pernah membungkus ke baris kedua di desktop.
- Navigasi keyboard penuh, focus ring terlihat di seluruh permukaan gelap.
- `prefers-reduced-motion` mematikan seluruh motion.
- Skip link ke konten utama.
- Canvas 3D punya deskripsi teks alternatif dan tabel spesifikasi yang bisa dibaca
  screen reader. Informasi armada tidak pernah hanya ada di dalam canvas.
- Navigasi satu baris di desktop, tinggi maksimal 80px.

## 14. Testing dan verifikasi

- **Vitest** untuk helper: metadata builder, JSON-LD builder, validasi zod, manifest
  media, util motion.
- **Playwright** untuk: navigasi tiap route, submit form termasuk jalur gagal, empty
  state karier, paginasi artikel, dan satu spec khusus yang menjalankan beranda dengan
  `prefers-reduced-motion: reduce` untuk memastikan seluruh konten tetap tampil.
- **Playwright dengan JavaScript dimatikan** untuk membuktikan aturan arsitektur nomor
  satu: semua teks dan link hadir.
- **axe-core** di setiap route.
- **Lighthouse CI** dengan ambang: LCP di bawah 2,5 detik, CLS di bawah 0,1, skor SEO
  minimal 95. Beranda diuji dengan throttling mobile.
- `bun run check` menjalankan lint, typecheck, test, build, dan lighthouse berurutan.

## 15. Deployment

- `output: 'standalone'` di `next.config.ts`.
- Dockerfile multi-stage dengan bun.
- Coolify menjalankan container aplikasi dan container Postgres.
- Volume persisten untuk upload Payload, atau adapter S3 jika klien menyediakan bucket.
- Env: `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`, `WHATSAPP_NUMBER`,
  `SMTP_*` bila notifikasi email ditambahkan nanti.
- Migrasi Payload dijalankan saat startup container.

## 16. Di luar scope

- Situs booking `dutabahari.id`, termasuk BookJambo. Hanya ditautkan.
- Situs galangan `ptdml.com`. Konten DMLD di situs ini adalah ringkasan, bukan migrasi.
- Bahasa Inggris.
- Isi lowongan kerja. Struktur dibuat, data menyusul.
- Sistem booking, pembayaran, atau tracking kapal.
- Migrasi konten dari tiga folder project lama.

## 17. Risiko

| Risiko | Mitigasi |
|---|---|
| Semua data perusahaan berasal dari sumber publik | Tandai setiap angka belum terverifikasi di file konten, minta klien konfirmasi sebelum live |
| Payload mengunci versi Next | Pin `next` ke 16.2.x, jangan naikkan tanpa mengecek rilis Payload |
| Sekuens foto membengkak melewati anggaran | Ambang ditegakkan di script pipeline, build gagal jika total melewati batas |
| R3F memberatkan seksi 4 | Dynamic import, IntersectionObserver, fallback SVG di mobile, dan Lighthouse CI sebagai penjaga |
| Beranda sinematik menutupi konversi | CTA primer hadir di hero, di seksi lini bisnis, dan di footer. Halaman layanan tetap tenang dan langsung |
