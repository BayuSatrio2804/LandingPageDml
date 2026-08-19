# Company Profile PT Dutabahari Menara Line

Design spec, 16 Agustus 2026.

## 1. Ringkasan

Situs company profile grup PT Dutabahari Menara Line: perusahaan pelayaran Banjarmasin
berdiri 1988, bagian Sinar Alam Corporation, dengan dua lini bisnis utama. Dibangun dari nol
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

> **SUPERSEDED, 18 Agustus 2026.** Sumber utama data perusahaan sekarang company
> profile resmi klien, `assets/CP DML.pdf`. Bagian ini ditulis ulang mengikuti PDF itu.
> Daftar lengkap koreksi, penjelasan tiap perbedaan, dan tujuh butir yang masih wajib
> dikonfirmasi klien ada di
> `docs/superpowers/specs/2026-08-18-dml-plan-5-profil-dan-beranda-design.md`.
> Kalau bagian ini dan spec Plan 5 berbeda, spec Plan 5 yang berlaku.

Setiap angka yang belum punya dasar di PDF tetap ditandai komentar `unverified: sumber`
di file konten, dan setiap butir standar membawa penanda `cp-pdf` atau `riset-publik`
di tipenya.

**Identitas**
- Nama: PT Dutabahari Menara Line (DML)
- Berdiri: 30 November 1988 di Banjarmasin (sebelumnya tercatat 1985)
- Pendiri: Herman Chandra
- Induk: Sinar Alam Corporation (dua kata, sebelumnya ditulis "SinarAlam")
- Tagline: "From Zero to Hero with Continuous Improvement"
- Nilai: Dynamic, Measurable, Loyalty. Huruf awalnya mengeja DML.
- Kantor pusat DML: Jl. AES Nasution 43, Banjarmasin 70123, Kalimantan Selatan.
  Telepon +62 511 6773845.
- Cabang: Jl. Kalipuro, Ketapang, Banyuwangi, Jawa Timur
- Kantor grup, bukan kantor DML: Jl. Kapten Piere Tendean 174 Banjarmasin, dan Bakrie
  Tower Lantai 2 Rasuna Epicentrum Jakarta
- Armada total 64 kapal: 9 ro-ro penumpang dan 55 pengangkut BBM
- Tenaga kerja grup: lebih dari 300 orang
- Angka 40.546 DWT dari riset publik dihapus. PDF tidak memuat angka DWT total.

**Lini 1, Transportasi BBM** (dijalankan langsung oleh DML)
- Motor Tanker (MT), 7 kapal
- Oil Barge (OB), 9 kapal
- Self Propelled Oil Barge (SPOB), 30 kapal
- Tugboat (TB), 11 kapal
- Distribusi bahan bakar ke pelabuhan dan pulau-pulau utama Indonesia
- Kontrak sewa jangka panjang dengan PT Pertamina Patra Niaga (unverified: riset publik)
- Dimensi dan DWT per kelas tidak ada di PDF, masih estimasi proporsional

**Lini 2, Penyeberangan Ro-Ro** (dijalankan langsung oleh DML)
- 9 kapal ro-ro penumpang
- Ketapang - Gilimanuk: KMP Jambo VI, VIII, IX, X
- Jangkar - Lembar: KMP Jambo XII
- Surabaya - Kumai: KMP Jambo XIV
- Surabaya - Lembar: KMP Jambo XI
- Pasangan rute lama "Ketapang - Lembar" salah dan dikoreksi jadi Ketapang - Gilimanuk
- Fasilitas: kabin ber-AC, kafe, musala, ruang medis, kabin VIP, lounge
  (unverified: riset publik, tidak ada di PDF)
- Booking: `dutabahari.id`, situs terpisah, di luar scope project ini

**Perusahaan afiliasi** (cp-pdf hal. 03)
- PT Tri Sumaja Lines: ro-ro penumpang, lintasan Merak - Bakauheni (KMP BSP 1, KMP
  Salvatore). Lintasan ini milik TSL, bukan DML.
- PT Duta Wisata Bahari: wisata bahari Labuan Bajo, private boat charter dan open trip
- Dutabahari Teknik: perbaikan dan perawatan kapal, internal maupun pihak ketiga

**Galangan Kapal (DMLD)**
PT Dutabahari Menara Line Dockyard adalah perusahaan terpisah di dalam Sinar Alam
Corporation, bukan lini bisnis DML. Ia tidak lagi disebut sebagai "Lini 3" DML.
- Lokasi: Jl. Ir. H.P.M Noor, Kuin Cerucuk, Banjarmasin 70129 (unverified: riset publik)
- Fasilitas Pasir Mas sekitar 9 hektar, fasilitas kedua di Bakut (unverified)
- Tenaga kerja sekitar 150 orang (unverified)
- Situs sendiri: ptdml.com

**Standar dan keanggotaan** (cp-pdf hal. 01)
- Sistem manajemen: ISO 9001:2015 (sertifikat DQS), ISM Code
- Biro klasifikasi: Biro Klasifikasi Indonesia (BKI)
- Sistem informasi: SAP
- Keanggotaan: Sinar Alam Corporation, OCIMF, GAPASDAP, IMO
- ISPS Code dan SIRE tidak ada di PDF, tetap ditampilkan bertanda `riset-publik`


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
| Audit React | react-doctor | 0.9.12 |
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
| `/tentang-kami` | Satu halaman, dua bagian, anchor nav sticky. `#silsilah` berisi timeline sejak 1988, Herman Chandra, posisi dalam Sinar Alam Corporation. `#profil` berisi visi misi, legalitas, klaster standar, struktur grup | 6 |
| `/bisnis` | Hub. Dua lini yang dijalankan DML sendiri, plus tiga perusahaan afiliasi di tingkat lebih rendah | 6 |
| `/bisnis/transportasi-bbm` | Armada tanker, oil barge, SPOB, tugboat. Cakupan pelabuhan dan pulau utama Indonesia. Standar ISM Code dan ISO 9001:2015. Studi kasus operasi STS. CTA Permintaan Informasi Bisnis | 6 |
| `/bisnis/penumpang-roro` | Armada KMP Jambo, rute, fasilitas kapal. CTA Pesan Tiket keluar ke `dutabahari.id` | 6 |
| `/bisnis/galangan-kapal` | **Perlu keputusan ulang.** DMLD adalah perusahaan terpisah di dalam Sinar Alam Corporation, bukan lini bisnis DML (lihat bagian 2). Perawatan kapal milik DML sendiri dikerjakan afiliasi Dutabahari Teknik | 6 |
| `/bisnis/transportasi-bbm/permintaan-informasi` | Form inquiry B2B, prefill lewat query param | 4 |
| `/karier` | Scaffold penuh dengan empty state. JSON-LD `JobPosting` siap dipakai. Data kosong | 4 |
| `/artikel` | Daftar artikel dari Payload, paginasi | 4 |
| `/artikel/[slug]` | Detail artikel | 4 |
| `/kontak` | Form umum, peta, dua kantor DML (Banjarmasin dan cabang Banyuwangi), kontak per divisi. Kantor grup dipisah di `GROUP_OFFICES` | 4 |

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

### 6.2 Palet, "Navy Selat", light-locked

Diubah pada 18 Agustus 2026. Sampai Plan 5 halaman ini dikunci gelap dengan palet
"Deep Water" (surface #0A1418, aksen oranye #FF5A1F). Klien kemudian meminta seluruh
skema warna mengikuti pthis.id, situs PT Hasnur Internasional Shipping, yang memakai
skema terang bernavy. Bagian ini menggantikan keputusan lama sepenuhnya; catatan
"dark-locked" di bagian mana pun dokumen ini sudah tidak berlaku.

Halaman dikunci terang. Tidak ada seksi yang berbalik jadi gelap di tengah scroll.
Satu-satunya bidang berwarna penuh adalah kaki halaman navy, dan itu penutup halaman,
bukan pergantian tema di tengah jalan. Pola yang sama dipakai pthis.id.

```css
@theme {
  --color-surface:       #F5F9FD;  /* biru-putih, bidang halaman        */
  --color-surface-2:     #FFFFFF;  /* kartu, panel, seksi selang-seling */
  --color-surface-3:     #CED9EA;  /* garis rambut dekoratif            */
  --color-line:          #7A8CA8;  /* batas kontrol: input, ghost       */
  --color-ink:           #181C24;  /* hitam lembut, teks utama          */
  --color-ink-muted:     #515661;  /* teks sekunder                     */
  --color-accent:        #164194;  /* navy, warna utama                 */
  --color-accent-hover:  #0E3A8A;  /* hover, lebih gelap                */
  --color-accent-press:  #0A2C6B;  /* state tertekan                    */
  --color-accent-soft:   #E1EEFF;  /* isian navy paling tipis           */
  --color-on-accent:     #FFFFFF;  /* teks di atas permukaan navy       */
  --color-danger:        #C62828;  /* galat form                        */
}
```

Nilai navy, biru muda, biru-putih, hitam lembut, dan merah diambil langsung dari
`:root` milik pthis.id (`--c-primary`, `--c-tertiary`, `--c-body`, `--c-black`,
`--c-red`). Yang tidak ikut disalin ada dua. Pertama, arah state tombol: pthis
menaikkan terang saat hover, sementara di sini hover dan press turun ke navy yang
lebih gelap supaya teks putih di atasnya justru menguat. Kedua, `--color-line`, yang
tidak punya padanan di sana; pthis memakai satu token pembatas untuk garis dekoratif
dan tepi input sekaligus, dan tepi input jadi tidak pernah mencapai 3:1.

**Aturan token yang wajib dipatuhi, bukan sekadar dicek belakangan:**

| Kombinasi | Rasio | Status |
|---|---|---|
| `--color-ink` di atas `--color-surface` | 16,13:1 | Lolos AAA |
| `--color-ink-muted` di atas `--color-surface-2` | 7,36:1 | Lolos AA |
| `--color-accent` di atas `--color-surface` | 8,95:1 | Lolos AA, teks navy di latar terang aman |
| `--color-on-accent` di atas `--color-accent` | 9,47:1 | Lolos AA, ini satu-satunya teks yang boleh di atas tombol navy |
| `--color-surface-3` di atas `--color-accent` | 6,64:1 | Lolos AA, teks sekunder di kaki halaman navy |
| `--color-line` di atas `--color-surface-2` | 3,42:1 | Lolos 1.4.11, batas kontrol |
| `--color-danger` di atas `--color-surface` | 5,31:1 | Lolos AA |
| `--color-ink` di atas `--color-accent` | **1,80:1** | **Gagal. Dilarang.** |

Tombol navy terisi **selalu** memakai `--color-on-accent`, tidak pernah `--color-ink`.
Hover menurunkan terang ke `--color-accent-hover`, bukan menaikkannya, karena halaman
ini terang. Aturan ini kebalikan dari versi "Deep Water" dan menyalin arah lama ke
sini akan membuat hover kehilangan kontras terhadap teks putih di atasnya.

Navy dipilih bukan karena netral, melainkan karena itu warna induk grup di pthis.id
dan permintaan eksplisit klien. Konsekuensinya diterima apa adanya: oranye keselamatan
maritim yang dulu jadi titik panas satu-satunya di halaman hilang sepenuhnya, termasuk
di garis rute peta, garis ukur blueprint, dan angka metrik.

**Color consistency lock:** aksen navy dipakai identik di seluruh halaman. Tidak ada
CTA oranye, tidak ada badge teal. Satu aksen, dikunci. `--color-danger` bukan aksen
kedua: ia hanya boleh muncul pada pesan dan tepi galat form.

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

> **SUPERSEDED, 18 Agustus 2026.** Susunan seksi beranda ditulis ulang di
> `docs/superpowers/specs/2026-08-18-dml-plan-5-profil-dan-beranda-design.md` bagian 6,
> yang memuat diagnosis tiap cacat Plan 4 beserta perbaikannya. Bagian di bawah
> diringkas ulang mengikuti keadaan sekarang. Kalau keduanya berbeda, spec Plan 5 yang
> berlaku.

Sembilan seksi. Setiap animasi punya alasan yang bisa dinyatakan dalam satu kalimat.
Anggaran eyebrow: maksimal tiga di seluruh halaman, hero terhitung satu.

**Aturan keras yang berlaku ke seluruh seksi.** Elemen yang dipaku ScrollTrigger tidak
boleh lebih tinggi dari viewport. Memaku elemen yang lebih tinggi berarti sisa
tingginya baru menggulir masuk setelah pin dilepas, dan itu terbaca sebagai halaman
kosong yang harus di-scroll lagi. Setiap seksi dipaku juga wajib punya jeda diam
sebelum pin dilepas, dan wajib jatuh ke tata letak statis di bawah 768 px atau saat
`prefers-reduced-motion` menyala.

### 7.1 Seksi 1, Hero terbagi dua

Bidang gelap dua kolom, bukan foto satu layar penuh. Kiri: headline, subteks, satu CTA.
Kanan: satu artefak 3D di dalam bingkai berbatas, dengan poster `DJI_0815` sebagai
dasarnya.

- Poster render sebagai LCP dengan `priority` dan tidak pernah dilepas dari DOM. Ia yang
  tampil tanpa JS, saat reduced motion, di mobile, dan sebelum kanvas selesai dibuat.
- Kanvas dipasang setelah jeda idle 600 ms dan hanya di atas 768 px.
- Kamera dipasang sekali mengikuti kotak pembatas model, lalu OrbitControls yang pegang
  sudut: rotasi idle pelan plus seret untuk memutar manual.
- **Tidak ada pin dan tidak ada kamera yang digerakkan scroll.** Versi Plan 4 memaku
  hero sepanjang 1,2 layar dan menarik kamera tiap frame, yang bertengkar dengan tangan
  pengguna dan menghabiskan satu layar penuh sebelum konten pertama.

Disiplin hero: headline maksimal dua baris, subteks maksimal 20 kata, `pt-24` maksimal,
maksimal empat elemen teks, CTA terlihat tanpa scroll.

### 7.2 Seksi 2, Potong keras ke siang

Wide anchorage siang dengan parallax lambat, foto penuh layar. Satu heading dan satu
paragraf pendek menjelaskan apa itu ship-to-ship transfer.

Alasan: hero kini bidang gelap berbingkai, jadi seksi ini yang membuka ke foto penuh
layar. Pergantian bingkai ke penuh layar itu yang membuatnya terasa membuka, bukan
mengulang.

### 7.3 Seksi 3, Dua lini bisnis

Satu panggung setinggi satu viewport yang dipaku, dua bab, pergantian berupa sapuan
`clip-path`. Kiri kolom teks di bidang gelapnya sendiri, kanan lapisan foto.

- **Lapisan foto tidak pernah memakai opacity sebagai alat transisi.** Sticky-stack
  Plan 4 meredupkan kartu keluar sampai opacity 0,55 lewat trigger kartu berikutnya,
  dan jendela redup itu berimpit tepat dengan umur sticky kartu kedua, jadi kartu
  tengah tidak pernah tampil penuh selama ia jadi kartu yang dibaca.
- Isi babnya mengikuti company profile resmi: dua lini yang dijalankan DML sendiri.
  Ship-to-ship bukan lini bisnis, ia sudah jadi seksi 2.

### 7.4 Seksi 4, Perusahaan afiliasi

Tri Sumaja Lines, Duta Wisata Bahari, dan Dutabahari Teknik sebagai baris berpembatas
tipis, bukan tiga kartu sejajar. Company profile menggambarnya sebagai cabang di bawah
kotak DML, jadi hierarkinya memang lebih rendah dari dua lini utama.

### 7.5 Seksi 5, Fleet Blueprint Comparator, 3D

**Kenapa bukan globe rute.** Seluruh operasi mereka muat dalam sekitar 8 derajat
lintang. Bola berputar akan menghabiskan hampir seluruh geometrinya menampilkan
samudra dan benua yang tidak relevan, dan gerakan "bumi berputar masuk dari luar
angkasa lalu berhenti di Indonesia" adalah gerakan template. Geografi rute ditangani
peta SVG di seksi 6, yang memang alat yang tepat untuk pelabuhan berkoordinat.

**Kenapa 3D di sini justru benar.** Skala relatif armada adalah pertanyaan pertama
setiap charterer, dan perbandingan volume antar kelas kapal sulit disampaikan dengan
gambar datar.

Implementasi:
- Panggung setinggi satu viewport yang dipaku. Tabel spesifikasi hidup di blok sendiri
  di bawahnya, di luar area yang dipaku.
- Tiga kelas memakai model GLB berlisensi CC BY (tanker, tugboat, ferry), dua kelas
  khas Indonesia (SPOB, oil barge) dibangun dari primitif. Materialnya disamakan supaya
  kelimanya terbaca sebagai satu keluarga. Ini mengoreksi baris "tidak ada model GLB
  unduhan" di versi awal spec ini, yang sudah tidak berlaku sejak Plan 4.
- Pemetaan progress ke kelas memakai `segmentAt`: tiap kelas diam selama 65 persen
  irisnya sebelum menyeberang, dan kelas terakhir berdiri penuh sepanjang 20 persen
  scroll terakhir.
- Kamera memuat KOTAK pembatas kelas yang diukur dari scene, bukan bola pembatasnya,
  dan ukurannya di-lerp lintas pasangan kelas. Yang dikendalikan hanya jarak dan tinggi
  titik bidik; sudut orbit tetap milik pengguna.
- Grid tetap 10 m per kotak, dengan keterangan skalanya tertulis di kanvas.

**Serah terima scroll ke canvas.** ScrollTrigger menulis progress ke sebuah `ref` objek
mutable, lalu `useFrame` di dalam canvas membacanya tiap frame. Tidak ada React state
di jalur itu, dan tidak ada tween GSAP yang menyentuh objek milik canvas.

**Tiga representasi data armada:** geometri R3F untuk desktop, lima blueprint SVG
statis untuk di bawah 768 px, dan tabel spesifikasi teks. Ketiganya membaca sumber data
yang sama di `src/content/fleet.ts`.

### 7.6 Seksi 6, Peta rute ro-ro

SVG path yang menggambar dirinya sendiri mengikuti progress scroll, lima lintasan,
dengan label leg dan pelabuhan yang menyala mengikuti leg yang sedang digambar.

- Panggung setinggi satu viewport yang dipaku, dengan jeda akhir eksplisit sepanjang
  26 persen timeline. Versi Plan 4 menyelesaikan leg terakhir persis di frame terakhir
  pin, yang terbaca sebagai transisi patah.
- Bbox peta memuat Selat Sunda sampai Lombok. Tinggi viewBox diturunkan dari bbox
  supaya skala x dan y identik.
- Lintasan Merak-Bakauheni digambar dengan warna berbeda dan diberi keterangan
  operatornya, karena ia dioperasikan PT Tri Sumaja Lines.

### 7.7 Seksi 7, Sejak 1988

Editorial dua kolom: penghitung tahun, kalimat pendirian, dan foto. Di bawahnya tiga
nilai perusahaan sebagai daftar huruf gantung, karena huruf awalnya mengeja DML.

Menggantikan seksi silsilah horizontal-pan yang dihapus di Plan 4. **Tidak ada lagi
scroll hijack horizontal di seluruh situs.**

### 7.8 Seksi 8, Sertifikasi dan angka

Empat metrik dengan counter yang menghitung naik saat masuk viewport: 64 kapal, lebih
dari 300 orang, tahun beroperasi, dan pelabuhan yang dilayani. Angka pelabuhan
diturunkan dari lintasan yang dioperasikan DML sendiri, bukan dari seluruh titik di
peta.

Di bawahnya standar dikelompokkan tiga klaster, bukan satu deret pill seragam: sistem
manajemen (ISO 9001:2015, ISM Code, ISPS Code, SIRE), biro klasifikasi (BKI), dan
sistem informasi (SAP). SAP adalah ERP, bukan sertifikat keselamatan, dan menaruhnya
sederet dengan ISM Code akan menyesatkan. Baris terakhir memuat keanggotaan: Sinar Alam
Corporation, OCIMF, GAPASDAP, IMO.

Alasan: umpan balik visual bahwa angkanya bergerak membantu pembaca menyadari ini
data, bukan dekorasi.

### 7.9 Artikel terbaru, belum dibangun

Tiga post terbaru dari Payload. Grid editorial, bukan tiga kartu identik. Belum ada di
beranda sampai koleksi artikel terisi.

### 7.10 Seksi 9, CTA dan footer

Satu CTA primer. Tidak ada dua CTA dengan intent sama di seluruh halaman.

### 7.11 Yang dilarang di beranda

Marquee, custom cursor, scroll cue, eyebrow bernomor seksi, dot status dekoratif,
strip lokasi atau cuaca, fake screenshot dari div, em dash, pill yang ditumpuk di atas
foto, caption kredit foto palsu, label versi.

## 8. Anggaran performa

| Item | Aturan |
|---|---|
| LCP | Poster AVIF 1600w, `priority`, target di bawah 2,5 detik |
| CLS | Di bawah 0,1. Semua gambar dan canvas punya ruang yang direservasi |
| INP | Di bawah 200 ms |
| Sekuens malam desktop | 10 frame AVIF, crossfade sepanjang pin 1,2 layar, target total di bawah 700 kB. Latar hitam membuat AVIF sangat efisien |
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
- `STS 06 JULI 2025.zip`, 36 file, operasi STS siang. Dipakai untuk studi kasus di
  `/bisnis/transportasi-bbm` dan sebagai cadangan galeri. Tidak dipakai di beranda
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

### 10.1 Caching dan revalidasi

Ini alur yang menjadi alasan keberadaan CMS. Kalau admin menekan publish dan halaman
tidak berubah, seluruh CMS jadi percuma. Jadi jalurnya ditulis eksplisit, bukan
diasumsikan.

| Route | Strategi |
|---|---|
| `/artikel` | Static, di-tag `posts` |
| `/artikel/[slug]` | `generateStaticParams` dari slug published, di-tag `posts` dan `post:<slug>` |
| `/` seksi artikel terbaru | Di-tag `posts` |
| `sitemap.ts` | Di-tag `posts` |
| Route korporat | Fully static, tidak pernah di-revalidate oleh CMS |

Mekanisme: hook `afterChange` dan `afterDelete` pada collection `posts` memanggil
`revalidateTag('posts')` dan `revalidateTag('post:' + slug)`. Perubahan status draft
ke published dan sebaliknya sama-sama memicu hook.

`cacheComponents` **dimatikan** untuk rilis pertama. Dukungan Payload untuk fitur ini
baru parsial; blocker yang membuat admin panel gagal saat `cacheComponents` aktif
memang sudah diatasi, tapi kompatibilitas penuh belum dijamin di seluruh permukaan
Payload. Tidak ada alasan menanggung risiko itu untuk situs seukuran ini. Catat sebagai
kandidat peningkatan setelah live dan stabil.

Verifikasi wajib, lihat bagian 14: satu spec Playwright yang login ke admin, publish
artikel, lalu memastikan artikel itu muncul di `/artikel` dan di seksi artikel terbaru
beranda tanpa perlu rebuild.

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

### 11.1 State yang wajib ada

Bukan hanya jalur sukses. Setiap permukaan berikut punya keempat state yang dinyatakan
di komponennya sendiri:

| Permukaan | Loading | Empty | Error |
|---|---|---|---|
| Form inquiry dan kontak | Tombol submit disabled dengan label berubah, bukan spinner bulat | Tidak berlaku | Error inline per field, ditambah error tingkat form kalau server action gagal atau rate limit kena |
| `/artikel` | Skeleton yang bentuknya mengikuti kartu artikel final | Pesan "belum ada artikel" yang tersusun rapi | Pesan gagal muat dengan tombol coba lagi |
| `/artikel/[slug]` | Skeleton artikel | Tidak berlaku | `not-found.tsx` untuk slug tidak dikenal |
| `/karier` | Tidak berlaku | Empty state yang digarap serius, menjelaskan cara mengirim lamaran spontan | Tidak berlaku |
| Canvas 3D | Poster blueprint statis selama chunk R3F diunduh | Tidak berlaku | Kalau WebGL tidak tersedia, jatuh ke blueprint SVG yang sama seperti mobile |

Skeleton tidak pernah memakai spinner bulat generik. Bentuknya mengikuti layout akhir
supaya tidak ada pergeseran saat konten masuk.

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
- **Playwright, alur publish artikel.** Login ke `/admin`, buat artikel, ubah status ke
  published, lalu pastikan artikel itu muncul di `/artikel` dan di seksi artikel
  terbaru beranda tanpa rebuild. Ini tes yang membuktikan revalidasi di bagian 10.1
  benar-benar bekerja, dan tanpanya CMS bisa terlihat berfungsi padahal tidak.
- **Playwright, kontras token.** Assert bahwa tidak ada elemen dengan latar
  `--color-accent` yang memakai `--color-ink` sebagai warna teks. Kombinasi itu gagal
  AA di 2,72:1 dan merupakan kesalahan default yang paling mudah lolos review mata.
- **Playwright dengan JavaScript dimatikan** untuk membuktikan aturan arsitektur nomor
  satu: semua teks dan link hadir.
- **axe-core** di setiap route.
- **react-doctor** sebagai gerbang kualitas React. `bun run doctor` menjalankan
  `react-doctor . -y --blocking warning --no-score`, dan `bun run doctor:design`
  menjalankan audit design. Dijalankan setelah tiap milestone implementasi, bukan
  hanya sekali di akhir, karena tujuannya menangkap pola React yang buruk sebelum pola
  itu menyebar ke seksi berikutnya. Situs ini punya banyak client leaf dengan `useEffect`
  yang memegang ScrollTrigger dan `useFrame`, dan di sanalah kebocoran cleanup serta
  re-render yang tidak perlu paling mungkin muncul.
- **Lighthouse CI** dengan ambang: LCP di bawah 2,5 detik, CLS di bawah 0,1, skor SEO
  minimal 95. Beranda diuji dengan throttling mobile.
- `bun run check` menjalankan lint, typecheck, test, build, doctor, dan lighthouse
  berurutan. Ini gerbang tunggal sebelum deploy.

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
