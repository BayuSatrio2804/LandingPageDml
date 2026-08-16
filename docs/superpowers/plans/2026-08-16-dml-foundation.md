# DML Corporate, Plan 1: Fondasi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun fondasi teknis situs company profile PT Dutabahari Menara Line: project Next.js baru dengan design token yang kontrasnya terbukti lolos WCAG, infrastruktur motion yang menghormati `prefers-reduced-motion`, shell layout, primitif SEO, dan gerbang kualitas otomatis.

**Architecture:** Aplikasi Next.js App Router tunggal di `dml-web/`. Server Component adalah default; motion hidup di client leaf terisolasi yang tidak pernah membungkus konten teks. Token warna didefinisikan sekali di CSS lalu diverifikasi oleh unit test, sehingga pelanggaran kontras gagal di CI, bukan ditemukan mata reviewer. Lenis dan GSAP diinisialisasi satu kali di provider tingkat root dan dimatikan total ketika pengguna meminta reduced motion.

**Tech Stack:** Next.js 16.2, React 19, TypeScript strict, Tailwind CSS v4, Lenis 1.3, GSAP 3.13 (ScrollTrigger, SplitText), Phosphor Icons, Vitest, Playwright, react-doctor, bun 1.3.

**Spec:** `docs/superpowers/specs/2026-08-16-dml-corporate-design.md`

## Global Constraints

Setiap task secara implisit tunduk pada seluruh isi bagian ini.

- **Next.js minimum 16.2.0.** Payload 3 tidak mendukung Next 15.5 sampai 16.1.x dan tidak akan mendukungnya. Jangan pernah menurunkan versi ini.
- **Package manager bun.** Tidak ada `npm install` atau `yarn` di mana pun, termasuk di dokumentasi.
- **Bahasa situs Indonesia saja.** `lang="id"`. Tidak ada route `/en`, tidak ada hreflang, tidak ada i18n library.
- **Halaman dark-locked.** Tidak ada `dark:` variant, tidak ada theme toggle, tidak ada seksi yang berbalik terang.
- **Teks di atas permukaan `--color-accent` selalu `--color-on-accent`.** Kombinasi `--color-ink` di atas `--color-accent` adalah 2,72:1 dan dilarang.
- **Radius: 12px kartu dan panel, 8px input, full-pill tombol.** Tanpa kecuali.
- **Ikon hanya dari `@phosphor-icons/react`,** `weight="regular"`. Tidak ada SVG ikon yang digambar tangan, tidak ada library ikon kedua.
- **Dilarang `window.addEventListener('scroll')`.** Gunakan ScrollTrigger, IntersectionObserver, atau CSS scroll-driven animation.
- **Dilarang menyimpan nilai kontinu di React state.** Progress scroll dan posisi pointer hidup di `ref`, bukan `useState`.
- **Setiap `useEffect` yang membuat animasi wajib punya cleanup.** Pola `gsap.context()` lalu `return () => ctx.revert()`.
- **Tidak ada em dash (`—`) atau en dash (`–`)** di teks yang terlihat pengguna maupun di komentar kode. Gunakan tanda hubung biasa.
- **Tidak ada library animasi selain GSAP dan Lenis.** Jangan menambahkan `motion` atau `framer-motion`.
- **Konten teks dan link selalu render di server.** Client leaf hanya boleh mengubah transform dan opacity elemen yang sudah ada di HTML.
- **Semua angka perusahaan berasal dari sumber publik** dan wajib ditandai sampai klien mengonfirmasi: `// unverified: <sumber>` di berkas data seperti `src/content/company.ts` (sintaks `{/* */}` tidak sah di luar JSX), dan `{/* unverified: <sumber> */}` di titik render JSX kalau angkanya dicetak langsung di markup Plan 3 atau Plan 5.
- **Setiap task wajib lolos `bun run lint`,** bukan cuma `bun run test`, `bunx tsc --noEmit`, dan `bun run build`. Konfigurasi eslint Next 16 memuat aturan react-hooks generasi compiler yang menangkap kelas kesalahan yang tidak terlihat oleh typechecker maupun test runner.
- **`noUncheckedIndexedAccess` aktif.** Setiap akses indeks ke array, ke hasil `.match()` atau `.exec()`, dan ke `Record` menghasilkan `T | undefined`. Blok kode di rencana ini belum tentu lolos `bunx tsc --noEmit`; kalau bentrok, perbaiki dengan guard eksplisit, bukan dengan non-null assertion (`!`) atau `as`, lalu laporkan agar rencananya diperbaiki.

---

## File Structure

```
dml-web/
  src/
    app/
      layout.tsx                  root layout, lang="id", font, provider motion
      page.tsx                    placeholder beranda, diisi Plan 5
      globals.css                 @theme token, reset, base
      sitemap.ts
      robots.ts
      not-found.tsx
    components/
      layout/
        site-header.tsx           server, nav satu baris
        site-footer.tsx           server
        skip-link.tsx             server
        external-link.tsx         server, ikon + rel noopener
      motion/
        smooth-scroll-provider.tsx  client leaf, Lenis
        reveal.tsx                  client leaf, scroll reveal stagger
    lib/
      color.ts                    contrastRatio, relativeLuminance
      motion/
        gsap.ts                   registrasi plugin, sekali saja
        use-prefers-reduced-motion.ts
      seo/
        metadata.ts               buildMetadata
        json-ld.ts                organizationJsonLd, breadcrumbJsonLd
    content/
      company.ts                  data perusahaan, satu sumber kebenaran
      navigation.ts               struktur nav dan footer
      types.ts
  tests/
    e2e/
      no-js.spec.ts               konten hadir tanpa JavaScript
      reduced-motion.spec.ts      konten hadir dengan reduced motion
      contrast-tokens.spec.ts     tidak ada ink di atas accent
  scripts/
  public/
    fonts/
```

Pembagian ini menaruh setiap tanggung jawab di satu file. `lib/color.ts` murni fungsi, tanpa React, sehingga bisa diuji tanpa DOM. `content/company.ts` jadi satu-satunya tempat angka perusahaan hidup, supaya representasi mana pun tidak bisa berbeda.

---

### Task 1: Scaffold project dan pin versi

**Files:**
- Create: `dml-web/` (seluruh scaffold)
- Modify: `dml-web/package.json`
- Modify: `dml-web/tsconfig.json`

**Interfaces:**
- Consumes: tidak ada, ini task pertama
- Produces: project Next.js yang bisa `bun run build`, dengan alias import `@/*` menunjuk ke `dml-web/src/*`

- [ ] **Step 1: Buat project**

```bash
cd /home/waxarsatia/test/company-profile
bunx create-next-app@latest dml-web \
  --typescript --tailwind --app --src-dir --turbopack \
  --import-alias "@/*" --use-bun --eslint --yes
```

- [ ] **Step 2: Verifikasi versi Next memenuhi lantai keras**

```bash
cd dml-web && bun pm ls | grep -E '^\s*├──\s+next@|next@'
```

Expected: versi 16.2.0 atau lebih tinggi. Jika lebih rendah, jalankan:

```bash
bun add next@^16.2.0 react@^19 react-dom@^19
```

Lalu ulangi verifikasi. Jangan lanjut sebelum lolos. Payload 3 di Plan 4 akan gagal pada Next di bawah 16.2.0.

- [ ] **Step 3: Aktifkan TypeScript strict**

Di `dml-web/tsconfig.json`, pastikan `compilerOptions` memuat:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true
}
```

- [ ] **Step 4: Pasang dependensi runtime**

```bash
cd /home/waxarsatia/test/company-profile/dml-web
bun add lenis@^1.3 gsap@^3.13 @phosphor-icons/react@^2 zod@^4
```

- [ ] **Step 5: Pasang dependensi pengembangan**

```bash
bun add -d vitest@^4 @vitejs/plugin-react@^6 jsdom@^30 \
  @testing-library/react@^16 @testing-library/jest-dom@^7 \
  @testing-library/user-event@^14 \
  @playwright/test@^1.62 react-doctor@^0.9.12
bunx playwright install chromium
```

- [ ] **Step 6: Verifikasi build bersih**

Run: `bun run build`
Expected: build sukses tanpa error TypeScript.

- [ ] **Step 7: Commit**

```bash
cd /home/waxarsatia/test/company-profile
git add dml-web
git commit -m "feat: scaffold project Next 16.2 dengan bun, Tailwind v4, TypeScript strict"
```

---

### Task 2: Utilitas kontras warna dan tes token

Task ini didahulukan sebelum token ditulis, karena spec memuat satu kombinasi warna yang gagal WCAG dan kesalahan itu mudah lolos review mata. Tesnya harus ada sebelum warnanya ada.

**Files:**
- Create: `dml-web/src/lib/color.ts`
- Create: `dml-web/src/lib/color.test.ts`
- Create: `dml-web/vitest.config.mts`
- Create: `dml-web/vitest.setup.ts`

**Interfaces:**
- Consumes: tidak ada
- Produces:
  - `relativeLuminance(hex: string): number`
  - `contrastRatio(a: string, b: string): number`
  - `TOKENS: Record<string, string>` di Task 3, diuji di sini lewat import

- [ ] **Step 1: Konfigurasi Vitest**

Create `dml-web/vitest.config.mts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

Create `dml-web/vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Tambahkan script ke `dml-web/package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: Tulis tes yang gagal**

Create `dml-web/src/lib/color.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { contrastRatio, relativeLuminance } from "./color";

describe("relativeLuminance", () => {
  it("mengembalikan 0 untuk hitam murni", () => {
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
  });

  it("mengembalikan 1 untuk putih murni", () => {
    expect(relativeLuminance("#FFFFFF")).toBeCloseTo(1, 5);
  });

  it("menerima notasi tiga digit", () => {
    expect(relativeLuminance("#fff")).toBeCloseTo(1, 5);
  });

  it("menolak digit yang bukan heksadesimal", () => {
    expect(() => relativeLuminance("#GGGGGG")).toThrow(/tidak sah/);
  });

  it("menolak panjang digit yang tidak sah", () => {
    expect(() => relativeLuminance("#12345")).toThrow(/tidak sah/);
  });
});

describe("contrastRatio", () => {
  it("mengembalikan 21 untuk hitam lawan putih", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
  });

  it("simetris terhadap urutan argumen", () => {
    const a = contrastRatio("#0A1418", "#FF5A1F");
    const b = contrastRatio("#FF5A1F", "#0A1418");
    expect(a).toBeCloseTo(b, 10);
  });

  it("mengembalikan 1 untuk warna yang sama", () => {
    expect(contrastRatio("#FF5A1F", "#FF5A1F")).toBeCloseTo(1, 5);
  });
});
```

- [ ] **Step 3: Jalankan tes untuk memastikan gagal**

Run: `cd dml-web && bun run test src/lib/color.test.ts`
Expected: FAIL dengan pesan bahwa modul `./color` tidak ditemukan.

- [ ] **Step 4: Implementasi minimal**

Create `dml-web/src/lib/color.ts`:

```ts
const HEX_PATTERN = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Menguraikan hex tiga atau enam digit menjadi tiga kanal 0 sampai 255.
 * Melempar untuk masukan yang tidak sah, karena nilai NaN yang mengalir diam
 * diam akan membuat pemeriksaan kontras lolos tanpa pernah benar benar diuji.
 */
function parseHex(hex: string): [number, number, number] {
  const [, digits] = HEX_PATTERN.exec(hex.trim()) ?? [];
  if (digits === undefined) {
    throw new Error(`Nilai hex tidak sah: ${JSON.stringify(hex)}`);
  }
  const raw =
    digits.length === 3
      ? digits
          .split("")
          .map((c) => c + c)
          .join("")
      : digits;
  return [
    parseInt(raw.slice(0, 2), 16),
    parseInt(raw.slice(2, 4), 16),
    parseInt(raw.slice(4, 6), 16),
  ];
}

/**
 * Ambang 0.04045 adalah titik potong sRGB menurut IEC 61966-2-1. Teks WCAG 2.x
 * menuliskan 0.03928, dan untuk seluruh kanal delapan bit kedua ambang itu
 * memberi hasil yang identik, jadi perbedaannya tekstual, bukan fungsional.
 */
function channelToLinear(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.04045
    ? srgb / 12.92
    : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

/** Luminansi relatif menurut WCAG 2.1, rentang 0 sampai 1. */
export function relativeLuminance(hex: string): number {
  const [red, green, blue] = parseHex(hex);
  const r = channelToLinear(red);
  const g = channelToLinear(green);
  const b = channelToLinear(blue);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Rasio kontras WCAG antara dua warna, rentang 1 sampai 21. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}
```

- [ ] **Step 5: Jalankan tes untuk memastikan lolos**

Run: `cd dml-web && bun run test src/lib/color.test.ts`
Expected: PASS, delapan assertion hijau.

Tes kontras untuk token warna tidak berada di berkas ini. Token belum ada sampai
Task 3, dan Task 3 membawa berkas tesnya sendiri, `src/lib/tokens.test.ts`.

- [ ] **Step 6: Commit**

```bash
cd /home/waxarsatia/test/company-profile
git add dml-web/src/lib/color.ts dml-web/src/lib/color.test.ts \
  dml-web/vitest.config.mts dml-web/vitest.setup.ts dml-web/package.json
git commit -m "feat: utilitas rasio kontras WCAG dengan tes"
```

---

### Task 3: Design token dan tes kontras token

**Files:**
- Create: `dml-web/src/lib/tokens.ts`
- Create: `dml-web/src/lib/tokens.test.ts`
- Modify: `dml-web/src/app/globals.css`

**Interfaces:**
- Consumes: `contrastRatio` dari Task 2
- Produces: `TOKENS` dengan kunci `surface`, `surface2`, `surface3`, `ink`, `inkMuted`, `accent`, `accentHover`, `accentPress`, `onAccent`. Setiap task berikutnya membaca warna dari sini atau dari variabel CSS dengan nama yang sama, tidak pernah menulis hex secara langsung.

- [ ] **Step 1: Tulis tes yang gagal**

Create `dml-web/src/lib/tokens.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { contrastRatio, relativeLuminance } from "./color";
import { TOKENS } from "./tokens";

describe("kontras token Deep Water", () => {
  it("teks utama di atas latar utama lolos AAA", () => {
    expect(contrastRatio(TOKENS.ink, TOKENS.surface)).toBeGreaterThanOrEqual(7);
  });

  it("teks sekunder di atas latar utama lolos AA", () => {
    expect(contrastRatio(TOKENS.inkMuted, TOKENS.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it("aksen sebagai teks di atas latar utama lolos AA", () => {
    expect(contrastRatio(TOKENS.accent, TOKENS.surface)).toBeGreaterThanOrEqual(4.5);
  });

  it("teks on-accent di atas permukaan aksen lolos AA", () => {
    expect(contrastRatio(TOKENS.onAccent, TOKENS.accent)).toBeGreaterThanOrEqual(4.5);
  });

  it("teks ink di atas permukaan aksen GAGAL, ini yang dilarang spec", () => {
    expect(contrastRatio(TOKENS.ink, TOKENS.accent)).toBeLessThan(4.5);
  });

  it("hover lebih terang daripada aksen dasar karena halaman gelap", () => {
    expect(relativeLuminance(TOKENS.accentHover)).toBeGreaterThan(
      relativeLuminance(TOKENS.accent),
    );
  });

  it("state tertekan lebih gelap daripada aksen dasar", () => {
    expect(relativeLuminance(TOKENS.accentPress)).toBeLessThan(
      relativeLuminance(TOKENS.accent),
    );
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `cd dml-web && bun run test src/lib/tokens.test.ts`
Expected: FAIL, modul `./tokens` tidak ditemukan.

- [ ] **Step 3: Implementasi token TypeScript**

Create `dml-web/src/lib/tokens.ts`:

```ts
/**
 * Palet "Deep Water". Sumber kebenaran tunggal untuk warna.
 * Nilai di sini wajib identik dengan blok @theme di globals.css.
 * Rasio kontrasnya dijaga oleh tokens.test.ts.
 */
export const TOKENS = {
  surface: "#0A1418",
  surface2: "#111E24",
  surface3: "#18292F",
  ink: "#F2EFE9",
  inkMuted: "#8FA1A8",
  accent: "#FF5A1F",
  accentHover: "#FF7A45",
  accentPress: "#E04A12",
  onAccent: "#0A1418",
} as const;

export type TokenName = keyof typeof TOKENS;
```

- [ ] **Step 4: Jalankan tes untuk memastikan lolos**

Run: `cd dml-web && bun run test src/lib/tokens.test.ts`
Expected: PASS, tujuh assertion hijau. Perhatikan bahwa tes kelima sengaja menegaskan sebuah kegagalan kontras: itu memastikan larangan spec tetap terdokumentasi di kode.

- [ ] **Step 5: Tulis token CSS**

Replace isi `dml-web/src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-surface: #0a1418;
  --color-surface-2: #111e24;
  --color-surface-3: #18292f;
  --color-ink: #f2efe9;
  --color-ink-muted: #8fa1a8;
  --color-accent: #ff5a1f;
  --color-accent-hover: #ff7a45;
  --color-accent-press: #e04a12;
  --color-on-accent: #0a1418;

  --radius-card: 12px;
  --radius-input: 8px;

  /*
   * Fallback wajib ada di dalam var(). Referensi var() tanpa fallback yang
   * belum terdefinisi membuat SELURUH deklarasi font-family tidak sah pada
   * computed-value time, bukan cuma item pertamanya, jadi rantai cadangan di
   * belakang koma tidak pernah terpakai dan browser jatuh ke font default
   * yang sering serif. Task 4 mendefinisikan dua variabel pertama.
   */
  --font-display: var(--font-cabinet-grotesk, ui-sans-serif), system-ui, sans-serif;
  --font-body: var(--font-satoshi, ui-sans-serif), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono, ui-monospace), monospace;
}

html {
  color-scheme: dark;
}

body {
  background-color: var(--color-surface);
  color: var(--color-ink);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

/* Lenis mengontrol scroll. Tanpa ini, scroll native ikut berjalan. */
html.lenis,
html.lenis body {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 6: Verifikasi build**

Run: `cd dml-web && bun run build`
Expected: build sukses.

- [ ] **Step 7: Commit**

```bash
cd /home/waxarsatia/test/company-profile
git add dml-web/src/lib/tokens.ts dml-web/src/lib/tokens.test.ts dml-web/src/app/globals.css
git commit -m "feat: token Deep Water dengan tes kontras yang menjaga aturan on-accent"
```

---

### Task 4: Font self-hosted

**Files:**
- Create: `dml-web/src/fonts/` (berkas font)
- Create: `dml-web/src/lib/fonts.ts`
- Modify: `dml-web/src/app/layout.tsx`

Font tidak ditaruh di `public/`. `next/font/local` sudah menyalin berkasnya ke
`.next/static/media/` dengan nama ber-hash dan header cache abadi. Menaruh sumbernya
di `public/` berarti ikut mengirim salinan kedua yang tidak pernah dirujuk siapa pun,
dengan header cache yang lebih buruk.

**Interfaces:**
- Consumes: variabel `--font-cabinet-grotesk`, `--font-satoshi`, `--font-geist-mono` yang sudah dirujuk `globals.css` di Task 3
- Produces: `fontVariables: string` untuk dipasang di `<html className>`

- [ ] **Step 1: Ekstrak Cabinet Grotesk dan Satoshi**

Arsip Fontshare sudah tersedia di `/home/waxarsatia/test/company-profile/fonts/`.
Keduanya memuat berkas variable `.woff2`, jadi gunakan itu, bukan bobot statis.

```bash
cd /home/waxarsatia/test/company-profile
mkdir -p dml-web/src/fonts
unzip -o -j fonts/CabinetGrotesk_Complete.zip \
  "CabinetGrotesk_Complete/Fonts/WEB/fonts/CabinetGrotesk-Variable.woff2" \
  -d dml-web/src/fonts
unzip -o -j fonts/Satoshi_Complete.zip \
  "Satoshi_Complete/Fonts/WEB/fonts/Satoshi-Variable.woff2" \
  -d dml-web/src/fonts
ls -la dml-web/src/fonts
```

Expected: dua berkas, `CabinetGrotesk-Variable.woff2` sekitar 41 kB dan
`Satoshi-Variable.woff2` sekitar 42 kB.

Varian italic sengaja tidak diambil. Spec tidak memakai italic di mana pun, dan
menambahkannya berarti membayar 44 kB untuk berkas yang tidak pernah dirender.

- [ ] **Step 2: Pasang Geist Mono lewat paket resmi**

Geist Mono tidak diunduh manual. Vercel menerbitkannya sebagai paket npm yang sudah
terintegrasi dengan `next/font`, jadi berkasnya di-host sendiri secara otomatis tanpa
perlu masuk ke `public/`.

```bash
cd /home/waxarsatia/test/company-profile/dml-web
bun add geist
```

- [ ] **Step 3: Deklarasikan font**

Create `dml-web/src/lib/fonts.ts`:

```ts
import localFont from "next/font/local";
import { GeistMono } from "geist/font/mono";

export const cabinetGrotesk = localFont({
  src: "../fonts/CabinetGrotesk-Variable.woff2",
  variable: "--font-cabinet-grotesk",
  display: "swap",
  weight: "100 900",
});

export const satoshi = localFont({
  src: "../fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  display: "swap",
  weight: "300 900",
});

export const geistMono = GeistMono;

export const fontVariables = [
  cabinetGrotesk.variable,
  satoshi.variable,
  geistMono.variable,
].join(" ");
```

`GeistMono.variable` menghasilkan `--font-geist-mono`, nama yang sama dengan yang
sudah dirujuk `globals.css` di Task 3, jadi tidak ada yang perlu diubah di sana.

- [ ] **Step 4: Pasang di root layout**

Sunting `dml-web/src/app/layout.tsx` sampai isinya menjadi:

```tsx
import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "PT Dutabahari Menara Line",
  description:
    "Perusahaan pelayaran Banjarmasin sejak 1985. Transportasi BBM, penyeberangan ro-ro, dan galangan kapal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

Ganti **hanya bagian fontnya**. `LayoutProps<"/">` adalah tipe global bawaan
typed routes Next 16, lebih tepat daripada menulis ulang `React.ReactNode` sendiri.
Class `h-full antialiased` dan `min-h-full flex flex-col` sudah ada sejak scaffold
dan menopang layout kolom penuh yang dipakai Task 8, jadi keduanya dipertahankan.

- [ ] **Step 5: Verifikasi font termuat, otomatis**

Langkah ini wajib dijalankan lewat browser headless, bukan lewat DevTools manual.
Instruksi manual tidak menghasilkan bukti apa pun di dalam laporan.

Jalankan `bun run build` lalu `bun run start`, kemudian jalankan skrip Playwright
sekali pakai terhadap `http://localhost:3000`. Skrip itu harus menegaskan tiga hal:

1. **Self-hosted.** Setiap respons woff2 berstatus 200 dan berasal dari origin yang
   sama. **Tidak ada** permintaan ke `fonts.googleapis.com` maupun `fonts.gstatic.com`.
2. **Variabel terpasang.** Elemen `<html>` membawa ketiga class variabel font sekaligus.
3. **Sumbu bobot benar-benar tergerak.** Ini yang paling penting dan paling mudah
   terlewat.

Soal nomor 3: kedua berkas ini punya instance default `wght = 900` dan
`usWeightClass = 900`, tidak lazim untuk font Fontshare yang biasanya default 400.
Artinya kalau rentang `weight` gagal sampai ke `@font-face`, seluruh situs akan
dirender dengan bobot Black tanpa ada yang error.

`getComputedStyle(el).fontWeight` **tidak bisa** mendeteksi ini. Nilai itu melaporkan
angka CSS yang mengalir dari cascade, bukan bobot yang benar-benar dirender font.
Yang membedakan adalah metrik: render string yang sama di dua span dengan bobot
berbeda, lalu bandingkan `getBoundingClientRect().width`.

- Cabinet Grotesk: bandingkan bobot 100 lawan 900
- Satoshi: bandingkan bobot 300 lawan 900

Lebar yang berbeda berarti sumbunya tergerak. Lebar yang identik berarti semuanya
dirender di default 900 dan deklarasi `weight` tidak sampai ke font.

Tempel keluaran skrip itu apa adanya ke dalam laporan. Rentang sumbu sudah
diverifikasi dari tabel `fvar` sebelum task ini didispatch: Cabinet Grotesk
`wght 100..900`, Satoshi `wght 300..900`.

Matikan server setelah selesai. Skrip verifikasi ini tidak ikut dikomit.

- [ ] **Step 6: Commit**

```bash
cd /home/waxarsatia/test/company-profile
git add dml-web/src/fonts dml-web/src/lib/fonts.ts dml-web/src/app/layout.tsx \
  dml-web/package.json dml-web/bun.lock
git commit -m "feat: font self-hosted Cabinet Grotesk, Satoshi, dan Geist Mono via paket geist"
```

---

### Task 5: Hook prefers-reduced-motion

**Files:**
- Create: `dml-web/src/lib/motion/use-prefers-reduced-motion.ts`
- Create: `dml-web/src/lib/motion/use-prefers-reduced-motion.test.tsx`

**Interfaces:**
- Consumes: tidak ada
- Produces: `usePrefersReducedMotion(): boolean`. Mengembalikan `true` saat render pertama di server dan sebelum hidrasi, sehingga default aman adalah tanpa motion. Semua client leaf motion di Task 6, Task 7, Plan 5 memanggil hook ini.

- [ ] **Step 1: Tulis tes yang gagal**

Create `dml-web/src/lib/motion/use-prefers-reduced-motion.test.tsx`:

```tsx
import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

type Listener = (event: MediaQueryListEvent) => void;

function mockMatchMedia(initialMatches: boolean) {
  const listeners = new Set<Listener>();
  const mql = {
    matches: initialMatches,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: (_: string, cb: Listener) => listeners.add(cb),
    removeEventListener: (_: string, cb: Listener) => listeners.delete(cb),
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mql),
  );
  return {
    emit(matches: boolean) {
      mql.matches = matches;
      listeners.forEach((cb) => cb({ matches } as MediaQueryListEvent));
    },
    listenerCount: () => listeners.size,
  };
}

describe("usePrefersReducedMotion", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("menanyakan media query yang tepat", () => {
    mockMatchMedia(false);
    renderHook(() => usePrefersReducedMotion());
    expect(window.matchMedia).toHaveBeenCalledWith(
      "(prefers-reduced-motion: reduce)",
    );
  });

  it("mengembalikan false ketika pengguna tidak meminta reduced motion", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it("mengembalikan true ketika pengguna meminta reduced motion", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it("bereaksi ketika preferensi berubah saat halaman terbuka", () => {
    const media = mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
    act(() => media.emit(true));
    expect(result.current).toBe(true);
  });

  it("melepas listener saat unmount", () => {
    const media = mockMatchMedia(false);
    const { unmount } = renderHook(() => usePrefersReducedMotion());
    expect(media.listenerCount()).toBe(1);
    unmount();
    expect(media.listenerCount()).toBe(0);
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `cd dml-web && bun run test src/lib/motion/use-prefers-reduced-motion.test.tsx`
Expected: FAIL, modul tidak ditemukan.

- [ ] **Step 3: Implementasi**

Create `dml-web/src/lib/motion/use-prefers-reduced-motion.ts`:

```ts
"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onStoreChange: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

/**
 * Di server dan selama hidrasi kita belum tahu preferensi pengguna, dan pilihan
 * yang aman adalah tidak menganimasikan apa pun. React memakai snapshot server
 * ini untuk render pertama, lalu beralih ke nilai asli setelah hidrasi selesai,
 * jadi tidak ada mismatch.
 */
function getServerSnapshot(): boolean {
  return true;
}

/**
 * matchMedia adalah external store, jadi useSyncExternalStore adalah API React
 * yang memang untuk ini. Versi useState plus useEffect memanggil setState
 * sinkron di dalam efek, yang memicu render bertingkat dan ditolak aturan
 * react-hooks/set-state-in-effect.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

- [ ] **Step 4: Jalankan tes untuk memastikan lolos**

Run: `cd dml-web && bun run test src/lib/motion/use-prefers-reduced-motion.test.tsx`
Expected: PASS, empat assertion hijau. Tes keempat adalah yang penting: kebocoran listener di hook ini akan terulang di setiap komponen motion.

- [ ] **Step 5: Commit**

```bash
cd /home/waxarsatia/test/company-profile
git add dml-web/src/lib/motion/
git commit -m "feat: hook usePrefersReducedMotion dengan default aman dan cleanup"
```

---

### Task 6: Provider Lenis dan registry GSAP

**Files:**
- Create: `dml-web/src/lib/motion/gsap.ts`
- Create: `dml-web/src/components/motion/smooth-scroll-provider.tsx`
- Modify: `dml-web/src/app/layout.tsx`

**Interfaces:**
- Consumes: `usePrefersReducedMotion` dari Task 5
- Produces:
  - `registerGsap(): void` dari `@/lib/motion/gsap`, aman dipanggil berkali-kali
  - `<SmoothScrollProvider>{children}</SmoothScrollProvider>`, membungkus seluruh aplikasi. Provider ini tidak merender elemen apa pun, hanya mengembalikan `children`, sehingga tidak mengubah struktur DOM atau memindahkan konten ke client.

- [ ] **Step 1: Registry GSAP**

Create `dml-web/src/lib/motion/gsap.ts`:

```ts
"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registered = false;

/**
 * GSAP 3.13 dan seluruh pluginnya gratis termasuk untuk penggunaan komersial.
 * Registrasi harus terjadi tepat satu kali per sesi browser.
 */
export function registerGsap(): void {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  registered = true;
}

export { gsap, ScrollTrigger, SplitText };
```

- [ ] **Step 2: Provider Lenis**

Create `dml-web/src/components/motion/smooth-scroll-provider.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { registerGsap, ScrollTrigger, gsap } from "@/lib/motion/gsap";

/**
 * Tidak merender elemen apa pun. Membungkus aplikasi tanpa mengubah DOM,
 * sehingga seluruh konten tetap berada di Server Component.
 *
 * Provider ini TIDAK BOLEH memanggil ScrollTrigger.getAll().kill(). Dia tidak
 * membuat satu pun ScrollTrigger, jadi dia tidak berhak membunuh milik siapa
 * pun. Trigger yang tidak ikut bergantung pada reduced, misalnya yang tugasnya
 * cuma onEnter untuk memuat kanvas 3D, tidak akan pernah dibuat ulang kalau
 * dibunuh dari sini. Pembersihan trigger adalah tanggung jawab masing masing
 * komponen lewat ctx.revert(), sesuai Global Constraints.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    registerGsap();
    if (reduced) return;

    const lenis = new Lenis({ autoRaf: false });

    // Satu ticker untuk Lenis dan GSAP. Dua RAF loop terpisah akan
    // saling mendahului dan membuat ScrollTrigger salah menghitung posisi.
    const onTick = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(onTick);

    // lagSmoothing global. Dimatikan supaya Lenis yang memegang kendali waktu,
    // lalu WAJIB dikembalikan ke default di cleanup. Nilai 500 dan 33 itu
    // default GSAP yang sebenarnya, terbaca di gsap-core.js.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
```

- [ ] **Step 3: Pasang di layout**

Modify `dml-web/src/app/layout.tsx`, ganti isi `<body>`:

```tsx
import { SmoothScrollProvider } from "@/components/motion/smooth-scroll-provider";

// ...

      <body>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
```

- [ ] **Step 4: Verifikasi otomatis**

Wajib lewat browser headless, bukan DevTools manual. Yang menjalankan rencana ini
adalah subagent, dan langkah manual hanya menghasilkan klaim tanpa bukti.

Tambahkan sementara `<div style={{ height: "300vh" }} />` di `src/app/page.tsx`
supaya halaman punya tinggi untuk di-scroll, jalankan `bun run build` lalu
`bun run start`, kemudian jalankan skrip Playwright sekali pakai yang menegaskan:

1. **Lenis aktif secara default.** Tanpa emulasi apa pun, elemen `<html>` membawa
   class `lenis`. Lenis memasang class itu sendiri saat konstruksi.
2. **Gerbang reduced motion benar benar menutup.** Dengan
   `page.emulateMedia({ reducedMotion: "reduce" })` lalu reload, `<html>` **tidak**
   membawa class `lenis`. Ini yang membuktikan hook Task 5 benar benar mengendalikan
   provider, bukan sekadar terpasang.
3. **Console bersih.** Tidak ada warning GSAP soal plugin yang belum terdaftar, dan
   tidak ada error apa pun, di kedua kondisi.

Tempel keluaran skrip apa adanya ke dalam laporan. Hapus kembali div sementara dan
matikan server setelah selesai. Skrip verifikasinya tidak ikut dikomit.

Perhatikan bahwa poin 2 adalah satu satunya cara memastikan gerbang aksesibilitas
situs ini bekerja. Kalau gerbangnya bocor, seluruh situs tetap beranimasi untuk
pengguna yang secara eksplisit meminta sebaliknya, tanpa error apa pun.

- [ ] **Step 5: Commit**

```bash
cd /home/waxarsatia/test/company-profile
git add dml-web/src/lib/motion/gsap.ts dml-web/src/components/motion dml-web/src/app/layout.tsx
git commit -m "feat: provider Lenis dengan ticker tunggal GSAP dan gerbang reduced motion"
```

---

### Task 7: Data perusahaan dan struktur navigasi

**Files:**
- Create: `dml-web/src/content/types.ts`
- Create: `dml-web/src/content/company.ts`
- Create: `dml-web/src/content/navigation.ts`
- Create: `dml-web/src/content/company.test.ts`

**Interfaces:**
- Consumes: tidak ada
- Produces:
  - `COMPANY: Company` dengan field `legalName`, `foundedIso`, `founder`, `parent`, `phone`, `offices: Office[]`, `certifications: string[]`, `fleetSummary`
  - `NAV_ITEMS: NavItem[]` dengan `NavItem = { label: string; href: string; external?: boolean }`
  - `FOOTER_GROUPS: FooterGroup[]`
  - Plan 3 dan Plan 5 membaca angka armada dan alamat hanya dari sini.

- [ ] **Step 1: Definisikan tipe**

Create `dml-web/src/content/types.ts`:

```ts
export type Office = {
  label: string;
  street: string;
  city: string;
  postalCode: string;
  province: string;
};

export type Company = {
  legalName: string;
  shortName: string;
  foundedIso: string;
  founder: string;
  parent: string;
  phone: string;
  offices: Office[];
  certifications: string[];
  fleetSummary: { vessels: number; totalDwt: number };
};

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterGroup = {
  heading: string;
  items: NavItem[];
};
```

- [ ] **Step 2: Tulis tes yang gagal**

Create `dml-web/src/content/company.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { COMPANY } from "./company";
import { NAV_ITEMS } from "./navigation";

describe("COMPANY", () => {
  it("mencatat tanggal berdiri sebagai ISO yang bisa diparse", () => {
    expect(Number.isNaN(Date.parse(COMPANY.foundedIso))).toBe(false);
    expect(new Date(COMPANY.foundedIso).getFullYear()).toBe(1985);
  });

  it("punya dua kantor", () => {
    expect(COMPANY.offices).toHaveLength(2);
  });

  it("nomor telepon dalam format E.164", () => {
    expect(COMPANY.phone).toMatch(/^\+62\d{7,13}$/);
  });
});

describe("NAV_ITEMS", () => {
  it("setiap href internal diawali garis miring", () => {
    for (const item of NAV_ITEMS.filter((i) => !i.external)) {
      expect(item.href.startsWith("/")).toBe(true);
    }
  });

  it("setiap tautan eksternal memakai URL absolut", () => {
    for (const item of NAV_ITEMS.filter((i) => i.external)) {
      expect(item.href).toMatch(/^https:\/\//);
    }
  });

  it("memuat BookJambo sebagai tautan eksternal, bukan route", () => {
    const bookJambo = NAV_ITEMS.find((i) => i.label === "BookJambo");
    expect(bookJambo?.external).toBe(true);
    expect(bookJambo?.href).toBe("https://dutabahari.id");
  });

  it("tidak melebihi enam item, agar nav muat satu baris di desktop", () => {
    expect(NAV_ITEMS.length).toBeLessThanOrEqual(6);
  });
});
```

- [ ] **Step 3: Jalankan tes untuk memastikan gagal**

Run: `cd dml-web && bun run test src/content/company.test.ts`
Expected: FAIL, modul tidak ditemukan.

- [ ] **Step 4: Implementasi data perusahaan**

Create `dml-web/src/content/company.ts`:

```ts
import type { Company } from "./types";

/**
 * Seluruh angka di bawah berasal dari sumber publik: SinarAlam Corporation,
 * ptdml.com, MagicPort, dan arsip Banjarmasin Post.
 * Wajib dikonfirmasi klien sebelum situs live.
 */
export const COMPANY: Company = {
  legalName: "PT Dutabahari Menara Line",
  shortName: "Dutabahari Menara Line",
  foundedIso: "1985-11-30", // unverified: SinarAlam Corporation
  founder: "Herman Chandra", // unverified: SinarAlam Corporation
  parent: "SinarAlam Corporation",
  phone: "+625113268280", // unverified: SinarAlam Corporation
  offices: [
    {
      label: "Kantor Pusat",
      street: "Jl. Kapten Piere Tendean 174",
      city: "Banjarmasin",
      postalCode: "70123",
      province: "Kalimantan Selatan",
    },
    {
      label: "Kantor Gadang",
      street: "Jl. AES Nasution, Gadang",
      city: "Banjarmasin Tengah",
      postalCode: "70122",
      province: "Kalimantan Selatan",
    },
  ],
  certifications: ["ISM Code", "ISPS Code", "SIRE", "ISO 9001:2015"],
  fleetSummary: {
    vessels: 15, // unverified: MagicPort
    totalDwt: 40546, // unverified: MagicPort
  },
};
```

- [ ] **Step 5: Implementasi navigasi**

Create `dml-web/src/content/navigation.ts`:

```ts
import type { FooterGroup, NavItem } from "./types";

export const NAV_ITEMS: NavItem[] = [
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Bisnis Kami", href: "/bisnis" },
  { label: "Karier", href: "/karier" },
  { label: "Artikel", href: "/artikel" },
  { label: "Kontak", href: "/kontak" },
  { label: "BookJambo", href: "https://dutabahari.id", external: true },
];

export const FOOTER_GROUPS: FooterGroup[] = [
  {
    heading: "Bisnis",
    items: [
      { label: "Transportasi BBM", href: "/bisnis/transportasi-bbm" },
      { label: "Penumpang Ro-Ro", href: "/bisnis/penumpang-roro" },
      { label: "Galangan Kapal", href: "/bisnis/galangan-kapal" },
    ],
  },
  {
    heading: "Perusahaan",
    items: [
      { label: "Silsilah", href: "/tentang-kami#silsilah" },
      { label: "Company Profile", href: "/tentang-kami#profil" },
      { label: "Karier", href: "/karier" },
    ],
  },
  {
    heading: "Layanan",
    items: [
      { label: "Pesan Tiket Ro-Ro", href: "https://dutabahari.id", external: true },
      {
        label: "Permintaan Informasi Bisnis",
        href: "/bisnis/transportasi-bbm/permintaan-informasi",
      },
      { label: "Kontak", href: "/kontak" },
    ],
  },
];
```

- [ ] **Step 6: Jalankan tes untuk memastikan lolos**

Run: `cd dml-web && bun run test src/content/company.test.ts`
Expected: PASS, tujuh tes hijau (sembilan titik `expect()`).

- [ ] **Step 7: Commit**

```bash
cd /home/waxarsatia/test/company-profile
git add dml-web/src/content
git commit -m "feat: data perusahaan dan struktur navigasi dengan penanda unverified"
```

---

### Task 8: Shell layout, header, footer, skip link

**Files:**
- Create: `dml-web/src/components/layout/skip-link.tsx`
- Create: `dml-web/src/components/layout/external-link.tsx`
- Create: `dml-web/src/components/layout/site-header.tsx`
- Create: `dml-web/src/components/layout/site-footer.tsx`
- Modify: `dml-web/src/app/layout.tsx`
- Modify: `dml-web/src/app/page.tsx`

**Interfaces:**
- Consumes: `NAV_ITEMS`, `FOOTER_GROUPS`, `COMPANY` dari Task 7
- Produces: `<SiteHeader />`, `<SiteFooter />`, `<SkipLink />`, `<ExternalLink href label />`. Semuanya Server Component. Tidak satu pun memakai `'use client'`.

- [ ] **Step 1: Skip link**

Create `dml-web/src/components/layout/skip-link.tsx`:

```tsx
export function SkipLink() {
  return (
    <a
      href="#konten-utama"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-5 focus:py-2 focus:text-on-accent"
    >
      Lompat ke konten utama
    </a>
  );
}
```

- [ ] **Step 2: Tautan eksternal**

Create `dml-web/src/components/layout/external-link.tsx`:

```tsx
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

export function ExternalLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
      <ArrowUpRight size={14} weight="regular" aria-hidden />
      <span className="sr-only">(membuka situs lain)</span>
    </a>
  );
}
```

Import dari `@phosphor-icons/react/dist/ssr` penting: entry point itu aman dipakai di Server Component, sedangkan entry point utama menuntut `'use client'`.

- [ ] **Step 3: Header**

Create `dml-web/src/components/layout/site-header.tsx`:

```tsx
import Link from "next/link";
import { NAV_ITEMS } from "@/content/navigation";
import { COMPANY } from "@/content/company";
import { ExternalLink } from "./external-link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-surface-3 bg-surface/85 backdrop-blur md:h-[72px]">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-4 md:px-8">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight"
        >
          {COMPANY.shortName}
        </Link>

        <nav aria-label="Navigasi utama" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                {item.external ? (
                  <ExternalLink
                    href={item.href}
                    label={item.label}
                    className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
                  />
                ) : (
                  <Link
                    href={item.href}
                    className="text-sm text-ink-muted transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Menu mobile dibangun di Task 9 sebagai satu-satunya client leaf di header. */}
      </div>
    </header>
  );
}
```

Tinggi header dikunci 64px di mobile dan 72px di desktop, di bawah batas 80px dari spec.

- [ ] **Step 4: Footer**

Create `dml-web/src/components/layout/site-footer.tsx`:

```tsx
import Link from "next/link";
import { COMPANY } from "@/content/company";
import { FOOTER_GROUPS } from "@/content/navigation";
import { ExternalLink } from "./external-link";

export function SiteFooter() {
  return (
    <footer className="border-t border-surface-3 bg-surface-2">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-16 md:grid-cols-[2fr_1fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-xl font-bold">{COMPANY.legalName}</p>
          <p className="mt-3 max-w-[38ch] text-sm text-ink-muted">
            Perusahaan pelayaran Banjarmasin sejak 1985. Bagian dari{" "}
            {COMPANY.parent}.
          </p>
          <address className="mt-6 space-y-4 not-italic text-sm text-ink-muted">
            {COMPANY.offices.map((office) => (
              <div key={office.street}>
                <p className="text-ink">{office.label}</p>
                <p>{office.street}</p>
                <p>
                  {office.city} {office.postalCode}, {office.province}
                </p>
              </div>
            ))}
          </address>
        </div>

        {FOOTER_GROUPS.map((group) => (
          <div key={group.heading}>
            <p className="font-display text-sm font-bold">{group.heading}</p>
            <ul className="mt-4 space-y-3">
              {group.items.map((item) => (
                <li key={item.href}>
                  {item.external ? (
                    <ExternalLink
                      href={item.href}
                      label={item.label}
                      className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
                    />
                  ) : (
                    <Link
                      href={item.href}
                      className="text-sm text-ink-muted transition-colors hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-surface-3">
        <div className="mx-auto max-w-[1400px] px-4 py-6 text-xs text-ink-muted md:px-8">
          <p>
            {new Date().getFullYear()} {COMPANY.legalName}
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Rakit di root layout**

Modify `dml-web/src/app/layout.tsx`, ganti isi `<body>`. **Pertahankan
`className="min-h-full flex flex-col"` yang sudah ada di tag `<body>`** dan
tambahkan `flex-1` di `<main>`:

```tsx
      <body className="min-h-full flex flex-col">
        <SkipLink />
        <SmoothScrollProvider>
          <SiteHeader />
          <main id="konten-utama" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </SmoothScrollProvider>
      </body>
```

Tambahkan import `SkipLink`, `SiteHeader`, `SiteFooter` dari `@/components/layout/...`.

`flex-1` di `<main>` bukan kosmetik. `body` sudah `flex flex-col` sejak scaffold,
tapi tanpa elemen yang tumbuh, deklarasi itu tidak berbuat apa apa dan footer
jatuh tepat di bawah konten alih alih terkunci ke dasar viewport pada halaman
pendek, misalnya Karier sebelum isinya ditulis.

- [ ] **Step 6: Beranda placeholder**

Replace `dml-web/src/app/page.tsx`:

```tsx
export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-24 md:px-8">
      <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
        Menggerakkan energi dan orang di perairan Kalimantan sejak 1985.
      </h1>
      <p className="mt-6 max-w-[55ch] text-ink-muted">
        Beranda sinematik dibangun di Plan 5. Halaman ini sengaja polos agar
        fondasi bisa diverifikasi lebih dulu.
      </p>
    </div>
  );
}
```

- [ ] **Step 7: Verifikasi otomatis**

Wajib lewat browser headless. Jalankan `bun run build` lalu `bun run start`,
kemudian skrip Playwright sekali pakai terhadap `http://localhost:3000` pada
viewport 1024 lebar yang menegaskan:

1. **Header satu baris di desktop.** `nav[aria-label="Navigasi utama"]` terlihat
   (bukan `hidden`), dan tinggi elemen `header` sama dengan 72 piksel.
2. **Skip link berfungsi.** Tab pertama dari `body` memindahkan fokus ke elemen
   dengan teks "Lompat ke konten utama", elemen itu terlihat saat fokus
   (`focus:not-sr-only`), dan menekan Enter memindahkan fokus ke elemen dengan
   id `konten-utama`.
3. **BookJambo eksternal.** Tautan dengan teks "BookJambo" membawa
   `target="_blank"`, `rel` memuat `noopener` dan `noreferrer`, dan `href`
   persis `https://dutabahari.id`.
4. **Footer terkunci ke dasar pada halaman pendek.** Pada viewport tinggi 900px,
   batas bawah elemen `footer` berada pada atau melewati batas bawah viewport.
   Ini yang membuktikan `flex-1` di `<main>` benar benar bekerja, bukan sekadar
   terpasang.

Tempel keluaran skrip apa adanya ke dalam laporan. Matikan server setelah
selesai. Skrip verifikasinya tidak ikut dikomit.

- [ ] **Step 8: Commit**

```bash
cd /home/waxarsatia/test/company-profile
git add dml-web/src/components/layout dml-web/src/app/layout.tsx dml-web/src/app/page.tsx
git commit -m "feat: shell layout dengan header satu baris, footer, dan skip link"
```

---

### Task 9: Menu mobile sebagai satu-satunya client leaf di header

**Files:**
- Create: `dml-web/src/components/layout/mobile-menu.tsx`
- Modify: `dml-web/src/components/layout/site-header.tsx`

**Interfaces:**
- Consumes: `NAV_ITEMS` dari Task 7
- Produces: `<MobileMenu items={NAV_ITEMS} />`. Menerima item sebagai prop dari Server Component sehingga data tetap dirender server dan tidak diambil ulang di client.

- [ ] **Step 1: Implementasi**

Create `dml-web/src/components/layout/mobile-menu.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import type { NavItem } from "@/content/types";

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        // Fokus kembali ke tombol pemicu. Tanpa ini, pengguna keyboard yang
        // sedang berada di dalam menu kehilangan fokus sepenuhnya begitu
        // Escape membuat nav-nya hidden.
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="menu-mobile"
        className="flex size-10 items-center justify-center rounded-full transition-transform active:scale-[0.98]"
      >
        {open ? <X size={22} weight="regular" /> : <List size={22} weight="regular" />}
        <span className="sr-only">{open ? "Tutup menu" : "Buka menu"}</span>
      </button>

      <nav
        id="menu-mobile"
        aria-label="Navigasi utama mobile"
        hidden={!open}
        className="fixed inset-x-0 top-16 border-b border-surface-3 bg-surface px-4 pb-8 pt-4"
      >
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.href}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-3 text-lg"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  href={item.href}
                  className="block py-3 text-lg"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
```

Atribut `hidden` dipakai, bukan render kondisional, supaya seluruh tautan tetap ada di HTML server dan tetap bisa ditemukan crawler serta pengguna tanpa JavaScript.

- [ ] **Step 2: Pasang di header**

Modify `dml-web/src/components/layout/site-header.tsx`, ganti komentar placeholder di Task 8 Step 3 dengan:

```tsx
        <MobileMenu items={NAV_ITEMS} />
```

Tambahkan `import { MobileMenu } from "./mobile-menu";`.

- [ ] **Step 3: Verifikasi otomatis**

Wajib lewat browser headless. Jalankan `bun run build` lalu `bun run start`,
kemudian skrip Playwright sekali pakai pada viewport 390 lebar yang menegaskan:

1. **Toggle responsif.** Tombol menu terlihat, `nav[aria-label="Navigasi utama"]`
   (nav desktop dari Task 8) tidak terlihat.
2. **Escape menutup DAN mengembalikan fokus.** Klik tombol untuk membuka menu,
   pastikan `aria-expanded="true"`, tekan Escape, lalu tegaskan dua hal:
   `aria-expanded` kembali `"false"`, dan elemen yang sedang fokus adalah tombol
   pemicu itu sendiri, bukan `body` atau elemen lain.
3. **Tautan tetap ada di HTML server saat menu tertutup.** Ambil HTML mentah
   lewat `page.content()` sebelum interaksi apa pun, dan tegaskan setiap label
   `NAV_ITEMS` muncul sebagai teks di dalamnya. Ini yang membuktikan `hidden`
   dipakai, bukan render kondisional yang membuang tautan dari DOM.

Tempel keluaran skrip apa adanya ke dalam laporan. Matikan server setelah
selesai. Skrip verifikasinya tidak ikut dikomit.

- [ ] **Step 4: Commit**

```bash
cd /home/waxarsatia/test/company-profile
git add dml-web/src/components/layout
git commit -m "feat: menu mobile yang tetap merender tautan di HTML server"
```

---

### Task 10: Primitif SEO, metadata, JSON-LD, sitemap, robots

**Files:**
- Create: `dml-web/src/lib/seo/metadata.ts`
- Create: `dml-web/src/lib/seo/json-ld.ts`
- Create: `dml-web/src/lib/seo/json-ld.test.ts`
- Create: `dml-web/src/app/sitemap.ts`
- Create: `dml-web/src/app/robots.ts`
- Modify: `dml-web/src/app/layout.tsx`
- Create: `dml-web/.env.example`

**Interfaces:**
- Consumes: `COMPANY` dari Task 7
- Produces:
  - `buildMetadata(input: { title: string; description: string; path: string }): Metadata`
  - `organizationJsonLd(): object`
  - `breadcrumbJsonLd(trail: Array<{ name: string; path: string }>): object`
  - `safeJsonLdString(data: unknown): string`
  - `SITE_URL: string`
  - Plan 3, 4, 5 memanggil `buildMetadata` di setiap `generateMetadata` dan tidak pernah merakit objek `Metadata` sendiri. Setiap `dangerouslySetInnerHTML` yang menyisipkan JSON-LD wajib lewat `safeJsonLdString`, tidak pernah `JSON.stringify` langsung, karena Plan 4 mengisi JSON-LD artikel dari input admin.

- [ ] **Step 1: Tulis tes yang gagal**

Create `dml-web/src/lib/seo/json-ld.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { breadcrumbJsonLd, organizationJsonLd } from "./json-ld";

describe("organizationJsonLd", () => {
  const data = organizationJsonLd() as Record<string, unknown>;

  it("memakai tipe Organization", () => {
    expect(data["@type"]).toBe("Organization");
  });

  it("mencantumkan tanggal berdiri", () => {
    expect(data.foundingDate).toBe("1985-11-30");
  });

  it("mencantumkan kedua alamat kantor", () => {
    expect(Array.isArray(data.address)).toBe(true);
    expect((data.address as unknown[]).length).toBe(2);
  });

  it("memakai URL absolut", () => {
    expect(String(data.url)).toMatch(/^https?:\/\//);
  });
});

describe("breadcrumbJsonLd", () => {
  const data = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Bisnis Kami", path: "/bisnis" },
  ]) as Record<string, unknown>;

  it("memakai tipe BreadcrumbList", () => {
    expect(data["@type"]).toBe("BreadcrumbList");
  });

  it("memberi posisi berurutan mulai dari satu", () => {
    const items = data.itemListElement as Array<Record<string, unknown>>;
    expect(items.map((i) => i.position)).toEqual([1, 2]);
  });

  it("mengubah path relatif jadi URL absolut", () => {
    const items = data.itemListElement as Array<Record<string, unknown>>;
    // Optional chaining, bukan non-null assertion: noUncheckedIndexedAccess
    // membuat items[1] bertipe T | undefined, dan kalau memang undefined tes
    // ini gagal wajar lewat toMatch, bukan lewat klaim ke compiler.
    expect(String(items[1]?.item)).toMatch(/^https?:\/\/.+\/bisnis$/);
  });
});
```

- [ ] **Step 2: Jalankan tes untuk memastikan gagal**

Run: `cd dml-web && bun run test src/lib/seo/json-ld.test.ts`
Expected: FAIL, modul tidak ditemukan.

- [ ] **Step 3: Implementasi metadata helper**

Create `dml-web/src/lib/seo/metadata.ts`:

```ts
import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

export function buildMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "PT Dutabahari Menara Line",
      locale: "id_ID",
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
```

- [ ] **Step 4: Implementasi JSON-LD**

Create `dml-web/src/lib/seo/json-ld.ts`:

```ts
import { COMPANY } from "@/content/company";
import { absoluteUrl, SITE_URL } from "./metadata";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.legalName,
    url: SITE_URL,
    foundingDate: COMPANY.foundedIso,
    founder: { "@type": "Person", name: COMPANY.founder },
    parentOrganization: { "@type": "Organization", name: COMPANY.parent },
    telephone: COMPANY.phone,
    address: COMPANY.offices.map((office) => ({
      "@type": "PostalAddress",
      streetAddress: office.street,
      addressLocality: office.city,
      postalCode: office.postalCode,
      addressRegion: office.province,
      addressCountry: "ID",
    })),
  };
}

export function breadcrumbJsonLd(
  trail: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: absoluteUrl(entry.path),
    })),
  };
}
```

- [ ] **Step 5: Jalankan tes untuk memastikan lolos**

Run: `cd dml-web && bun run test src/lib/seo/json-ld.test.ts`
Expected: PASS, tujuh tes hijau (delapan titik `expect()`).

- [ ] **Step 6: Sitemap dan robots**

Create `dml-web/src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/metadata";

// Slug artikel ditambahkan di Plan 4 ketika Payload sudah ada.
const STATIC_PATHS = [
  "/",
  "/tentang-kami",
  "/bisnis",
  "/bisnis/transportasi-bbm",
  "/bisnis/penumpang-roro",
  "/bisnis/galangan-kapal",
  "/karier",
  "/artikel",
  "/kontak",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: path === "/artikel" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
```

Create `dml-web/src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
```

Create `dml-web/.env.example`:

```
NEXT_PUBLIC_SITE_URL=https://dutabaharimenaraline.co.id
```

- [ ] **Step 7: Sisipkan JSON-LD di root layout**

Tambahkan helper escape di `dml-web/src/lib/seo/json-ld.ts`, di akhir berkas:

```ts
/**
 * JSON.stringify biasa tidak meng-escape "<", jadi field string apa pun yang
 * kebetulan memuat "</script>" bisa menutup tag lebih awal dan menyuntik
 * markup. COMPANY sekarang statis dan aman, tapi Plan 4 akan memakai fungsi
 * ini juga untuk JSON-LD artikel yang datang dari input admin di Payload,
 * jadi escape-nya dipasang di sini, sekali, bukan di titik pemakaian.
 */
export function safeJsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\u003c");
}
```

Modify `dml-web/src/app/layout.tsx`, tambahkan tepat sebelum `</body>`:

```tsx
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLdString(organizationJsonLd()),
          }}
        />
```

Tambahkan `import { organizationJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";`.

Ganti juga `export const metadata` yang ditulis di Task 4 dengan:

```tsx
export const metadata = buildMetadata({
  title: "PT Dutabahari Menara Line",
  description:
    "Perusahaan pelayaran Banjarmasin sejak 1985. Transportasi BBM, penyeberangan ro-ro, dan galangan kapal.",
  path: "/",
});
```

- [ ] **Step 8: Verifikasi otomatis**

Wajib lewat browser headless dan `fetch`, bukan buka tab manual. Jalankan
`bun run build` lalu `bun run start`, kemudian skrip sekali pakai yang
menegaskan:

1. **Sitemap.** `fetch("http://localhost:3000/sitemap.xml")` mengembalikan 200,
   dan parsing XML-nya menghasilkan tepat sembilan elemen `<url>`.
2. **Robots.** `fetch("http://localhost:3000/robots.txt")` mengembalikan 200 dan
   isinya memuat baris yang diawali `Sitemap:`.
3. **JSON-LD valid dan aman.** Ambil HTML beranda lewat Playwright, cari elemen
   `script[type="application/ld+json"]`, `JSON.parse()` isi teksnya (harus
   berhasil parse, membuktikan escaping tidak merusak JSON), dan tegaskan
   `"@type"` sama dengan `"Organization"`.
4. **Canonical.** Elemen `link[rel="canonical"]` ada persis satu di `<head>`.

Tempel keluaran skrip apa adanya ke dalam laporan. Matikan server setelah
selesai. Skrip verifikasinya tidak ikut dikomit.

- [ ] **Step 9: Commit**

```bash
cd /home/waxarsatia/test/company-profile
git add dml-web/src/lib/seo dml-web/src/app/sitemap.ts dml-web/src/app/robots.ts \
  dml-web/src/app/layout.tsx dml-web/.env.example
git commit -m "feat: primitif SEO, metadata helper, JSON-LD, sitemap, robots"
```

---

### Task 11: Primitif reveal scroll

**Files:**
- Create: `dml-web/src/components/motion/reveal.tsx`

**Interfaces:**
- Consumes: `registerGsap`, `gsap`, `ScrollTrigger` dari Task 6; `usePrefersReducedMotion` dari Task 5
- Produces: `<Reveal as="div" stagger={0.06}>{children}</Reveal>`. Membungkus konten yang sudah dirender server dan hanya menganimasikan `opacity` serta `transform` anak langsungnya. Dipakai Plan 3 dan Plan 5.

- [ ] **Step 1: Implementasi**

Create `dml-web/src/components/motion/reveal.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/motion/gsap";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";

export function Reveal({
  children,
  stagger = 0.06,
  className,
}: {
  children: React.ReactNode;
  stagger?: number;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced || !root.current) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>(root.current!.children);
      gsap.from(targets, {
        opacity: 0,
        y: 24,
        duration: 0.6,
        ease: "power3.out",
        stagger,
        scrollTrigger: {
          trigger: root.current,
          start: "top 82%",
          once: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, [reduced, stagger]);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
```

`gsap.from` dipilih, bukan `gsap.set` lalu `gsap.to`, supaya state akhir adalah keadaan alami HTML. Jika JavaScript gagal dimuat, konten tetap terlihat penuh tanpa perlu style pemulihan.

- [ ] **Step 2: Verifikasi manual**

Sisipkan sementara di `src/app/page.tsx`:

```tsx
import { Reveal } from "@/components/motion/reveal";

// di dalam JSX, setelah paragraf yang sudah ada
<div style={{ height: "120vh" }} />
<Reveal className="space-y-4">
  <p>Baris satu</p>
  <p>Baris dua</p>
  <p>Baris tiga</p>
</Reveal>
```

Run: `cd dml-web && bun run dev`

1. Scroll ke bawah. Expected: tiga baris muncul berurutan dengan jeda pendek.
2. Aktifkan emulasi reduced motion, reload, scroll. Expected: ketiga baris langsung terlihat tanpa animasi.
3. Matikan JavaScript di DevTools, reload. Expected: ketiga baris tetap terlihat.

Hapus blok sementara setelah verifikasi.

- [ ] **Step 3: Commit**

```bash
cd /home/waxarsatia/test/company-profile
git add dml-web/src/components/motion/reveal.tsx
git commit -m "feat: primitif Reveal berbasis ScrollTrigger dengan cleanup dan gerbang reduced motion"
```

---

### Task 12: Gerbang kualitas otomatis

**Files:**
- Create: `dml-web/playwright.config.ts`
- Create: `dml-web/tests/e2e/no-js.spec.ts`
- Create: `dml-web/tests/e2e/reduced-motion.spec.ts`
- Create: `dml-web/tests/e2e/contrast-tokens.spec.ts`
- Modify: `dml-web/package.json`

**Interfaces:**
- Consumes: seluruh task sebelumnya
- Produces: perintah `bun run check` yang menjalankan lint, typecheck, test, build, dan doctor secara berurutan. Ini gerbang tunggal yang dipakai semua plan berikutnya sebelum menandai task selesai.

- [ ] **Step 1: Konfigurasi Playwright**

Create `dml-web/playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "bun run build && bun run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
```

- [ ] **Step 2: Tes tanpa JavaScript**

Create `dml-web/tests/e2e/no-js.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.use({ javaScriptEnabled: false });

test("konten dan navigasi hadir tanpa JavaScript", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // Setiap tautan navigasi utama harus ada di HTML server.
  for (const label of [
    "Tentang Kami",
    "Bisnis Kami",
    "Karier",
    "Artikel",
    "Kontak",
    "BookJambo",
  ]) {
    await expect(page.getByRole("link", { name: label }).first()).toHaveCount(1);
  }
});
```

- [ ] **Step 3: Tes reduced motion**

Create `dml-web/tests/e2e/reduced-motion.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test("konten tetap tampil penuh saat reduced motion aktif", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
});
```

- [ ] **Step 4: Tes kontras token**

Create `dml-web/tests/e2e/contrast-tokens.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

const ACCENT = "rgb(255, 90, 31)";
const INK = "rgb(242, 239, 233)";

test("tidak ada elemen dengan latar aksen yang memakai teks ink", async ({
  page,
}) => {
  await page.goto("/");

  const violations = await page.evaluate(
    ({ accent, ink }) => {
      const bad: string[] = [];
      for (const el of Array.from(document.querySelectorAll("*"))) {
        const style = getComputedStyle(el);
        if (style.backgroundColor === accent && style.color === ink) {
          bad.push(el.tagName + "." + String(el.className));
        }
      }
      return bad;
    },
    { accent: ACCENT, ink: INK },
  );

  // Kombinasi ini 2,72:1 dan gagal WCAG AA. Lihat spec bagian 6.2.
  expect(violations).toEqual([]);
});
```

- [ ] **Step 5: Script package.json**

Modify `dml-web/package.json`, bagian `scripts`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "doctor": "react-doctor . -y --blocking warning --no-score",
    "doctor:design": "react-doctor design",
    "check": "bun run lint && bun run typecheck && bun run test && bun run build && bun run doctor"
  }
}
```

- [ ] **Step 6: Jalankan seluruh gerbang**

Run: `cd dml-web && bun run check`
Expected: lima langkah lolos berurutan.

Run: `cd dml-web && bun run test:e2e`
Expected: tiga spec lolos.

Jika `bun run doctor` melaporkan warning yang memblokir, perbaiki sebelum commit. Itulah gunanya react-doctor dipasang sejak sekarang, bukan setelah lima plan menumpuk.

- [ ] **Step 7: Commit**

```bash
cd /home/waxarsatia/test/company-profile
git add dml-web/playwright.config.ts dml-web/tests dml-web/package.json
git commit -m "feat: gerbang kualitas, tes tanpa JS, reduced motion, kontras token, dan bun run check"
```

---

## Definition of Done, Plan 1

Seluruh poin berikut harus benar sebelum Plan 2 dimulai:

- [ ] `bun run check` lolos penuh
- [ ] `bun run test:e2e` lolos penuh
- [ ] Nav muat satu baris di 1024px, tinggi header 72px atau kurang
- [ ] Skip link berfungsi dengan keyboard
- [ ] Lenis aktif saat motion normal, dan tidak diinisialisasi sama sekali saat reduced motion
- [ ] Halaman tetap terbaca penuh dengan JavaScript dimatikan
- [ ] `sitemap.xml` dan `robots.txt` menghasilkan output benar
- [ ] Tidak ada permintaan jaringan ke domain font pihak ketiga
- [ ] Tidak ada em dash di seluruh berkas yang dibuat plan ini
