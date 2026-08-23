# Plan 7: Palet warna dml-web — Design Spec

**Tanggal:** 2026-08-23
**Status:** disetujui pemilik repo, siap masuk implementation plan
**Ruang lingkup:** `dml-web/` saja. Branch `denis`.

## 1. Masalah

Situs terasa terlalu terang. Pemilik repo ingin tetap light mode — bukan
dark mode, bukan toggle — dan ingin palet diturunkan dari ptdml.com.

Terangnya bukan satu sebab. Ada tiga, dan hanya satu yang berupa nilai token:

1. **Bidang halaman nyaris putih.** `surface: #F5F9FD` punya luminansi relatif
   0,9426. Praktis kertas. Kartu `surface-2: #FFFFFF` cuma 0,057 di atasnya,
   jadi selang-seling seksi terang/lebih-terang nyaris tidak terbaca sebagai
   irama.
2. **Resep gradasi seksi memancar dari dua arah.** `.bg-surface-wash` dan
   `.bg-surface-2-wash` menaruh `accent-soft` (#E1EEFF, biru muda) pada stop
   0% *dan* 130%, lalu menumpuk radial putih di atasnya. Dipakai 15 kali di 8
   berkas. Memperdalam token mengganti bahannya, tapi resepnya yang bikin
   silau — dua sudut menyala sekaligus dan tidak ada tepi yang membumi.
3. **Bidang chrome ikut terang, termasuk di atas hero gelap.** `hero.tsx:73`
   memakai `-mt-18`, jadi hero naik ke bawah header yang `bg-surface/85
   backdrop-blur`. Hasilnya pita nyaris putih 85% melayang di atas foto hero
   gelap. Di ptdml.com posisi itu justru pita navy penuh.

Di luar itu, palet 3D dan peta tidak ikut sistem token sama sekali dan
disetel untuk bidang terang yang sekarang: `stage.tsx` memuat tujuh warna
lampu keras, `materials.ts` tiga, `route-map.tsx` dua. Memperdalam bidang
tanpa menyetel ulang ketiganya akan membuat kapal dan peta terlihat terpotong
dari halaman.

## 2. Referensi ptdml.com — apa yang benar-benar ada di sana

Diambil dari `wp-content/themes/ptdml-multi/css/custom.css`, `style.css`, dan
histogram aset `img/`.

| Peran | Nilai | Bukti |
| --- | --- | --- |
| Navy utama | `#183163` | 24 kemunculan di `custom.css`: tautan, header, tombol, judul seksi, penanda pager |
| Pita header bertekstur | `#183569` → `#1B458C` | histogram `img/bg_menu.jpg` |
| Bidang halaman | `#F9F9F9` / `#EDEDED` | histogram `img/bg_main.jpg` |
| Kartu | `#fff` | 26 kemunculan |
| Teks sekunder | `#777` / `#888` / `#999` | 15 kemunculan gabungan |
| Logo | navy `#2F3A52`, `#3A4665`, `#667BB2` + near-black | histogram `uploads/2018/06/logo.png` |

**Yang sengaja tidak diambil:**

- **Maroon `#b20102` / `#670001`.** Hanya muncul pada selektor `.sub-menu` dan
  `.menu .abs-link a`. Markup `sub-menu`, `abs-link`, dan
  `menu-item-has-children` **nol kemunculan** di HTML halaman live, dan
  histogram logo tidak memuat merah sama sekali. Ini CSS tema WordPress yang
  mati. Mempromosikannya jadi aksen sekunder berarti mengarang identitas
  merek dari bangkai selektor.
- **`#04a4cc`** di `style.css` — boilerplate tema html5blank, bukan merek.

**Yang paling penting dan hampir terlewat:** bidang halaman ptdml **netral**,
tanpa rona biru. Navy dikurung di chrome. dml-web sekarang kebalikannya —
rona biru muda dioleskan ke seluruh bidang lewat wash.

## 3. Keputusan yang diambil pemilik repo

Tiga keputusan diajukan dengan dua kandidat palet yang **dua-duanya sudah
lolos seluruh gerbang kontras**, jadi pilihannya murni rasa, bukan teknis.

1. **Karakter bidang: biru diperdalam** (bukan netral abu ala ptdml). Keluarga
   biru sekarang dipertahankan, terangnya diturunkan satu tingkat penuh.
   Konsekuensi yang diterima: menyimpang dari ptdml yang bidangnya netral, dan
   rona biru tetap hadir di seluruh bidang. Yang didapat: perubahan lebih
   kecil, identitas "biru maritim" yang sudah dibangun di Plan 4-6 tidak
   dibuang.
2. **Chrome: header navy penuh + footer navy.** Footer sudah navy penuh sejak
   Plan 5; ini menambah pasangannya di atas, seperti ptdml.
3. **Setel ulang 3D + peta masuk plan ini**, bukan ditunda.

## 4. Palet baru

Nilai wajib identik di `src/lib/tokens.ts` dan blok `@theme` di
`src/app/globals.css`. `tokens-parity.test.ts` menolak ketidaksamaan di kedua
arah, termasuk custom property yatim.

| Token | Lama | Baru | Alasan |
| --- | --- | --- | --- |
| `surface` | `#F5F9FD` | `#E9EEF5` | luminansi 0,9426 → 0,8507. Ini inti perbaikannya |
| `surface2` | `#FFFFFF` | `#FBFCFE` | putih murni membunuh kedalaman; kartu tetap terangkat jelas di atas surface baru |
| `surface3` | `#CED9EA` | `#C3CEDE` | ikut turun agar garis rambut tidak jadi lebih terang dari bidangnya |
| `line` | `#7A8CA8` | `#6E7C93` | tepi kontrol; lihat catatan risiko di §8 |
| `ink` | `#181C24` | `#151A22` | |
| `inkMuted` | `#515661` | `#4C525C` | |
| `accent` | `#164194` | `#183163` | navy ptdml |
| `accentHover` | `#0E3A8A` | `#12274F` | |
| `accentPress` | `#0A2C6B` | `#0C1B39` | |
| `accentSoft` | `#E1EEFF` | `#D6E0EE` | |
| `onAccent` | `#FFFFFF` | `#FFFFFF` | tidak berubah; ini teks, bukan bidang |
| `danger` | `#C62828` | `#B32222` | disetel ulang terhadap bidang yang lebih dalam |
| `heroGround` | `#0A1428` | `#0B1424` | ikut rona navy baru |
| `accentLift` | `#4C7FD6` | `#5B84C8` | aksen di atas bidang gelap hero |

### 4.1 Hasil pengukuran

Diukur dengan `src/lib/color.ts` milik repo sendiri, bukan kalkulator luar.

| Pemeriksaan | Ambang | Lama | Baru |
| --- | --- | --- | --- |
| `ink` / `surface` | ≥ 7 | 16,13 | 14,98 |
| `ink` / `surface2` | ≥ 7 | 17,07 | 17,01 |
| `inkMuted` / `surface` | ≥ 4,5 | 6,96 | 6,75 |
| `inkMuted` / `surface2` | ≥ 4,5 | 7,36 | 7,67 |
| `accent` / `surface` | ≥ 4,5 | 8,95 | 10,86 |
| `accent` / `accentSoft` | ≥ 4,5 | 8,06 | 9,50 |
| `onAccent` / `accent` | ≥ 4,5 | 9,47 | 12,66 |
| `onAccent` / `accentHover` | ≥ 4,5 | 10,55 | 14,70 |
| `onAccent` / `accentPress` | ≥ 4,5 | 13,25 | 17,05 |
| `ink` / `accent` | **< 4,5** | 1,80 | 1,38 |
| `line` / `surface` | ≥ 3 | 3,23 | 3,63 |
| `line` / `surface2` | ≥ 3 | 3,42 | 4,12 |
| `surface3` / `accent` | ≥ 4,5 | 6,64 | 7,96 |
| `danger` / `surface` | ≥ 4,5 | 5,31 | 5,68 |
| `danger` / `surface2` | ≥ 4,5 | 5,62 | 6,46 |
| `onAccent` / `danger` | ≥ 4,5 | 5,62 | 6,63 |
| `accentLift` / `heroGround` | ≥ 4,5 | 4,65 | 4,90 |
| `onAccent` / `heroGround` | ≥ 4,5 | 18,36 | 18,42 |
| arah `press` < `hover` < `accent` | wajib | lolos | lolos (0,0116 < 0,0214 < 0,0329) |

Tidak ada gerbang yang melemah kecuali dua yang tetap jauh di atas ambang
(`ink/surface` 16,13 → 14,98 dengan ambang 7; `inkMuted/surface` 6,96 → 6,75
dengan ambang 4,5). Sisanya menguat, sebagian besar karena navy yang lebih
gelap punya jarak lebih lebar ke bidang terang.

## 5. Resep wash dibongkar

Ini bagian yang tidak akan disembuhkan oleh pergantian token, dan karena itu
punya seksinya sendiri.

Tiga aturan struktural yang jadi kontrak:

1. **`accent-soft` hanya boleh muncul di satu ujung gradien linear**, tidak di
   dua-duanya. Sekarang ia ada di stop 0% dan 130%, jadi bidang menyala dari
   dua sudut.
2. **Radial sorot tidak boleh putih murni** dan opasitasnya diturunkan. Yang
   sekarang memakai `var(--color-surface-2)` solid pada stop 0%, yang setelah
   `surface-2` jadi `#FBFCFE` tetap terlalu terang sebagai sorot.
3. **Ujung yang tidak memakai `accent-soft` dibumikan** dengan campuran
   `surface-3`, bukan dibiarkan luruh ke `surface`. Ini yang memberi seksi
   pijakan di tepi bawah dan bikin selang-seling terbaca.

Nilai target (stop boleh disetel saat implementasi, tiga aturan di atas
tidak):

```css
.bg-surface-wash {
  background:
    radial-gradient(
      78% 88% at 88% -8%,
      color-mix(in srgb, var(--color-surface-2) 65%, transparent) 0%,
      transparent 56%
    ),
    linear-gradient(
      150deg,
      var(--color-accent-soft) 0%,
      var(--color-surface) 34%,
      var(--color-surface) 74%,
      color-mix(in srgb, var(--color-surface-3) 50%, var(--color-surface)) 100%
    );
}

.bg-surface-2-wash {
  background:
    radial-gradient(
      78% 88% at 10% -8%,
      color-mix(in srgb, var(--color-accent-soft) 70%, transparent) 0%,
      transparent 58%
    ),
    linear-gradient(
      150deg,
      var(--color-surface-2) 0%,
      var(--color-surface-2) 36%,
      var(--color-surface) 78%,
      color-mix(in srgb, var(--color-surface-3) 45%, var(--color-surface)) 100%
    );
}
```

`color-mix()` didukung di seluruh baseline browser yang ditarget Next.js 16 dan
tidak menambah custom property baru, jadi `tokens-parity.test.ts` tidak
terpengaruh — ia hanya membaca deklarasi `--color-*` di dalam blok `@theme`.

Pemakaian yang harus diverifikasi ulang setelah resep berubah (15 titik, 8
berkas): `since-1988.tsx:39`, `affiliates.tsx:14`, `day-cut.tsx:12`,
`certifications.tsx:52`, `cta-section.tsx:5`, `business-lines.tsx:86` dan
`:187`, `route-map.tsx:237` dan `:338`, `tentang-kami/page.tsx:37` dan `:51`,
`fleet-comparator.tsx:29`, `:45`, `:90`, `group-structure.tsx:17`.

## 6. Chrome navy

`site-header.tsx` berubah dari `bg-surface/85 backdrop-blur` menjadi
`bg-accent` **solid**.

**Kenapa solid, bukan `bg-accent/90 backdrop-blur`.** `contrast-tokens.spec.ts`
menelusuri latar efektif tiap elemen bertekstur dan membandingkannya dengan
nilai `accent` persis. `bg-accent/90` menghasilkan computed
`rgba(24, 49, 99, 0.9)`, yang tidak cocok dengan string itu, jadi seluruh
header akan **dilewati diam-diam** oleh pemeriksaan. Header transparan berarti
menukar sebuah penjaga aktif dengan efek visual. Solid mempertahankan
penjaganya.

Konsekuensi yang harus ikut dikerjakan:

- Tautan nav sekarang `text-ink-muted hover:text-ink`. Di atas navy itu
  melanggar `contrast-tokens.spec.ts` (ink di atas accent = 1,38:1). Ganti ke
  pola yang sudah dipakai footer: `text-surface-3` → `hover:text-on-accent`.
  Dua-duanya ada di allowlist e2e.
- Wordmark `COMPANY.shortName` mewarisi `ink`; jadikan `text-on-accent`.
- `border-b border-surface-3` di atas bidang navy jadi nyaris tak terlihat;
  ikuti pola footer `border-on-accent/20`.
- `mobile-menu.tsx:50` memakai `shadow-[0_6px_18px_rgba(22,65,148,0.08)]`.
  `22,65,148` adalah aksen **lama** (`#164194`). Perbarui ke aksen baru
  (`24,49,99`). Panel menu sendiri tetap terang — ia turun dari header navy
  seperti laci, dan itu memang pola ptdml.
- **Dua cacat turunan yang tidak dijaga tes mana pun.** `text-on-accent`
  dipasang di elemen `<header>`, dan warna teks diwariskan. `MobileMenu`
  dirender di dalam header itu tapi panelnya `bg-surface-2`, jadi tautannya
  akan jadi putih di atas bidang nyaris putih kalau tidak diberi `text-ink`
  eksplisit. `contrast-tokens.spec.ts` tidak bisa menangkapnya — latar efektif
  panel itu `surface-2`, bukan `accent`, jadi ia dibuang sebelum diperiksa.
  Terpisah tapi serumpun: `skip-link.tsx` memakai `focus:top-4 focus:z-50
  focus:bg-accent`, dan pita header setinggi 64/72px membuat pil fokus itu
  mendarat di dalamnya — navy di atas navy, 1:1, regresi WCAG 2.4.7. Pilnya
  dibalik jadi bidang terang bertulisan navy dengan cincin navy: 12,3:1 di
  atas header, dan cincin itu yang menggambar tepinya di atas bidang halaman
  terang yang cuma berbeda 1,1:1.
- `anchor-nav.tsx` memakai `text-accent` / `text-ink-muted`. Sudah diperiksa:
  ia hanya dirender di `tentang-kami/page.tsx:28`, di dalam `<main>`, tidak
  pernah di dalam header. Tidak terpengaruh.

Halaman dalam (`/kontak`, `/karier`, `/tentang-kami`) mulai dari bidang
terang, jadi header navy di sana langsung terbaca sebagai pita ptdml. Di
beranda ia bertemu hero gelap dan keduanya menyatu jadi satu blok chrome —
memperbaiki pita putih 85% yang sekarang melayang di atas foto hero.

**Page Theme Lock tetap utuh.** Halaman tetap satu tema terang. Pita navy atas
dan bawah plus panggung hero gelap dibaca sebagai *chrome*, bukan seksi yang
membalik tema. Tidak ada seksi isi yang berubah jadi gelap.

## 7. Setel ulang 3D dan peta

Prinsipnya: nilai yang memang bisa jadi token diangkat jadi token; nilai yang
secara natur bukan token (warna lampu, garis pantai geografis) tetap hex lokal
**dengan komentar yang menjelaskan kenapa**, mengikuti pola yang sudah ada di
`route-map.tsx:21`.

- **`three/stage.tsx`** — tujuh nilai: `#FFFFFF`, `#D8E6F5`, `#AFC4DB`,
  `#E5EDF6`, `#DCE7F2`, `#FFFFFF`, `#BFD4E8`, plus `ContactShadows`
  `color="#1E3352"`. Semuanya disetel terhadap bidang `#F5F9FD`. Arah setelan:
  turunkan ujung terangnya dan geser ke rona navy baru; warna bayangan kontak
  diselaraskan ke keluarga `accent` baru.
- **`three/materials.ts`** — lambung `#33475C`, `#22303F`, sub `#E3EBF5`.
  Diperdalam sedikit supaya kapal tidak melayang di atas bidang yang lebih
  gelap.
- **`route-map.tsx`** — `coast: #B6C6DC`, `portDim: #94A6C0`. Keduanya diam
  sementara laut (`accentSoft`) bergerak mendekat, jadi rasionya **turun**
  kalau dibiarkan. Terukur: `coast` 1,48 → 1,30 terhadap laut, `portDim` 2,11
  → 1,86. `coast` diturunkan ke `#A9BACF` (kembali ke 1,48). `portDim`
  membawa makna — ia berubah jadi `portLit` saat rute mencapainya, jadi WCAG
  1.4.11 menuntut 3:1 terhadap latar, dan nilai lamanya tidak pernah memenuhi
  itu bahkan di palet lama. Setiap nilai yang lolos 3:1 di atas laut baru
  ternyata segelap `TOKENS.line`, jadi `portDim` **jatuh ke token itu**
  (3,17:1) alih-alih memakai hex kembar. Satu warna keras hilang, satu cacat
  1.4.11 lama tertutup.
- Efek samping yang menguntungkan: `routeMitra` (= `TOKENS.line`) naik dari
  2,91 ke 3,17 terhadap laut, jadi ia lolos 1.4.11 tanpa perubahan apa pun.
  Dipasangi asersi supaya tidak hilang lagi.

Verifikasi bagian ini **visual, bukan numerik** — kecuali empat rasio peta di
atas, yang dikunci asersi di `route-map.test.tsx` dan menuntut `MAP` diekspor
(berkas itu sudah mengekspor `activeLegIndex` ke tes, jadi polanya ada).
Screenshot beranda sebelum dan sesudah, bandingkan.

## 8. Penjaga dan risiko

**Yang sudah ada dan harus tetap hijau:**

- `tokens.test.ts` — 9 pemeriksaan kontras, termasuk satu asersi **negatif**
  (`ink`/`accent` harus **di bawah** 4,5) dan dua asersi arah luminansi state.
- `tokens-parity.test.ts` — `tokens.ts` ≡ blok `@theme`, dua arah.
- `contrast-tokens.spec.ts` — 4 rute, allowlist teks di atas navy hanya
  `onAccent` dan `surface3`.
- `a11y-viewport.spec.ts`, `kontak.spec.ts`, dan sisanya lewat axe.

**Asersi baru yang wajib ditambahkan:**

```ts
it("surface3 sebagai teks di atas navy lolos AA", () => {
  expect(contrastRatio(TOKENS.surface3, TOKENS.accent)).toBeGreaterThanOrEqual(4.5);
});
```

Alasannya: `surface3` merangkap dua pekerjaan — garis rambut dekoratif *dan*
teks di atas bidang navy (footer, dan setelah plan ini juga header). Kombinasi
itu sekarang **hanya** dijaga oleh e2e. Artinya `bun run test` akan hijau
sementara `bun run test:e2e` merah, dan penyebabnya baru ketahuan di gerbang
paling lambat dan paling mahal.

**Risiko yang sudah diperiksa:**

| Risiko | Status |
| --- | --- |
| `line` jatuh di bawah 3:1 saat bidang diperdalam | Tidak terjadi. `#6E7C93` justru naik ke 3,63 / 4,12 karena bidang lebih gelap sementara `line` ikut turun lebih sedikit |
| Asersi negatif `ink`/`accent` pecah | Tidak. 1,38 — turun, makin aman |
| Dua langkah state di bawah navy yang sudah gelap kehabisan ruang | Tidak. 0,0116 < 0,0214 < 0,0329 |
| `surface3`/`accent` pecah tanpa peringatan unit test | Ditutup oleh asersi baru di atas |

**Aset turunan yang memanggang token dan wajib diregenerasi:**
`scripts/prepare-cert-placeholders.ts` menyuntik `TOKENS.surface2`,
`TOKENS.line`, `TOKENS.accent`, dan `TOKENS.inkMuted` ke dalam SVG placeholder
sertifikasi. Tanpa `bun run prepare:cert-placeholders`, badge sertifikasi tetap
membawa palet lama di atas halaman berpalet baru. Ini satu-satunya aset
turunan yang terikat token — `prepare-assets`, `prepare-map`, dan
`prepare-models` tidak menyentuh `tokens.ts`.

**Docblock adalah rasionale of record.** `tokens.ts` dan blok `@theme` di
`globals.css` sama-sama menyatakan paletnya diturunkan dari color scheme
pthis.id (Hasnur Internasional Shipping). Setelah plan ini pernyataan itu
salah. Memperbaruinya ke ptdml.com adalah task, bukan kosmetik — repo ini
memakai docblock sebagai tempat menyimpan alasan keputusan, dan komentar yang
berbohong lebih buruk daripada tidak ada komentar.

## 9. Bukan ruang lingkup

- Dark mode dan toggle tema. Pemilik repo eksplisit: tetap light mode.
- Tipografi, skala tipe, dan pasangan font.
- Layout, komposisi seksi, dan information architecture.
- Motion, GSAP, ScrollTrigger, dan animasi intro hero.
- Copy dan konten.
- Maroon ptdml sebagai aksen sekunder — lihat §2.
- Menambahkan token baru. Palet ini menukar nilai, tidak menambah anggota.
  Kalau saat implementasi terasa ada yang kurang, itu temuan untuk dibicarakan,
  bukan token yang diselundupkan.

## 10. Urutan fase yang disarankan

1. **Fase 1 — Token dan penjaga.** Tukar 13 nilai di `tokens.ts` dan `@theme`
   berbarengan, tambah asersi `surface3`/`accent`, perbarui docblock,
   regenerasi placeholder sertifikasi. Gerbang: `lint && typecheck && test &&
   build`.
2. **Fase 2 — Resep wash.** Bongkar dua class wash, verifikasi 15 titik pakai
   di 8 berkas. Gerbang: tambah `test:e2e`.
3. **Fase 3 — Chrome navy.** Header, wordmark, tautan nav, pembatas, bayangan
   mobile menu. Gerbang: `test:e2e` wajib hijau — di sinilah
   `contrast-tokens.spec.ts` paling mungkin menangkap sesuatu.
4. **Fase 4 — 3D dan peta.** `stage.tsx`, `materials.ts`, `route-map.tsx`.
   Verifikasi screenshot sebelum/sesudah. Gerbang: seluruh `bun run check`.

Fase 1 sengaja mendahului fase 2 dan 3 supaya kalau ada gerbang yang pecah,
penyebabnya jelas nilai token, bukan campuran nilai dan resep.
