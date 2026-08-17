# Plan 4 — Overhaul beranda

Tanggal: 18 Agustus 2026
Status: menunggu review
Cabang: `feat/dml-foundation`
Menggantikan sebagian: `docs/superpowers/specs/2026-08-16-dml-corporate-design.md` §7 (delta dicatat di §9)

## 1. Design read

Redesign-overhaul beranda korporat pelayaran B2B. Pembaca utama adalah charterer dan mitra
energi yang menilai kapasitas armada, pembaca kedua adalah calon penumpang ro-ro. Bahasa
visual: sinematik-dokumenter maritim di atas palet Deep Water yang sudah terkunci. Fondasi
teknis tetap Tailwind v4 + GSAP ScrollTrigger + React Three Fiber, tanpa design system pihak
ketiga.

Mode redesign adalah **overhaul**, bukan preserve: bahasa visual boleh berganti, tetapi
konten, rute URL, label navigasi, ID anchor, dan token warna dipertahankan apa adanya.

Dial, dibaca dari situs sekarang (variance 4 / motion 5 / density 3) lalu dinaikkan sesuai
aturan overhaul dan permintaan animasi sinematik:

| Dial | Sekarang | Target |
|---|---|---|
| DESIGN_VARIANCE | 4 | 7 |
| MOTION_INTENSITY | 5 | 8 |
| VISUAL_DENSITY | 3 | 4 |

## 2. Audit — kondisi beranda sekarang

Diverifikasi lewat screenshot 1440x900 pada `next dev` dan pembacaan kode, 18 Agustus 2026.

### 2.1 Cacat yang harus diperbaiki

1. **Kartu lini bisnis kolaps.** `business-lines.tsx:72-75` memasang `min-h-screen` (tinggi
   auto) di induk dan `h-full` di anak. `h-full` dihitung terhadap tinggi auto, jadi kolaps
   ke tinggi konten. Isi kartu cuma `<Image fill>` (di luar alur) plus blok teks, sehingga
   tinggi pita kartu = tinggi teks, sekitar 240 px di tengah viewport 100 vh. Ini penyebab
   tunggal dua keluhan sekaligus: ruang terbuang di atas dan bawah, dan teks mendarat di
   tengah foto (bagian paling terang) alih-alih di dasar gradien. Kartu STS paling parah
   karena deskripsinya paling panjang dan memakai `text-ink-muted` (#8FA1A8) di atas lambung
   putih.
2. **Peta rute mengisi sepertiga lebar.** `route-map.tsx:49` memakai `max-w-2xl` di dalam
   kontainer 1400 px. Sisi kanan kosong sepenuhnya.
3. **Jaringan rute digambar salah.** `routePath()` menyambung keempat pelabuhan jadi satu
   polyline berantai Ketapang → Lembar → Tanjung Perak → Kumai. Master spec §2 menyebut tiga
   leg terpisah: Ketapang ke Lembar, Tanjung Perak Surabaya ke Lembar, Kumai ke Surabaya.
   Selain itu `ports.ts` menyatakan sendiri koordinatnya bukan geografis.
4. **"Ketapang" salah pulau.** Dipasangkan dengan Lembar (Lombok) dan Tanjung Perak, yang
   dimaksud adalah Ketapang, Banyuwangi, Jawa Timur, bukan Ketapang, Kalimantan Barat.
5. **Silsilah menampilkan satu kartu menempel kiri.** `TIMELINE` berisi satu entri, sengaja,
   karena sumber publik hanya mengonfirmasi tahun pendirian. `LineagePan` berhenti saat
   `distance <= 0`, jadi pin dan pan tidak pernah aktif dan kartu tunggal menempel di tepi
   kiri wrapper full-bleed tanpa gutter.
6. **Kapal 3D terpotong keluar frame.** `fleet-canvas.tsx:95` memakai kamera tetap
   `[4, 2, 4]` fov 45 tanpa fit terhadap ukuran objek. Lambung 95 m tidak muat.
7. **Rongga vertikal besar.** Beranda 11.822 px dengan beberapa layar hampir kosong, akibat
   gabungan cacat 1, 2, dan 5.

### 2.2 Yang dipertahankan

- Token Deep Water (`globals.css` + `tokens.ts`), rasio kontrasnya dijaga `tokens.test.ts`.
- Pasangan huruf Cabinet Grotesk display, Satoshi body, Geist Mono angka.
- Aksen tunggal `--color-accent` #FF5A1F di seluruh halaman.
- Rute URL, label navigasi, anchor `#silsilah`, isi footer, target CTA `/kontak`.
- Kontrak `Reveal`, `usePrefersReducedMotion`, `SmoothScrollProvider`, `CtaLink`.
- Aturan arsitektur master spec §4.2: R3F dan GSAP tidak pernah berada di pohon komponen
  yang sama. GSAP menulis progress ke ref biasa, `useFrame` membacanya.

## 3. Keputusan yang sudah diambil

Dikonfirmasi pengguna, 18 Agustus 2026:

1. **Sumber 3D**: model GLB berlisensi dari Sketchfab, diunduh lewat API token, dioptimasi
   di pipeline lokal. Membatalkan larangan model unduhan di master spec §7.4.
2. **Peta**: garis pantai vektor asli offline dari Natural Earth, tanpa API key dan tanpa
   dependency runtime pihak ketiga.
3. **Silsilah**: seksi horizontal-pan diganti seksi pernyataan "Sejak 1985". Membatalkan
   master spec §7.6.
4. **Gerbang performa**: ambang LCP dilonggarkan demi hero 3D. Angka pasti di §7.
5. **Comparator**: tiga kelas memakai GLB, dua kelas (SPOB dan oil barge) dibangun dari
   geometri agar konsisten. Tidak ada model SPOB atau oil barge di sumber manapun; keduanya
   tipe kapal khas Indonesia.
6. **Atribusi**: satu baris kredit kecil di footer.

## 4. Aset 3D

### 4.1 Model terpilih

Seluruhnya lisensi **CC Attribution 4.0**, bukan CC0. Kewajiban atribusi ditangani di §4.4.
Ukuran GLB mentah dari API Sketchfab, terverifikasi 18 Agustus 2026.

| Peran | Model | Penulis | UID | Tris | GLB mentah |
|---|---|---|---|---|---|
| Hero + kelas Motor Tanker | Tanker Ship | Art Blender (@ArtBlender) | `96ebf61af42b4062ae98a6ad848e1a25` | 193.100 | 10,2 MB |
| Cadangan tanker | Oil Tanker | Gman The Cruise Dude (@gmanisdabossatbeastmode) | `0b857798b11649fb86ced9475274684c` | 159.190 | 7,1 MB |
| Kelas Ro-Ro Ferry | Hailuoto car ferry L/A Meriluoto | Snowsoup (@snowsoup) | `44eaf2dd56b74e76a310d2e532957dbe` | 82.676 | 5,1 MB |
| Kelas Tugboat | Rastar 3200 tugboat | Brout (@davidbroutian) | `1bbadbe4ab0a4b2599cd3f450942e6fe` | 46.880 | 4,0 MB |

Nama penulis dan label lisensi di atas diambil langsung dari `GET /v3/models/{uid}` pada 18
Agustus 2026, bukan dari ingatan. `src/content/model-credits.ts` mengulang data yang sama
apa adanya, termasuk URL viewer per model untuk tautan atribusi.

Kelas **SPOB** dan **Oil Barge** tidak punya model di sumber manapun. Keduanya dibangun dari
geometri three.js (`ExtrudeGeometry` untuk profil lambung, box dan lathe untuk superstruktur)
dan diberi material PBR yang sama persis dengan model GLB setelah dinormalisasi: warna
lambung, roughness, metalness, dan garis deck diambil dari nilai material tanker yang sudah
diunduh, bukan dipilih terpisah. Tujuannya satu frame comparator terbaca sebagai satu
keluarga, bukan campuran dua kualitas.

### 4.2 Pipeline model

Skrip baru `scripts/prepare-models.ts`, dipanggil lewat `bun run prepare-models`, memakai
`@gltf-transform/cli` sebagai devDependency baru:

1. Unduh GLB lewat `GET /v3/models/{uid}/download` dengan header
   `Authorization: Token ${SKETCHFAB_TOKEN}`. Token dibaca dari `.env.local`, tidak pernah
   di-commit. Ditambahkan ke `.env.example` sebagai variabel opsional dengan penjelasan.
2. `dedup`, `weld`, `join`, `prune` untuk membuang node dan material tak terpakai.
3. `simplify` (meshoptimizer) dengan target ratio per model sampai 30.000 sampai 60.000 tris.
   Angka final ditentukan saat implementasi lewat inspeksi visual, dicatat di laporan task.
4. Tekstur di-resize maksimal 1024 px dan dikonversi ke WebP.
5. Kompresi geometri `meshopt`.
6. Keluaran ke `public/models/*.glb`. GLB mentah dan `assets/_raw/models/` masuk
   `.gitignore`, hanya turunan yang di-commit. Pola sama dengan pipeline gambar yang sudah
   berjalan.

### 4.3 Anggaran

- Per model setelah optimasi: maksimal **700 kB**.
- Total seluruh model di beranda: maksimal **2,2 MB**.
- Seluruh model dimuat lazy, tidak ada yang masuk bundel awal.
- HDRI lingkungan: satu file `.hdr` CC0 dari Poly Haven, resolusi 1k, maksimal 400 kB,
  dipakai bersama oleh hero dan comparator lewat satu loader.
- Gerbang: `bun run prepare-models` gagal dan keluar non-nol kalau ada berkas melewati
  anggaran, supaya angka ini tidak diam-diam melar.

### 4.4 Atribusi

Berkas baru `src/content/model-credits.ts` berisi nama model, nama penulis, URL model, dan
nama lisensi per entri. `SiteFooter` merender satu baris di bar bawah, sebaris dengan
copyright:

> Model 3D: Tanker Ship oleh Art Blender, Hailuoto car ferry oleh …, Rastar 3200 tugboat
> oleh …. Lisensi CC BY 4.0.

Nama penulis tertaut ke halaman model di Sketchfab. Ini syarat lisensi, bukan hiasan, jadi
tidak boleh disembunyikan di balik disclosure atau ditulis dengan kontras di bawah AA.

## 5. Sembilan seksi

Delapan seksi aktif, delapan keluarga layout berbeda. Anggaran eyebrow: `ceil(8 / 3)` = 2.
Rencana memakai nol eyebrow; judul seksi sudah cukup menerangkan.

### 5.1 Hero — artefak 3D terpin

Keluarga layout: pinned WebGL canvas, konten teks rata kiri bawah.

Panggung R3F full-bleed: satu lambung tanker mengambang di atas bidang air gelap, disinari
HDRI senja maritim plus satu key light hangat dari haluan. Tanpa langit fotografis; latar
tetap `--color-surface` supaya lambung terbaca sebagai artefak, bukan foto.

Gerak kamera digerakkan scroll lewat ScrollTrigger `pin: true`, `start: "top top"`,
`end: "+=120%"`, `scrub: 1`, menulis ke `progressRef`. `useFrame` di dalam canvas membaca ref
itu dan menggerakkan tiga beat:

1. **Dolly-in**: kamera masuk dari jarak jauh ke tiga perempat panjang lambung.
2. **Orbit**: yaw bergeser sekitar 35 derajat melewati sisi lambung.
3. **Naik**: kamera terangkat dan pitch menunduk ke geladak.

Alasan gerak, satu kalimat: skala kapal hanya terbaca kalau kamera bergerak melewatinya.

Headline mask-reveal tiga beat sepanjang pin. Copy dipendekkan supaya muat dua baris di
desktop:

- H1: "Menggerakkan energi Kalimantan sejak 1985."
- Subteks (13 kata): "Armada BBM, penyeberangan ro-ro, dan galangan kapal dalam satu grup
  pelayaran Banjarmasin."
- Satu CTA primer, "Hubungi Kami", ke `/kontak`.

Maksimal tiga elemen teks. Tidak ada scroll cue, tidak ada strip dekorasi, tidak ada label
versi.

**Kontrak render (mengikat, diuji):**

| Kondisi | Yang dirender |
|---|---|
| Desktop, JS aktif, motion normal | Poster `<Image priority>` lalu canvas crossfade masuk |
| Tanpa JS | Poster + H1 + subteks + CTA, statis |
| `prefers-reduced-motion: reduce` | Poster + H1 + subteks + CTA, statis, tanpa canvas |
| Viewport < 768 px | Poster + H1 + subteks + CTA, tanpa canvas |

Poster `DJI_0815` tetap elemen LCP di semua kondisi. Canvas mount setelah frame pertama
selesai dan `requestIdleCallback` menyala, lalu naik opacity 0 ke 1 di atas poster. Poster
tidak dilepas dari DOM; dia jadi latar canvas kalau WebGL gagal.

Tanpa WebGL di mobile: bukan sekadar hemat, tapi juga menjaga assertion
`canvas count 0` di `beranda.spec.ts` untuk viewport 375 px tetap berlaku.

### 5.2 Potong ke siang — zoom parallax

Keluarga layout: full-bleed zoom parallax dengan kolom teks bertumpu panel.

Foto `DJI_0030` full-bleed. Scroll menggerakkan `scale` 1,12 ke 1,0 dan `y` foto lebih lambat
dari halaman. Alasan: potongan malam ke siang adalah potongan film, dan zoom keluar memberi
rasa kamera menjauh dari operasi.

Perbaikan keterbacaan: teks tidak lagi bergantung gradien. Paragraf duduk di panel
`bg-surface/85` dengan `backdrop-blur-sm` dan border satu piksel, lebar maksimal 55ch, rata
kiri di kolom kiri grid 12 kolom (span 5). Warna teks naik dari `text-ink-muted` ke
`text-ink`. Panel juga jadi jangkar layout, jadi tidak ada lagi teks mengambang di tengah
foto terang.

Paragraf ini satu-satunya tempat STS dijelaskan panjang. Kartu STS di seksi berikutnya
dipotong pendek supaya tidak duplikatif.

### 5.3 Tiga lini bisnis — sticky stack

Keluarga layout: sticky stack, satu kartu satu layar penuh.

Perbaikan struktural: setiap kartu `min-h-[100dvh]` dan lapisan media `absolute inset-0`,
bukan `h-full` di dalam induk auto. Skeleton mengikuti Section 5.A design-taste: setiap kartu
kecuali terakhir dipin dengan `start: "top top"`, `pin: true`, `pinSpacing: false`; scale dan
opacity kartu digerakkan ScrollTrigger kartu berikutnya.

Komposisi tiap kartu: foto full-frame dengan `scale` 1,08 ke 1,0 saat kartu masuk, panel
konten rata kiri (`bg-surface/85`, `backdrop-blur-sm`) berisi judul, deskripsi maksimal 25
kata dengan `text-ink`, dan daftar kelas kapal terkait dalam Geist Mono. Numeral indeks besar
di sudut sebagai jangkar komposisi, bukan sebagai eyebrow bernomor.

Kartu tidak punya `href`; halaman `/bisnis/<slug>` belum ada. Tidak ada penanda "Segera
Hadir".

CTA hanya di kartu terakhir, satu, ke `/kontak`.

### 5.4 Perbandingan armada — pinned split

Keluarga layout: pinned split, canvas di kanan, rel data di kiri.

Grid dua kolom: kolom kiri (span 4) berisi nama kelas aktif, angka panjang, DWT, kapasitas,
dan kapasitas penumpang dalam Geist Mono; kolom kanan (span 8) berisi canvas. Ini memperbaiki
dua hal sekaligus: kamera tidak lagi memotong lambung, dan angka terbaca berdampingan dengan
bentuknya.

Kamera memakai fit-to-object: jarak dihitung dari bounding box lambung aktif dan fov, jadi
kelas 95 m dan kelas 32 m sama-sama muat penuh dengan margin sama. Ini perbaikan langsung
untuk cacat audit 2.1 nomor 6.

Skala bersama dibuat terbaca lewat bidang grid 10 m di bawah lambung yang ikut berganti
ukuran relatif, plus garis ukur oranye dengan angka menempel. Saat scroll berpindah kelas,
kamera melakukan dolly pendek dan lambung lama fade keluar sementara lambung baru fade masuk;
grid tidak ikut berganti, jadi mata punya patokan tetap. Alasan: perbandingan volume antar
kelas tidak terbaca dari gambar datar, dan tanpa patokan tetap morph antar kelas kehilangan
maknanya.

Tiga representasi data, semuanya membaca `src/content/fleet.ts`:

1. Geometri R3F, desktop, JS aktif, motion normal.
2. `BlueprintSvg` lima kelas, di bawah 768 px atau reduced motion. Dipertahankan apa adanya.
3. `FleetSpecTable`, selalu ada di DOM server. Dipertahankan apa adanya.

### 5.5 Rute ro-ro — peta vektor asli

Keluarga layout: peta full-bleed dengan teks overlay, scrollytelling.

Garis pantai asli, bukan garis abstrak. Skrip baru `scripts/prepare-map.ts` mengambil
Natural Earth 1:10m `ne_10m_land` (public domain) dari
`github.com/nvkelso/natural-earth-vector`, memotong ke bbox lon 109 sampai 118, lat -10
sampai -1, menyederhanakan dengan toleransi yang menjaga bentuk pada zoom terjauh, dan
menulis `src/features/route-map/coastline.json`. Target ukuran maksimal 60 kB, di-commit.

`src/features/route-map/ports.ts` ditulis ulang dengan koordinat geografis asli dan
diproyeksikan Mercator oleh helper murni yang punya unit test:

| Pelabuhan | Lintang | Bujur |
|---|---|---|
| Ketapang, Banyuwangi | -8,145 | 114,383 |
| Lembar, Lombok | -8,725 | 116,070 |
| Tanjung Perak, Surabaya | -7,200 | 112,730 |
| Kumai, Kalimantan Tengah | -2,740 | 111,730 |

Tiga leg terpisah, bukan satu polyline (memperbaiki cacat audit 2.1 nomor 3):

1. Ketapang ke Lembar, sejak 20 Desember 2020.
2. Tanjung Perak Surabaya ke Lembar, 25 sampai 28 jam.
3. Kumai ke Surabaya, ekspansi Juni 2025.

Marker kantor pusat Banjarmasin (-3,320, 114,590) ditampilkan sebagai titik netral tanpa leg,
supaya pembaca tahu di mana perusahaannya berada.

Gerak: scroll melakukan zoom dari seluruh bbox ke koridor rute sambil pan mengikuti leg yang
sedang digambar, tiap leg menggambar dirinya sendiri berurutan, label pelabuhan muncul saat
garisnya sampai. Alasan: urutan gambar menjelaskan jaringan lebih cepat daripada tiga garis
yang muncul bersamaan.

SVG dirender di server sehingga seluruh nama pelabuhan dan judul leg ada di HTML tanpa JS.
Zoom, pan, dan gambar-sendiri hanya lapisan motion di atasnya. Tidak ada WebGL di seksi ini.

Teks seksi overlay di kolom kiri di atas panel, bukan blok terpisah di atas peta. Ini
menghabiskan lebar penuh dan memperbaiki cacat audit 2.1 nomor 2.

### 5.6 Sejak 1985 — pernyataan editorial

Keluarga layout: editorial asimetris, tanpa kartu.

Menggantikan seksi Silsilah. Alasan penggantian tercatat di §9 delta 3.

Grid 12 kolom asimetris. Kiri (span 7): angka tahun besar dalam Geist Mono, "1985" ke angka
usia perusahaan yang menghitung naik saat masuk viewport, memakai `useCounter` yang sudah
ada. Kanan (span 5): satu foto arsip dari `assets/_raw`, satu kalimat pendiri dari
`TIMELINE[0]`, dan tautan "Lihat silsilah lengkap" ke `/tentang-kami#silsilah`.

`TIMELINE` tetap dipakai sebagai sumber, jadi tidak ada data yang ditinggalkan dan
`/tentang-kami#silsilah` tidak berubah. `LineagePan` dan `lineage-pan` dihapus dari beranda;
tidak ada konsumen lain (diverifikasi: hanya `lineage.tsx` yang mengimpornya).

Heading berubah dari "Silsilah" menjadi "Sejak 1985". Dua spec e2e yang mengassert heading
"Silsilah" di beranda diperbarui, bukan dihapus.

Tidak ada angka tonggak yang dikarang. Data yang ada tetap satu entri terverifikasi.

### 5.7 Sertifikasi dan angka — data band

Keluarga layout: band data padat, hairline, tanpa kartu.

Empat metrik dalam Geist Mono dipisah hairline vertikal, bukan kartu: jumlah kapal, total
DWT, tahun beroperasi, jumlah pelabuhan yang dilayani. Counter naik saat masuk viewport,
`useCounter` dipakai ulang.

Sertifikasi dikelompokkan jadi dua klaster berlabel, "Operasi kapal" (ISM Code, ISPS Code,
SIRE) dan "Galangan" (ISO 9001:2015), bukan satu deret pill seragam. Radius mengikuti sistem
bentuk halaman (§6.3).

Seluruh angka `// unverified` yang sudah ada tetap ditandai; tidak ada angka baru yang
dikarang.

### 5.8 CTA dan footer

Keluarga layout: pernyataan terpusat.

Satu CTA primer, "Hubungi Kami", ke `/kontak`. Label ini identik di hero, kartu lini bisnis
terakhir, dan seksi ini; tidak ada dua CTA dengan intent sama memakai kata berbeda.

Footer menambah satu baris kredit model 3D (§4.4). Sisanya tidak berubah.

## 6. Sistem visual

### 6.1 Ritme vertikal

Padding seksi diseragamkan lewat satu skala: seksi penuh layar memakai `min-h-[100dvh]`,
seksi konten memakai `py-24 md:py-32`. Rongga kosong sekarang berasal dari cacat layout, bukan
dari ritme, jadi ritme tidak perlu dipadatkan; yang perlu adalah cacatnya diperbaiki.

### 6.2 Komponen bersama baru

Untuk membunuh markup duplikat yang sekarang ada di enam seksi:

- `src/components/ui/section-header.tsx` — judul h2 plus deskripsi opsional, satu tempat
  untuk skala tipografi dan lebar maksimal.
- `src/components/ui/overlay-panel.tsx` — panel scrim yang dipakai seksi 2, 3, dan 5. Satu
  tempat untuk aturan kontras teks di atas foto, termasuk fallback
  `prefers-reduced-transparency`.
- `src/lib/motion/use-scroll-progress.ts` — satu jembatan ScrollTrigger ke ref yang dipakai
  hero dan comparator, menggantikan dua salinan logika `progressRef` yang hampir sama.
- `src/lib/motion/tokens.ts` — durasi dan easing bernama, supaya gerak antar seksi terasa
  satu tangan.

### 6.3 Bentuk dan warna

- Radius: satu sistem. Kartu dan panel `radius-card` 12 px, input `radius-input` 8 px, tombol
  pill penuh. Sudah konsisten sekarang, dipertahankan.
- Aksen: `--color-accent` #FF5A1F, satu-satunya aksen, dipakai identik di garis ukur 3D,
  garis rute peta, angka counter, dan CTA.
- Tema terkunci gelap (`color-scheme: dark`). Tidak ada seksi yang membalik ke terang.
- Semua teks di atas foto lewat `OverlayPanel`, tidak ada lagi yang mengandalkan gradien saja.

### 6.4 Larangan yang tetap berlaku

Master spec §7.10 dipertahankan penuh: tidak ada marquee, custom cursor, scroll cue, eyebrow
bernomor seksi, dot status dekoratif, strip lokasi atau cuaca, fake screenshot dari div,
tanda pisah em, pill di atas foto, caption kredit foto palsu, label versi.

Kredit model 3D di footer bukan pelanggaran larangan caption kredit palsu: itu kredit nyata
untuk karya nyata, dan diwajibkan lisensi.

## 7. Anggaran performa dan gerbang

### 7.1 Perubahan ambang

`lighthouserc.json`, `largest-contentful-paint` dinaikkan **5000 ms ke 6000 ms**.

Alasan ditulis eksplisit supaya tidak jadi kebiasaan menaikkan ambang ke angka apa pun yang
kebetulan lolos: hero sekarang memuat HDRI dan satu GLB setelah LCP, yang menambah kontensi
jaringan di jendela pengukuran Lighthouse mobile-throttled meski elemen LCP-nya sendiri tidak
berubah. 6000 ms adalah headroom terbatas, bukan pencabutan gerbang. Kalau hasil ukur ternyata
di bawah 5000 ms, ambang dikembalikan ke 5000 ms dan angka ini dihapus.

`cumulative-layout-shift` tetap 0,1. `categories:seo` tetap 0,95. Keduanya tidak dilonggarkan.

### 7.2 Gerbang yang tidak berubah

- `bun run check` tetap gerbang akhir: lint, typecheck, test, build, doctor, lighthouse.
- `bun run doctor` tetap `--blocking warning`. Kode R3F baru mengikuti aturan yang sudah
  memberi bekas di `fleet-canvas.tsx`: tidak ada konstruksi objek three di badan render,
  tidak ada resource prop inline, tidak ada `setState` di effect.
- `tests/e2e/no-js.spec.ts`, `reduced-motion.spec.ts`, `beranda.spec.ts` tetap gerbang.
  Assertion `canvas count 0` untuk reduced motion dan viewport 375 px dipertahankan; kontrak
  render hero di §5.1 memang dirancang supaya keduanya tetap hijau.
- axe-core di beranda tetap nol violation.

### 7.3 Anggaran jaringan

- Model dan HDRI: maksimal 2,6 MB total, seluruhnya lazy, nol di bundel awal.
- Canvas hero mount setelah frame pertama; canvas comparator mount lewat IntersectionObserver
  `rootMargin: 200px` seperti sekarang.
- `coastline.json` maksimal 60 kB, di-commit, dirender server.

## 8. Testing

Tambahan di atas suite yang sudah ada:

- Unit: proyeksi Mercator (`ports.ts` helper), pembacaan `model-credits.ts`, fit-to-object
  kamera (fungsi murni jarak kamera dari bounding box dan fov), `use-scroll-progress`.
- Unit: setiap komponen seksi yang berubah, memperbarui test yang ada, bukan menghapusnya:
  `hero.test.tsx`, `business-lines.test.tsx`, `day-cut.test.tsx`, `certifications.test.tsx`,
  `lineage.test.tsx` (jadi test seksi Sejak 1985).
- E2E: heading beranda diperbarui dari "Silsilah" ke "Sejak 1985" di `no-js.spec.ts` dan
  `beranda.spec.ts`.
- E2E baru: hero tanpa JS merender H1, subteks, CTA, dan poster; hero reduced-motion tidak
  memasang canvas.
- E2E baru: baris kredit model 3D hadir di footer dan tautannya punya `href` ke Sketchfab.
- Visual: screenshot 1440x900 dan 375x812 per seksi setelah tiap milestone, dibandingkan
  dengan baseline audit di §2 untuk membuktikan cacat ruang mati benar-benar hilang.
- Gerbang bentuk: `prepare-models` keluar non-nol kalau anggaran ukuran terlampaui.

## 9. Delta terhadap master spec

Master spec `2026-08-16-dml-corporate-design.md` tetap berlaku kecuali empat hal berikut.

**Delta 1 — model GLB unduhan diizinkan (§7.4).** Master spec melarang model GLB unduhan
dengan alasan nol risiko lisensi dan nol risiko model buruk. Pengguna memilih realisme.
Risiko lisensi ditangani lewat audit lisensi eksplisit dan kredit footer wajib (§4.4); risiko
kualitas ditangani lewat daftar pendek terverifikasi dengan jumlah poligon terukur (§4.1).

**Delta 2 — estetika comparator berubah dari wireframe blueprint ke PBR (§7.4).** Master spec
memilih wireframe sebagai pilihan desain sadar untuk menghindari uncanny valley. Dengan model
asli, jurang itu tidak ada. Konsekuensi yang diterima: dua kelas tanpa model harus dibangun
menyamai tiga kelas lainnya, dan kalau hasilnya tidak menyatu dalam satu frame, seluruh seksi
kembali ke wireframe. Checkpoint ini wajib dilihat di browser sebelum task ditutup.

**Delta 3 — seksi 6 berubah dari horizontal pan ke pernyataan (§7.6).** Master spec menyebut
ini satu-satunya scroll hijack horizontal di seluruh situs. Datanya tidak ada: `TIMELINE`
berisi satu entri dan penambahan entri karangan ditolak sejak Plan 3. Horizontal pan dengan
satu kartu bukan desain, itu bug yang terlihat. Kalau klien nanti memberi tonggak asli,
seksi ini boleh kembali jadi horizontal pan tanpa perlu re-approval desain.

**Delta 4 — ambang LCP naik ke 6000 ms (§8).** Alasan dan syarat pengembalian di §7.1.

Master spec §7.10 (larangan) dan §4.2 (batas komponen R3F dan GSAP) tidak berubah.

## 10. Di luar scope

- Halaman selain beranda. `/tentang-kami`, `/kontak`, `/karier` hanya disentuh kalau footer
  atau komponen bersama menyentuhnya.
- `/bisnis/*` dan halaman permintaan informasi bisnis.
- Sistem artikel dan seksi 8 beranda.
- Verifikasi klien atas seluruh data `// unverified`.

## 11. Risiko

1. **Model GLB tidak menyatu dengan dua kelas buatan.** Mitigasi: checkpoint browser wajib
   di Delta 2, dengan jalan mundur kembali ke wireframe untuk seluruh comparator.
2. **Anggaran ukuran model tidak tercapai setelah simplify.** Mitigasi: `prepare-models`
   gagal keras; kalau satu model tidak bisa turun di bawah 700 kB tanpa rusak, ganti ke
   kandidat cadangan `0b857798` yang lebih ringan.
3. **Ambang LCP 6000 ms ternyata masih terlampaui.** Mitigasi: hero turun ke poster plus
   canvas yang baru mount setelah interaksi scroll pertama, bukan setelah idle.
4. **Koordinat Ketapang salah baca.** Interpretasi Ketapang, Banyuwangi diambil dari
   pasangan rutenya di master spec §2, bukan dari nama saja. Ditandai `// unverified` dan
   masuk daftar konfirmasi klien.
