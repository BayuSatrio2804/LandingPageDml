# Plan 6: Stabilisasi current state dml-web — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membawa `bun run check` dari merah ke hijau dan menutup sebelas bug serta enam inkonsistensi sistem yang tertinggal setelah enam commit kolaborator pasca-Plan 5, sehingga plan penyelesaian project berikutnya berangkat dari dasar yang bersih.

**Architecture:** Tiga fase berpagar. Fase 1 memperbaiki cacat yang membuat gerbang merah, dengan pemecahan `hero.tsx` diletakkan paling akhir supaya refactor itu murni pemindahan tanpa perubahan perilaku. Fase 2 membuang aset, dependency, dan lockfile mati. Fase 3 memasang penjaga untuk kontrak yang selama ini cuma komentar, merender data yang tidak pernah tampil, lalu mengaudit sisanya.

**Tech Stack:** Next.js 16.3 App Router, React 19.2, TypeScript 5, Tailwind v4, GSAP 3.13 + ScrollTrigger, three.js + React Three Fiber, Payload CMS 3 (Postgres), Vitest 4 + Testing Library, Playwright 1.62, react-doctor 0.9, bun 1.3.14.

**Spec:** `docs/superpowers/specs/2026-08-23-dml-plan-6-stabilisasi-design.md`

## Global Constraints

- **Package manager bun saja.** Jalankan `bun install`, `bun run <script>`, `bun <file>`. Jangan pernah `npm install` atau `yarn` di repo ini — `package.json` menetapkan `packageManager: bun@1.3.14`.
- **Semua perintah dijalankan dari `dml-web/`**, bukan dari root repo.
- **Bahasa.** Seluruh komentar kode, pesan commit, nama tes, dan teks yang tampil ke pengguna ditulis dalam bahasa Indonesia. Ini konvensi repo, konsisten di 36 file tes yang sudah ada.
- **Tes unit hanya dikenali di `src/`.** `vitest.config.mts` menetapkan `include: ["src/**/*.test.{ts,tsx}"]`. Tes yang ditaruh di `tests/` tidak akan pernah dijalankan `bun run test`; `tests/e2e/` khusus Playwright.
- **Alias impor:** `@/` menunjuk ke `src/`, `@payload-config` menunjuk ke `src/payload/payload.config.ts`.
- **Postgres wajib jalan untuk e2e.** `docker compose up -d` sebelum `bun run test:e2e`, tunggu healthcheck lolos.
- **Kontrak LCP hero tidak boleh dilanggar.** Panel foto dan logo sertifikasi hanya dipasang setelah hidrasi (cabang `mounted`). `hero.test.tsx` menguncinya lewat `renderToStaticMarkup`. Kalau tes itu gagal, penyebabnya perubahanmu, bukan tesnya.
- **Aturan seksi dipaku:** `ScrollTrigger` dengan `pin: true` hanya boleh pada panggung setinggi tepat viewport, tidak pernah pada `<section>` pembungkus. Plan ini tidak menambah pin baru; jangan menambahkannya.
- **Nilai warna hidup di dua tempat dan wajib identik:** `src/lib/tokens.ts` dan blok `@theme` di `src/app/globals.css`. Sampai Task 15 tidak ada yang menjaga itu — setelah Task 15, ada.
- **Branch.** Bekerja di `denis`. Jangan membuat branch baru, jangan push, jangan menyentuh `main`, `bayu`, atau `origin/master`.
- **Gerbang per fase:** `bun run lint && bun run typecheck && bun run test && bun run build && bun run test:e2e` hijau. `bun run doctor` **tidak** dituntut exit-0 sampai akhir Fase 3, dan bahkan di akhir Fase 3 tetap exit 1 dengan tepat satu temuan permanen: `effect-needs-cleanup` di `hero.tsx:240` (Task 2 Step 3 — false-positive terdokumentasi pada pencocok pembersihan loop milik alat itu sendiri, ditemukan dan disetujui pemilik repo saat eksekusi plan). Tiap fase hanya wajib menutup temuan doctor miliknya dan tidak menambah temuan baru selain pengecualian itu.

---

## Struktur File

**Dibuat:**

| File | Tanggung jawab |
|---|---|
| `src/content/certifications.ts` | Daftar sertifikasi yang tampil di hero, diturunkan dari `COMPANY.standards`, plus path aset logonya. Sumber tunggal. |
| `src/content/certifications.test.ts` | Mengunci dua kontrak: daftar berasal dari lapisan data, dan setiap path aset benar-benar ada di `public/`. |
| `scripts/prepare-cert-placeholders.ts` | Membangkitkan tiga PNG placeholder lewat sharp. Sekali jalan, hasilnya di-commit. |
| `public/assets/cert/iso-9001.png` | Placeholder, ditukar aset klien nanti. |
| `public/assets/cert/ism-code.png` | Placeholder. |
| `public/assets/cert/hsse.png` | Placeholder. |
| `src/features/home/hero-doors.tsx` | Panel foto berbelahan diagonal, gradasi per sisi, jahitan. |
| `src/features/home/hero-copy.tsx` | Eyebrow, headline, subteks, kartu pintu, CTA, indikator gulir. |
| `src/features/home/use-hero-choreography.ts` | Seluruh GSAP hero: intro, scrub timeline, Ken Burns, parallax kursor, magnetic CTA. |
| `src/lib/tokens-parity.test.ts` | Membandingkan `TOKENS` dengan blok `@theme` di `globals.css`, nilai per nilai. |
| `src/features/inquiry/contact-form.test.tsx` | Mengunci bahwa kegagalan server action tampil sebagai pesan galat, bukan senyap. |
| `src/features/about/group-structure.tsx` | Seksi struktur grup Sinar Alam di halaman Tentang Kami. |
| `src/features/about/group-structure.test.tsx` | Mengunci setiap sektor dan penandaan DML tampil. |

**Diubah:**

| File | Perubahan |
|---|---|
| `src/features/home/hero.tsx` | Dari 464 baris jadi komposisi tipis; konsumsi `CERT_BADGES`; `<img>` jadi `next/image`; `will-change` dinamis; path media lewat manifest; warna lewat token. |
| `src/features/home/route-map.tsx:166` | `transition-all` jadi properti eksplisit. |
| `src/features/home/fleet-3d/fleet-canvas.tsx:265-267` | Konstruksi `THREE.Vector3` keluar dari jalur render. |
| `src/features/inquiry/actions.ts` | `payload.create` dibungkus try/catch. |
| `src/features/inquiry/contact-form.tsx` | `onSubmit` dibungkus try/catch. |
| `src/features/inquiry/schema.test.ts:44` | Hapus binding tak terpakai. |
| `tests/e2e/contrast-tokens.spec.ts:16` | Hapus parameter tak terpakai. |
| `src/lib/media/manifest.ts` | Hapus set `hero-malam` dan variannya di `MediaSetId`. |
| `src/lib/media/manifest.test.ts` | Hapus asersi "hero-malam punya 10 frame". |
| `scripts/prepare-assets.ts` | Hapus sepuluh entri `RAW_SOURCE` hero-malam. |
| `src/lib/tokens.ts` | Tambah dua token yang selama ini ditulis sebagai hex mentah di hero. |
| `src/app/globals.css` | Tambah dua token yang sama di blok `@theme`. |
| `src/features/home/day-cut.tsx:12` | `bg-surface-2` jadi `bg-surface-2-wash`. |
| `src/app/(site)/tentang-kami/page.tsx` | Pasang seksi struktur grup dan butir `AnchorNav`-nya. |
| `package.json` | Hapus `lottie-web`; tambah script `prepare:cert-placeholders`. |
| `.gitignore` (dml-web) | Tambah `package-lock.json`. |
| `README.md` | Prasyarat Postgres, bun-only, prosedur tukar logo cert. |

**Dihapus:**

`public/media/hero-malam/` (80 file), `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg`, `public/window.svg`, `package-lock.json`.

---

# FASE 1 — Merah jadi hijau

Gerbang fase: `lint`, `typecheck`, `test`, `build`, `test:e2e` hijau. Temuan doctor yang wajib bersih di ujung fase ini: `no-giant-component`, `no-permanent-will-change` ×2, `nextjs-no-img-element`, `no-transition-all`, `rerender-lazy-ref-init`, `three-no-object-construction-in-render`. Dua temuan `deslop/*` masih boleh tersisa, plus satu pengecualian terdokumentasi: `effect-needs-cleanup` di `hero.tsx:240` (lihat Task 2 Step 3).

---

### Task 1: Lapisan data sertifikasi, placeholder PNG, dan hero memakainya

Hero memuat array `CERTS` lokal yang menyebut HSSE, padahal `COMPANY.standards` (bersumber CP DML.pdf) tidak memuat HSSE sama sekali. Ketiga path PNG yang dirujuknya juga tidak pernah ada, jadi tiga gambar rusak tayang di setiap desktop. Task ini memindahkan daftarnya ke lapisan data, membangkitkan aset placeholder-nya, dan menyambungkan hero lewat `next/image`.

Digabung jadi satu task karena tidak bisa dipisah: memisahkannya menghasilkan satu task yang berakhir dengan tes merah dan tanpa deliverable yang bisa diverifikasi sendiri.

**Files:**
- Modify: `.gitignore` (yang di **root repo**, bukan yang di `dml-web/`)
- Create: `src/content/certifications.ts`
- Create: `src/content/certifications.test.ts`
- Modify: `src/content/types.ts`
- Create: `scripts/prepare-cert-placeholders.ts`
- Create: `public/assets/cert/iso-9001.png`, `public/assets/cert/ism-code.png`, `public/assets/cert/hsse.png`
- Modify: `package.json`
- Modify: `src/features/home/hero.tsx` (array `CERTS` sekitar baris 76-80, blok render `data-hero-certs` sekitar baris 356-372)

**Interfaces:**
- Consumes: `COMPANY.standards` dari `src/content/company.ts`, bertipe `StandardCluster[]` dengan `items: { name: string; source: SourceTag }[]`.
- Produces: `CERT_BADGES: CertBadge[]` dan `type CertBadge = { name: string; assetPath: string; alt: string; source: SourceTag }`. Task 15 dan README merujuknya. `SourceTag` bertambah satu varian, `"belum-terverifikasi"`.

- [ ] **Step 1: Lepaskan public/assets dari gitignore root**

Ini langkah pertama dan bukan detail administratif. `.gitignore` di root repo memuat pola `assets/` tanpa garis miring di depan, dan git mencocokkan pola seperti itu terhadap direktori bernama `assets` **di kedalaman mana pun** — termasuk `dml-web/public/assets/`. Tanpa langkah ini, ketiga PNG yang kamu bangkitkan nanti tidak akan pernah masuk repo.

Buktikan dulu:

```bash
mkdir -p dml-web/public/assets/cert && touch dml-web/public/assets/cert/probe.png
git check-ignore -v dml-web/public/assets/cert/probe.png
rm -rf dml-web/public/assets
```
Expected: satu baris yang menyebut `.gitignore:26:assets/`.

Perbaikannya adalah menjangkarkan polanya ke root, tempat ia memang selalu dimaksudkan berlaku. Di `.gitignore` root, ubah baris `assets/` menjadi `/assets/`. Komentar panjang di atasnya tentang CP DML.pdf dan arsip drone tetap dipertahankan — ia menjelaskan direktori root itu, dan penjelasannya masih benar.

**Jangan** menyelesaikan ini dengan `git add -f` nanti. Itu memasukkan berkasnya sekali sambil membiarkan polanya tetap salah, sehingga `git add -A` berikutnya diam-diam melewati direktori itu lagi — dan tesnya tetap hijau di mesinmu karena berkasnya ada di disk. Itu persis bentuk bug yang task ini dibuat untuk mencegahnya: path dirujuk, aset tidak ada di clone yang bersih.

**Jangan** pula mencoba `!dml-web/public/assets/` sebagai negasi. Git tidak bisa memasukkan kembali berkas yang direktori induknya sudah dikecualikan pola direktori.

Verifikasi:

```bash
mkdir -p dml-web/public/assets/cert && touch dml-web/public/assets/cert/probe.png
git check-ignore -v dml-web/public/assets/cert/probe.png || echo "tidak lagi diabaikan"
rm -rf dml-web/public/assets
```
Expected: `tidak lagi diabaikan`.

- [ ] **Step 2: Tambah varian SourceTag**

Di `src/content/types.ts`, ubah tipe `SourceTag`:

```ts
/**
 * Penanda asal setiap fakta. Company profile PDF (`assets/CP DML.pdf`, Canva,
 * 5 Agustus 2026) adalah sumber utama sejak Plan 5; sisa fakta yang masih
 * berasal dari riset publik Plan 1 ditandai berbeda supaya klien tahu persis
 * baris mana yang belum punya dasar dokumen resmi.
 *
 * "belum-terverifikasi" dipakai untuk fakta yang masuk ke situs lewat jalur
 * lain — misalnya ditulis langsung di komponen oleh kolaborator — dan belum
 * punya dasar di PDF maupun di riset Plan 1. Bedanya dengan "riset-publik":
 * riset-publik punya sumber yang bisa ditunjuk, ini tidak.
 */
export type SourceTag = "cp-pdf" | "riset-publik" | "belum-terverifikasi";
```

- [ ] **Step 3: Tulis tes yang gagal**

Buat `src/content/certifications.test.ts`:

```tsx
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CERT_BADGES } from "./certifications";
import { COMPANY } from "./company";

const PUBLIC_DIR = fileURLToPath(new URL("../../public/", import.meta.url));

describe("CERT_BADGES", () => {
  it("berisi tiga lencana", () => {
    expect(CERT_BADGES).toHaveLength(3);
  });

  /*
   * Ini kontrak inti task ini. Sebelum Plan 6, hero memuat array literal yang
   * menyebut HSSE, sementara COMPANY.standards tidak pernah memuatnya. Dua
   * daftar sertifikasi yang tidak saling tahu adalah cara paling mudah untuk
   * memasang klaim yang tidak didukung dokumen ke halaman depan.
   */
  it("setiap nama yang bersumber cp-pdf benar-benar ada di COMPANY.standards", () => {
    const known = COMPANY.standards.flatMap((cluster) => cluster.items.map((item) => item.name));
    for (const badge of CERT_BADGES) {
      if (badge.source !== "cp-pdf") continue;
      expect(known, `${badge.name} tidak ada di COMPANY.standards`).toContain(badge.name);
    }
  });

  /*
   * Bug yang memicu task ini: hero merujuk /assets/cert/iso-9001.png dan dua
   * saudaranya, dan public/assets/ tidak pernah ada. Tiga gambar rusak di
   * setiap desktop, dan tak satu pun tes menangkapnya karena elemennya cuma
   * dipasang setelah hidrasi. Tes ini yang menahannya kambuh — termasuk nanti
   * saat placeholder ditukar aset asli klien dan nama filenya berubah.
   */
  it("setiap path aset benar-benar ada di public/", () => {
    for (const badge of CERT_BADGES) {
      const absolute = `${PUBLIC_DIR}${badge.assetPath.replace(/^\//, "")}`;
      expect(existsSync(absolute), `aset hilang: ${badge.assetPath}`).toBe(true);
    }
  });

  it("setiap lencana punya alt text bahasa Indonesia non-kosong", () => {
    for (const badge of CERT_BADGES) {
      expect(badge.alt.trim().length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 4: Jalankan tes, pastikan gagal**

Run: `bun run test src/content/certifications.test.ts`
Expected: FAIL — modul `./certifications` tidak ditemukan.

- [ ] **Step 5: Tulis lapisan datanya**

Buat `src/content/certifications.ts`:

```ts
import type { SourceTag } from "./types";

export type CertBadge = {
  /** Wajib sama persis dengan entri di COMPANY.standards kalau source-nya cp-pdf. */
  name: string;
  /** Path relatif terhadap public/. Dijaga certifications.test.ts agar benar-benar ada. */
  assetPath: string;
  alt: string;
  source: SourceTag;
};

/**
 * Lencana sertifikasi yang tampil di hero. Sebelum Plan 6 daftar ini berupa
 * array literal di dalam hero.tsx, terpisah dari COMPANY.standards, dan salah
 * satu isinya (HSSE) tidak punya dasar di dokumen mana pun.
 *
 * HSSE dipertahankan tapi ditandai belum-terverifikasi, bukan dihapus.
 * Menghapusnya diam-diam membuang klaim yang mungkin benar untuk operator
 * tanker; menandainya membuat klien bisa mencoretnya tanpa menebak, mengikuti
 * konvensi `source` yang sudah dipakai COMPANY.standards.
 *
 * Berkas PNG di assetPath saat ini adalah placeholder yang dibangkitkan
 * scripts/prepare-cert-placeholders.ts. Prosedur menukarnya dengan logo resmi
 * klien ada di README.
 */
export const CERT_BADGES: CertBadge[] = [
  {
    name: "ISO 9001:2015",
    assetPath: "/assets/cert/iso-9001.png",
    alt: "Tersertifikasi ISO 9001:2015",
    source: "cp-pdf",
  },
  {
    name: "ISM Code",
    assetPath: "/assets/cert/ism-code.png",
    alt: "Menerapkan ISM Code",
    source: "cp-pdf",
  },
  {
    name: "HSSE",
    assetPath: "/assets/cert/hsse.png",
    alt: "Utamakan keselamatan dan kesehatan kerja",
    source: "belum-terverifikasi",
  },
];
```

- [ ] **Step 6: Jalankan tes lagi**

Run: `bun run test src/content/certifications.test.ts`
Expected: tiga PASS, satu FAIL — "setiap path aset benar-benar ada di public/". Itu benar: asetnya memang belum dibangkitkan. Jangan melemahkan tesnya, Step 7 dan 8 yang menghijaukannya.

- [ ] **Step 7: Tulis script pembangkit placeholder**

Buat `scripts/prepare-cert-placeholders.ts`:

```ts
#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import sharp from "sharp";
import { CERT_BADGES } from "../src/content/certifications";
import { TOKENS } from "../src/lib/tokens";

/**
 * Membangkitkan placeholder logo sertifikasi. Dijalankan sekali, hasilnya
 * di-commit; ini bukan langkah build. Begitu klien mengirim logo resmi,
 * timpa berkas PNG di public/assets/cert/ dengan nama yang sama dan script
 * ini tidak perlu dijalankan lagi.
 *
 * Placeholder mencantumkan nama standarnya sebagai teks supaya tidak terbaca
 * sebagai kotak kosong saat direview, dan memakai token palet supaya tidak
 * menabrak bidang navy hero.
 */
const OUT_DIR = new URL("../public/assets/cert/", import.meta.url).pathname;
const WIDTH = 240;
const HEIGHT = 160;

function placeholderSvg(label: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" rx="12" fill="${TOKENS.surface2}"/>
  <rect x="6" y="6" width="${WIDTH - 12}" height="${HEIGHT - 12}" rx="8" fill="none"
        stroke="${TOKENS.line}" stroke-width="2" stroke-dasharray="8 6"/>
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 - 4}" text-anchor="middle"
        font-family="sans-serif" font-size="24" font-weight="700" fill="${TOKENS.accent}">${label}</text>
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 26}" text-anchor="middle"
        font-family="sans-serif" font-size="13" fill="${TOKENS.inkMuted}">placeholder</text>
</svg>`;
}

await mkdir(OUT_DIR, { recursive: true });

for (const badge of CERT_BADGES) {
  const fileName = badge.assetPath.split("/").pop();
  if (!fileName) throw new Error(`assetPath tidak sah: ${badge.assetPath}`);
  const out = `${OUT_DIR}${fileName}`;
  await sharp(Buffer.from(placeholderSvg(badge.name))).png({ compressionLevel: 9 }).toFile(out);
  console.log(`${badge.name} -> ${out}`);
}
```

Formatnya PNG, bukan SVG, dan itu keputusan yang punya dua alasan keras. `next.config.ts` tidak menyetel `images.dangerouslyAllowSVG`, jadi `next/image` menolak `src` SVG dan Step 10 akan langsung bertabrakan dengan pilihan format ini. Dan aset asli dari klien hampir pasti raster, sehingga menyamakan format membuat penukaran nanti jadi menimpa berkas, bukan menyunting kode. Menaruh byte SVG di path `.png` bukan jalan tengah — content-type-nya jadi `image/png` dan gambarnya rusak, persis bug yang sedang diperbaiki.

Daftarkan di `package.json`, satu baris di blok `scripts` tepat setelah `"prepare-assets"`:

```json
"prepare:cert-placeholders": "bun scripts/prepare-cert-placeholders.ts",
```

- [ ] **Step 8: Jalankan script**

Run: `bun run prepare:cert-placeholders`
Expected: tiga baris output. `ls public/assets/cert/` memperlihatkan `iso-9001.png`, `ism-code.png`, `hsse.png`.

- [ ] **Step 9: Jalankan tes, sekarang harus hijau seluruhnya**

Run: `bun run test src/content/certifications.test.ts`
Expected: empat tes PASS.

- [ ] **Step 10: Sambungkan hero**

Di `src/features/home/hero.tsx`, hapus seluruh blok `const CERTS = [...]` (tiga entri) dan tambahkan impor di kepala file, di bawah impor `CtaLink`:

```tsx
import { CERT_BADGES } from "@/content/certifications";
```

Ganti blok render `data-hero-certs` — bagian `{mounted ? CERTS.map(...) : null}` — dengan:

```tsx
              {mounted
                ? CERT_BADGES.map((badge) => (
                    <Image
                      key={badge.assetPath}
                      src={badge.assetPath}
                      alt={badge.alt}
                      width={87}
                      height={58}
                      className="block h-14.5 w-auto"
                    />
                  ))
                : null}
```

`width`/`height` 87×58 mempertahankan rasio 3:2 aset pada tinggi 58 px yang sudah dipakai `h-14.5`, dan memberi `next/image` dimensi intrinsik sehingga tidak ada layout shift. Komentar di atas blok itu tentang kebutuhan ~58 px tetap dipertahankan apa adanya.

- [ ] **Step 11: Gerbang dan commit**

Run: `bun run lint && bun run typecheck && bun run test && bun run build`
Expected: lint 2 warning tersisa (bukan lagi 3 — warning `<img>` hilang), typecheck bersih, seluruh tes PASS, build lolos.

Verifikasi berkasnya benar-benar akan masuk repo sebelum commit:

```bash
git status --short public/assets/cert
```
Expected: tiga baris `??`. Kalau kosong, Step 1 belum berhasil — kembali ke sana, jangan pakai `-f`.

```bash
cd .. && git add .gitignore && cd dml-web
git add src/content/certifications.ts src/content/certifications.test.ts src/content/types.ts \
        scripts/prepare-cert-placeholders.ts public/assets/cert package.json \
        src/features/home/hero.tsx
git commit -m "fix: logo sertifikasi hero tidak lagi menunjuk berkas yang tidak ada"
```

---

### Task 2: Cleanup tween magnetic CTA

React-doctor melaporkan `effect-needs-cleanup` bertingkat error di `hero.tsx:245`. Pembacaan kode menunjukkan event listener-nya sudah dibersihkan dengan benar; yang tidak dibersihkan adalah tween `gsap.quickTo` yang dibuat per tombol. Perbaikannya nyata tapi lebih ringan dari label alatnya — dan sesudah diperbaiki, temuannya tetap tampil di doctor karena false-positive terpisah pada pencocok pembersihan loop milik alat itu sendiri (rinciannya di Step 3). Task ini tetap menutup bug nyatanya; ia tidak menutup baris di laporan doctor.

**Files:**
- Modify: `src/features/home/hero.tsx` (efek magnetic CTA, sekitar baris 244-273)

**Interfaces:**
- Consumes: `gsap` dari `@/lib/motion/gsap`.
- Produces: tidak ada API baru.

- [ ] **Step 1: Baca kodenya dulu**

Run: `sed -n '243,275p' src/features/home/hero.tsx`

Konfirmasi sendiri bahwa `btn.removeEventListener` sudah ada di `cleanups` dan yang hilang cuma `kill()` untuk `xTo`/`yTo`. Jangan memperbaiki apa yang sudah benar.

- [ ] **Step 2: Tambahkan kill tween ke cleanup**

Di dalam loop `for (const btn of ...)`, ubah blok `cleanups.push(...)` menjadi:

```tsx
      cleanups.push(() => {
        btn.removeEventListener("mousemove", move);
        btn.removeEventListener("mouseleave", out);
        // quickTo mengembalikan fungsi setter, tween-nya menempel di tombol.
        // Melepas listener saja menyisakan tween hidup yang masih memegang
        // referensi ke elemen setelah hero unmount.
        gsap.killTweensOf(btn);
      });
```

- [ ] **Step 3: Verifikasi doctor — temuan ini tetap ada, dan itu diterima**

Run: `bun run doctor 2>&1 | grep -A2 "effect-needs-cleanup" || echo "temuan hilang"`

Expected sebenarnya: **temuan tetap tampil** di `hero.tsx:240`, bukan hilang. Ini sudah dicoba tiga struktur berbeda saat plan ini dieksekusi — array closure (kode di atas), pasangan array paralel dengan `forEach`, dan pasangan array paralel dengan `for` biasa — dan ketiganya tetap terdeteksi.

Penyebabnya bukan tween yang belum dibersihkan (itu sudah beres di Step 2). Alat ini punya *asymmetry* yang didokumentasikan di https://react.doctor/docs/rules/react-doctor/effect-needs-cleanup: pencocok pembersihannya cuma andal mengenali `removeEventListener` sebagai pernyataan langsung di level teratas fungsi yang dikembalikan, dengan identifier handler yang sama persis dengan pendaftarannya — persis pola `mobile-menu.tsx:23-24` (satu listener, tanpa loop). Efek magnetic CTA ini mendaftar listener di dalam `for` atas `document.querySelectorAll(...)` karena jumlah tombolnya data-driven (dua elemen dari `DOORS.map()`), jadi pembersihannya tidak bisa dituliskan sebagai pernyataan datar tanpa loop — membongkar loop-nya bukan perbaikan, itu memaksakan struktur yang tidak dibutuhkan datanya.

**Jangan** menghabiskan waktu mencoba struktur keempat, kelima, dst. **Jangan** menambah `eslint-disable`/config-exception baru untuk mendiamkannya. Temuan ini didokumentasikan sebagai pengecualian gerbang Fase 1 (lihat baris gerbang fase di atas Task 1), diperlakukan sama seperti dua temuan `deslop/*` — dicatat dan dibiarkan, bukan disembunyikan.

- [ ] **Step 4: Jalankan gerbang**

Run: `bun run test && bun run build`
Expected: seluruh tes PASS, build lolos.

- [ ] **Step 5: Commit**

```bash
git add src/features/home/hero.tsx
git commit -m "fix: tween magnetic CTA hero ikut dibersihkan saat unmount"
```

---

### Task 3: will-change dipasang saat animasi, dilepas setelahnya

Dua elemen hero memakai utility `will-change-transform` permanen. `will-change` yang tidak pernah dilepas memaksa browser menahan layer komposit selamanya, dan react-doctor melaporkannya dua kali.

**Files:**
- Modify: `src/features/home/hero.tsx` (baris 278 `mediaRef`, baris 344 `contentRef`)

**Interfaces:**
- Consumes: `mediaRef`, `contentRef` yang sudah ada.
- Produces: tidak ada API baru.

- [ ] **Step 1: Hapus utility permanen**

Di JSX, hapus `will-change-transform` dari kedua `className`:

- Elemen `<div ref={mediaRef} className="absolute inset-0 will-change-transform">` jadi `<div ref={mediaRef} className="absolute inset-0">`.
- Elemen `<div ref={contentRef} className="... pb-13 will-change-transform min-[900px]:gap-6 ...">` — hapus token `will-change-transform` saja, sisa class-nya jangan disentuh.

- [ ] **Step 2: Pasang dan lepas dari sisi GSAP**

Di dalam `gsap.context`, tepat sebelum blok "Parallax kursor berlapis" yang membuat `mx`/`my`/`cx`/`cy`, tambahkan:

```tsx
      // will-change dipasang hanya selama parallax kursor hidup. Sebagai
      // utility permanen di className, ia memaksa browser menahan layer
      // komposit untuk kedua elemen sepanjang umur halaman, termasuk jauh
      // setelah hero tergulir keluar layar.
      const media = mediaRef.current;
      const content = contentRef.current;
      if (media && content) {
        gsap.set([media, content], { willChange: "transform" });
      }
```

Lalu hapus deklarasi `const media = mediaRef.current;` dan `const content = contentRef.current;` yang lama di bawahnya supaya tidak dideklarasikan dua kali, dan ubah cabang `if (media && content) { ... }` yang lama sehingga fungsi cleanup-nya juga melepas `will-change`:

```tsx
        stage.addEventListener("mousemove", onMove);
        return () => {
          stage.removeEventListener("mousemove", onMove);
          gsap.set([media, content], { willChange: "auto" });
        };
```

- [ ] **Step 3: Verifikasi doctor**

Run: `bun run doctor 2>&1 | grep "will-change" || echo "temuan hilang"`
Expected: `temuan hilang`.

- [ ] **Step 4: Verifikasi visual tidak berubah**

Run: `bun run test src/features/home/hero.test.tsx && bun run build`
Expected: PASS dan build lolos. Parallax kursor tidak diuji unit; kalau kamu punya akses browser, buka `/` dan gerakkan kursor di hero untuk memastikan panel masih bergeser.

- [ ] **Step 5: Commit**

```bash
git add src/features/home/hero.tsx
git commit -m "perf: will-change hero dipasang saat parallax aktif, bukan permanen"
```

---

### Task 4: transition-all di penanda pelabuhan diganti properti eksplisit

**Files:**
- Modify: `src/features/home/route-map.tsx:166`

**Interfaces:** tidak ada.

- [ ] **Step 1: Lihat apa yang sebenarnya berubah**

Run: `sed -n '160,180p' src/features/home/route-map.tsx`

Elemen `<circle>` mengubah `r` dan `fill` berdasarkan `office`/`lit`. Hanya dua properti itu yang perlu ditransisikan; `transition-all` juga mentransisikan setiap properti lain yang kebetulan berubah, termasuk yang dianimasikan GSAP.

- [ ] **Step 2: Ganti class**

Ubah `className="transition-all duration-300"` pada `<circle>` menjadi:

```tsx
              className="transition-[r,fill] duration-300"
```

- [ ] **Step 3: Verifikasi**

Run: `bun run doctor 2>&1 | grep "transition-all" || echo "temuan hilang"`
Expected: `temuan hilang`.

Run: `bun run test src/features/home/route-map.test.tsx && bun run build`
Expected: PASS, build lolos.

- [ ] **Step 4: Commit**

```bash
git add src/features/home/route-map.tsx
git commit -m "perf: transisi penanda pelabuhan hanya pada r dan fill"
```

---

### Task 5: Konstruksi THREE.Vector3 keluar dari jalur render

`useRef<THREE.Vector3[]>(FLEET_CLASSES.map((entry) => new THREE.Vector3(...)))` mengevaluasi argumennya setiap render meski React membuang hasilnya setelah render pertama. Untuk objek three.js itu berarti satu `Vector3` per kelas armada dibuat dan langsung disampah, setiap frame yang memicu render. React-doctor melaporkannya sebagai dua temuan (`rerender-lazy-ref-init` dan `three-no-object-construction-in-render`); keduanya cacat yang sama.

**Files:**
- Modify: `src/features/home/fleet-3d/fleet-canvas.tsx:263-269`

**Interfaces:**
- Consumes: `FLEET_CLASSES`, `THREE`.
- Produces: `sizesRef` tetap bertipe `React.RefObject<THREE.Vector3[]>` — pembacanya di `useFrame` tidak berubah.

- [ ] **Step 1: Baca pola yang sudah dipakai di file yang sama**

Run: `sed -n '258,276p' src/features/home/fleet-3d/fleet-canvas.tsx`

Perhatikan dua baris di bawahnya: `const offset = useMemo(() => new THREE.Vector3(), []);` dan `const framed = useMemo(() => new THREE.Vector3(), []);`. Pola itu sudah benar dan sudah ada di file ini. Ikuti, jangan mengarang pola ketiga.

- [ ] **Step 2: Ubah inisialisasinya**

Ganti blok `sizesRef` dengan:

```tsx
  // Cadangan sebelum pengukuran selesai: dimensi dari data kelas, dalam satuan
  // dunia yang sama dengan hull-geometry.ts (meter dibagi sepuluh).
  //
  // useMemo, bukan argumen useRef langsung: argumen useRef dievaluasi setiap
  // render walau hasilnya dibuang setelah render pertama, jadi bentuk lama
  // mengkonstruksi satu Vector3 per kelas armada di setiap render.
  const initialSizes = useMemo(
    () =>
      FLEET_CLASSES.map(
        (entry) =>
          new THREE.Vector3(entry.lengthMeters / 10, entry.beamMeters / 25, entry.beamMeters / 10),
      ),
    [],
  );
  const sizesRef = useRef<THREE.Vector3[]>(initialSizes);
```

- [ ] **Step 3: Verifikasi doctor**

Run: `bun run doctor 2>&1 | grep -E "rerender-lazy-ref-init|three-no-object-construction" || echo "kedua temuan hilang"`
Expected: `kedua temuan hilang`.

- [ ] **Step 4: Verifikasi perilaku 3D tidak berubah**

Run: `bun run test && bun run build`
Expected: seluruh tes PASS, build lolos.

Run: `bun run test:e2e tests/e2e/beranda.spec.ts`
Expected: PASS. Spec ini mengunci bahwa canvas 3D tidak dimuat saat reduced motion dan bahwa fallback blueprint SVG tampil di mobile — dua jalur yang paling mungkin patah kalau inisialisasi ref salah dipindah.

- [ ] **Step 5: Commit**

```bash
git add src/features/home/fleet-3d/fleet-canvas.tsx
git commit -m "perf: dimensi cadangan armada dibuat sekali, bukan tiap render"
```

---

### Task 6: Dua warning lint tersisa

**Files:**
- Modify: `src/features/inquiry/schema.test.ts:44`
- Modify: `tests/e2e/contrast-tokens.spec.ts:16`

**Interfaces:** tidak ada.

- [ ] **Step 1: Perbaiki binding honeypot yang tidak terpakai**

Di `src/features/inquiry/schema.test.ts`, ubah:

```ts
    const { website: _website, ...withoutHoneypot } = VALID;
```

menjadi bentuk yang tidak membuat binding sama sekali:

```ts
    const withoutHoneypot: Record<string, unknown> = { ...VALID };
    delete withoutHoneypot.website;
```

Anotasi `Record<string, unknown>` bukan hiasan: `delete` pada properti yang tidak opsional adalah error TypeScript, jadi tanpa index signature itu langkah ini lolos lint tapi menggagalkan `typecheck`. Jangan menyelesaikannya dengan `eslint-disable` — aturannya benar, kodenya yang bisa lebih sederhana.

- [ ] **Step 2: Hapus parameter yang dibayangi**

Di `tests/e2e/contrast-tokens.spec.ts`, `collectOnAccent(accent: string)` menerima parameter `accent` yang tidak pernah dipakai karena fungsi dalamnya membaca `accentColor` dari argumen `page.evaluate`. Ubah tanda tangannya:

```ts
function collectOnAccent() {
```

dan perbarui kedua pemanggilannya, di baris ~57 dan ~74:

```ts
    const onAccent = await page.evaluate(collectOnAccent(), { accent: ACCENT });
```

- [ ] **Step 3: Verifikasi**

Run: `bun run lint`
Expected: `✔ 0 problems` — tidak ada error maupun warning.

Run: `bun run test src/features/inquiry/schema.test.ts`
Expected: PASS.

Run: `bun run test:e2e tests/e2e/contrast-tokens.spec.ts`
Expected: dua tes PASS. (Postgres tidak diperlukan untuk spec ini, tapi `docker compose up -d` tidak merugikan.)

- [ ] **Step 4: Commit**

```bash
git add src/features/inquiry/schema.test.ts tests/e2e/contrast-tokens.spec.ts
git commit -m "chore: bersihkan dua binding tak terpakai di tes"
```

---

### Task 7: Kegagalan server action form kontak tampil ke pengguna

`contact-form.tsx` sudah punya jalur galat lengkap dengan `role="alert"`. Yang membuatnya tidak pernah tampil: `submitInquiry` melempar, bukan mengembalikan `{ ok: false }`, saat `getPayload` gagal menyambung ke Postgres. Promise `onSubmit` menolak, react-hook-form tidak menangkapnya, dan pengguna melihat tombol yang ditekan tanpa apa pun terjadi. Ini yang menggagalkan `kontak.spec.ts` dan ini juga berlaku di produksi saat database sedang tidak sehat.

**Files:**
- Modify: `src/features/inquiry/actions.ts`
- Modify: `src/features/inquiry/contact-form.tsx`
- Create: `src/features/inquiry/contact-form.test.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: `submitInquiry(input: unknown, source: string): Promise<{ ok: true } | { ok: false; error: string }>`.
- Produces: kontrak tanda tangan itu tidak berubah; yang berubah adalah janjinya — sekarang benar-benar tidak pernah melempar.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `src/features/inquiry/contact-form.test.tsx`:

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/*
 * submitInquiry di-mock supaya tes ini menguji satu hal saja: apa yang
 * dilihat pengguna ketika server action gagal. Sebelum Plan 6 jawabannya
 * "tidak ada apa-apa" — action melempar saat Postgres mati, promise onSubmit
 * menolak, react-hook-form tidak menangkapnya, dan tombol yang ditekan tidak
 * menghasilkan pesan apa pun. kontak.spec.ts menggagalkan itu lewat timeout,
 * yang terbaca seperti masalah lingkungan padahal cacat perilaku.
 */
const submitInquiry = vi.hoisted(() => vi.fn());
vi.mock("./actions", () => ({ submitInquiry }));

import { ContactForm } from "./contact-form";

async function isiFormYangSah(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Nama"), "Budi Santoso");
  await user.type(screen.getByLabelText("Nomor telepon"), "+6281234567890");
  await user.type(screen.getByLabelText("Email"), "budi@example.com");
  await user.type(screen.getByLabelText("Pesan"), "Saya ingin bertanya soal pengangkutan BBM.");
  await user.click(screen.getByRole("button", { name: /kirim pesan/i }));
}

describe("ContactForm saat server action gagal", () => {
  it("menampilkan pesan galat ketika action melempar", async () => {
    submitInquiry.mockRejectedValueOnce(new Error("cannot connect to Postgres"));
    const user = userEvent.setup();
    render(<ContactForm whatsappNumber="625116773845" />);

    await isiFormYangSah(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(/gagal|coba lagi/i);
  });

  it("menampilkan pesan galat ketika action mengembalikan ok:false", async () => {
    submitInquiry.mockResolvedValueOnce({ ok: false, error: "Terlalu banyak percobaan, coba lagi nanti." });
    const user = userEvent.setup();
    render(<ContactForm whatsappNumber="625116773845" />);

    await isiFormYangSah(user);

    expect(await screen.findByRole("alert")).toHaveTextContent("Terlalu banyak percobaan");
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan tes pertama gagal**

Run: `bun run test src/features/inquiry/contact-form.test.tsx`
Expected: tes kedua PASS (jalur `ok:false` memang sudah ada), tes pertama FAIL — tidak ada elemen `role="alert"` yang muncul.

- [ ] **Step 3: Bungkus penulisan Payload di server action**

Di `src/features/inquiry/actions.ts`, ganti blok `const payload = await getPayload(...)` sampai `return { ok: true };` dengan:

```ts
  // getPayload dan payload.create sama-sama melempar saat Postgres tidak bisa
  // dihubungi. Tanda tangan fungsi ini menjanjikan hasil, bukan lemparan; kalau
  // ia melempar, promise onSubmit di client menolak dan jalur galat form yang
  // sudah ada tidak pernah tercapai. Pengguna melihat tombol ditekan tanpa
  // apa pun terjadi.
  try {
    const payload = await getPayload({ config });
    await payload.create({
      collection: "inquiries",
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email,
        message: parsed.data.message,
        source,
      },
    });
  } catch (error) {
    console.error("gagal menyimpan inquiry", error);
    return { ok: false, error: "Pesan gagal terkirim. Coba lagi sebentar lagi." };
  }

  return { ok: true };
```

- [ ] **Step 4: Bungkus pemanggilan di client**

Di `src/features/inquiry/contact-form.tsx`, ganti `onSubmit` dengan:

```tsx
  const onSubmit = async (data: InquiryInput) => {
    setFormError(null);
    // Jaring pengaman kedua. actions.ts sudah menangkap kegagalan Payload,
    // tapi server action juga bisa gagal sebelum kodenya sempat jalan —
    // jaringan putus, deploy di tengah jalan, respons bukan-JSON. Tanpa
    // tangkapan di sini, kegagalan seperti itu tetap senyap.
    let result: Awaited<ReturnType<typeof submitInquiry>>;
    try {
      result = await submitInquiry(data, "kontak");
    } catch (error) {
      console.error("submitInquiry gagal", error);
      setFormError("Pesan gagal terkirim. Periksa koneksi lalu coba lagi.");
      return;
    }
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setSent(true);
    const message = `Halo, saya ${data.name}. ${data.message}`;
    window.location.assign(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`);
  };
```

- [ ] **Step 5: Jalankan tes**

Run: `bun run test src/features/inquiry/contact-form.test.tsx`
Expected: kedua tes PASS.

- [ ] **Step 6: Dokumentasikan prasyarat Postgres**

Di `README.md`, di bawah butir `bun run test:e2e` pada bagian "Perintah penting", ganti butir itu menjadi:

```markdown
- `bun run test:e2e`: Playwright. **Postgres harus berjalan lebih dulu**, kalau tidak
  `kontak.spec.ts` gagal dengan timeout yang terbaca seperti bug UI padahal server
  action-nya yang tidak bisa menyentuh database:
  ```bash
  docker compose up -d
  until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
  bun run test:e2e
  ```
  Build dan start dijalankan otomatis oleh `playwright.config.ts`, jadi tidak perlu
  menjalankannya sendiri.
```

- [ ] **Step 7: Jalankan e2e lengkap**

```bash
docker compose up -d
until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
bun run test:e2e
```
Expected: 24 dari 24 PASS.

- [ ] **Step 8: Commit**

```bash
git add src/features/inquiry/actions.ts src/features/inquiry/contact-form.tsx \
        src/features/inquiry/contact-form.test.tsx README.md
git commit -m "fix: kegagalan simpan inquiry tampil sebagai pesan, bukan senyap"
```

---

### Task 8: Pecah hero.tsx

464 baris dalam satu komponen. Task ini murni pemindahan: tidak ada perilaku yang berubah, tidak ada tes yang disunting. Kalau ada tes yang perlu diubah agar hijau, itu tanda pemindahannya salah, bukan tanda tesnya usang.

Diletakkan paling akhir di Fase 1 dengan sengaja — semua perubahan isi hero (Task 1, 2, 3) sudah mendarat, jadi yang tersisa benar-benar hanya memindahkan kode yang sudah final.

**Files:**
- Create: `src/features/home/hero-doors.tsx`
- Create: `src/features/home/hero-copy.tsx`
- Create: `src/features/home/use-hero-choreography.ts`
- Modify: `src/features/home/hero.tsx`

**Interfaces:**
- Produces:
  - `export const DOORS` pindah ke `hero-doors.tsx` dan diekspor dari sana; `hero-copy.tsx` dan `use-hero-choreography.ts` mengimpornya.
  - `export function HeroDoors({ mounted, kbRefs }: { mounted: boolean; kbRefs: React.RefObject<(HTMLDivElement | null)[]> })`
  - `export function HeroCopy({ mounted, contentRef, ruleRefs, countRefs }: { mounted: boolean; contentRef: React.RefObject<HTMLDivElement | null>; ruleRefs: React.RefObject<(HTMLSpanElement | null)[]>; countRefs: React.RefObject<(HTMLSpanElement | null)[]> })`
  - `export function useHeroChoreography(refs: HeroRefs): { mounted: boolean; reduced: boolean }` dengan `export type HeroRefs = { sectionRef, stageRef, mediaRef, contentRef, kbRefs, ruleRefs, countRefs }`. Hook ini yang memanggil `useMounted()` dan `usePrefersReducedMotion()`, lalu mengembalikan hasilnya ke `hero.tsx` — menghitungnya dua kali di dua tempat membuka peluang keduanya berbeda, dan `mounted` adalah bagian dari kontrak LCP.

- [ ] **Step 1: Catat baseline sebelum menyentuh apa pun**

```bash
bun run test src/features/home/hero.test.tsx
docker compose up -d
bun run test:e2e tests/e2e/hero.spec.ts tests/e2e/beranda.spec.ts tests/e2e/no-js.spec.ts
```
Expected: semuanya PASS. Catat jumlahnya. Angka yang sama harus muncul lagi di Step 6.

- [ ] **Step 2: Pindahkan panel foto**

Buat `src/features/home/hero-doors.tsx` berisi konstanta `DOORS` (dipindah apa adanya dari `hero.tsx`, termasuk komentarnya) dan komponen panel. Markup-nya disalin persis dari blok `<div ref={mediaRef} ...>` sampai jahitan `hero-seam`, tanpa satu class pun diubah:

```tsx
"use client";

import Image from "next/image";

export const DOORS = [
  {
    key: "bbm",
    label: "Transportasi BBM",
    value: 55,
    unit: "Tanker",
    desc: "Pengangkutan bahan bakar dan transfer ship-to-ship untuk klien korporat.",
    photo: "/media/lini-bisnis/operasi-sts-2400.webp",
    alt: "Transfer ship-to-ship antar tanker BBM",
  },
  {
    key: "roro",
    label: "Penyeberangan Ro-Ro",
    value: 9,
    unit: "Kapal",
    desc: "Penyeberangan untuk penumpang dan kendaraan, dengan tiket daring.",
    photo: "/media/lini-bisnis/penumpang-roro-2400.webp",
    alt: "Kapal penyeberangan ro-ro",
  },
] as const;

/**
 * Dua panel foto berbelahan diagonal plus garis jahitannya. Belahannya dibaca
 * dari custom property --hero-split lewat clip-path di globals.css; komponen ini
 * tidak pernah menulis nilai itu, use-hero-choreography yang menulisnya.
 *
 * Lihat KONTRAK LCP di hero.tsx: seluruh isi komponen ini hanya boleh dirender
 * ketika `mounted` true.
 */
export function HeroDoors({
  mounted,
  kbRefs,
}: {
  mounted: boolean;
  kbRefs: React.RefObject<(HTMLDivElement | null)[]>;
}) {
  return (
    <>
      {mounted
        ? DOORS.map((door, index) => (
            <div
              key={door.key}
              data-hero-panel
              className={`absolute inset-0 ${index === 0 ? "hero-panel-a" : "hero-panel-b"}`}
            >
              <div
                ref={(el) => {
                  kbRefs.current[index] = el;
                }}
                className="absolute -inset-y-[7%] -inset-x-[5%]"
              >
                <Image
                  src={door.photo}
                  alt={door.alt}
                  fill
                  sizes="100vw"
                  className={
                    index === 0
                      ? "object-cover brightness-60 contrast-125 saturate-60"
                      : "object-cover brightness-95 contrast-105 saturate-105"
                  }
                />
              </div>
              {/* Gradasi per sisi: BBM lebih dingin dan industrial, Ro-Ro
                  lebih terang. Tanpa ini belahannya cuma terbaca sebagai
                  garis, bukan sebagai dua lini bisnis. */}
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    index === 0
                      ? "linear-gradient(160deg,rgba(12,32,72,0.52) 0%,rgba(6,16,38,0.68) 100%)"
                      : "linear-gradient(200deg,rgba(96,138,190,0.16) 0%,rgba(10,22,48,0.42) 100%)",
                }}
              />
            </div>
          ))
        : null}
      <div aria-hidden="true" className="hero-seam absolute inset-0 bg-white/42" />
    </>
  );
}
```

- [ ] **Step 3: Verifikasi setelah langkah pertama saja**

Di `hero.tsx`, hapus konstanta `DOORS`, impor `DOORS` dan `HeroDoors` dari `./hero-doors`, dan ganti isi `<div ref={mediaRef} className="absolute inset-0">` dengan `<HeroDoors mounted={mounted} kbRefs={kbRefs} />`.

Run: `bun run typecheck && bun run test src/features/home/hero.test.tsx`
Expected: PASS. Memindahkan satu bagian lalu langsung memverifikasi lebih murah daripada memindahkan tiga bagian sekaligus lalu mencari mana yang patah.

- [ ] **Step 4: Pindahkan teks dan CTA**

Buat `src/features/home/hero-copy.tsx` dengan komponen `HeroCopy` berisi salinan persis dari blok `<div ref={contentRef} ...>` sampai penutupnya, ditambah blok `data-hero-scroll` di bawahnya. Impor `DOORS` dari `./hero-doors`, `CERT_BADGES` dari `@/content/certifications`, `CtaLink` dari `@/components/ui/cta-link`, dan `Image` dari `next/image`. Konstanta `CTA_BBM_HREF` beserta komentar `TODO(dml)`-nya ikut pindah ke sini.

`contentRef` tetap tinggal di `hero.tsx` dan diteruskan ke elemen terluar `HeroCopy` — koreografi memerlukannya. Tambahkan `contentRef` ke props:

```tsx
export function HeroCopy({
  mounted,
  contentRef,
  ruleRefs,
  countRefs,
}: {
  mounted: boolean;
  contentRef: React.RefObject<HTMLDivElement | null>;
  ruleRefs: React.RefObject<(HTMLSpanElement | null)[]>;
  countRefs: React.RefObject<(HTMLSpanElement | null)[]>;
}) {
```

Salin seluruh markup tanpa mengubah satu pun class, atribut `data-*`, atau teks. Atribut `data-hero-eyebrow`, `data-hero-h1`, `data-hero-sub`, `data-hero-door`, `data-hero-cta`, `data-hero-certs`, `data-hero-scroll`, dan `data-testid="hero-subteks"` adalah permukaan yang dipakai GSAP dan tes; satu saja hilang, sesuatu patah diam-diam.

- [ ] **Step 5: Pindahkan koreografi**

Buat `src/features/home/use-hero-choreography.ts`. Pindahkan kedua `useEffect` dari `hero.tsx` apa adanya, termasuk seluruh komentar, ke dalam satu hook:

```ts
"use client";

import { useEffect } from "react";
import { gsap, registerGsap } from "@/lib/motion/gsap";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { useMounted } from "@/lib/motion/use-mounted";
import { DOORS } from "./hero-doors";

export type HeroRefs = {
  sectionRef: React.RefObject<HTMLElement | null>;
  stageRef: React.RefObject<HTMLDivElement | null>;
  mediaRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  kbRefs: React.RefObject<(HTMLDivElement | null)[]>;
  ruleRefs: React.RefObject<(HTMLSpanElement | null)[]>;
  countRefs: React.RefObject<(HTMLSpanElement | null)[]>;
};

/**
 * Seluruh gerak hero. Dipisah dari markup karena keduanya berubah karena alasan
 * berbeda: markup berubah saat copy atau tata letak berubah, hook ini berubah
 * saat ritme scroll berubah.
 *
 * Mengembalikan `mounted` karena markup juga membutuhkannya untuk kontrak LCP,
 * dan menghitungnya dua kali di dua tempat membuka peluang keduanya berbeda.
 */
export function useHeroChoreography(refs: HeroRefs): { mounted: boolean; reduced: boolean } {
  const reduced = usePrefersReducedMotion();
  const mounted = useMounted();

  // <<< KEDUA useEffect DARI hero.tsx DISALIN PERSIS DI SINI >>>
  // Salinan verbatim, bukan tulisan ulang.

  return { mounted, reduced };
}
```

Isi hook ini adalah salinan verbatim dari kedua `useEffect` yang ada sekarang di `hero.tsx` — efek koreografi utama dan efek magnetic CTA — beserta seluruh komentarnya. Sebelum menyalin, jalankan `grep -n "useEffect" src/features/home/hero.tsx` untuk menemukan batas keduanya, karena nomor barisnya sudah bergeser akibat Task 1, 2, dan 3.

Transformasi mekanisnya tepat tujuh substitusi dan tidak lebih:

| Di `hero.tsx` | Di hook |
|---|---|
| `sectionRef` | `refs.sectionRef` |
| `stageRef` | `refs.stageRef` |
| `mediaRef` | `refs.mediaRef` |
| `contentRef` | `refs.contentRef` |
| `kbRefs` | `refs.kbRefs` |
| `ruleRefs` | `refs.ruleRefs` |
| `countRefs` | `refs.countRefs` |

Deklarasi `const reduced = usePrefersReducedMotion();` dan `const mounted = useMounted();` tidak ikut disalin — keduanya sudah ada di kepala hook. Jangan menulis ulang logikanya, jangan menyederhanakan, jangan mengubah satu pun nilai durasi, delay, atau easing. Kalau kamu tergoda memperbaiki sesuatu di sini, catat sebagai temuan dan lanjut — task ini adalah pemindahan, dan satu-satunya cara membuktikannya berhasil adalah seluruh tes lolos tanpa satu pun tes disunting.

**Efek samping lint yang tidak terhindarkan dari pemindahan ini:** begitu `sectionRef`, `stageRef`, dll. datang lewat parameter `refs: HeroRefs` alih-alih deklarasi `useRef()` langsung di scope komponen, `react-hooks/exhaustive-deps` tidak bisa lagi membuktikan stabilitasnya secara statis dan akan menandai efek koreografi utama sebagai kekurangan dependency — meski perilakunya identik (ref React stabil sepanjang umur komponen, hanya `.current`-nya yang berubah). Destrukturisasi `const { sectionRef, ... } = refs;` di kepala hook TIDAK menghilangkan peringatan ini (sudah diverifikasi) karena linter tetap kehilangan jejak provenance-nya. Memasukkan `refs` ke dependency array juga salah — `refs` sebagai objek pembungkus dibuat ulang tiap render di `Hero()`, jadi itu membuat efeknya jalan ulang tiap render, mengubah perilaku.

Satu-satunya penyelesaian yang benar: `// eslint-disable-next-line react-hooks/exhaustive-deps` tepat di atas baris `}, [reduced, mounted]);` milik efek koreografi utama, dengan komentar yang menjelaskan alasannya. Ini berbeda dari larangan `eslint-disable` di Task 6 — di sana aturannya benar dan kodenya yang salah; di sini aturannya secara struktural tidak bisa membuktikan sesuatu yang tetap benar, dan suppression untuk ref-di-deps adalah pola standar React, bukan jalan pintas.

- [ ] **Step 6: Rakit hero.tsx yang tipis**

`hero.tsx` sekarang tinggal: blok komentar kepala file (dipertahankan seluruhnya — ia mendokumentasikan kontrak LCP dan lima keputusan yang sengaja tidak diambil), tujuh `useRef`, satu panggilan `useHeroChoreography`, dan JSX yang merangkai `HeroDoors`, dua lapis gradasi overlay, dan `HeroCopy`. Target di bawah 90 baris.

- [ ] **Step 7: Verifikasi lengkap**

```bash
bun run lint && bun run typecheck && bun run test && bun run build
bun run doctor 2>&1 | grep "no-giant-component" || echo "temuan hilang"
bun run test:e2e
```
Expected: lint 0 problem, typecheck bersih, seluruh tes unit PASS tanpa satu pun file tes disunting, build lolos, `temuan hilang`, e2e 24 dari 24.

Kalau `no-giant-component` sekarang menunjuk `hero-copy.tsx` alih-alih hilang: itu mungkin, karena berkas itu menyerap eyebrow, headline, subteks, dua kartu pintu beserta CTA-nya, dan indikator gulir. Perbaikannya adalah mengekstrak satu kartu pintu jadi komponen sendiri di berkas yang sama — keduanya identik kecuali sisi dan isinya, jadi ekstraksinya lurus. Jangan menyelesaikannya dengan mengendurkan gerbang atau menambah pengecualian di config doctor.

- [ ] **Step 8: Commit**

```bash
git add src/features/home/hero.tsx src/features/home/hero-doors.tsx \
        src/features/home/hero-copy.tsx src/features/home/use-hero-choreography.ts
git commit -m "refactor: pecah hero jadi panel, teks, dan koreografi"
```

- [ ] **Step 9: Gerbang Fase 1**

```bash
bun run lint && bun run typecheck && bun run test && bun run build && bun run test:e2e
bun run doctor
```
Expected: lima gerbang pertama hijau. `doctor` masih exit 1 dengan tepat **tiga** temuan tersisa: dua `deslop/*` (`unused-dependency` dan `unused-export`) plus `effect-needs-cleanup` di `hero.tsx:240` (pengecualian terdokumentasi dari Task 2 Step 3). Kalau ada temuan keempat, ia diperkenalkan di fase ini dan harus diselesaikan sebelum lanjut.

---

# FASE 2 — Hygiene

Gerbang fase: sama seperti Fase 1, ditambah `deslop/unused-dependency` bersih. `deslop/unused-export` masih boleh tersisa sampai Task 18. `effect-needs-cleanup` di `hero.tsx:240` tetap jadi pengecualian permanen (Task 2 Step 3) — tidak hilang di fase mana pun.

---

### Task 9: Satu lockfile

Repo melacak `bun.lock` dan `package-lock.json` sekaligus, padahal `package.json` menetapkan `packageManager: bun@1.3.14`. Ada yang menjalankan `npm install`. Dua lockfile yang tidak saling tahu menghasilkan pohon dependency yang berbeda antar mesin, dan itu kelas bug yang paling mahal dilacak.

**Files:**
- Delete: `package-lock.json`
- Modify: `.gitignore`
- Modify: `README.md`

**Interfaces:** tidak ada.

- [ ] **Step 1: Hapus dari pelacakan git**

```bash
git rm --cached package-lock.json
rm package-lock.json
```

- [ ] **Step 2: Cegah kembali**

Di `.gitignore` (yang di `dml-web/`), di bawah blok `# dependencies`, tambahkan:

```
# Repo ini bun-only, lihat packageManager di package.json. package-lock.json
# yang ter-commit pernah membuat dua pohon dependency yang tidak saling tahu.
package-lock.json
yarn.lock
pnpm-lock.yaml
```

- [ ] **Step 3: Catat di README**

Di `README.md`, tepat di bawah judul `## Setup fresh clone`, sisipkan:

```markdown
> Repo ini memakai bun, dan hanya bun. `package.json` menetapkan
> `packageManager: bun@1.3.14`. Jangan menjalankan `npm install` atau `yarn`
> di sini — lockfile yang dihasilkannya diabaikan git dan menghasilkan pohon
> dependency yang berbeda dari yang dipakai anggota tim lain.
```

- [ ] **Step 4: Verifikasi install masih bersih**

Run: `bun install && bun run build`
Expected: install lolos, build lolos.

- [ ] **Step 5: Commit**

```bash
git add -A .gitignore README.md package-lock.json bun.lock
git commit -m "chore: satu lockfile, bun saja"
```

`bun.lock` ikut di-`git add` karena ia sudah dirty di working tree sejak sebelum plan ini dimulai; commit ini yang membersihkannya.

---

### Task 10: Hapus lottie-web

Nol rujukan di `src/`, `scripts/`, dan `tests/`.

**Files:**
- Modify: `package.json`

**Interfaces:** tidak ada.

- [ ] **Step 1: Buktikan dulu, jangan percaya alat**

Run: `grep -rn "lottie" src scripts tests || echo "nol rujukan"`
Expected: `nol rujukan`. Kalau ada hasil, hentikan task ini dan laporkan — react-doctor keliru dan dependency-nya dipakai.

- [ ] **Step 2: Hapus**

Run: `bun remove lottie-web`

- [ ] **Step 3: Verifikasi**

Run: `bun run typecheck && bun run build`
Expected: keduanya lolos.

Run: `bun run doctor 2>&1 | grep "unused-dependency" || echo "temuan hilang"`
Expected: `temuan hilang`.

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: hapus lottie-web yang tidak pernah dipakai"
```

---

### Task 11: Hapus aset hero-malam

Sepuluh frame dalam empat lebar dan dua format, 80 berkas, 4,6 MB. Tidak dikonsumsi komponen mana pun sejak hero ditulis ulang. Empat hal jatuh bersamaan: berkasnya, entri manifest, varian tipe, dan pemetaan `RAW_SOURCE` di pipeline. Menghapus salah satu tanpa yang lain meninggalkan pipeline yang merujuk manifest yang sudah tidak ada.

**Files:**
- Delete: `public/media/hero-malam/` (80 berkas)
- Modify: `src/lib/media/manifest.ts`
- Modify: `src/lib/media/manifest.test.ts`
- Modify: `scripts/prepare-assets.ts`

**Interfaces:**
- Produces: `MediaSetId` menyusut jadi `"hari" | "lini-bisnis"`.

- [ ] **Step 1: Buktikan tidak ada konsumen**

Run: `grep -rn "hero-malam" src tests | grep -v "manifest"`
Expected: kosong. Kalau ada hasil, hentikan dan laporkan.

- [ ] **Step 2: Buktikan sumber mentahnya masih ada sebelum menghapus**

Run: `ls ../assets/_raw/sts-sri-yuliani/ | grep -c "DJI_08[12][0-9]"`
Expected: angka ≥ 10. Ini yang membuat penghapusan bisa dibatalkan: `scripts/prepare-assets.ts` memetakan kesepuluh frame ke berkas itu, jadi mengembalikannya cukup dengan memulihkan entri manifest lalu menjalankan `bun run prepare-assets`. Kalau angkanya di bawah 10, **hentikan task ini** dan laporkan — penghapusannya jadi permanen.

- [ ] **Step 3: Turunkan tes lebih dulu**

Di `src/lib/media/manifest.test.ts`, hapus seluruh blok tes ini:

```ts
  it("hero-malam punya 10 frame", () => {
    expect(MEDIA["hero-malam"]).toHaveLength(10);
  });
```

Ganti dengan asersi yang menjaga sesuatu yang masih hidup:

```ts
  it("setiap set punya minimal satu frame", () => {
    for (const [id, set] of Object.entries(MEDIA)) {
      expect(set.length, `set ${id} kosong`).toBeGreaterThan(0);
    }
  });
```

- [ ] **Step 4: Hapus dari manifest**

Di `src/lib/media/manifest.ts`, ubah tipe:

```ts
export type MediaSetId = "hari" | "lini-bisnis";
```

dan hapus seluruh properti `"hero-malam": [ ... ]` (sepuluh baris entri) dari objek `MEDIA`.

- [ ] **Step 5: Hapus dari pipeline**

Di `scripts/prepare-assets.ts`, hapus kesepuluh baris `"/media/hero-malam/dji-08xx": "sts-sri-yuliani/DJI_08xx.JPG"` dari `RAW_SOURCE`. Tambahkan komentar di atas objek itu:

```ts
/**
 * Peta manual dari basePath manifest ke lokasi file mentah hasil unzip.
 * Diisi tangan karena kurasi frame adalah keputusan manusia, bukan
 * sesuatu yang bisa ditebak dari nama arsip.
 *
 * Set hero-malam (DJI_0811-0820) dihapus di Plan 6 bersama hero lama. Berkas
 * mentahnya masih ada di assets/_raw/sts-sri-yuliani/; kalau set itu
 * dibutuhkan lagi, kembalikan entrinya di sini dan di MEDIA lalu jalankan
 * bun run prepare-assets.
 */
```

- [ ] **Step 6: Hapus berkasnya**

Run: `git rm -r public/media/hero-malam`

- [ ] **Step 7: Verifikasi**

Run: `bun run typecheck && bun run test && bun run build`
Expected: typecheck bersih (kalau ada error, ada konsumen yang lolos dari Step 1 — pulihkan dan laporkan), seluruh tes PASS, build lolos.

Run: `du -sh public/media`
Expected: sekitar 3 MB, turun dari 7,6 MB.

- [ ] **Step 8: Commit**

```bash
git add public/media src/lib/media/manifest.ts src/lib/media/manifest.test.ts scripts/prepare-assets.ts
git commit -m "chore: hapus set hero-malam yang tidak lagi dipakai siapa pun"
```

---

### Task 12: Hapus boilerplate Next.js

**Files:**
- Delete: `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg`, `public/window.svg`

**Interfaces:** tidak ada.

- [ ] **Step 1: Buktikan tidak dirujuk**

Run: `grep -rn "next.svg\|vercel.svg\|file.svg\|globe.svg\|window.svg" src tests || echo "nol rujukan"`
Expected: `nol rujukan`.

- [ ] **Step 2: Hapus**

```bash
git rm public/next.svg public/vercel.svg public/file.svg public/globe.svg public/window.svg
```

- [ ] **Step 3: Verifikasi**

Run: `bun run build`
Expected: lolos.

- [ ] **Step 4: Commit**

```bash
git commit -m "chore: hapus lima SVG boilerplate create-next-app"
```

---

### Task 13: README yang akurat

**Files:**
- Modify: `README.md`

**Interfaces:** tidak ada.

- [ ] **Step 1: Perbarui bagian Struktur**

Bagian `## Struktur` sekarang menyebut "seksi beranda menyusul", yang sudah lama tidak benar. Ganti seluruh bagian itu dengan:

```markdown
## Struktur

- `src/app/(site)/`: halaman publik — beranda, kontak, karier, tentang kami.
- `src/app/(payload)/`: admin panel Payload di `/admin`.
- `src/payload/`: config dan collection Payload.
- `src/features/home/`: seksi beranda, satu file per seksi.
- `src/features/inquiry/`: form kontak, skema validasi, server action, rate limiter.
- `src/features/route-map/`, `src/features/fleet/`: data dan komponen peta rute serta armada.
- `src/content/`: data korporat hardcoded. Setiap angka wajib menyebut sumbernya di
  komentar; `SourceTag` membedakan `cp-pdf`, `riset-publik`, dan `belum-terverifikasi`.
- `src/lib/`: token warna, manifest media, util motion, SEO.
- `scripts/`: pipeline aset sekali-jalan (foto, peta, model 3D, placeholder sertifikasi).
```

- [ ] **Step 2: Tambahkan prosedur tukar logo sertifikasi**

Di akhir README, tambahkan bagian baru:

```markdown
## Menukar placeholder sertifikasi dengan logo resmi

Tiga berkas di `public/assets/cert/` saat ini adalah placeholder yang dibangkitkan
`bun run prepare:cert-placeholders`, bukan logo resmi. Begitu klien mengirim asetnya:

1. Timpa `iso-9001.png`, `ism-code.png`, dan `hsse.png` dengan berkas asli. Kalau nama
   berkasnya berbeda, perbarui `assetPath` di `src/content/certifications.ts` — jangan
   menyunting `hero.tsx`, daftar itu tidak lagi tinggal di sana.
2. Sesuaikan `width`/`height` di `hero-copy.tsx` kalau rasio aset asli bukan 3:2.
3. Jalankan `bun run test src/content/certifications.test.ts`. Tes itu menggagalkan build
   kalau ada `assetPath` yang menunjuk berkas yang tidak ada — bug persis itu yang membuat
   tiga gambar rusak tayang di produksi sebelum Plan 6.
4. HSSE masih bertanda `belum-terverifikasi` di `certifications.ts`. Kalau klien
   mengonfirmasi statusnya, ubah `source`-nya jadi `cp-pdf` dan tambahkan entrinya ke
   `COMPANY.standards`; kalau klien mencoretnya, hapus entrinya dari `CERT_BADGES`.
```

- [ ] **Step 3: Verifikasi klaim README satu per satu**

Baca ulang seluruh README dan jalankan setiap perintah yang disebutkannya di mesin bersih-ish. Setiap klaim yang tidak kamu jalankan sendiri, hapus atau tandai. README yang salah lebih buruk daripada README yang pendek.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: README menyusul keadaan repo sekarang"
```

---

### Task 14: Ukur Lighthouse dan catat

Bukan gerbang. Tujuannya menghasilkan angka dasar dan, lebih penting, mengetahui elemen LCP mana yang sekarang terpilih setelah hero berubah dari kanvas 3D berposter tetap menjadi panel foto yang dipasang setelah hidrasi.

**Files:**
- Create: `.superpowers/sdd/2026-08-23-dml-plan-6/lighthouse.md`

**Interfaces:** tidak ada.

- [ ] **Step 1: Siapkan mesin sesenggang mungkin**

Tutup browser dan aplikasi berat. Catat `uptime` sebelum mulai:

Run: `uptime`

- [ ] **Step 2: Jalankan tiga kali**

```bash
for i in 1 2 3; do
  echo "=== run $i ==="
  uptime
  bun run lighthouse 2>&1 | tail -30
done
```

Beberapa run bisa gagal assertion. Itu data, bukan kegagalan task.

- [ ] **Step 3: Ambil elemen LCP dari laporan**

Run: `cat .lighthouseci/*.report.json | grep -o '"largest-contentful-paint-element".\{0,800\}' | head -1`

Cari nama elemen dan selector-nya. Ini informasi yang belum pernah dicatat siapa pun untuk hero baru.

- [ ] **Step 4: Tulis ledger**

Buat `.superpowers/sdd/2026-08-23-dml-plan-6/lighthouse.md` berisi: tanggal, `uptime`/load average tiap run, nilai LCP tiap run, nilai CLS tiap run, skor SEO tiap run, elemen LCP yang terpilih beserta selector-nya, dan satu paragraf kesimpulan yang menjawab: apakah elemen LCP bergeser dibanding Plan 4 (yang mencatat poster hero sebagai elemen LCP pada 4228 ms), dan apakah sebaran angkanya lebih lebar daripada selisih terhadap ambang 5000 ms.

Kalau sebarannya lebih lebar dari selisihnya, tulis itu apa adanya: pengukuran di mesin ini tidak bisa membedakan regresi dari kontensi CPU, dan angka yang bisa dipercaya harus datang dari CI.

- [ ] **Step 5: Commit**

```bash
git add -f .superpowers/sdd/2026-08-23-dml-plan-6/lighthouse.md
git commit -m "docs: catat baseline Lighthouse dan elemen LCP hero baru"
```

`-f` diperlukan karena `.superpowers/` ada di `.gitignore` root. Ledger ini sengaja dikecualikan: ia satu-satunya catatan angka LCP hero baru, dan kehilangannya berarti mengukur ulang dari nol.

- [ ] **Step 6: Gerbang Fase 2**

```bash
bun run lint && bun run typecheck && bun run test && bun run build && bun run test:e2e
bun run doctor
```
Expected: lima gerbang pertama hijau, `doctor` exit 1 dengan tepat **dua** temuan tersisa: `deslop/unused-export` di `src/content/company.ts` (Task 18 yang menutupnya) dan `effect-needs-cleanup` di `hero.tsx:240` (pengecualian permanen, tidak pernah ditutup).

---

# FASE 3 — Konsistensi design system

Gerbang fase: seluruh gerbang hijau **termasuk** `bun run doctor`, dengan tepat **satu** temuan tersisa dan tidak lebih: `effect-needs-cleanup` di `hero.tsx:240`, pengecualian permanen yang didokumentasikan di Task 2 Step 3 (false-positive pencocok pembersihan loop milik alat itu sendiri, bukan bug nyata). `doctor` akan tetap exit 1 karena temuan ini — itu yang diharapkan, bukan kegagalan.

---

### Task 15: Penjaga kesamaan token

`tokens.ts` menyatakan nilainya wajib identik dengan blok `@theme` di `globals.css`. Tidak ada apa pun yang memeriksanya; `tokens.test.ts` hanya menguji rasio kontras. Palet baru saja diganti tangan di kedua berkas oleh kolaborator, dan tidak ada yang menahan keduanya berpisah lagi. Ini celah paling berbahaya yang tersisa karena kegagalannya senyap: situs tetap build, tetap lolos semua tes, dan cuma tampil dengan warna yang salah.

**Files:**
- Create: `src/lib/tokens-parity.test.ts`

**Interfaces:**
- Consumes: `TOKENS` dari `src/lib/tokens.ts`, berkas `src/app/globals.css`.
- Produces: pemetaan nama token camelCase ke nama custom property, dipakai juga oleh Task 16.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `src/lib/tokens-parity.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { TOKENS, type TokenName } from "./tokens";

/*
 * tokens.ts dan blok @theme di globals.css memuat nilai yang sama dua kali:
 * TypeScript membutuhkannya untuk menghitung rasio kontras, Tailwind
 * membutuhkannya untuk membangkitkan utility. Sampai Plan 6 kesamaan itu cuma
 * komentar, dan komentar tidak menahan apa pun. Palet Navy Selat masuk lewat
 * suntingan tangan di kedua berkas; suntingan berikutnya yang cuma menyentuh
 * satu sisi akan lolos setiap gerbang dan tampil sebagai warna yang salah.
 */
const CSS = readFileSync(fileURLToPath(new URL("../app/globals.css", import.meta.url)), "utf8");

/** camelCase di tokens.ts jadi kebab-case di custom property Tailwind. */
function cssVarName(token: TokenName): string {
  return `--color-${token.replace(/([A-Z])/g, "-$1").replace(/(\d+)/g, "-$1").toLowerCase()}`;
}

function readThemeBlock(): Map<string, string> {
  const match = CSS.match(/@theme\s*\{([\s\S]*?)\n\}/);
  if (!match?.[1]) throw new Error("blok @theme tidak ditemukan di globals.css");
  const entries = new Map<string, string>();
  for (const line of match[1].split("\n")) {
    const declaration = line.match(/^\s*(--color-[a-z0-9-]+)\s*:\s*([^;]+);/);
    if (declaration?.[1] && declaration[2]) {
      entries.set(declaration[1], declaration[2].trim().toLowerCase());
    }
  }
  return entries;
}

describe("kesamaan TOKENS dan blok @theme", () => {
  const theme = readThemeBlock();

  it("setiap token punya custom property dengan nilai yang sama", () => {
    for (const [name, value] of Object.entries(TOKENS) as [TokenName, string][]) {
      const variable = cssVarName(name);
      expect(theme.has(variable), `${variable} tidak ada di blok @theme`).toBe(true);
      expect(theme.get(variable), `${variable} berbeda dari TOKENS.${name}`).toBe(
        value.toLowerCase(),
      );
    }
  });

  it("tidak ada custom property warna yang tidak punya pasangan di TOKENS", () => {
    const expected = new Set(
      (Object.keys(TOKENS) as TokenName[]).map((name) => cssVarName(name)),
    );
    const yatim = [...theme.keys()].filter((variable) => !expected.has(variable));
    expect(yatim, "custom property warna tanpa pasangan di tokens.ts").toEqual([]);
  });
});
```

- [ ] **Step 2: Jalankan tes**

Run: `bun run test src/lib/tokens-parity.test.ts`
Expected: PASS jika kedua berkas memang sudah identik. Kalau FAIL, kamu baru saja menemukan bug nyata — laporkan selisihnya sebelum memperbaiki, karena yang benar antara `tokens.ts` dan `globals.css` adalah keputusan, bukan tebakan.

Perhatikan `cssVarName`: `surface2` harus memetakan ke `--color-surface-2`, dan `accentSoft` ke `--color-accent-soft`. Kalau pemetaannya meleset untuk salah satu token, perbaiki fungsinya, jangan mengendurkan asersinya.

- [ ] **Step 3: Buktikan tesnya benar-benar menggigit**

Ubah sementara satu nilai di `globals.css` — misalnya `--color-accent: #164194` jadi `#164195` — lalu jalankan ulang.

Run: `bun run test src/lib/tokens-parity.test.ts`
Expected: FAIL, dengan pesan yang menyebut `--color-accent`. Kembalikan nilainya, jalankan lagi, pastikan PASS. Tes yang tidak pernah kamu lihat merah adalah tes yang belum kamu percayai.

- [ ] **Step 4: Commit**

```bash
git add src/lib/tokens-parity.test.ts
git commit -m "test: kunci kesamaan tokens.ts dan blok @theme globals.css"
```

---

### Task 16: Hero memakai token dan manifest, bukan nilai harfiah

Hero menulis tiga nilai warna sebagai hex mentah (`#0A1428` untuk bidang gelapnya, `#4C7FD6` dan `#ffffff` untuk garis penanda pintu) dan dua path media secara harfiah, melewati `MEDIA` manifest yang seharusnya jadi sumber tunggal path dan alt-text.

**Files:**
- Modify: `src/lib/tokens.ts`
- Modify: `src/app/globals.css`
- Modify: `src/lib/tokens.test.ts`
- Modify: `src/features/home/hero.tsx`
- Modify: `src/features/home/hero-doors.tsx`
- Modify: `src/features/home/hero-copy.tsx`
- Modify: `src/features/home/use-hero-choreography.ts`

**Interfaces:**
- Consumes: `MEDIA` dan tipe `MediaAsset` dari `@/lib/media/manifest`, `TOKENS` dari `@/lib/tokens`.
- Produces: dua token baru, `heroGround` dan `accentLift`.

- [ ] **Step 1: Tambahkan dua token**

Di `src/lib/tokens.ts`, di dalam objek `TOKENS`, tambahkan:

```ts
  /**
   * Bidang gelap hero. Satu-satunya bidang gelap di situs terang ini, dan
   * karena itu tidak diturunkan dari surface mana pun. Sebelum Plan 6 nilainya
   * ditulis sebagai hex mentah di className hero.
   */
  heroGround: "#0A1428",
  /**
   * Aksen di ATAS bidang gelap. Navy #164194 nyaris tak terlihat di atas
   * heroGround, jadi penanda pintu hero memakai rona yang diangkat. Ini bukan
   * pengganti accent di bidang terang, dan tidak boleh dipakai di sana.
   */
  accentLift: "#4C7FD6",
```

- [ ] **Step 2: Tambahkan pasangannya di CSS**

Di `src/app/globals.css`, di dalam blok `@theme`, tepat di bawah `--color-danger`:

```css
  --color-hero-ground: #0a1428;
  --color-accent-lift: #4c7fd6;
```

- [ ] **Step 3: Jalankan penjaga dari Task 15**

Run: `bun run test src/lib/tokens-parity.test.ts`
Expected: PASS. Kalau FAIL, `cssVarName` belum memetakan camelCase dua-kata dengan benar — perbaiki fungsinya, bukan nilainya.

- [ ] **Step 4: Tambahkan asersi kontras untuk token baru**

Di `src/lib/tokens.test.ts`, tambahkan di dalam `describe` yang sudah ada:

```ts
  // Penanda pintu hero adalah elemen non-teks. WCAG 1.4.11 menuntut 3:1 untuk
  // itu, bukan 4,5:1. Navy dasar tidak lolos di atas bidang gelap hero, dan
  // itulah alasan accentLift ada sebagai token terpisah.
  it("aksen terangkat lolos 3:1 di atas bidang gelap hero", () => {
    expect(contrastRatio(TOKENS.accentLift, TOKENS.heroGround)).toBeGreaterThanOrEqual(3);
  });

  it("teks putih lolos AAA di atas bidang gelap hero", () => {
    expect(contrastRatio(TOKENS.onAccent, TOKENS.heroGround)).toBeGreaterThanOrEqual(7);
  });
```

Run: `bun run test src/lib/tokens.test.ts`
Expected: PASS. Kalau salah satu gagal, nilai tokennya yang harus disesuaikan, bukan ambangnya.

- [ ] **Step 5: Pakai tokennya**

- Di `hero.tsx`, `className="relative -mt-18 h-[250vh] bg-[#0A1428]"` jadi `className="relative -mt-18 h-[250vh] bg-hero-ground"`.
- Di `hero-copy.tsx`, `className="h-0.5 w-5.5 bg-[#4C7FD6]"` jadi `className="h-0.5 w-5.5 bg-accent-lift"`.
- Di `use-hero-choreography.ts`, ketiga literal warna di timeline scrub diganti pembacaan token. Tambahkan impor `import { TOKENS } from "@/lib/tokens";` lalu ganti `backgroundColor: "#ffffff"` jadi `backgroundColor: TOKENS.onAccent` dan `backgroundColor: "#4C7FD6"` jadi `backgroundColor: TOKENS.accentLift`.

- [ ] **Step 6: Sambungkan path media ke manifest**

Di `hero-doors.tsx`, hapus properti `photo` dan `alt` dari kedua entri `DOORS` dan ganti dengan `mediaId`:

```tsx
export const DOORS = [
  {
    key: "bbm",
    label: "Transportasi BBM",
    value: 55,
    unit: "Tanker",
    desc: "Pengangkutan bahan bakar dan transfer ship-to-ship untuk klien korporat.",
    mediaId: "operasi-sts",
  },
  {
    key: "roro",
    label: "Penyeberangan Ro-Ro",
    value: 9,
    unit: "Kapal",
    desc: "Penyeberangan untuk penumpang dan kendaraan, dengan tiket daring.",
    mediaId: "penumpang-roro",
  },
] as const;

/**
 * Path dan alt-text foto datang dari MEDIA, bukan ditulis di sini. Sebelum
 * Plan 6 hero menulis "/media/lini-bisnis/operasi-sts-2400.webp" secara
 * harfiah beserta alt-text-nya sendiri, jadi foto yang sama punya dua alt-text
 * berbeda tergantung seksi mana yang menampilkannya.
 */
function assetFor(mediaId: string): MediaAsset {
  const asset = MEDIA["lini-bisnis"].find((entry) => entry.id === mediaId);
  if (!asset) throw new Error(`MEDIA['lini-bisnis'] tidak punya id ${mediaId}`);
  return asset;
}
```

Di dalam `HeroDoors`, ganti `<Image src={door.photo} alt={door.alt} ... />` dengan:

```tsx
                {(() => {
                  const asset = assetFor(door.mediaId);
                  return (
                    <Image
                      src={avifSrc(asset, 2400)}
                      alt={asset.alt}
                      fill
                      sizes="100vw"
                      className={
                        index === 0
                          ? "object-cover brightness-60 contrast-125 saturate-60"
                          : "object-cover brightness-95 contrast-105 saturate-105"
                      }
                    />
                  );
                })()}
```

dengan impor `import { MEDIA, avifSrc, type MediaAsset } from "@/lib/media/manifest";`.

Perhatikan: ini juga menukar sumbernya dari `.webp` ke `.avif`, konsisten dengan `since-1988.tsx` dan `business-lines.tsx` yang sudah memakai `avifSrc`. Kedua berkas ada di `public/media/lini-bisnis/`.

- [ ] **Step 7: Verifikasi**

```bash
bun run lint && bun run typecheck && bun run test && bun run build
docker compose up -d
bun run test:e2e tests/e2e/hero.spec.ts tests/e2e/beranda.spec.ts tests/e2e/contrast-tokens.spec.ts
```
Expected: semuanya hijau. Kalau `contrast-tokens.spec.ts` menemukan pelanggaran baru, kemungkinan besar `accent-lift` dipakai sebagai warna teks di suatu tempat — ia hanya untuk elemen non-teks.

- [ ] **Step 8: Commit**

```bash
git add src/lib/tokens.ts src/lib/tokens.test.ts src/app/globals.css \
        src/features/home/hero.tsx src/features/home/hero-doors.tsx \
        src/features/home/hero-copy.tsx src/features/home/use-hero-choreography.ts
git commit -m "refactor: hero pakai token warna dan manifest media, bukan literal"
```

---

### Task 17: day-cut masuk sistem wash

Delapan seksi beranda memakai `.bg-surface-wash` atau `.bg-surface-2-wash` yang diperkenalkan commit 8994de9. `day-cut.tsx` satu-satunya yang tertinggal dengan `bg-surface-2` polos, jadi ritme selang-selingnya putus tepat di seksi kedua halaman.

**Files:**
- Modify: `src/features/home/day-cut.tsx:12`

**Interfaces:** tidak ada.

- [ ] **Step 1: Konfirmasi ritmenya**

Run: `grep -rn "bg-surface-wash\|bg-surface-2-wash\|bg-surface-2\"" src/features/home/*.tsx`

Urutan seksi di `page.tsx` adalah Hero, DayCut, BusinessLines, Affiliates, FleetComparator, RouteMap, Since1988, Certifications, CtaSection. Konfirmasi sendiri bahwa DayCut adalah satu-satunya yang belum memakai varian wash sebelum mengubahnya.

- [ ] **Step 2: Ubah**

```tsx
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden bg-surface-2-wash">
```

`bg-surface-2-wash`, bukan `bg-surface-wash`, karena BusinessLines yang datang persis setelahnya memakai `bg-surface-wash` dan dua seksi berurutan dengan bidang yang sama akan menghilangkan pemisahnya.

- [ ] **Step 3: Verifikasi gradasi overlay masih terbaca**

Seksi ini menumpuk `bg-gradient-to-r from-surface-2/75 via-surface-2/25 to-transparent` di atas fotonya untuk membuat panel teks terbaca. Latar wash ada di bawah foto, jadi tidak seharusnya memengaruhinya — konfirmasi di browser kalau kamu punya aksesnya.

Run: `bun run test src/features/home/day-cut.test.tsx && bun run build`
Expected: PASS, build lolos.

- [ ] **Step 4: Commit**

```bash
git add src/features/home/day-cut.tsx
git commit -m "style: seksi potong ke siang ikut sistem latar bergradasi"
```

---

### Task 18: Seksi struktur grup di Tentang Kami

`GROUP_UNITS` memuat pemetaan grup Sinar Alam dari CP DML.pdf halaman 01, lengkap dengan komentar yang menyatakan data itu dipakai halaman Tentang Kami. Tidak ada satu pun import di seluruh `src/`. Data hasil ekstraksi PDF tersimpan tanpa pernah tampil, dan react-doctor melaporkannya sebagai `unused-export` — bukan sampah, melainkan fitur yang hilang.

**Files:**
- Create: `src/features/about/group-structure.tsx`
- Create: `src/features/about/group-structure.test.tsx`
- Modify: `src/app/(site)/tentang-kami/page.tsx`

**Interfaces:**
- Consumes: `GROUP_UNITS: GroupUnit[]` dari `@/content/company`, `COMPANY.legalName`, `COMPANY.parent`. `GroupUnit` bertipe `{ sector: string; companies: string[] }`.
- Produces: `export function GroupStructure(): JSX.Element`.

- [ ] **Step 1: Baca bentuk datanya**

Run: `sed -n '131,160p' src/content/company.ts` dan `grep -n "GroupUnit" -A 6 src/content/types.ts`

Konfirmasi nama properti sebelum menulis komponen. Data dikelompokkan per sektor dengan daftar perusahaan di dalamnya, dan DML sendiri ada di salah satu daftar itu.

- [ ] **Step 2: Tulis tes yang gagal**

Buat `src/features/about/group-structure.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { COMPANY, GROUP_UNITS } from "@/content/company";
import { GroupStructure } from "./group-structure";

describe("GroupStructure", () => {
  it("menampilkan setiap sektor grup", () => {
    render(<GroupStructure />);
    for (const unit of GROUP_UNITS) {
      expect(screen.getByText(unit.sector)).toBeInTheDocument();
    }
  });

  it("menampilkan setiap perusahaan anggota", () => {
    render(<GroupStructure />);
    for (const unit of GROUP_UNITS) {
      for (const company of unit.companies) {
        expect(screen.getAllByText(company).length).toBeGreaterThan(0);
      }
    }
  });

  /*
   * Gunanya seksi ini adalah menunjukkan posisi DML di dalam grup. Daftar
   * datar tanpa penanda membuat pembaca harus memindai empat sektor untuk
   * menemukan perusahaan yang sedang mereka baca profilnya.
   */
  it("menandai DML sendiri di dalam daftar", () => {
    render(<GroupStructure />);
    const self = screen.getByTestId("grup-diri-sendiri");
    expect(self).toHaveTextContent(COMPANY.legalName);
  });

  it("menyebut induk grupnya", () => {
    render(<GroupStructure />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(COMPANY.parent);
  });
});
```

- [ ] **Step 3: Jalankan tes, pastikan gagal**

Run: `bun run test src/features/about/group-structure.test.tsx`
Expected: FAIL — modul `./group-structure` tidak ditemukan.

- [ ] **Step 4: Tulis komponennya**

Buat `src/features/about/group-structure.tsx`:

```tsx
import { COMPANY, GROUP_UNITS } from "@/content/company";
import { Reveal } from "@/components/motion/reveal";

/**
 * Struktur grup Sinar Alam, cp-pdf hal. 01. Data ini ada di src/content sejak
 * Plan 5 tapi tidak pernah dirender sampai Plan 6 — komentarnya bahkan
 * menyatakan halaman ini memakainya, padahal tidak ada import sama sekali.
 *
 * Dikelompokkan per sektor, bukan sebagai daftar datar, karena empat sektornya
 * bukan kategori yang setara: satu transportir, satu galangan, dan seterusnya.
 * Meratakan semuanya jadi satu daftar menghapus justru informasi yang membuat
 * seksi ini layak ada.
 */
export function GroupStructure() {
  return (
    <section id="grup" className="mt-24 scroll-mt-24">
      <h2 className="font-display text-2xl font-bold">Bagian dari {COMPANY.parent}</h2>
      <p className="mt-3 max-w-[60ch] text-ink-muted">
        {COMPANY.shortName} beroperasi sebagai salah satu unit usaha grup. Berikut sektor dan
        perusahaan yang menaunginya.
      </p>
      <Reveal className="mt-8 grid gap-8 md:grid-cols-2">
        {GROUP_UNITS.map((unit) => (
          <div key={unit.sector} className="rounded-card border border-surface-3 bg-surface-2 p-6">
            <p className="font-mono text-xs tracking-[0.16em] text-ink-muted uppercase">
              {unit.sector}
            </p>
            <ul className="mt-4 space-y-2">
              {unit.companies.map((company) => {
                const isSelf = company === COMPANY.legalName;
                return (
                  <li
                    key={company}
                    data-testid={isSelf ? "grup-diri-sendiri" : undefined}
                    className={
                      isSelf
                        ? "font-medium text-accent before:mr-2 before:content-['▸']"
                        : "text-ink-muted"
                    }
                  >
                    {company}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 5: Jalankan tes**

Run: `bun run test src/features/about/group-structure.test.tsx`
Expected: kelima tes PASS. Kalau "menandai DML sendiri" gagal, nama di `GROUP_UNITS` tidak sama persis dengan `COMPANY.legalName` — perbaiki data, bukan perbandingannya, dan laporkan selisihnya.

- [ ] **Step 6: Pasang di halaman**

Di `src/app/(site)/tentang-kami/page.tsx`, tambahkan impor:

```tsx
import { GroupStructure } from "@/features/about/group-structure";
```

Tambahkan butir ketiga ke `AnchorNav`:

```tsx
        items={[
          { id: "silsilah", label: "Silsilah" },
          { id: "profil", label: "Profil" },
          { id: "grup", label: "Grup" },
        ]}
```

dan sisipkan `<GroupStructure />` setelah `</section>` penutup seksi Profil, sebelum blok `<script type="application/ld+json">`.

- [ ] **Step 7: Verifikasi halaman**

```bash
bun run lint && bun run typecheck && bun run test && bun run build
docker compose up -d
bun run test:e2e tests/e2e/tentang-kami.spec.ts
```
Expected: semuanya hijau. `tentang-kami.spec.ts` menguji navigasi anchor dan aksesibilitas — keduanya menyentuh apa yang baru saja kamu tambahkan.

- [ ] **Step 8: Verifikasi doctor sekarang tinggal satu pengecualian**

Run: `bun run doctor`
Expected: exit 1, tepat **satu** temuan: `effect-needs-cleanup` di `hero.tsx:240` (pengecualian permanen, Task 2 Step 3). Semua temuan lain, termasuk `deslop/unused-export`, hilang untuk pertama kalinya sejak plan dimulai.

- [ ] **Step 9: Commit**

```bash
git add src/features/about src/app/\(site\)/tentang-kami/page.tsx
git commit -m "feat: seksi struktur grup Sinar Alam di halaman Tentang Kami"
```

---

### Task 19: Audit design system dan aksesibilitas

Diletakkan di akhir supaya temuannya tidak tercampur dengan sampah yang sudah dijadwalkan hilang di Fase 1 dan 2.

**Files:**
- Create: `.superpowers/sdd/2026-08-23-dml-plan-6/audit.md`

**Interfaces:** tidak ada.

- [ ] **Step 1: Jalankan audit panduan antarmuka**

Invoke skill `web-design-guidelines` terhadap `src/app/(site)/`, `src/features/home/`, `src/features/about/`, dan `src/components/`.

- [ ] **Step 2: Sweep aksesibilitas di tiga viewport**

Spec e2e yang ada menjalankan axe hanya pada viewport default, dan `playwright.config.ts` cuma mendefinisikan satu proyek Chromium desktop. Lebar viewport **tidak** bisa divariasikan dari baris perintah — tidak ada flag `--viewport`. Menjalankan suite yang sama tiga kali di dalam loop shell hanya menghasilkan tiga kali hasil yang identik, dan itu persis bentuk kepercayaan palsu yang membuat dua cacat visual lolos di Plan 4.

Satu-satunya cara benar adalah dari dalam spec. Buat berkas sementara `tests/e2e/a11y-viewport.spec.ts`:

```ts
import { test } from "@playwright/test";
import { expectNoAxeViolations } from "./axe";

const ROUTES = ["/", "/kontak", "/tentang-kami", "/karier"];
const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const viewport of VIEWPORTS) {
  test.describe(`aksesibilitas ${viewport.name} ${viewport.width}px`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });
    for (const path of ROUTES) {
      test(`tanpa pelanggaran axe di ${path}`, async ({ page }) => {
        await page.goto(path);
        await expectNoAxeViolations(page);
      });
    }
  });
}
```

Buka `tests/e2e/axe.ts` lebih dulu untuk memakai nama helper yang benar-benar diekspor di sana — jangan menebak `expectNoAxeViolations` kalau namanya berbeda.

```bash
docker compose up -d
bun run test:e2e tests/e2e/a11y-viewport.spec.ts
```
Expected: dua belas tes. Setiap kegagalan adalah temuan.

Berkas ini sementara. Setelah audit selesai, keputusan apakah ia jadi permanen dibawa ke pemilik repo bersama daftar temuan di Step 5 — menambah dua belas tes ke setiap run e2e memperlambat gerbang semua orang, dan itu bukan keputusan sepihak. Jangan mengubah `playwright.config.ts` sama sekali.

- [ ] **Step 3: Periksa lima hal yang tidak dicakup alat mana pun**

Baca dan catat, satu per satu:

1. **Ritme seksi beranda.** Urutan sembilan seksi di `page.tsx` — apakah masih tidak ada dua seksi berurutan yang memakai keluarga tata letak yang sama, seperti yang diklaim komentar di berkas itu? Hero berubah total sejak klaim itu ditulis.
2. **Halaman Tentang Kami tidak memakai sistem wash sama sekali** dan tidak memakai komponen `SectionHeader` yang dipakai beranda. Apakah itu keputusan atau kelalaian?
3. **`h-14.5` dan `gap-5.5` dan `pt-21`** — nilai spacing pecahan yang dipakai hero. Apakah konsisten dengan skala spacing yang dipakai seksi lain, atau angka yang muncul dari penyetelan mata?
4. **Fokus keyboard di hero.** Dua CTA hero berada di dalam panggung `sticky` dengan `overflow-hidden`. Uji Tab dari header sampai melewati hero, pastikan tidak ada fokus yang terpotong atau tak terlihat.
5. **Hero pada tinggi viewport pendek.** Baris sertifikasi disembunyikan di bawah 760 px tinggi. Uji pada 1440×720 apakah sisa isinya masih muat tanpa terpotong.

- [ ] **Step 4: Tulis temuan**

Buat `.superpowers/sdd/2026-08-23-dml-plan-6/audit.md`. Untuk tiap temuan catat: berkas dan baris, apa yang salah, bukti (screenshot, output axe, atau kutipan kode), tingkat keyakinan, dan usulan perbaikan. Temuan tanpa bukti dari berkas yang bersangkutan tidak masuk daftar.

- [ ] **Step 5: Gerbang keputusan scope**

Hitung temuannya.

- **Enam atau kurang, semuanya mekanis:** kerjakan sebagai Task 20 dan seterusnya di fase ini, satu commit per temuan, gerbang penuh di akhir.
- **Lebih dari enam, atau ada yang menyentuh keputusan desain** (mengubah tata letak, mengganti komponen, mengubah copy): **berhenti**. Bawa daftarnya ke pemilik repo sebagai keputusan scope. Melebarkan plan diam-diam adalah cara plan stabilisasi berubah jadi plan desain ulang.

- [ ] **Step 6: Commit temuan**

```bash
git add -f .superpowers/sdd/2026-08-23-dml-plan-6/audit.md
git commit -m "docs: temuan audit design system dan aksesibilitas"
```

- [ ] **Step 7: Gerbang Fase 3 dan penutupan plan**

```bash
bun run lint && bun run typecheck && bun run test && bun run build
bun run doctor
docker compose up -d
bun run test:e2e
```
Expected: empat gerbang pertama hijau, `doctor` exit 1 dengan tepat satu temuan (`effect-needs-cleanup` di `hero.tsx:240`, pengecualian permanen dari Task 2 Step 3), e2e 24 dari 24 (ditambah tes baru yang kamu tulis di Task 1, 7, 15, dan 18 di sisi unit).

Jalankan `bun run lighthouse` sekali lagi dan bandingkan dengan ledger Task 14. Kalau angkanya bergeser jauh, catat di ledger yang sama. Ini tetap tidak memblokir.

---

## Ringkasan gerbang

| Fase | Task | Gerbang |
|---|---|---|
| 1 | 1-8 | lint, typecheck, test, build, e2e hijau. Doctor: tinggal dua temuan `deslop/*` plus satu pengecualian permanen `effect-needs-cleanup`. |
| 2 | 9-14 | Sama, ditambah `unused-dependency` bersih. Lighthouse diukur dan dicatat. |
| 3 | 15-19 | Semua hijau. Doctor: tepat satu temuan tersisa (`effect-needs-cleanup`, pengecualian permanen terdokumentasi), bukan exit 0. |

## Yang sengaja tidak dikerjakan

Verifikasi `/admin` Payload lewat browser, rate limiter berbasis `x-forwarded-for`, keputusan branch dan remote (`origin/master` adalah prototipe Vite tanpa nenek moyang bersama dan tetap jadi default branch di GitHub), setup CI, seed migration, dan tujuh butir yang menunggu konfirmasi klien dari Plan 5 bagian 5. Rinciannya di bagian 7 spec.
