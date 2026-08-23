# Plan 7: Palet warna dml-web — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menurunkan palet dml-web dari ptdml.com dan memperdalam bidang halaman satu tingkat penuh tanpa meninggalkan light mode, sehingga situs berhenti terbaca sebagai kertas putih tanpa mengorbankan satu pun gerbang kontras yang sudah berdiri.

**Architecture:** Empat fase berpagar, diurutkan supaya kegagalan gerbang selalu punya satu penyebab. Fase 1 menukar 13 nilai token dan memasang penjaga yang hilang. Fase 2 membongkar resep gradasi seksi, yang merupakan sumber "terlalu terang" yang tidak akan disembuhkan oleh pergantian token. Fase 3 mengubah header jadi pita navy penuh. Fase 4 menyetel ulang tiga berkas yang punya palet sendiri di luar sistem token: panggung 3D, material lambung, dan peta rute.

**Tech Stack:** Next.js 16.3 App Router, React 19.2, TypeScript 5, Tailwind v4, GSAP 3.13 + ScrollTrigger, three.js + React Three Fiber + drei, Payload CMS 3 (Postgres), Vitest 4 + Testing Library, Playwright 1.62, sharp, bun 1.3.14.

**Spec:** `docs/superpowers/specs/2026-08-23-dml-plan-7-palet-warna-design.md`

## Global Constraints

- **Package manager bun saja.** `bun install`, `bun run <script>`, `bun <file>`. Jangan pernah `npm install` atau `yarn` — `package.json` menetapkan `packageManager: bun@1.3.14`.
- **Semua perintah dijalankan dari `dml-web/`**, bukan dari root repo.
- **Bahasa.** Seluruh komentar kode, pesan commit, nama tes, dan teks yang tampil ke pengguna ditulis dalam bahasa Indonesia. Konvensi repo, konsisten di 36+ berkas tes yang sudah ada.
- **Tes unit hanya dikenali di `src/`.** `vitest.config.mts` menetapkan `include: ["src/**/*.test.{ts,tsx}"]`. Tes di `tests/` tidak akan pernah dijalankan `bun run test`; `tests/e2e/` khusus Playwright.
- **Alias impor:** `@/` menunjuk ke `src/`, `@payload-config` menunjuk ke `src/payload/payload.config.ts`.
- **Postgres wajib jalan untuk e2e.** `docker compose up -d` sebelum `bun run test:e2e`, tunggu healthcheck lolos.
- **Nilai warna hidup di dua tempat dan wajib identik:** `src/lib/tokens.ts` dan blok `@theme` di `src/app/globals.css`. `tokens-parity.test.ts` menolak ketidaksamaan di **kedua arah** — token tanpa custom property, dan custom property `--color-*` tanpa token. Setiap suntingan token menyentuh dua berkas atau tidak sama sekali.
- **Palet ini menukar nilai, tidak menambah anggota.** Tidak ada token baru di plan ini. Kalau saat implementasi terasa ada yang kurang, itu temuan untuk dilaporkan, bukan token yang diselundupkan.
- **`on-accent` tidak berubah.** Tetap `#FFFFFF`. Ia teks di atas navy, bukan bidang halaman.
- **Aturan seksi dipaku:** `ScrollTrigger` dengan `pin: true` hanya boleh pada panggung setinggi tepat viewport, tidak pernah pada `<section>` pembungkus. Plan ini tidak menambah atau memindahkan pin mana pun.
- **Kontrak LCP hero tidak boleh dilanggar.** Panel foto dan logo sertifikasi hanya dipasang setelah hidrasi (cabang `mounted`). `hero.test.tsx` menguncinya lewat `renderToStaticMarkup`.
- **Branch.** Bekerja di `denis`. Jangan membuat branch baru, jangan push, jangan menyentuh `main`, `bayu`, atau `origin/master`.
- **Gerbang per fase** disebut eksplisit di akhir tiap fase. `bun run doctor` tetap exit 1 dengan tepat satu temuan permanen yang sudah didokumentasikan sejak Plan 6: `effect-needs-cleanup` di `hero.tsx`. Itu bukan temuan plan ini.

---

## Peta Berkas

**Diubah:**

| Berkas | Tanggung jawab setelah plan ini |
| --- | --- |
| `src/lib/tokens.ts` | 13 nilai token baru + docblock yang menyebut ptdml.com sebagai sumber |
| `src/app/globals.css` | blok `@theme` cermin dari tokens.ts, plus dua class wash dengan resep baru |
| `src/lib/tokens.test.ts` | tambah satu asersi penjaga `surface3`/`accent` |
| `src/components/layout/site-header.tsx` | pita navy penuh, teks di atasnya memakai pasangan yang lolos AA |
| `src/components/layout/mobile-menu.tsx` | panel memasang warna teksnya sendiri, bayangan memakai aksen baru |
| `src/components/layout/skip-link.tsx` | pil fokus dibalik supaya tidak navy di atas pita navy |
| `src/features/home/route-map.tsx` | `MAP` diekspor untuk diuji; `coast` diperdalam; `portDim` jatuh ke token |
| `src/features/home/route-map.test.tsx` | tambah asersi kontras penanda peta |
| `src/features/home/three/stage.tsx` | delapan warna lampu dan bayangan disetel ke bidang yang lebih dalam |
| `src/features/home/three/materials.ts` | lambung, dek, dan grid sub disetel seirama |
| `public/assets/cert/*.png` | placeholder sertifikasi diregenerasi dari token baru |

**Tidak dibuat berkas baru.** Ini kalibrasi, bukan fitur.

---

## Fase 1 — Token dan penjaga

### Task 1: Penjaga `surface3` di atas navy

`surface3` merangkap dua pekerjaan: garis rambut dekoratif di bidang terang, **dan** teks di atas bidang navy (footer sejak Plan 5, header setelah Fase 3). Pekerjaan kedua sekarang hanya dijaga oleh `tests/e2e/contrast-tokens.spec.ts`. Artinya kombinasi yang pecah akan lolos `bun run test` dan baru ketahuan di gerbang paling lambat dan paling mahal.

Asersi ini **hijau sejak menit pertama** (6,64:1 dengan nilai lama). Itu memang tujuannya — ia dipasang sebelum nilai berubah supaya Task 2 punya jaring. Jangan mencari langkah merah di sini; tidak ada, dan memalsukannya lebih buruk daripada mengakuinya.

**Files:**
- Modify: `src/lib/tokens.test.ts` (sisipkan setelah blok `it("aksen sebagai teks di atas isian navy tipis tetap lolos AA", ...)`)

**Interfaces:**
- Consumes: `TOKENS` dan `contrastRatio` dari `src/lib/tokens.ts` dan `src/lib/color.ts` — sudah diimpor di berkas itu, tidak perlu impor baru.
- Produces: tidak ada; ini penjaga murni.

- [x] **Step 1: Tulis asersi penjaga**

```ts
  /*
   * surface3 mengerjakan dua hal sekaligus: garis rambut di bidang terang dan
   * teks di atas bidang navy (kaki halaman, dan sejak Plan 7 juga kepala
   * halaman). Sampai sekarang pekerjaan kedua cuma dijaga contrast-tokens.spec.ts,
   * jadi kombinasi yang pecah lolos `bun run test` dan baru ketahuan di
   * Playwright. Asersi ini memindahkan penjaganya ke gerbang yang lebih murah.
   */
  it("surface3 sebagai teks di atas navy lolos AA", () => {
    expect(contrastRatio(TOKENS.surface3, TOKENS.accent)).toBeGreaterThanOrEqual(4.5);
  });
```

- [x] **Step 2: Jalankan dan pastikan HIJAU**

Run: `bun run test src/lib/tokens.test.ts`
Expected: PASS. Nilai terukur 6,64. Kalau merah, ada yang sudah mengubah token sebelum plan ini dijalankan — berhenti dan laporkan.

- [x] **Step 3: Commit**

```bash
git add src/lib/tokens.test.ts
git commit -m "test: jaga kontras surface3 di atas navy dari gerbang unit"
```

---

### Task 2: Tukar 13 nilai token

Task ini punya langkah merah yang **sungguhan**: `tokens-parity.test.ts` akan gagal begitu `tokens.ts` disunting sendirian. Jalankan langkahnya berurutan; jangan menyunting dua berkas sekaligus, karena langkah merah itu yang membuktikan penjaga paritas hidup.

**Files:**
- Modify: `src/lib/tokens.ts`
- Modify: `src/app/globals.css:15-29` (blok `@theme`, bagian `--color-*` saja)

**Interfaces:**
- Consumes: penjaga dari Task 1.
- Produces: `TOKENS` dengan 13 nilai baru. Nama token **tidak berubah** — seluruh berkas lain (`materials.ts`, `route-map.tsx`, `prepare-cert-placeholders.ts`) tetap membaca `TOKENS.accent`, `TOKENS.surface3`, dan seterusnya tanpa perubahan impor.

- [x] **Step 1: Sunting `src/lib/tokens.ts` — nilai saja, jangan docblock dulu**

Ganti isi objek `TOKENS` menjadi persis ini. Komentar per-token dipertahankan di tempatnya **kecuali tiga yang jadi berbohong** — perbaiki ketiganya di step ini juga, dengan alasan yang sama yang dipakai Step 5 untuk dua docblock besar: komentar yang berbohong lebih buruk daripada tidak ada komentar.

| Komentar | Kenapa jadi salah | Ganti jadi |
| --- | --- | --- |
| `surface` — "Biru-putih, bukan putih murni, supaya kartu putih punya tempat berdiri." | kartunya tidak putih murni lagi | `/** Bidang halaman. Biru-abu, cukup dalam supaya kartu surface2 punya tempat berdiri tanpa harus jadi putih murni. */` |
| `surface2` — tidak berkomentar, tapi nilainya berhenti jadi `#FFFFFF` | — | tambahkan `/** Bidang terangkat: kartu, panel scrim, seksi selang-seling. Bukan putih murni; putih murni membunuh kedalaman dan tidak menyisakan ruang naik. */` |
| `line` — "...dan #CED9EA cuma mencapai 1,4:1 di atas putih" | `#CED9EA` tidak ada lagi di berkas ini, dan bidangnya bukan putih | ganti klausa itu jadi `...dan surface3 cuma mencapai 1,5:1 di atas bidang terangkat` |

Komentar `accentLift` menyebut "Navy #164194 nyaris tak terlihat di atas heroGround" — perbarui angkanya jadi `#183163`. Komentar `danger` menyebut palet oranye yang lama; itu catatan sejarah yang masih benar, biarkan.

Nilainya:

```ts
  surface: "#E9EEF5",
  surface2: "#FBFCFE",
  surface3: "#C3CEDE",
  line: "#6E7C93",
  ink: "#151A22",
  inkMuted: "#4C525C",
  accent: "#183163",
  accentHover: "#12274F",
  accentPress: "#0C1B39",
  accentSoft: "#D6E0EE",
  onAccent: "#FFFFFF",
  danger: "#B32222",
  heroGround: "#0B1424",
  accentLift: "#5B84C8",
```

- [x] **Step 2: Jalankan tes dan pastikan MERAH karena paritas**

Run: `bun run test src/lib/`
Expected: FAIL. `tokens-parity.test.ts` melaporkan `--color-surface berbeda dari TOKENS.surface` (dan 12 lainnya). `tokens.test.ts` sendiri **hijau** — seluruh rasio baru sudah diukur lolos. Kalau `tokens.test.ts` ikut merah, salah ketik salah satu hex; bandingkan huruf per huruf dengan daftar di Step 1.

- [x] **Step 3: Sunting blok `@theme` di `src/app/globals.css`**

Ganti empat belas baris `--color-*` menjadi persis ini. Perhatikan huruf kecil: pembaca paritas melakukan `.toLowerCase()` pada dua sisi, jadi kapitalisasi bebas, tapi konsistensi dengan gaya berkas yang sudah ada adalah huruf kecil.

```css
  --color-surface: #e9eef5;
  --color-surface-2: #fbfcfe;
  --color-surface-3: #c3cede;
  --color-line: #6e7c93;
  --color-ink: #151a22;
  --color-ink-muted: #4c525c;
  --color-accent: #183163;
  --color-accent-hover: #12274f;
  --color-accent-press: #0c1b39;
  --color-accent-soft: #d6e0ee;
  --color-on-accent: #ffffff;
  --color-danger: #b32222;
  --color-hero-ground: #0b1424;
  --color-accent-lift: #5b84c8;
```

- [x] **Step 4: Jalankan tes dan pastikan HIJAU**

Run: `bun run test src/lib/`
Expected: PASS, termasuk 10 asersi di `tokens.test.ts` (9 lama + 1 dari Task 1) dan 2 asersi paritas.

Yang paling perlu diperhatikan kalau ada yang merah:
- `"teks ink di atas permukaan aksen GAGAL, ini yang dilarang spec"` adalah asersi **negatif** — ia menuntut rasio **di bawah** 4,5. Nilai baru 1,38. Kalau ini merah, `accent` terlalu terang atau `ink` terlalu gelap.
- `"garis kontrol lolos 3:1"` adalah yang paling rawan saat bidang diperdalam. Nilai baru 3,63 dan 4,12.

- [x] **Step 5: Perbarui docblock di kedua berkas**

Docblock di repo ini adalah rasionale of record, bukan hiasan. Dua-duanya sekarang menyatakan paletnya diturunkan dari pthis.id (Hasnur Internasional Shipping); setelah Step 4 pernyataan itu salah.

Di `src/lib/tokens.ts`, ganti dua paragraf pertama docblock jadi:

```ts
/**
 * Palet "Navy Selat". Sumber kebenaran tunggal untuk warna.
 * Nilai di sini wajib identik dengan blok @theme di globals.css; kesamaannya
 * dijaga tokens-parity.test.ts, rasio kontrasnya dijaga tokens.test.ts.
 *
 * Sumber warnanya color scheme ptdml.com: navy #183163 (24 kemunculan di
 * custom.css tema mereka — tautan, header, tombol, judul seksi), putih kartu,
 * dan abu sekunder. Yang TIDAK ikut disalin ada tiga. Pertama, bidang halaman
 * ptdml netral (#F9F9F9) sementara di sini bidangnya tetap biru-abu, karena
 * identitas "biru maritim" sudah dibangun sejak Plan 4. Kedua, maroon
 * #b20102 di CSS mereka — markup sub-menu dan abs-link nol kemunculan di
 * halaman live dan histogram logo tidak memuat merah, jadi itu selektor tema
 * WordPress yang mati. Ketiga, arah state tombol: halaman ini terang, jadi
 * hover dan press turun ke navy yang lebih gelap supaya teks putih di atasnya
 * justru menguat, bukan melemah.
 */
```

Di `src/app/globals.css`, ganti docblock di atas blok `@theme` jadi:

```css
/*
 * Palet "Navy Selat". Diturunkan dari color scheme ptdml.com: navy #183163
 * sebagai warna utama, bidang halaman biru-abu #E9EEF5, dan teks hitam lembut
 * #151A22. Nilai di sini wajib identik dengan src/lib/tokens.ts — alasan
 * lengkap tiap keputusan ada di docblock berkas itu; kesamaannya dijaga
 * tokens-parity.test.ts dan kontrasnya dijaga tokens.test.ts.
 *
 * Halamannya terang, jadi arah state tombol ikut membalik: hover dan press
 * lebih GELAP dari aksen, bukan lebih terang. Di halaman gelap yang lama
 * arahnya kebalikan, dan menyalin arah lama ke sini akan membuat hover
 * kehilangan kontras terhadap teks putih di atasnya.
 */
```

- [x] **Step 6: Gerbang penuh**

Run: `bun run lint && bun run typecheck && bun run test && bun run build`
Expected: keempatnya hijau.

- [x] **Step 7: Commit**

```bash
git add src/lib/tokens.ts src/app/globals.css
git commit -m "style: palet diturunkan dari ptdml.com, bidang halaman diperdalam"
```

---

### Task 3: Regenerasi placeholder sertifikasi

`scripts/prepare-cert-placeholders.ts` menyuntik `TOKENS.surface2`, `TOKENS.line`, `TOKENS.accent`, dan `TOKENS.inkMuted` ke dalam SVG lalu me-render PNG ke `public/assets/cert/`. Hasilnya di-commit dan **bukan** langkah build, jadi tanpa task ini badge sertifikasi tetap membawa palet lama di atas halaman berpalet baru. Ini satu-satunya aset turunan yang terikat token — `prepare-assets`, `prepare-map`, dan `prepare-models` tidak menyentuh `tokens.ts`.

**Files:**
- Modify: `public/assets/cert/*.png` (dihasilkan script, tidak disunting tangan)

**Interfaces:**
- Consumes: `TOKENS` hasil Task 2.
- Produces: tidak ada antarmuka kode.

- [x] **Step 1: Jalankan script**

Run: `bun run prepare:cert-placeholders`
Expected: satu baris `<nama standar> -> /.../public/assets/cert/<berkas>.png` per badge di `CERT_BADGES`.

- [x] **Step 2: Pastikan berkas benar-benar berubah**

Run: `git status --short public/assets/cert/`
Expected: setiap PNG muncul sebagai `M`. Kalau tidak ada yang berubah, script membaca token lama — pastikan Task 2 sudah di-commit dan tidak ada cache build yang ikut campur.

- [x] **Step 3: Commit**

```bash
git add public/assets/cert/
git commit -m "chore: regenerasi placeholder sertifikasi dari palet baru"
```

**Gerbang Fase 1:** `bun run lint && bun run typecheck && bun run test && bun run build` hijau.

---

## Fase 2 — Resep gradasi seksi

### Task 4: Bongkar dua class wash

Ini bagian yang **tidak** disembuhkan oleh Fase 1. `.bg-surface-wash` dan `.bg-surface-2-wash` menaruh `accent-soft` pada stop 0% *dan* 130%, lalu menumpuk radial terang di atasnya. Bidang menyala dari dua sudut dan tidak ada tepi yang membumi. Fase 1 mengganti bahannya; task ini mengganti resepnya.

Tiga aturan struktural adalah kontraknya. Angka stop boleh disetel; tiga aturan ini tidak:

1. `accent-soft` hanya di **satu** ujung gradien linear.
2. Radial sorot **tidak** memakai warna solid pada stop 0% — ia dicampur ke transparan lewat `color-mix`.
3. Ujung yang tidak memakai `accent-soft` **dibumikan** dengan campuran `surface-3`, bukan dibiarkan luruh ke `surface`.

`color-mix()` tidak menambah custom property, jadi `tokens-parity.test.ts` tidak terpengaruh — pembacanya hanya memindai deklarasi `--color-*` di dalam blok `@theme`.

**Files:**
- Modify: `src/app/globals.css:65-90` (dua blok class wash, bukan blok `@theme`)

**Interfaces:**
- Consumes: `--color-surface`, `--color-surface-2`, `--color-surface-3`, `--color-accent-soft` hasil Task 2.
- Produces: dua nama class yang tidak berubah (`bg-surface-wash`, `bg-surface-2-wash`), jadi 15 titik pakai di 8 berkas tidak perlu disentuh.

- [x] **Step 1: Ganti kedua blok class**

Ganti dua blok `.bg-surface-wash` dan `.bg-surface-2-wash` beserta komentar di atasnya menjadi:

```css
/*
 * Latar section bergradasi, pengganti bg-surface/bg-surface-2 solid. Dua class
 * ini dipakai bergantian antar section (pola zebra-striping yang sudah ada)
 * supaya iramanya tetap jalan, tapi tiap bidang sendiri tidak lagi flat.
 *
 * Resepnya diganti di Plan 7, bukan cuma bahannya. Versi sebelumnya menaruh
 * accent-soft di stop 0% DAN 130% lalu menumpuk radial putih di atasnya, jadi
 * bidang menyala dari dua sudut sekaligus dan tidak punya tepi yang membumi.
 * Memperdalam token tidak menyembuhkan itu; yang menyembuhkan adalah tiga
 * aturan berikut, dan ketiganya kontrak, bukan selera:
 *
 *   1. accent-soft cuma boleh di SATU ujung gradien linear.
 *   2. Radial sorot tidak memakai warna solid di stop 0%.
 *   3. Ujung yang tidak memakai accent-soft dibumikan dengan campuran
 *      surface-3, tidak dibiarkan luruh ke surface.
 *
 * Angka stop di bawah boleh disetel; tiga aturan di atas tidak. Tidak ada
 * warna baru di sini — semuanya campuran dari token @theme.
 */
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

- [x] **Step 2: Verifikasi 15 titik pakai secara visual**

Nyalakan Postgres lalu dev server:

```bash
docker compose up -d
bun run dev
```

Buka dan periksa tiap seksi berikut. Yang dicari: seksi bersebelahan masih terbaca sebagai dua bidang berbeda (irama zebra jalan), dan tidak ada seksi yang menyala di dua sudut.

| Rute | Titik |
| --- | --- |
| `/` | `since-1988.tsx:39`, `affiliates.tsx:14`, `day-cut.tsx:12`, `certifications.tsx:52`, `cta-section.tsx:5`, `business-lines.tsx:86` dan `:187`, `route-map.tsx:237` dan `:338`, `fleet-comparator.tsx:29`, `:45`, `:90` |
| `/tentang-kami` | `page.tsx:37`, `page.tsx:51`, `group-structure.tsx:17` |

Kalau dua seksi bersebelahan jadi tidak terbedakan, yang disetel adalah stop `surface`/`surface-2` di tengah gradien linear, **bukan** menambahkan kembali `accent-soft` di ujung kedua.

- [x] **Step 3: Gerbang penuh termasuk e2e**

```bash
bun run lint && bun run typecheck && bun run test && bun run build
bun run test:e2e
```
Expected: semua hijau. `a11y-viewport.spec.ts` dan pemeriksaan axe di spec lain adalah yang paling mungkin bereaksi kalau ada teks yang jatuh ke bidang yang salah.

- [x] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "style: resep wash seksi tidak lagi menyala dari dua sudut"
```

**Gerbang Fase 2:** seluruh perintah di Step 3 hijau.

---

## Fase 3 — Chrome navy

### Task 5: Header jadi pita navy penuh

`hero.tsx:73` memakai `-mt-18`, jadi hero naik ke bawah header. Sekarang itu berarti pita `bg-surface/85 backdrop-blur` — nyaris putih 85% — melayang di atas foto hero gelap. Di ptdml.com posisi itu pita navy penuh, dan `site-footer.tsx` di repo ini sudah navy penuh sejak Plan 5. Task ini memasang pasangannya di atas.

**Solid, bukan `bg-accent/90`.** `contrast-tokens.spec.ts` menelusuri latar efektif tiap elemen dan membandingkannya dengan string RGB `accent` **persis**. `bg-accent/90` menghasilkan computed `rgba(24, 49, 99, 0.9)`, yang tidak cocok, jadi seluruh header akan dilewati diam-diam oleh pemeriksaan. Header transparan berarti menukar penjaga aktif dengan efek visual. Jangan.

Task ini punya langkah merah yang sungguhan lewat e2e.

**Akar dua cacat turunan, baca sebelum mulai.** `text-on-accent` dipasang di elemen `<header>` supaya wordmark dan ikon hamburger ikut putih. Tapi warna teks **diwariskan**, dan tidak semua keturunan header duduk di atas navy:

- `MobileMenu` dirender **di dalam** `<header>` (`site-header.tsx:41`), dan panelnya `bg-surface-2` — bidang terang. Tautan di dalamnya (`mobile-menu.tsx:60,68`) tidak punya warna sendiri, jadi mereka akan mewarisi putih dan hilang di atas panel nyaris putih. `contrast-tokens.spec.ts` **tidak bisa** menangkap ini: `collectOnAccent` hanya menyimpan elemen yang latar efektifnya sama dengan `accent`, dan panel itu berhenti di `surface-2`. Axe juga tidak, selama panel `hidden`.
- `SkipLink` bukan keturunan header, tapi kena tabrakan yang serumpun: ia `focus:fixed focus:top-4 focus:z-50 focus:bg-accent`. Header `sticky top-0` setinggi 64/72px, jadi pil fokus mendarat **di dalam** pita navy dan dicat di atasnya — aksen di atas aksen, 1:1. Ini regresi WCAG 2.4.7, bukan sesuatu yang cukup "diperiksa secara visual".

Dua-duanya ditutup di task ini sebagai langkah, bukan sebagai catatan. Kalau nanti ada elemen lain dipindahkan ke dalam `<header>`, pertanyaannya selalu sama: apakah ia benar-benar duduk di atas navy? Kalau tidak, ia butuh warna teksnya sendiri.

**Files:**
- Modify: `src/components/layout/site-header.tsx:9-11` dan `:25-38`
- Modify: `src/components/layout/mobile-menu.tsx:50`
- Modify: `src/components/layout/skip-link.tsx:5`

**Interfaces:**
- Consumes: token dari Task 2; pola teks-di-atas-navy yang sudah dipakai `site-footer.tsx:24,51,56`.
- Produces: tidak ada antarmuka kode baru. `SiteHeader` dan `MobileMenu` mempertahankan signature props-nya.

- [x] **Step 1: Ubah bidang header jadi navy, tautan nav SENGAJA belum disentuh**

Di `src/components/layout/site-header.tsx`, ganti baris `<header ...>`:

```tsx
    <header className="isolate sticky top-0 z-40 h-16 border-b border-on-accent/20 bg-accent md:h-[72px]">
```

Jangan sentuh apa pun yang lain di berkas ini pada step ini.

- [x] **Step 2: Jalankan e2e dan pastikan MERAH**

```bash
docker compose up -d
bun run test:e2e tests/e2e/contrast-tokens.spec.ts
```
Expected: FAIL pada tes `"tidak ada teks ink di atas latar aksen"`. Daftar pelanggaran memuat tautan nav dan wordmark, karena `text-ink-muted` dan `ink` warisan di atas navy cuma 1,38:1.

Ini bukti penjaganya hidup. Kalau justru hijau, `bg-accent` tidak benar-benar terpasang — periksa apakah kelas lama masih ada di baris yang sama.

- [x] **Step 3: Pindahkan teks header ke pasangan yang lolos AA**

Di `src/components/layout/site-header.tsx`:

Tambahkan `text-on-accent` pada `<header>` supaya wordmark dan ikon hamburger mewarisi putih, bukan `ink`:

```tsx
    <header className="isolate sticky top-0 z-40 h-16 border-b border-on-accent/20 bg-accent text-on-accent md:h-[72px]">
```

Ganti kelas dua tautan nav (satu di cabang `item.external`, satu di cabang `Link`) dari `text-sm text-ink-muted transition-colors hover:text-ink` menjadi:

```tsx
className="inline-flex items-center gap-1 text-sm text-surface-3 transition-colors hover:text-on-accent"
```

```tsx
className="text-sm text-surface-3 transition-colors hover:text-on-accent"
```

Yang pertama untuk `<ExternalLink>`, yang kedua untuk `<Link>` — perhatikan `inline-flex items-center gap-1` hanya ada di yang pertama, persis seperti sebelumnya.

Tambahkan komentar di atas `<header>`:

```tsx
    /*
     * Pita navy penuh, sepasang dengan kaki halaman. Solid, bukan bg-accent/90:
     * contrast-tokens.spec.ts membandingkan latar efektif dengan nilai accent
     * persis, dan varian beropasitas menghasilkan rgba(...) yang tidak cocok,
     * jadi seluruh header akan dilewati diam-diam oleh pemeriksaan itu.
     *
     * text-on-accent dipasang di elemen header, bukan per-anak, supaya wordmark
     * dan ikon hamburger ikut putih. Ikon bukan simpul teks, jadi e2e tidak
     * akan pernah menangkapnya kalau ia tertinggal mewarisi ink.
     *
     * Tautan nav memakai surface-3 dan menguat ke on-accent saat hover. Dua
     * warna itu, dan cuma dua itu, yang ada di allowlist e2e.
     */
```

- [x] **Step 4: Jalankan e2e dan pastikan HIJAU**

Run: `bun run test:e2e tests/e2e/contrast-tokens.spec.ts`
Expected: PASS kedua tes, termasuk `expect(checked).toBeGreaterThan(0)` yang membuktikan penelusuran latar benar-benar menemukan elemen.

- [x] **Step 5: Kembalikan warna teks panel mobile menu**

Tombol pemicu di `mobile-menu.tsx:35` memang **harus** mewarisi `text-on-accent` dari Step 3 — ia duduk di atas navy. Panelnya tidak, dan tanpa langkah ini seluruh nav mobile jadi putih di atas `#FBFCFE`.

Di `src/components/layout/mobile-menu.tsx:50`, tambahkan `text-ink` dan ganti `rgba(22,65,148,0.08)` — itu aksen **lama** (`#164194`) — ke aksen baru (`#183163` → `24,49,99`). Ganti juga komentar di atasnya yang menyebut pthis.id:

```tsx
        // Panel terang di atas bidang biru-abu, bukan bidang yang sama dengan
        // halaman. Kalau panelnya bg-surface ia menyatu dengan latar dan menu
        // terbaca seperti halaman yang tiba-tiba menumpuk teks. Sejak Plan 7
        // panel ini turun dari header navy, jadi ia dibaca sebagai laci — pola
        // yang sama dengan ptdml.com.
        //
        // text-ink WAJIB eksplisit di sini. Panel ini dirender di dalam
        // <header> yang memasang text-on-accent, dan warna teks diwariskan,
        // jadi tautan di bawah akan jadi putih di atas panel nyaris putih
        // kalau dibiarkan mewarisi. contrast-tokens.spec.ts tidak akan pernah
        // menangkapnya: latar efektif panel ini surface-2, bukan accent, jadi
        // collectOnAccent membuangnya sebelum sempat diperiksa.
        //
        // Bayangannya ditintakan ke aksen, bukan hitam murni, supaya tidak
        // terbaca sebagai lubang.
        className="fixed inset-x-0 top-16 border-b border-surface-3 bg-surface-2 px-4 pb-8 pt-4 text-ink shadow-[0_6px_18px_rgba(24,49,99,0.08)]"
```

- [x] **Step 6: Balik pil skip link supaya tidak navy di atas navy**

`skip-link.tsx` memakai `focus:top-4` dengan `focus:z-50`, sementara header `sticky top-0` setinggi 64/72px dan `z-40`. Pil fokus mendarat di dalam pita navy dan dicat di atasnya. Setelah Step 1, `focus:bg-accent` berarti navy di atas navy — 1:1, dan tautan lewati-navigasi lenyap total untuk pengguna keyboard.

Ganti baris `className` di `src/components/layout/skip-link.tsx` jadi:

```tsx
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface-2 focus:px-5 focus:py-2 focus:text-accent focus:ring-2 focus:ring-accent"
```

Tambahkan komentar di atas `<a>`:

```tsx
    /*
     * Pil dibalik sejak Plan 7: bidang terang, teks navy. Sebelumnya bg-accent,
     * dan begitu kepala halaman jadi pita navy pil itu jadi navy di atas navy —
     * top-4 dengan z-50 mendaratkannya persis di dalam pita setinggi 64/72px.
     *
     * Cincinnya bukan hiasan. Pil ini fixed dan halaman bergulir di bawahnya,
     * jadi ia harus terbaca di dua latar: di atas navy, bidang terangnya sendiri
     * yang membedakan (12,3:1); di atas bidang halaman terang, bedanya cuma
     * 1,1:1 dan yang menggambar tepinya semata-mata cincin navy itu.
     */
```

- [x] **Step 7: Verifikasi visual empat rute**

```bash
bun run dev
```

Periksa `/`, `/kontak`, `/karier`, `/tentang-kami`:
- Header navy solid, wordmark putih, tautan nav abu-terang yang memutih saat hover.
- Di `/`, pita navy bertemu hero gelap tanpa jahitan terang di antaranya.
- Di lebar mobile, ikon hamburger putih, panel menu turun sebagai bidang terang, dan **teks tautan di dalamnya gelap dan terbaca** — ini verifikasi untuk Step 5 dan tidak dijaga tes mana pun.
- Tekan Tab dari halaman baru dimuat: pil skip link muncul sebagai bidang terang bercincin navy di dalam pita header, bukan lenyap.
- `/tentang-kami` memakai `AnchorNav` di dalam `<main>` (`page.tsx:28`), bukan di dalam header, jadi `text-accent`/`text-ink-muted` di sana tetap berada di atas bidang terang dan tidak terpengaruh. Verifikasi sekilas saja.

- [x] **Step 8: Gerbang penuh**

```bash
bun run lint && bun run typecheck && bun run test && bun run build
bun run test:e2e
```
Expected: semua hijau. Selain `contrast-tokens.spec.ts`, perhatikan `a11y-viewport.spec.ts` dan `no-js.spec.ts`.

- [x] **Step 9: Commit**

```bash
git add src/components/layout/site-header.tsx src/components/layout/mobile-menu.tsx src/components/layout/skip-link.tsx
git commit -m "style: kepala halaman jadi pita navy, sepasang dengan kaki halaman"
```

**Gerbang Fase 3:** seluruh perintah di Step 8 hijau.

---

## Fase 4 — 3D dan peta

### Task 6: Peta rute

Dua nilai keras di `route-map.tsx`, dua-duanya harus bergerak.

`portDim: #94A6C0` menyimpan cacat yang sudah ada sejak sebelum plan ini: 2,11:1 di atas laut pada palet lama, di bawah ambang 3:1 yang dituntut WCAG 1.4.11 untuk objek grafis bermakna. Penanda pelabuhan yang belum aktif memang bermakna — ia berubah jadi `portLit` saat rute mencapainya. Setelah Fase 1 memperdalam laut, rasionya justru **turun ke 1,86:1**, karena laut bergerak mendekati `portDim` sementara `portDim` diam. Ini kalibrasi yang tidak boleh dibiarkan.

Nilai apa pun yang lolos 3:1 di atas laut baru ternyata segelap `TOKENS.line`. Daripada mengarang hex kembar, `portDim` **jatuh ke `TOKENS.line`**: 3,17:1 di atas laut. Satu warna keras hilang, satu cacat 1.4.11 tertutup.

`coast` tetap hex lokal dan alasannya masih berlaku: beda terang antara darat dan laut cuma 1,30:1, jadi yang menggambar bentuk pulau adalah goresannya, dan `surface3` terlalu pucat untuk pekerjaan itu. Tapi nilainya harus ikut turun — `#B6C6DC` di atas laut baru cuma 1,30:1, jatuh dari 1,48:1 di palet lama, karena laut mendekatinya. `#A9BACF` mengembalikannya ke 1,48:1.

**Files:**
- Modify: `src/features/home/route-map.tsx:16-36`
- Modify: `src/features/home/route-map.test.tsx`

**Interfaces:**
- Consumes: `TOKENS` hasil Task 2.
- Produces: `export const MAP` dari `src/features/home/route-map.tsx` — objek `as const` dengan kunci `sea`, `land`, `coast`, `routeDml`, `routeMitra`, `portOffice`, `portLit`, `portDim`, `labelLit`, `labelDim`, semuanya bertipe `string`. Berkas itu sudah mengekspor `activeLegIndex` ke tes, jadi ini mengikuti pola yang ada.

- [x] **Step 1: Ekspor `MAP` supaya bisa diuji**

Di `src/features/home/route-map.tsx`, ubah `const MAP = {` menjadi `export const MAP = {`. Tidak ada perubahan lain pada step ini.

- [x] **Step 2: Tulis asersi kontras yang gagal**

Di `src/features/home/route-map.test.tsx`, tambahkan dua impor **di blok impor paling atas berkas** (bukan di akhir — `MAP` datang dari modul yang sudah diimpor di baris 3, jadi cukup menambah namanya di situ):

```ts
import { RouteMap, activeLegIndex, MAP } from "./route-map";
import { contrastRatio } from "@/lib/color";
```

Lalu tambahkan blok describe baru di akhir berkas:

```ts
describe("kontras penanda peta", () => {
  /*
   * WCAG 1.4.11 menuntut 3:1 untuk objek grafis yang membawa makna. Penanda
   * pelabuhan yang belum dilewati rute membawa makna — ia berubah jadi portLit
   * saat rute sampai — jadi ia masuk cakupan aturan itu. Nilai lamanya
   * (#94A6C0) cuma 2,11:1 di palet lama dan tidak pernah ada yang menjaganya,
   * lalu turun lagi ke 1,86:1 begitu laut diperdalam di Plan 7: laut mendekat,
   * penandanya diam.
   */
  it("penanda pelabuhan redup terbaca di atas laut", () => {
    expect(contrastRatio(MAP.portDim, MAP.sea)).toBeGreaterThanOrEqual(3);
  });

  /*
   * Ambangnya 2,5, bukan 3, dan itu bukan kompromi yang dilonggarkan supaya
   * lolos. WCAG menuntut 3:1 terhadap LATAR, bukan antara dua state dari objek
   * yang sama; yang dijaga di sini cuma bahwa redup dan menyala tidak pernah
   * jatuh jadi satu warna. Nilai terukurnya 3,00 — persis di batas, jadi
   * menuliskan 3 di sini akan pecah karena pembulatan float, bukan karena
   * paletnya salah.
   */
  it("penanda redup dan penanda menyala tetap terbedakan", () => {
    expect(contrastRatio(MAP.portDim, MAP.portLit)).toBeGreaterThanOrEqual(2.5);
  });

  /*
   * Rute mitra memakai token line dan ini justru nyaris jatuh di bawah ambang
   * pada palet LAMA (2,91:1). Bidang laut yang lebih dalam mengangkatnya ke
   * 3,17:1. Asersi ini menahan supaya perbaikan gratis itu tidak hilang lagi.
   */
  it("rute mitra terbaca di atas laut", () => {
    expect(contrastRatio(MAP.routeMitra, MAP.sea)).toBeGreaterThanOrEqual(3);
  });

  /*
   * Garis pantai sengaja BUKAN token. Beda terang darat dan laut cuma 1,30:1,
   * jadi yang menggambar bentuk pulau adalah goresannya, dan surface3 terlalu
   * pucat untuk pekerjaan itu. Yang dijaga bukan keterbacaan teks melainkan
   * bahwa goresannya tidak pernah larut ke dalam salah satu bidang yang
   * dilaluinya. Ambangnya diambil dari nilai terukur palet lama supaya
   * pendalaman bidang tidak diam-diam menipiskan peta.
   */
  it("garis pantai tidak larut ke laut maupun darat", () => {
    expect(contrastRatio(MAP.coast, MAP.sea)).toBeGreaterThanOrEqual(1.4);
    expect(contrastRatio(MAP.coast, MAP.land)).toBeGreaterThanOrEqual(1.8);
  });
});
```

- [x] **Step 3: Jalankan dan pastikan MERAH**

Run: `bun run test src/features/home/route-map.test.tsx`
Expected: FAIL pada **dua** tes, dengan tiga asersi yang gagal:

| Tes | Terukur | Ambang |
| --- | --- | --- |
| `"penanda pelabuhan redup terbaca di atas laut"` | 1,86 | 3 |
| `"garis pantai tidak larut..."` — terhadap laut | 1,30 | 1,4 |
| `"garis pantai tidak larut..."` — terhadap darat | 1,69 | 1,8 |

Dua tes lainnya hijau: `"rute mitra"` pada 3,17 dan `"penanda redup dan menyala"` pada 5,11. Itu wajar — keduanya penjaga regresi, bukan pendorong perubahan.

Kalau `"rute mitra"` ikut merah, Task 2 belum selesai: `line` masih bernilai lama.

- [x] **Step 4: Perbaiki `MAP`**

Di `src/features/home/route-map.tsx`, ganti dua nilai dan perbarui paragraf terakhir docblock:

```ts
/**
 * Warna peta, dibaca sebagai peta dan bukan sebagai diagram. Laut memakai
 * isian navy paling tipis dan daratan memakai putih, arah yang sama dengan
 * peta cetak: bidang berwarna adalah air, bidang kosong adalah tanah.
 *
 * Garis pantai punya nilainya sendiri, #A9BACF, dan itu bukan token yang
 * malas dipilih. Beda terang antara darat dan laut cuma 1,3:1, jadi yang
 * benar-benar menggambar bentuk pulau adalah goresannya, bukan isiannya.
 * Token surface3 terlalu pucat untuk pekerjaan itu di atas laut.
 *
 * portDim sebaliknya JATUH ke token line di Plan 7. Nilai lamanya #94A6C0
 * cuma 2,11:1 di atas laut, di bawah 3:1 yang dituntut WCAG 1.4.11 untuk
 * objek grafis bermakna, dan penanda pelabuhan memang bermakna: ia berubah
 * jadi portLit begitu rute sampai. Setiap nilai yang lolos 3:1 di atas laut
 * ternyata segelap line, jadi hex kembar tidak ada gunanya.
 */
export const MAP = {
  sea: TOKENS.accentSoft,
  land: TOKENS.surface2,
  coast: "#A9BACF",
  routeDml: TOKENS.accent,
  routeMitra: TOKENS.line,
  portOffice: TOKENS.inkMuted,
  portLit: TOKENS.accent,
  portDim: TOKENS.line,
  labelLit: TOKENS.ink,
  labelDim: TOKENS.inkMuted,
} as const;
```

- [x] **Step 5: Jalankan dan pastikan HIJAU**

Run: `bun run test src/features/home/route-map.test.tsx`
Expected: PASS semua, termasuk tes komponen yang sudah ada di berkas itu.

- [x] **Step 6: Commit**

```bash
git add src/features/home/route-map.tsx src/features/home/route-map.test.tsx
git commit -m "fix: penanda pelabuhan redup lolos 3:1, palet peta ikut bidang baru"
```

---

### Task 7: Panggung 3D dan material lambung

Delapan nilai di `stage.tsx` dan tiga di `materials.ts` disetel terhadap bidang `#F5F9FD`. Bidang barunya `#E9EEF5` — lebih gelap dan sedikit lebih jenuh. Tanpa setel ulang, lambung akan terbaca terlalu terang dan bayangan kontaknya salah rona.

Verifikasi task ini **visual, bukan numerik**. Tidak ada ambang WCAG yang berlaku untuk warna lampu; yang menentukan adalah apakah kapal terbaca sebagai permukaan logam yang berdiri di halaman ini, bukan tempelan dari halaman lain.

**Files:**
- Modify: `src/features/home/three/stage.tsx:12-16` (docblock), `:22-24`, `:31`, `:39-41`, `:47`
- Modify: `src/features/home/three/materials.ts:15-25`, `:33`

**Interfaces:**
- Consumes: `TOKENS` hasil Task 2 (`materials.ts` sudah mengimpornya untuk `ACCENT_LINE_COLOR` dan `GRID_COLORS.main`).
- Produces: `HULL_MATERIAL`, `DECK_MATERIAL`, `ACCENT_LINE_COLOR`, `GRID_COLORS` — nama dan bentuk tidak berubah, hanya nilainya.

- [x] **Step 1: Setel warna panggung**

Di `src/features/home/three/stage.tsx`, ganti delapan nilai warna:

| Baris | Elemen | Lama | Baru |
| --- | --- | --- | --- |
| 22 | `Lightformer` kunci belakang | `#FFFFFF` | `#F7FAFD` |
| 23 | `Lightformer` kiri | `#D8E6F5` | `#C9D8EC` |
| 24 | `Lightformer` kanan | `#AFC4DB` | `#9FB2CB` |
| 31 | `Lightformer` pantulan lantai | `#E5EDF6` | `#DAE3EF` |
| 39 | `ambientLight` | `#DCE7F2` | `#CFDAE9` |
| 40 | `directionalLight` kunci | `#FFFFFF` | `#F7FAFD` |
| 41 | `directionalLight` isian | `#BFD4E8` | `#AEC2DA` |
| 47 | `ContactShadows` | `#1E3352` | `#16294B` |

Ganti paragraf kedua docblock berkas itu (baris 12-16) jadi:

```tsx
 * Susunannya tetap, warnanya yang pindah keluarga dua kali. Lampu hangat
 * #FFD9BC masuk akal di atas bidang hitam kehijauan yang lama; di atas bidang
 * biru-putih ia membuat lambung menguning. Sejak Plan 7 bidang halamannya
 * turun lagi satu tingkat (#F5F9FD jadi #E9EEF5), jadi ujung terang tiap lampu
 * ikut turun dan tidak ada lagi putih murni di sini: lampu yang lebih terang
 * dari lantainya sendiri membuat lambung terbaca seperti tempelan dari
 * halaman lain. Bayangan kontak ikut pindah ke keluarga navy yang baru.
```

- [x] **Step 2: Setel material lambung**

Di `src/features/home/three/materials.ts`, ganti tiga nilai:

```ts
export const HULL_MATERIAL = {
  color: "#2C3E52",
  metalness: 0.5,
  roughness: 0.45,
} as const;

export const DECK_MATERIAL = {
  color: "#1C2836",
  metalness: 0.3,
  roughness: 0.8,
} as const;
```

```ts
/** Garis grid lantai panggung: sumbu utama dan sumbu pembagi. */
export const GRID_COLORS = {
  main: TOKENS.surface3,
  sub: "#D9E2EF",
} as const;
```

`metalness` dan `roughness` **tidak** berubah. Angka-angka itu sudah disetel di Plan 4 untuk lingkungan terang dan bidang yang sedikit lebih dalam tidak mengubah perhitungannya. Kalau lambung terasa terlalu berkilau setelah Step 3, yang disetel adalah intensitas lampu, bukan `metalness` — mengubahnya akan membuat lima kelas di comparator terbaca sebagai lima keluarga berbeda.

Tambahkan satu paragraf di akhir docblock `materials.ts`:

```ts
 * Plan 7 menurunkan lambung dan dek satu tingkat lagi mengikuti bidang halaman
 * yang ikut turun, dan memindahkan grid sub dari #E3EBF5 ke #D9E2EF karena
 * nilai lama lebih terang daripada bidang yang sekarang menampungnya, jadi
 * garis pembagi terbaca sebagai sorot, bukan sebagai grid.
```

- [x] **Step 3: Verifikasi visual sebelum dan sesudah**

```bash
docker compose up -d
bun run dev
```

Buka `/` dan gulir ke seksi armada 3D serta comparator. Yang dicari:
- Lambung berdiri di halaman, tidak melayang dan tidak terbaca sebagai siluet.
- Bayangan kontak terbaca sebagai lantai, bukan lubang.
- Grid lantai panggung terbaca sebagai grid, bukan sorot.
- Lima kelas di comparator masih terbaca sebagai satu keluarga material.

Kalau salah satu meleset, setel **intensitas** lampu di `stage.tsx`, bukan `metalness` di `materials.ts`.

- [x] **Step 4: Gerbang penuh**

```bash
bun run lint && bun run typecheck && bun run test && bun run build
bun run test:e2e
bun run doctor
```
Expected: empat perintah pertama hijau. `bun run doctor` tetap exit 1 dengan **tepat satu** temuan: `effect-needs-cleanup` di `hero.tsx`, false-positive permanen yang sudah didokumentasikan sejak Plan 6. Temuan lain apa pun berasal dari plan ini dan harus ditutup.

- [x] **Step 5: Commit**

```bash
git add src/features/home/three/stage.tsx src/features/home/three/materials.ts
git commit -m "style: panggung 3D dan material lambung disetel ke bidang baru"
```

---

### Task 8: Sapuan akhir

**Files:**
- Tidak ada yang disunting kecuali temuan muncul.

**Interfaces:**
- Consumes: seluruh hasil Task 1-7.
- Produces: tidak ada.

- [x] **Step 1: Pastikan tidak ada nilai palet lama yang tertinggal**

```bash
grep -rn --include='*.tsx' --include='*.ts' --include='*.css' -iE '#164194|#F5F9FD|#CED9EA|#7A8CA8|#181C24|#515661|#E1EEFF|#C62828|#0A1428|#4C7FD6|22,65,148|#94A6C0|#B6C6DC|#E3EBF5|#33475C|#22303F|#1E3352|#D8E6F5|#AFC4DB|#E5EDF6|#DCE7F2|#BFD4E8' src/
```
Expected: nol baris.

Kalau ada hasil, itu titik yang terlewat — tutup dan ulangi. Satu pengecualian yang perlu diketahui walau tidak muncul di grep ini: `src/lib/color.test.ts` memakai `#FF5A1F` dan `#0A1418` sebagai fixture aritmetika kontras, bukan sebagai warna situs. Jangan pernah menyentuh fixture itu, termasuk kalau grep yang lebih longgar menemukannya.

- [x] **Step 2: Pastikan tidak ada docblock yang masih menyebut pthis.id**

```bash
grep -rn --include='*.tsx' --include='*.ts' --include='*.css' -i 'pthis' src/
```
Expected: nol baris. Tiga tempat menyebutnya sebelum plan ini: `tokens.ts`, `globals.css`, dan `mobile-menu.tsx:49`. Ketiganya sudah ditangani di Task 2 dan Task 5.

- [x] **Step 3: Gerbang lengkap**

```bash
docker compose up -d
bun run lint && bun run typecheck && bun run test && bun run build
bun run test:e2e
bun run doctor
bun run lighthouse
```
Expected: semua hijau kecuali `doctor` yang exit 1 dengan satu temuan permanen. `bun run lighthouse` diketahui labil di mesin ini (dicatat sejak Plan 4) — kalau ia gagal, jalankan ulang sekali; kalau tetap gagal, laporkan angkanya, jangan diamkan dan jangan pula menyetel ulang palet untuk mengejarnya.

- [x] **Step 4: Tandai plan selesai**

```bash
git add docs/superpowers/plans/2026-08-23-dml-plan-7-palet-warna.md
git commit -m "docs: tandai Plan 7 palet warna selesai dikerjakan"
```

**Gerbang Fase 4:** seluruh perintah di Task 8 Step 3 sesuai ekspektasi.

---

## Ringkasan nilai — rujukan cepat

| Token | Lama | Baru |
| --- | --- | --- |
| `surface` | `#F5F9FD` | `#E9EEF5` |
| `surface2` | `#FFFFFF` | `#FBFCFE` |
| `surface3` | `#CED9EA` | `#C3CEDE` |
| `line` | `#7A8CA8` | `#6E7C93` |
| `ink` | `#181C24` | `#151A22` |
| `inkMuted` | `#515661` | `#4C525C` |
| `accent` | `#164194` | `#183163` |
| `accentHover` | `#0E3A8A` | `#12274F` |
| `accentPress` | `#0A2C6B` | `#0C1B39` |
| `accentSoft` | `#E1EEFF` | `#D6E0EE` |
| `onAccent` | `#FFFFFF` | `#FFFFFF` |
| `danger` | `#C62828` | `#B32222` |
| `heroGround` | `#0A1428` | `#0B1424` |
| `accentLift` | `#4C7FD6` | `#5B84C8` |

Nilai keras di luar sistem token:

| Tempat | Lama | Baru |
| --- | --- | --- |
| `route-map.tsx` `coast` | `#B6C6DC` | `#A9BACF` |
| `route-map.tsx` `portDim` | `#94A6C0` | `TOKENS.line` |
| `stage.tsx` kunci belakang | `#FFFFFF` | `#F7FAFD` |
| `stage.tsx` kiri | `#D8E6F5` | `#C9D8EC` |
| `stage.tsx` kanan | `#AFC4DB` | `#9FB2CB` |
| `stage.tsx` pantulan lantai | `#E5EDF6` | `#DAE3EF` |
| `stage.tsx` ambient | `#DCE7F2` | `#CFDAE9` |
| `stage.tsx` directional kunci | `#FFFFFF` | `#F7FAFD` |
| `stage.tsx` directional isian | `#BFD4E8` | `#AEC2DA` |
| `stage.tsx` bayangan kontak | `#1E3352` | `#16294B` |
| `materials.ts` lambung | `#33475C` | `#2C3E52` |
| `materials.ts` dek | `#22303F` | `#1C2836` |
| `materials.ts` grid sub | `#E3EBF5` | `#D9E2EF` |
| `mobile-menu.tsx` bayangan | `rgba(22,65,148,0.08)` | `rgba(24,49,99,0.08)` |
