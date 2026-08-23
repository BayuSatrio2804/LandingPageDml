# Plan 8 — Cabang bisnis, legalitas, dan sapuan konsistensi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menutup seluruh cabang `/bisnis` yang selama ini ditunjuk navigasi tapi tidak pernah ada, mengisi tabel legalitas di `/tentang-kami#profil`, dan membereskan sitemap, copy usang, serta tiga utang teknis, sehingga tidak ada lagi tautan internal yang menuju halaman tidak ada kecuali `/artikel` yang menunggu Plan 9.

**Architecture:** Data korporat baru diekstrak dari `assets/CP DML.pdf` jadi dua berkas di `src/content/`, dijaga tes konsistensi silang terhadap `fleet.ts` dan `ports.ts` yang sudah ada. Empat halaman baru dibangun sebagai Server Component statis yang memakai ulang komponen presentasi yang sudah ada (`SectionHeader`, `FleetSpecTable`, `BlueprintSvg`, `CtaLink`, `TextField`, `SubmitButton`) dan tidak memuat aset WebGL apa pun. Form B2B memperluas fitur `src/features/inquiry/` yang sudah ada, bukan menulis form kedua dari nol.

**Tech Stack:** Next.js 16.3.1 App Router, React 19.2, Tailwind v4, Payload CMS 3 (Postgres), zod v4, react-hook-form, GSAP, vitest, Playwright, bun.

**Spec:** `docs/superpowers/specs/2026-08-23-dml-plan-8-halaman-bisnis-dan-artikel-design.md`

Plan ini mengerjakan bagian 4.1, 4.3, 4.4, 5, 6, 7, 8, 9, 11, 12, 13, 14, dan 18 dari spec itu. Bagian 10 (artikel) sengaja **tidak** dikerjakan di sini; ia jadi Plan 9. Alasan pemecahan ada di bagian 18 spec.

---

## Global Constraints

Setiap task tunduk pada seluruh butir di bawah ini. Tidak diulang per task.

- **Bahasa.** Seluruh copy yang tampil ke pengunjung, alt text, dan komentar kode ditulis dalam bahasa Indonesia. Pesan commit juga bahasa Indonesia, mengikuti seluruh riwayat repo.
- **bun saja.** `package.json` menetapkan `packageManager: bun@1.3.14`. Jangan pernah menjalankan `npm install` atau `yarn` di repo ini.
- **Sumber data.** Setiap angka atau fakta perusahaan yang baru wajib membawa komentar sumber dan `SourceTag` (`"cp-pdf" | "riset-publik" | "belum-terverifikasi"`, didefinisikan di `src/content/types.ts:12`). Apa pun yang tidak ada di `assets/CP DML.pdf` **tidak dibuat**. Kalau sebuah seksi ternyata tidak punya data sumber, seksi itu dihapus dari halaman, bukan diisi angka wajar.
- **Tidak ada WebGL di halaman baru.** Komparator armada 3D dan peta rute beranimasi tetap milik beranda saja. Halaman `/bisnis/*` memakai tabel, blueprint SVG, daftar, dan foto.
- **Tidak ada ScrollTrigger `pin`** di halaman mana pun yang dibuat plan ini. Kalau suatu saat dibutuhkan, `pin: true` hanya boleh pada panggung setinggi tepat `h-[100dvh]`, tidak pernah pada `<section>` pembungkus yang memuat konten tambahan di bawahnya.
- **Larangan visual** (master spec bagian 7.11, berlaku juga di halaman baru): tanpa marquee, custom cursor, scroll cue, eyebrow bernomor seksi, dot status dekoratif, strip lokasi atau cuaca, fake screenshot dari div, em dash, pill yang ditumpuk di atas foto, caption kredit foto palsu, dan label versi.
- **`transition-all` dilarang.** Repo saat ini nol dan itu diverifikasi ulang di Plan 6. Selalu sebut properti yang ditransisikan, misalnya `transition-colors`.
- **Aksesibilitas wajib**, semuanya adalah temuan nyata Plan 6 yang tidak boleh terulang:
  - Pembungkus tabel yang menggulir wajib `tabIndex={0}` + `role="region"` + `aria-label`.
  - Setiap input form membawa `autoComplete` yang benar.
  - Setiap heading memakai `text-pretty` (otomatis kalau memakai `SectionHeader`).
  - Tidak ada elemen interaktif yang tidak terjangkau keyboard selama animasi. Jangan pakai `autoAlpha` GSAP pada elemen yang memuat tautan atau tombol; pakai `opacity`.
- **Setiap halaman baru wajib** memanggil `buildMetadata` dari `@/lib/seo/metadata` dan menyisipkan `breadcrumbJsonLd` lewat `safeJsonLdString` dari `@/lib/seo/json-ld`.
- **Gambar memakai `next/image`, bukan `<img>` mentah.** Repo ini memakai `<Image>` di seluruh permukaan yang menampilkan foto; lihat `src/features/home/business-lines.tsx:71`. `eslint-config-next` mengaktifkan `@next/next/no-img-element`, jadi `<img>` mentah **menggagalkan `bun run lint`** — gerbang yang dijalankan setiap task.

  Blok kode di Task 5, 6, dan 7 menuliskan bentuk `<img src srcSet sizes alt width height>` supaya jelas frame mana yang dipakai dan alt text-nya dari mana. Konversikan setiap satu ke `<Image>` saat mengetiknya:

  ```tsx
  import Image from "next/image";
  import { MEDIA, avifSrc } from "@/lib/media/manifest";

  // Rasio tetap dan lebar penuh kontainer: pakai width/height eksplisit.
  <Image
    src={avifSrc(asset, 1600)}
    alt={asset.alt}
    width={1600}
    height={900}
    sizes="(min-width: 1400px) 1400px, 100vw"
    className="mt-10 aspect-[16/9] w-full rounded-card object-cover"
  />
  ```

  `<Image>` merangkai `srcSet` sendiri, jadi `avifSrcSet` tidak dipakai bersamanya dan tidak perlu diimpor di halaman-halaman ini. Untuk gambar di bawah lipatan (galeri alur STS di Task 6), `next/image` sudah lazy secara default; jangan menambahkan `loading="lazy"` manual. Jangan pula memberi `priority` pada gambar mana pun di halaman `/bisnis/*` — tidak satu pun dari mereka LCP beranda, dan `priority` yang ditabur sembarangan justru merebut bandwidth awal.
- **Postgres wajib hidup sebelum `bun run test:e2e`.** Kalau tidak, `kontak.spec.ts` gagal dengan timeout yang terbaca seperti bug UI padahal server action tidak bisa menyentuh database:
  ```bash
  docker compose up -d
  until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
  ```
- **Angka Lighthouse dari mesin ini tidak dipercaya sebagai bukti regresi.** Plan 4 mencatat run yang lolos sekali dan gagal tiga kali di rentang 5800 sampai 5930 ms karena kontensi CPU desktop. Ambang 5000 ms di `lighthouserc.json` **tidak boleh disentuh** plan ini.
- **Cwd.** Seluruh perintah dijalankan dari `dml-web/`, kecuali perintah `git` yang dijalankan dari akar repo `company-profile/`.
- **Commit tiap task.** Setiap task berakhir dengan satu commit. Jangan menumpuk beberapa task dalam satu commit.

---

## File Structure

**Dibuat:**

| Berkas | Tanggung jawab |
|---|---|
| `src/content/vessels.ts` | 66 nama kapal dari PDF hal. 04, terstruktur per kelas dan per lintasan |
| `src/content/vessels.test.ts` | Tes konsistensi silang vessels terhadap `fleet.ts` dan `ports.ts` |
| `src/content/legal-documents.ts` | 9 baris dokumen legal dari PDF hal. 06 |
| `src/content/legal-documents.test.ts` | Tes bentuk dan kelengkapan data legal |
| `src/features/fleet/vessel-roster.tsx` | Daftar nama kapal berkelompok, dipakai dua halaman bisnis |
| `src/features/fleet/vessel-roster.test.tsx` | Tes render roster |
| `src/features/fleet/route-table.tsx` | Tabel lima lintasan dengan kolom operator |
| `src/features/fleet/route-table.test.tsx` | Tes render tabel lintasan |
| `src/features/about/legal-table.tsx` | Tabel dokumen legal, jatuh ke daftar di mobile |
| `src/features/about/legal-table.test.tsx` | Tes render tabel legal |
| `src/features/inquiry/business-inquiry-form.tsx` | Form B2B, client component |
| `src/features/inquiry/business-inquiry-form.test.tsx` | Tes state form B2B |
| `src/app/(site)/bisnis/page.tsx` | Hub bisnis |
| `src/app/(site)/bisnis/transportasi-bbm/page.tsx` | Halaman lini BBM |
| `src/app/(site)/bisnis/penumpang-roro/page.tsx` | Halaman lini ro-ro |
| `src/app/(site)/bisnis/transportasi-bbm/permintaan-informasi/page.tsx` | Halaman form B2B |
| `src/app/sitemap.test.ts` | Tes setiap path sitemap menunjuk route yang ada |
| `tests/e2e/bisnis.spec.ts` | E2E cabang bisnis: navigasi, no-JS, form B2B |

**Dimodifikasi:**

| Berkas | Perubahan |
|---|---|
| `src/content/types.ts` | Tambah tipe `Vessel` dan `LegalDocument` |
| `src/lib/media/manifest.ts` | Tambah tiga set media baru |
| `src/lib/media/manifest.test.ts` | Tidak diubah, sudah generik terhadap seluruh set |
| `scripts/prepare-assets.ts` | Tambah pemetaan `RAW_SOURCE` untuk set baru |
| `src/features/inquiry/schema.ts` | Tambah `businessInquirySchema` |
| `src/features/inquiry/schema.test.ts` | Tambah kasus skema B2B |
| `src/features/inquiry/actions.ts` | Terima `company` dan `service`, kunci rate limit diperbaiki |
| `src/features/inquiry/actions.test.ts` | Tambah kasus B2B |
| `src/features/inquiry/rate-limit.ts` | Tambah bucket global dan util kunci dari `x-forwarded-for` |
| `src/features/inquiry/rate-limit.test.ts` | Tambah kasus hop tepercaya dan bucket global |
| `src/app/(site)/tentang-kami/page.tsx` | Sisipkan `LegalTable`, perbaiki copy Misi |
| `src/app/(site)/kontak/page.tsx` | Perbaiki copy usang dan grid |
| `src/app/sitemap.ts` | Sinkronkan daftar path |
| `src/lib/seo/json-ld.ts` | Hapus `jobPostingJsonLd` |
| `src/lib/seo/json-ld.test.ts` | Hapus describe `jobPostingJsonLd` |
| `src/components/motion/reveal.tsx` | `gsap.from` jadi `fromTo` + `clearProps` |
| `tests/e2e/a11y-viewport.spec.ts` | Tambah empat route baru ke `ROUTES` |
| `tests/e2e/tentang-kami.spec.ts` | Tinjau ulang guard `reducedMotion` |
| `.env.example` | Tambah `TRUSTED_PROXY_HOPS` |
| `README.md` | Struktur halaman baru, catatan `TRUSTED_PROXY_HOPS` |

---

## Task 1: Data armada, `src/content/vessels.ts`

**Files:**
- Create: `src/content/vessels.ts`
- Create: `src/content/vessels.test.ts`
- Modify: `src/content/types.ts` (tambah tipe `Vessel` setelah `FleetClass` di baris 106)

**Interfaces:**
- Consumes: `SourceTag` dari `src/content/types.ts:12`; `FLEET_CLASSES` dari `src/content/fleet.ts`; `ROUTE_LEGS` dari `src/features/route-map/ports.ts`.
- Produces: tipe `Vessel`; `VESSELS: Vessel[]`; `vesselsByClass(slug: string): Vessel[]`; `vesselsByRoute(routeId: string): Vessel[]`.

**Konteks yang perlu diketahui.** `fleet.ts` sudah menyimpan `vesselCount` per kelas (7 MT, 9 OB, 30 SPOB, 11 TB, 9 ro-ro) dan nama kapalnya cuma hidup sebagai komentar untuk dua kelas. Task ini mengeluarkan seluruh 66 nama jadi data terstruktur. Angka `vesselCount` yang sudah ada adalah wasit kebenarannya.

- [ ] **Step 1: Ekstrak teks PDF ke scratchpad sebagai rujukan**

Jangan mengetik ulang nama kapal dari layar. Keluaran `pdftotext` adalah sumbernya.

```bash
pdftotext -f 5 -l 5 -layout "../assets/CP DML.pdf" /tmp/dml-fleet-page.txt
cat /tmp/dml-fleet-page.txt
```

Perhatikan: keluaran ini menyisipkan potongan tagline (`"From Zero to`, `Hero with`, `Continuous`, `Improvement"`) di tengah kolom Oil Barge dan SPOB, karena tagline itu tergambar melintang di latar halaman. Baris-baris itu dibuang. Nomor halaman cetak di PDF adalah `04`, sedangkan nomor halaman fisiknya 5; itulah sebabnya `-f 5`.

- [ ] **Step 2: Tambahkan tipe `Vessel` ke `src/content/types.ts`**

Sisipkan tepat setelah blok `FleetClass` yang berakhir di baris 106.

```ts
/**
 * Satu kapal bernama dari daftar armada company profile halaman 04.
 * `classSlug` menunjuk FleetClass.slug di fleet.ts; `routeId` hanya diisi
 * untuk kapal ro-ro, menunjuk RouteLeg.id di features/route-map/ports.ts.
 */
export type Vessel = {
  name: string;
  classSlug: string;
  routeId?: string;
  source: SourceTag;
};
```

- [ ] **Step 3: Tulis tes yang gagal**

Buat `src/content/vessels.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { VESSELS, vesselsByClass, vesselsByRoute } from "./vessels";
import { FLEET_CLASSES } from "./fleet";
import { ROUTE_LEGS } from "@/features/route-map/ports";

describe("VESSELS", () => {
  it("memuat 66 kapal, sesuai hitungan daftar PDF halaman 04", () => {
    expect(VESSELS).toHaveLength(66);
  });

  it("jumlah per kelas cocok dengan vesselCount di fleet.ts", () => {
    for (const fleetClass of FLEET_CLASSES) {
      expect(
        vesselsByClass(fleetClass.slug).length,
        `kelas ${fleetClass.slug}`,
      ).toBe(fleetClass.vesselCount);
    }
  });

  it("setiap classSlug menunjuk kelas yang benar-benar ada", () => {
    const known = new Set(FLEET_CLASSES.map((fleetClass) => fleetClass.slug));
    for (const vessel of VESSELS) {
      expect(known.has(vessel.classSlug), `kapal ${vessel.name}`).toBe(true);
    }
  });

  it("setiap routeId menunjuk lintasan yang benar-benar ada", () => {
    const known = new Set(ROUTE_LEGS.map((leg) => leg.id));
    for (const vessel of VESSELS) {
      if (!vessel.routeId) continue;
      expect(known.has(vessel.routeId), `kapal ${vessel.name}`).toBe(true);
    }
  });

  it("hanya kapal ro-ro yang punya routeId", () => {
    for (const vessel of VESSELS) {
      if (vessel.routeId) expect(vessel.classSlug).toBe("ro-ro-ferry");
    }
  });

  it("kelima lintasan punya minimal satu kapal", () => {
    for (const leg of ROUTE_LEGS) {
      expect(vesselsByRoute(leg.id).length, `lintasan ${leg.id}`).toBeGreaterThan(0);
    }
  });

  it("tidak ada nama duplikat", () => {
    const names = VESSELS.map((vessel) => vessel.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("tidak ada sisa teks tagline yang ikut terekstrak", () => {
    for (const vessel of VESSELS) {
      expect(vessel.name).not.toMatch(/zero|hero|continuous|improvement/i);
    }
  });
});
```

- [ ] **Step 4: Jalankan tes, pastikan gagal**

Run: `bun run test src/content/vessels.test.ts`
Expected: FAIL, `Failed to resolve import "./vessels"`.

- [ ] **Step 5: Tulis `src/content/vessels.ts`**

Cocokkan setiap nama dengan `/tmp/dml-fleet-page.txt` sebelum menyimpan. Kapitalisasi dinormalkan dari huruf besar semua di PDF ke Title Case, kecuali angka Romawi dan kode yang tetap huruf besar.

```ts
import type { Vessel } from "./types";

/**
 * Daftar 66 kapal bernama dari company profile resmi `assets/CP DML.pdf`
 * halaman 04. Sebelum plan ini, nama-nama ini cuma hidup sebagai komentar di
 * fleet.ts untuk dua kelas saja.
 *
 * SELISIH ANGKA, sekarang bisa ditunjuk persis. Daftar pengangkut BBM di
 * halaman itu berisi 57 kapal (7 MT + 11 TB + 9 OB + 30 SPOB), sedangkan
 * ringkasan di halaman yang sama menulis 55. Ro-ro cocok di angka 9. Jadi
 * seluruh selisih dua kapal ada di sisi BBM, bukan tersebar.
 * `COMPANY.fleetSummary` tetap memakai angka ringkasan PDF, dan tidak ada satu
 * pun tempat di situs yang menjumlahkan daftar ini lalu menampilkannya
 * bersebelahan dengan angka ringkasan. Termasuk butir konfirmasi klien.
 *
 * `OB Sahoya 0` tampak terpotong di PDF dan disalin apa adanya, ditandai
 * belum-terverifikasi, tidak ditebak jadi "Sahoya 04".
 */
export const VESSELS: Vessel[] = [
  // Ro-Ro, dikelompokkan per lintasan persis seperti di PDF.
  { name: "KMP Jambo VI", classSlug: "ro-ro-ferry", routeId: "ketapang-gilimanuk", source: "cp-pdf" },
  { name: "KMP Jambo VIII", classSlug: "ro-ro-ferry", routeId: "ketapang-gilimanuk", source: "cp-pdf" },
  { name: "KMP Jambo IX", classSlug: "ro-ro-ferry", routeId: "ketapang-gilimanuk", source: "cp-pdf" },
  { name: "KMP Jambo X", classSlug: "ro-ro-ferry", routeId: "ketapang-gilimanuk", source: "cp-pdf" },
  { name: "KMP BSP 1", classSlug: "ro-ro-ferry", routeId: "merak-bakauheni", source: "cp-pdf" },
  { name: "KMP Salvatore", classSlug: "ro-ro-ferry", routeId: "merak-bakauheni", source: "cp-pdf" },
  { name: "KMP Jambo XII", classSlug: "ro-ro-ferry", routeId: "jangkar-lembar", source: "cp-pdf" },
  { name: "KMP Jambo XIV", classSlug: "ro-ro-ferry", routeId: "kumai-perak", source: "cp-pdf" },
  { name: "KMP Jambo XI", classSlug: "ro-ro-ferry", routeId: "perak-lembar", source: "cp-pdf" },

  // Motor Tanker
  { name: "MT Royalty", classSlug: "motor-tanker", source: "cp-pdf" },
  { name: "MT Jazeel", classSlug: "motor-tanker", source: "cp-pdf" },
  { name: "MT AS Marine Satu", classSlug: "motor-tanker", source: "cp-pdf" },
  { name: "MT Gonaya VIII", classSlug: "motor-tanker", source: "cp-pdf" },
  { name: "MT Jefferson", classSlug: "motor-tanker", source: "cp-pdf" },
  { name: "MT Winston 01", classSlug: "motor-tanker", source: "cp-pdf" },
  { name: "MT Ocean River", classSlug: "motor-tanker", source: "cp-pdf" },

  // Oil Barge
  { name: "OB Wapoga", classSlug: "oil-barge", source: "cp-pdf" },
  { name: "OB Rani 68", classSlug: "oil-barge", source: "cp-pdf" },
  { name: "OB Fery 04", classSlug: "oil-barge", source: "cp-pdf" },
  { name: "OB Sahoya 05", classSlug: "oil-barge", source: "cp-pdf" },
  { name: "OB Megapower XI", classSlug: "oil-barge", source: "cp-pdf" },
  { name: "OB TS 005", classSlug: "oil-barge", source: "cp-pdf" },
  { name: "OB Sahoya 03", classSlug: "oil-barge", source: "cp-pdf" },
  // Nama ini terbaca terpotong di PDF, disalin apa adanya. Jangan ditebak.
  { name: "OB Sahoya 0", classSlug: "oil-barge", source: "belum-terverifikasi" },
  { name: "OB Utama 18", classSlug: "oil-barge", source: "cp-pdf" },

  // SPOB
  { name: "SPOB Fery IX", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Fery VI", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Hendra 001", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB SADP XX", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Palangkaraya", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Fery 01", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Fery XIV", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Jambo V", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Adeline 05", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Adeline 03", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Gonaya III", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Adeline 01", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB CISM 01", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Gonaya XV", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Sumberjaya V", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB DMLD 01", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Fery XVIII", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Sumber Jaya XVII", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Citra S4002", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Fery XXIII", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Najehah", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Bakut", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Berkah 8", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Fery XXX", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Gonaya IX", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Fery VIII", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Fery XVII", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Sumber Jaya XII", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB Adeline 06", classSlug: "spob", source: "cp-pdf" },
  { name: "SPOB United X", classSlug: "spob", source: "cp-pdf" },

  // Tug Boat
  { name: "TB Bina Karya", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB DML 08", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB Albert", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB Fawwaz", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB Fery XX", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB Gonaya IV", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB Prioritas", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB Setia Kawan 27", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB Arya Candra", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB Sahoya 02", classSlug: "tugboat", source: "cp-pdf" },
  { name: "TB Teluk Sungkun 08", classSlug: "tugboat", source: "cp-pdf" },
];

export function vesselsByClass(classSlug: string): Vessel[] {
  return VESSELS.filter((vessel) => vessel.classSlug === classSlug);
}

export function vesselsByRoute(routeId: string): Vessel[] {
  return VESSELS.filter((vessel) => vessel.routeId === routeId);
}
```

- [ ] **Step 6: Jalankan tes, pastikan lolos**

Run: `bun run test src/content/vessels.test.ts`
Expected: PASS, 8 tes.

Kalau tes "jumlah per kelas" gagal, **jangan ubah `vesselCount` di `fleet.ts`**. Angka itu sudah diverifikasi terhadap PDF di Plan 5. Yang salah adalah ekstraksi di task ini; cocokkan ulang dengan `/tmp/dml-fleet-page.txt`.

- [ ] **Step 7: Typecheck dan lint**

Run: `bun run typecheck && bun run lint`
Expected: keduanya bersih.

- [ ] **Step 8: Commit**

```bash
git add dml-web/src/content/vessels.ts dml-web/src/content/vessels.test.ts dml-web/src/content/types.ts
git commit -m "feat: ekstrak 66 nama kapal dari company profile jadi data terstruktur

Sebelum ini nama kapal cuma hidup sebagai komentar di fleet.ts untuk dua
kelas. Sekarang seluruhnya jadi VESSELS, dijaga tes konsistensi silang
terhadap vesselCount di fleet.ts dan ROUTE_LEGS di ports.ts.

Selisih 64 vs 66 sekarang bisa ditunjuk persis: seluruhnya di sisi BBM
(57 terdaftar, 55 di ringkasan PDF), ro-ro cocok di angka 9."
```

---

## Task 2: Data legalitas, `src/content/legal-documents.ts`

**Files:**
- Create: `src/content/legal-documents.ts`
- Create: `src/content/legal-documents.test.ts`
- Modify: `src/content/types.ts` (tambah tipe `LegalDocument` setelah `Vessel`)

**Interfaces:**
- Consumes: `SourceTag` dari `src/content/types.ts:12`.
- Produces: tipe `LegalDocument`; `LEGAL_DOCUMENTS: LegalDocument[]`.

- [ ] **Step 1: Ekstrak halaman legalitas sebagai rujukan**

```bash
pdftotext -f 6 -l 6 -layout "../assets/CP DML.pdf" /tmp/dml-legal-page.txt
cat /tmp/dml-legal-page.txt
```

- [ ] **Step 2: Tambahkan tipe `LegalDocument` ke `src/content/types.ts`**

```ts
/**
 * Satu baris tabel dokumen legal dari company profile halaman 06.
 * Nomor dan penerbit disalin apa adanya; kapitalisasi dinormalkan dari
 * huruf besar semua.
 */
export type LegalDocument = {
  document: string;
  number: string;
  issuer: string;
  source: SourceTag;
};
```

- [ ] **Step 3: Tulis tes yang gagal**

Buat `src/content/legal-documents.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { LEGAL_DOCUMENTS } from "./legal-documents";

describe("LEGAL_DOCUMENTS", () => {
  it("memuat sembilan baris sesuai tabel PDF halaman 06", () => {
    expect(LEGAL_DOCUMENTS).toHaveLength(9);
  });

  it("setiap baris punya dokumen, nomor, dan penerbit yang terisi", () => {
    for (const entry of LEGAL_DOCUMENTS) {
      expect(entry.document.trim().length, `dokumen kosong: ${entry.number}`).toBeGreaterThan(0);
      expect(entry.number.trim().length, `nomor kosong: ${entry.document}`).toBeGreaterThan(0);
      expect(entry.issuer.trim().length, `penerbit kosong: ${entry.document}`).toBeGreaterThan(0);
    }
  });

  it("seluruhnya bersumber company profile, bukan riset publik", () => {
    for (const entry of LEGAL_DOCUMENTS) {
      expect(entry.source, entry.document).toBe("cp-pdf");
    }
  });

  it("tidak ada nomor dokumen duplikat", () => {
    const numbers = LEGAL_DOCUMENTS.map((entry) => entry.number);
    expect(new Set(numbers).size).toBe(numbers.length);
  });

  it("memuat NPWP dan NIB, dua dokumen yang paling sering ditanyakan mitra", () => {
    const documents = LEGAL_DOCUMENTS.map((entry) => entry.document).join(" ");
    expect(documents).toContain("NPWP");
    expect(documents).toContain("NIB");
  });
});
```

- [ ] **Step 4: Jalankan tes, pastikan gagal**

Run: `bun run test src/content/legal-documents.test.ts`
Expected: FAIL, `Failed to resolve import "./legal-documents"`.

- [ ] **Step 5: Tulis `src/content/legal-documents.ts`**

```ts
import type { LegalDocument } from "./types";

/**
 * Tabel dokumen legal dari company profile resmi `assets/CP DML.pdf`
 * halaman 06, disalin apa adanya dengan kapitalisasi dinormalkan.
 *
 * "Badan Kordinasi Penanaman Modal" ditulis begitu di PDF, tanpa huruf O
 * kedua. Ejaan resminya "Koordinasi", tapi nilai di sini mengikuti dokumen
 * sumber, sesuai aturan repo bahwa data korporat disalin bukan dikoreksi.
 * Kalau klien mengonfirmasi ini salah ketik di company profile mereka,
 * perbaiki di sini dan catat di README.
 */
export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    document: "Akta Pendirian Perusahaan",
    number: "No. 3887",
    issuer: "Notaris Nyonya Bertha Suriati",
    source: "cp-pdf",
  },
  {
    document: "Akta Perubahan Terakhir",
    number: "No. 151",
    issuer: "Notaris Linda Kenari, S.H., M.H.",
    source: "cp-pdf",
  },
  {
    document: "DOC (Document of Compliance)",
    number: "AL 601/537/13/DK/2019",
    issuer: "Direktorat Jenderal Perhubungan Laut",
    source: "cp-pdf",
  },
  {
    document: "NIB (Nomor Induk Berusaha)",
    number: "9120001262268",
    issuer: "Sistem OSS",
    source: "cp-pdf",
  },
  {
    document: "SIUPAL (Surat Izin Usaha Pengangkutan Laut)",
    number: "BX-333/AL/001",
    issuer: "Kementerian Perhubungan, Direktorat Jenderal Perhubungan Laut",
    source: "cp-pdf",
  },
  {
    document: "TDP (Tanda Daftar Perusahaan)",
    number: "16.10.1.50.0784",
    issuer:
      "Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu Pemerintah Kota Banjarmasin",
    source: "cp-pdf",
  },
  {
    document: "Surat Keterangan Domisili Perusahaan",
    number: "503.5183_XII",
    issuer:
      "Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu Pemerintah Kota Banjarmasin",
    source: "cp-pdf",
  },
  {
    document: "NPWP (Nomor Pokok Wajib Pajak)",
    number: "01.474.162.2-731.000",
    issuer: "Direktorat Jenderal Pajak",
    source: "cp-pdf",
  },
  {
    document: "Sertifikat Izin Usaha Pengangkutan Kapal",
    number: "05.AL03.21.00.014",
    issuer: "Badan Kordinasi Penanaman Modal",
    source: "cp-pdf",
  },
];
```

- [ ] **Step 6: Jalankan tes, pastikan lolos**

Run: `bun run test src/content/legal-documents.test.ts`
Expected: PASS, 5 tes.

- [ ] **Step 7: Commit**

```bash
git add dml-web/src/content/legal-documents.ts dml-web/src/content/legal-documents.test.ts dml-web/src/content/types.ts
git commit -m "feat: tambah data tabel dokumen legal dari company profile hal. 06

Sembilan baris lengkap dengan nomor dan penerbit. Heading Legalitas dan
Sertifikasi di /tentang-kami#profil selama ini cuma berisi satu kalimat
padahal datanya tidak pernah diblokir klien."
```

---

## Task 3: Set media untuk halaman bisnis

**Files:**
- Modify: `src/lib/media/manifest.ts`
- Modify: `scripts/prepare-assets.ts:20-25` (blok `RAW_SOURCE`)

**Interfaces:**
- Consumes: `MediaSetId`, `MediaAsset`, `avifSrc`, `avifSrcSet` dari `src/lib/media/manifest.ts`.
- Produces: set media `"bisnis"` dengan id frame `hub-bisnis`, `lini-bbm`, `lini-roro`, dan `alur-sts-1` sampai `alur-sts-3`.

**Konteks.** `assets/_raw/` memuat 53 foto drone kapal di `kapal-kapal/` dan dua set foto operasi ship-to-ship. `manifest.test.ts` yang sudah ada bersifat generik: ia mengiterasi seluruh set dan memastikan tiap set tidak kosong dan tiap frame punya alt text. Jadi set baru otomatis ikut teruji tanpa menyentuh berkas tes itu.

- [ ] **Step 1: Pilih frame dari aset mentah**

```bash
ls ../assets/_raw/kapal-kapal/ | head -60
ls ../assets/_raw/sts-06-juli/ | head -20
ls ../assets/_raw/sts-sri-yuliani/ | head -20
```

Kurasi frame adalah keputusan manusia, sama seperti yang sudah dicatat di docblock `RAW_SOURCE`. Pilih enam berkas: satu foto lebar untuk hub, satu tanker untuk lini BBM, satu ro-ro untuk lini ro-ro, dan tiga frame yang bersama-sama menceritakan urutan sandar ship-to-ship. Catat nama berkasnya, dipakai di Step 3.

Jangan memakai ulang empat berkas yang sudah terdaftar di `RAW_SOURCE` (`sts-06-juli/DJI_0030.JPG`, `sts-sri-yuliani/DJI_0660.JPG`, `kapal-kapal/DJI_0322.JPG`, `sts-sri-yuliani/DJI_0750.JPG`). Foto yang sama muncul di beranda dan subhalaman membuat subhalaman terbaca seperti pengulangan.

- [ ] **Step 2: Perluas `MediaSetId` dan `MEDIA` di `src/lib/media/manifest.ts`**

Ubah baris 1:

```ts
export type MediaSetId = "hari" | "lini-bisnis" | "bisnis" | "alur-sts";
```

Tambahkan dua set setelah blok `"lini-bisnis"`. Alt text wajib menyebut apa yang benar-benar terlihat di foto yang Anda pilih di Step 1; contoh di bawah adalah bentuknya, bukan teks final yang boleh disalin buta.

```ts
  bisnis: [
    { id: "hub-bisnis", basePath: "/media/bisnis/hub-bisnis", widths: STANDARD_WIDTHS, alt: "GANTI: sebutkan apa yang terlihat di frame yang dipilih" },
    { id: "lini-bbm", basePath: "/media/bisnis/lini-bbm", widths: STANDARD_WIDTHS, alt: "GANTI: sebutkan apa yang terlihat di frame yang dipilih" },
    { id: "lini-roro", basePath: "/media/bisnis/lini-roro", widths: STANDARD_WIDTHS, alt: "GANTI: sebutkan apa yang terlihat di frame yang dipilih" },
  ],
  "alur-sts": [
    { id: "alur-sts-1", basePath: "/media/alur-sts/alur-sts-1", widths: STANDARD_WIDTHS, alt: "GANTI: langkah pendekatan, sebutkan apa yang terlihat" },
    { id: "alur-sts-2", basePath: "/media/alur-sts/alur-sts-2", widths: STANDARD_WIDTHS, alt: "GANTI: langkah sandar, sebutkan apa yang terlihat" },
    { id: "alur-sts-3", basePath: "/media/alur-sts/alur-sts-3", widths: STANDARD_WIDTHS, alt: "GANTI: langkah transfer, sebutkan apa yang terlihat" },
  ],
```

Sebelum commit, seluruh string `GANTI:` harus sudah hilang. Step 6 memeriksanya.

- [ ] **Step 3: Tambahkan pemetaan di `scripts/prepare-assets.ts`**

Sisipkan ke dalam objek `RAW_SOURCE`, memakai nama berkas hasil Step 1:

```ts
  "/media/bisnis/hub-bisnis": "kapal-kapal/DJI_XXXX.JPG",
  "/media/bisnis/lini-bbm": "sts-sri-yuliani/DJI_XXXX.JPG",
  "/media/bisnis/lini-roro": "kapal-kapal/DJI_XXXX.JPG",
  "/media/alur-sts/alur-sts-1": "sts-06-juli/DJI_XXXX.JPG",
  "/media/alur-sts/alur-sts-2": "sts-06-juli/DJI_XXXX.JPG",
  "/media/alur-sts/alur-sts-3": "sts-sri-yuliani/DJI_XXXX.JPG",
```

`DJI_XXXX` diganti nama berkas sungguhan. Skrip melempar dengan pesan jelas kalau pemetaan hilang atau berkas mentahnya tidak ada, jadi salah ketik akan ketahuan di Step 4, bukan diam-diam menghasilkan halaman tanpa gambar.

- [ ] **Step 4: Jalankan pipeline aset**

Run: `bun run prepare-assets`
Expected: selesai tanpa lemparan; enam basePath baru menghasilkan berkas.

```bash
ls public/media/bisnis/ public/media/alur-sts/
```
Expected: 24 berkas `.avif` total (6 frame x 4 lebar).

- [ ] **Step 5: Jalankan tes manifest**

Run: `bun run test src/lib/media/manifest.test.ts`
Expected: PASS. Tes ini generik terhadap seluruh set, jadi set baru ikut terjaga tanpa menambah berkas tes.

- [ ] **Step 6: Pastikan tidak ada alt text placeholder tersisa**

```bash
grep -n "GANTI:" src/lib/media/manifest.ts || echo "bersih"
```
Expected: `bersih`.

- [ ] **Step 7: Commit**

```bash
git add dml-web/src/lib/media/manifest.ts dml-web/scripts/prepare-assets.ts dml-web/public/media/
git commit -m "feat: siapkan set media untuk halaman bisnis dan alur ship-to-ship

Enam frame baru dari aset mentah yang sudah lama ada di assets/_raw tapi
belum pernah dipakai. Sengaja tidak memakai ulang empat frame beranda:
foto yang sama di dua tempat membuat subhalaman terbaca sebagai
pengulangan."
```

---

## Task 4: Komponen `VesselRoster`

**Files:**
- Create: `src/features/fleet/vessel-roster.tsx`
- Create: `src/features/fleet/vessel-roster.test.tsx`

**Interfaces:**
- Consumes: `Vessel` dari `@/content/types`; `vesselsByClass` dari `@/content/vessels`; `FleetClass` dari `@/content/types`.
- Produces: `VesselRoster({ fleetClasses }: { fleetClasses: FleetClass[] })`, Server Component, dipakai Task 6 dan Task 7.

**Konteks.** Ini komponen yang memberi subhalaman kedalaman yang tidak dimiliki beranda: 57 nama kapal nyata untuk lini BBM, 9 untuk ro-ro. Ditampilkan sebagai daftar berkolom per kelas, **bukan tabel kedua**. Halaman lini BBM sudah punya `FleetSpecTable`; dua tabel beruntun membuat halaman terbaca seperti lampiran, bukan halaman.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `src/features/fleet/vessel-roster.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { VesselRoster } from "./vessel-roster";
import { FLEET_CLASSES } from "@/content/fleet";

const BBM_CLASSES = FLEET_CLASSES.filter((fleetClass) => fleetClass.category === "Transportasi BBM");

describe("VesselRoster", () => {
  it("menampilkan judul setiap kelas yang diberikan", () => {
    render(<VesselRoster fleetClasses={BBM_CLASSES} />);
    for (const fleetClass of BBM_CLASSES) {
      expect(screen.getByRole("heading", { name: new RegExp(fleetClass.name, "i") })).toBeInTheDocument();
    }
  });

  it("menampilkan seluruh nama kapal kelas yang diberikan", () => {
    render(<VesselRoster fleetClasses={BBM_CLASSES} />);
    expect(screen.getByText("MT Ocean River")).toBeInTheDocument();
    expect(screen.getByText("SPOB United X")).toBeInTheDocument();
    expect(screen.getByText("TB Teluk Sungkun 08")).toBeInTheDocument();
  });

  it("tidak menampilkan kapal dari kelas yang tidak diberikan", () => {
    render(<VesselRoster fleetClasses={BBM_CLASSES} />);
    expect(screen.queryByText("KMP Jambo X")).not.toBeInTheDocument();
  });

  it("setiap kelas menyebut jumlah kapalnya", () => {
    render(<VesselRoster fleetClasses={BBM_CLASSES} />);
    // SPOB adalah kelas terbesar, 30 kapal.
    expect(screen.getByText(/30 kapal/)).toBeInTheDocument();
  });

  it("memakai daftar bernama supaya pembaca layar bisa melompati per kelas", () => {
    render(<VesselRoster fleetClasses={BBM_CLASSES} />);
    const lists = screen.getAllByRole("list");
    expect(lists.length).toBe(BBM_CLASSES.length);
    for (const list of lists) {
      expect(list).toHaveAccessibleName();
    }
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `bun run test src/features/fleet/vessel-roster.test.tsx`
Expected: FAIL, `Failed to resolve import "./vessel-roster"`.

- [ ] **Step 3: Tulis `src/features/fleet/vessel-roster.tsx`**

```tsx
import type { FleetClass } from "@/content/types";
import { vesselsByClass } from "@/content/vessels";

/**
 * Daftar nama kapal per kelas, bukan tabel. Halaman lini BBM sudah memakai
 * FleetSpecTable untuk angka; dua tabel beruntun membuat halaman terbaca
 * seperti lampiran. Di sini yang dibaca adalah nama, dan nama paling enak
 * dibaca sebagai daftar berkolom.
 */
export function VesselRoster({ fleetClasses }: { fleetClasses: FleetClass[] }) {
  return (
    <div className="mt-10 grid gap-10 md:grid-cols-2">
      {fleetClasses.map((fleetClass) => {
        const vessels = vesselsByClass(fleetClass.slug);
        const headingId = `roster-${fleetClass.slug}`;
        return (
          <section key={fleetClass.slug} aria-labelledby={headingId}>
            <h3 id={headingId} className="font-display text-pretty text-xl font-bold text-ink">
              {fleetClass.name}
            </h3>
            <p className="mt-1 font-mono text-xs text-ink-muted">
              {vessels.length} kapal, {fleetClass.capacityLabel}
            </p>
            <ul
              aria-labelledby={headingId}
              className="mt-4 columns-1 gap-x-8 font-mono text-sm text-ink-muted sm:columns-2 md:columns-1 lg:columns-2"
            >
              {vessels.map((vessel) => (
                <li key={vessel.name} className="break-inside-avoid py-1">
                  {vessel.name}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `bun run test src/features/fleet/vessel-roster.test.tsx`
Expected: PASS, 5 tes.

- [ ] **Step 5: Commit**

```bash
git add dml-web/src/features/fleet/vessel-roster.tsx dml-web/src/features/fleet/vessel-roster.test.tsx
git commit -m "feat: komponen VesselRoster, daftar nama kapal per kelas

Daftar berkolom, bukan tabel kedua. Halaman lini BBM sudah punya
FleetSpecTable untuk angka; nama kapal punya kebutuhan baca yang berbeda."
```

---

## Task 5: Halaman `/bisnis`

**Files:**
- Create: `src/app/(site)/bisnis/page.tsx`

**Interfaces:**
- Consumes: `MAIN_LINES`, `AFFILIATES` dari `@/content/business-lines`; `COMPANY` dari `@/content/company`; `MEDIA`, `avifSrc`, `avifSrcSet` dari `@/lib/media/manifest`; `SectionHeader` dari `@/components/ui/section-header`; `CtaLink` dari `@/components/ui/cta-link`; `buildMetadata`, `breadcrumbJsonLd`, `safeJsonLdString`.
- Produces: route `/bisnis`. Tidak mengekspor apa pun ke task lain.

**Konteks.** `NAV_ITEMS` di `src/content/navigation.ts:6` sudah menaut ke `/bisnis` sejak Plan 1. Route-nya tidak pernah ada, jadi item navigasi utama ini menuju 404 sampai sekarang.

Aturan visual yang menentukan halaman ini: tiga afiliasi harus **jelas satu tingkat lebih rendah** dari dua lini utama. Ini bukan preferensi estetika. Rute Merak–Bakauheni dioperasikan PT Tri Sumaja Lines, bukan DML; menyamakan bobot visualnya dengan dua lini utama berarti mengklaim rute itu sebagai rute DML, dan itu membantah data yang dipakai beranda dan halaman Tentang Kami.

- [ ] **Step 1: Tulis halaman**

Buat `src/app/(site)/bisnis/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { MAIN_LINES, AFFILIATES } from "@/content/business-lines";
import { COMPANY } from "@/content/company";
import { MEDIA, avifSrc, avifSrcSet } from "@/lib/media/manifest";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { SectionHeader } from "@/components/ui/section-header";
import { CtaLink } from "@/components/ui/cta-link";

export const metadata: Metadata = buildMetadata({
  title: "Bisnis Kami | PT Dutabahari Menara Line",
  description:
    "Dua lini yang dijalankan PT Dutabahari Menara Line sendiri, transportasi BBM dan penyeberangan ro-ro, serta tiga perusahaan afiliasi di sekitarnya.",
  path: "/bisnis",
});

const LINE_MEDIA: Record<string, string> = {
  "transportasi-bbm": "lini-bbm",
  "penumpang-roro": "lini-roro",
};

const LINE_HREF: Record<string, string> = {
  "transportasi-bbm": "/bisnis/transportasi-bbm",
  "penumpang-roro": "/bisnis/penumpang-roro",
};

export default function BisnisPage() {
  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Bisnis Kami", path: "/bisnis" },
  ]);

  return (
    <div>
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
        <h1 className="font-display text-pretty text-4xl font-bold tracking-tight md:text-5xl">
          Bisnis Kami
        </h1>
        <p className="mt-6 max-w-[60ch] text-ink-muted">
          {COMPANY.legalName} menjalankan dua lini secara langsung, transportasi BBM dan
          penyeberangan ro-ro. Di sekitarnya ada tiga perusahaan afiliasi di dalam{" "}
          {COMPANY.parent} yang melayani kebutuhan berbeda.
        </p>
      </div>

      <section aria-labelledby="lini-utama" className="bg-surface-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <SectionHeader id="lini-utama" title="Lini utama" />
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {MAIN_LINES.map((line) => {
              const mediaId = LINE_MEDIA[line.id];
              const asset = mediaId
                ? (MEDIA["bisnis"].find((frame) => frame.id === mediaId) ?? null)
                : null;
              const href = LINE_HREF[line.id] ?? "/bisnis";
              return (
                <article
                  key={line.id}
                  className="overflow-hidden rounded-card border border-surface-3 bg-surface-2"
                >
                  {asset ? (
                    <img
                      src={avifSrc(asset, 1080)}
                      srcSet={avifSrcSet(asset)}
                      sizes="(min-width: 768px) 50vw, 100vw"
                      alt={asset.alt}
                      width={1080}
                      height={720}
                      className="aspect-[3/2] w-full object-cover"
                    />
                  ) : null}
                  <div className="p-8">
                    <h3 className="font-display text-pretty text-2xl font-bold text-ink md:text-3xl">
                      {line.title}
                    </h3>
                    <p className="mt-2 font-mono text-xs text-ink-muted">{line.operator}</p>
                    <p className="mt-4 max-w-[46ch] text-ink">{line.summary}</p>
                    {line.metric ? (
                      <p className="mt-6 font-display text-3xl font-bold text-accent">
                        {line.metric.value}{" "}
                        <span className="font-sans text-sm font-normal text-ink-muted">
                          {line.metric.label}
                        </span>
                      </p>
                    ) : null}
                    <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-ink-muted">
                      {line.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                    <Link
                      href={href}
                      className="mt-8 inline-flex text-sm font-medium text-accent transition-colors hover:text-accent-hover"
                    >
                      Lihat detail {line.title}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="afiliasi" className="bg-surface-2-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          {/*
            Blok ini sengaja lebih kecil, tanpa foto, dan diberi garis kiri yang
            menyatakan ia bersandar di bawah dua lini utama, mengikuti kurung
            siku di company profile halaman 03. Menyamakan bobotnya dengan lini
            utama berarti mengklaim rute Merak-Bakauheni sebagai rute DML,
            padahal itu dioperasikan PT Tri Sumaja Lines.
          */}
          <SectionHeader
            id="afiliasi"
            title="Perusahaan afiliasi"
            description={`Tiga perusahaan di dalam ${COMPANY.parent} yang berdiri sendiri dan tidak dijalankan ${COMPANY.abbreviation}.`}
          />
          <div className="mt-10 grid gap-6 border-l border-surface-3 pl-6 md:grid-cols-3">
            {AFFILIATES.map((affiliate) => (
              <article
                key={affiliate.id}
                className="rounded-card border border-surface-3 bg-surface p-6"
              >
                <h3 className="font-display text-pretty text-lg font-bold text-ink">
                  {affiliate.title}
                </h3>
                <p className="mt-3 text-sm text-ink-muted">{affiliate.summary}</p>
                <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-ink-muted">
                  {affiliate.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="angka" className="bg-surface-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <SectionHeader id="angka" title="Skala operasi" />
          <dl className="mt-10 grid gap-8 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-ink-muted">Armada</dt>
              <dd className="mt-1 font-display text-4xl font-bold text-ink">
                {COMPANY.fleetSummary.vessels}
                <span className="ml-2 font-sans text-sm font-normal text-ink-muted">kapal</span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-muted">Orang</dt>
              <dd className="mt-1 font-display text-4xl font-bold text-ink">
                &gt;{COMPANY.fleetSummary.people}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-muted">Berdiri</dt>
              <dd className="mt-1 font-display text-4xl font-bold text-ink">
                {COMPANY.foundedIso.slice(0, 4)}
              </dd>
            </div>
          </dl>
          <div className="mt-12">
            <CtaLink href="/bisnis/transportasi-bbm/permintaan-informasi">
              Ajukan permintaan informasi
            </CtaLink>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(trail) }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Jalankan build untuk membuktikan route terdaftar**

Run: `bun run build`
Expected: keluaran build memuat baris untuk `/bisnis`. Kalau tidak, berkasnya salah tempat.

- [ ] **Step 3: Verifikasi halaman hidup dan afiliasi dibedakan**

```bash
bun run dev &
sleep 8
curl -s http://localhost:3000/bisnis | grep -c "Perusahaan afiliasi"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/bisnis
kill %1
```
Expected: `1` lalu `200`.

- [ ] **Step 4: Typecheck dan lint**

Run: `bun run typecheck && bun run lint`
Expected: bersih.

- [ ] **Step 5: Commit**

```bash
git add "dml-web/src/app/(site)/bisnis/page.tsx"
git commit -m "feat: halaman hub /bisnis

Item navigasi utama ini menaut ke /bisnis sejak Plan 1 dan route-nya tidak
pernah ada. Tiga afiliasi digambar satu tingkat lebih rendah dari dua lini
utama, mengikuti kurung siku company profile hal. 03: menyamakan bobotnya
berarti mengklaim rute Merak-Bakauheni sebagai rute DML."
```

---

## Task 6: Halaman `/bisnis/transportasi-bbm`

**Files:**
- Create: `src/app/(site)/bisnis/transportasi-bbm/page.tsx`

**Interfaces:**
- Consumes: `FLEET_CLASSES` dari `@/content/fleet`; `VesselRoster` dari Task 4; `FleetSpecTable` dari `@/features/fleet/spec-table`; `BlueprintSvg` dari `@/features/fleet/blueprint-svg`; `COMPANY` dari `@/content/company`; `MEDIA` set `"bisnis"` dan `"alur-sts"` dari Task 3.
- Produces: route `/bisnis/transportasi-bbm`.

**Konteks.** `FOOTER_GROUPS` di `src/content/navigation.ts` sudah menaut ke sini. `FleetSpecTable` menerima `fleetClasses: FleetClass[]` dan sudah membawa pembungkus gulir yang keyboard-focusable; jangan membungkusnya lagi. `BlueprintSvg` juga menerima `fleetClasses` dan merender grid dua kolom sendiri.

Halaman ini adalah dokumen operasional. Beranda sudah menceritakan STS sebagai adegan; di sini ia dijelaskan sebagai prosedur.

- [ ] **Step 1: Tulis halaman**

Buat `src/app/(site)/bisnis/transportasi-bbm/page.tsx`:

```tsx
import type { Metadata } from "next";
import { FLEET_CLASSES } from "@/content/fleet";
import { COMPANY } from "@/content/company";
import { MAIN_LINES } from "@/content/business-lines";
import { MEDIA, avifSrc, avifSrcSet } from "@/lib/media/manifest";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { SectionHeader } from "@/components/ui/section-header";
import { CtaLink } from "@/components/ui/cta-link";
import { FleetSpecTable } from "@/features/fleet/spec-table";
import { BlueprintSvg } from "@/features/fleet/blueprint-svg";
import { VesselRoster } from "@/features/fleet/vessel-roster";

export const metadata: Metadata = buildMetadata({
  title: "Transportasi BBM | PT Dutabahari Menara Line",
  description:
    "Armada motor tanker, oil barge, SPOB, dan tugboat PT Dutabahari Menara Line untuk distribusi bahan bakar cair ke pelabuhan dan pulau utama Indonesia.",
  path: "/bisnis/transportasi-bbm",
});

const BBM_CLASSES = FLEET_CLASSES.filter(
  (fleetClass) => fleetClass.category === "Transportasi BBM",
);

/**
 * Empat langkah, bukan angka bulat yang dikarang. Urutannya mengikuti apa yang
 * benar-benar terbaca dari foto operasi di assets/_raw dan penjelasan lini BBM
 * di company profile halaman 03. Tidak ada durasi, jarak, atau volume per
 * langkah, karena tidak satu pun angka itu ada di sumber mana pun.
 */
const STS_STEPS = [
  {
    title: "Muat di terminal",
    body: "Motor tanker atau SPOB memuat bahan bakar cair di terminal, dengan dokumen muatan dan pemeriksaan yang mengikuti prosedur ISM Code.",
  },
  {
    title: "Berlayar ke titik serah",
    body: "Kapal menuju titik serah, termasuk titik yang tidak terjangkau jetty konvensional. Di sinilah armada berukuran berbeda punya gunanya masing-masing.",
  },
  {
    title: "Sandar kapal ke kapal",
    body: "Dua kapal disandarkan dengan fender dan tali tambat, lalu diikat dalam posisi yang menahan gerak relatif keduanya sepanjang transfer.",
  },
  {
    title: "Transfer dan serah",
    body: "Selang transfer dipasang, muatan dipindahkan, lalu dokumen serah diselesaikan sebelum kedua kapal dilepas.",
  },
];

export default function TransportasiBbmPage() {
  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Bisnis Kami", path: "/bisnis" },
    { name: "Transportasi BBM", path: "/bisnis/transportasi-bbm" },
  ]);
  const line = MAIN_LINES.find((entry) => entry.id === "transportasi-bbm");
  const hero = MEDIA["bisnis"].find((frame) => frame.id === "lini-bbm") ?? null;

  return (
    <div>
      {/*
        Pembuka tipis, bukan panggung sepenuh layar. Hero sepenuh layar milik
        beranda; halaman ini dibaca orang yang sudah tertarik dan sekarang mau
        angka, jadi bidang foto tidak boleh mendorong tabel keluar lipatan.
      */}
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
        <p className="font-mono text-xs text-ink-muted">Lini utama</p>
        <h1 className="mt-4 font-display text-pretty text-4xl font-bold tracking-tight md:text-5xl">
          Transportasi BBM
        </h1>
        <p className="mt-6 max-w-[60ch] text-ink-muted">{line?.summary}</p>
        {hero ? (
          <img
            src={avifSrc(hero, 1600)}
            srcSet={avifSrcSet(hero)}
            sizes="(min-width: 1400px) 1400px, 100vw"
            alt={hero.alt}
            width={1600}
            height={900}
            className="mt-10 aspect-[16/9] w-full rounded-card object-cover"
          />
        ) : null}
      </div>

      <section aria-labelledby="spesifikasi" className="bg-surface-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <SectionHeader
            id="spesifikasi"
            title="Kelas armada"
            description="Empat kelas kapal pengangkut BBM. Panjang, lebar, dan DWT di bawah masih estimasi proporsional, bukan angka dari company profile."
          />
          <FleetSpecTable fleetClasses={BBM_CLASSES} />
          <p className="mt-4 font-mono text-xs text-ink-muted">
            Sumber jumlah kapal: company profile PT Dutabahari Menara Line halaman 04.
            Dimensi dan DWT belum terverifikasi.
          </p>
          <div className="mt-12">
            <BlueprintSvg fleetClasses={BBM_CLASSES} />
          </div>
        </div>
      </section>

      <section aria-labelledby="roster" className="bg-surface-2-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <SectionHeader
            id="roster"
            title="Daftar kapal"
            description="Lima puluh tujuh kapal pengangkut BBM, dikelompokkan per kelas, disalin dari daftar armada company profile halaman 04."
          />
          <VesselRoster fleetClasses={BBM_CLASSES} />
        </div>
      </section>

      <section aria-labelledby="alur-sts" className="bg-surface-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <SectionHeader
            id="alur-sts"
            title="Alur ship-to-ship"
            description="Cara kerja di dalam lini transportasi BBM, bukan lini terpisah. Empat langkah dari muat sampai serah."
          />
          <ol className="mt-10 grid gap-8 md:grid-cols-2">
            {STS_STEPS.map((step, index) => (
              <li key={step.title} className="rounded-card border border-surface-3 bg-surface-2 p-6">
                <p className="font-mono text-xs text-accent">
                  Langkah {index + 1} dari {STS_STEPS.length}
                </p>
                <h3 className="mt-3 font-display text-pretty text-lg font-bold text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-ink-muted">{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {MEDIA["alur-sts"].map((frame) => (
              <img
                key={frame.id}
                src={avifSrc(frame, 1080)}
                srcSet={avifSrcSet(frame)}
                sizes="(min-width: 768px) 33vw, 100vw"
                alt={frame.alt}
                width={1080}
                height={720}
                loading="lazy"
                className="aspect-[3/2] w-full rounded-card object-cover"
              />
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="standar" className="bg-surface-2-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <SectionHeader id="standar" title="Standar dan klasifikasi" />
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {COMPANY.standards.map((cluster) => (
              <div key={cluster.label}>
                <p className="font-mono text-xs text-ink-muted">{cluster.label}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {cluster.items.map((item) => (
                    <li
                      key={item.name}
                      className="rounded-full bg-accent-soft px-3 py-1 text-xs text-accent"
                    >
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <CtaLink href="/bisnis/transportasi-bbm/permintaan-informasi?layanan=transportasi-bbm">
              Ajukan permintaan informasi
            </CtaLink>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(trail) }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Pastikan tidak ada aset WebGL yang ikut terbawa**

```bash
grep -nE "three|@react-three|fleet-canvas|Canvas" "src/app/(site)/bisnis/transportasi-bbm/page.tsx" || echo "bersih, tidak ada WebGL"
```
Expected: `bersih, tidak ada WebGL`.

- [ ] **Step 3: Build dan verifikasi halaman**

Run: `bun run build`
Expected: baris `/bisnis/transportasi-bbm` muncul di keluaran, ditandai statis.

```bash
bun run dev &
sleep 8
curl -s http://localhost:3000/bisnis/transportasi-bbm | grep -c "SPOB United X"
kill %1
```
Expected: `1`. Ini membuktikan roster benar-benar merender data dari Task 1, bukan cuma judul seksinya.

- [ ] **Step 4: Typecheck dan lint**

Run: `bun run typecheck && bun run lint`
Expected: bersih.

- [ ] **Step 5: Commit**

```bash
git add "dml-web/src/app/(site)/bisnis/transportasi-bbm/page.tsx"
git commit -m "feat: halaman lini transportasi BBM

Dokumen operasional untuk pembaca procurement: tabel spesifikasi, blueprint
per kelas, 57 nama kapal, alur ship-to-ship empat langkah, dan klaster
standar. Tanpa aset WebGL, itu tetap milik beranda."
```

---

## Task 7: Halaman `/bisnis/penumpang-roro`

**Files:**
- Create: `src/features/fleet/route-table.tsx`
- Create: `src/features/fleet/route-table.test.tsx`
- Create: `src/app/(site)/bisnis/penumpang-roro/page.tsx`

**Interfaces:**
- Consumes: `ROUTE_LEGS`, `PORTS` dari `@/features/route-map/ports`; `vesselsByRoute` dari `@/content/vessels`; `ExternalLink` dari `@/components/layout/external-link`.
- Produces: `RouteTable()`, tanpa prop, membaca `ROUTE_LEGS` langsung; route `/bisnis/penumpang-roro`.

**Konteks.** `RouteLeg` punya `operator: "dml" | "tsl"`. Kolom operator di tabel ini adalah alasan komponennya ada: lima lintasan terlihat seperti lima lintasan DML kalau operatornya tidak ditulis, padahal Merak–Bakauheni dijalankan PT Tri Sumaja Lines.

Tidak ada peta rute di halaman ini, tidak ada jadwal keberangkatan, dan tidak ada daftar fasilitas kapal. Dua yang terakhir tidak ada di PDF.

- [ ] **Step 1: Tulis tes `RouteTable` yang gagal**

Buat `src/features/fleet/route-table.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { RouteTable } from "./route-table";
import { ROUTE_LEGS } from "@/features/route-map/ports";

describe("RouteTable", () => {
  it("menampilkan kelima lintasan", () => {
    render(<RouteTable />);
    for (const leg of ROUTE_LEGS) {
      expect(screen.getByText(leg.label)).toBeInTheDocument();
    }
  });

  it("menyebut PT Tri Sumaja Lines sebagai operator Merak-Bakauheni", () => {
    render(<RouteTable />);
    const row = screen.getByText("Merak - Bakauheni").closest("tr");
    expect(row).not.toBeNull();
    expect(within(row as HTMLElement).getByText(/Tri Sumaja Lines/)).toBeInTheDocument();
  });

  it("menyebut DML sebagai operator Ketapang-Gilimanuk", () => {
    render(<RouteTable />);
    const row = screen.getByText("Ketapang - Gilimanuk").closest("tr");
    expect(row).not.toBeNull();
    expect(within(row as HTMLElement).getByText(/Dutabahari Menara Line/)).toBeInTheDocument();
  });

  it("menampilkan kapal yang melayani tiap lintasan", () => {
    render(<RouteTable />);
    const row = screen.getByText("Ketapang - Gilimanuk").closest("tr");
    expect(within(row as HTMLElement).getByText(/KMP Jambo VI/)).toBeInTheDocument();
  });

  it("pembungkusnya bisa digulir dengan keyboard", () => {
    render(<RouteTable />);
    const region = screen.getByRole("region", { name: /lintasan/i });
    expect(region).toHaveAttribute("tabindex", "0");
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `bun run test src/features/fleet/route-table.test.tsx`
Expected: FAIL, `Failed to resolve import "./route-table"`.

- [ ] **Step 3: Tulis `src/features/fleet/route-table.tsx`**

```tsx
import { ROUTE_LEGS } from "@/features/route-map/ports";
import { COMPANY } from "@/content/company";
import { vesselsByRoute } from "@/content/vessels";

/**
 * Kolom operator adalah alasan komponen ini ada. Lima lintasan terbaca sebagai
 * lima lintasan DML kalau operatornya tidak ditulis, padahal Merak-Bakauheni
 * dijalankan PT Tri Sumaja Lines menurut company profile halaman 03.
 *
 * Pembungkus gulir mendatar + tabIndex + role region mengikuti pola
 * FleetSpecTable: tanpa itu, tabel mendorong lebar dokumen di 375 px dan
 * SELURUH halaman ikut bisa digeser ke samping, dan pengguna keyboard tidak
 * bisa menggulirnya sama sekali (temuan aksesibilitas Plan 6).
 */
const OPERATOR_LABEL: Record<string, string> = {
  dml: COMPANY.legalName,
  tsl: "PT Tri Sumaja Lines",
};

export function RouteTable() {
  return (
    <div
      className="mt-10 overflow-x-auto"
      tabIndex={0}
      role="region"
      aria-label="Tabel lintasan penyeberangan"
    >
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <caption className="sr-only">
          Lima lintasan penyeberangan ro-ro beserta kapal dan operatornya
        </caption>
        <thead>
          <tr className="border-b border-surface-3 text-ink-muted">
            <th scope="col" className="py-3 pr-4 font-normal">Lintasan</th>
            <th scope="col" className="py-3 pr-4 font-normal">Kapal</th>
            <th scope="col" className="py-3 font-normal">Operator</th>
          </tr>
        </thead>
        <tbody>
          {ROUTE_LEGS.map((leg) => (
            <tr key={leg.id} className="border-b border-surface-3/50 align-top text-ink">
              <td className="py-4 pr-4">
                <span className="font-display font-bold">{leg.label}</span>
                <span className="mt-1 block text-xs text-ink-muted">{leg.note}</span>
              </td>
              <td className="py-4 pr-4 font-mono text-xs text-ink-muted">
                {vesselsByRoute(leg.id).map((vessel) => (
                  <span key={vessel.name} className="block">
                    {vessel.name}
                  </span>
                ))}
              </td>
              <td className="py-4 text-xs text-ink-muted">{OPERATOR_LABEL[leg.operator]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `bun run test src/features/fleet/route-table.test.tsx`
Expected: PASS, 5 tes.

- [ ] **Step 5: Tulis halaman `src/app/(site)/bisnis/penumpang-roro/page.tsx`**

```tsx
import type { Metadata } from "next";
import { FLEET_CLASSES } from "@/content/fleet";
import { MAIN_LINES } from "@/content/business-lines";
import { COMPANY } from "@/content/company";
import { MEDIA, avifSrc, avifSrcSet } from "@/lib/media/manifest";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { SectionHeader } from "@/components/ui/section-header";
import { ExternalLink } from "@/components/layout/external-link";
import { RouteTable } from "@/features/fleet/route-table";
import { VesselRoster } from "@/features/fleet/vessel-roster";

export const metadata: Metadata = buildMetadata({
  title: "Penyeberangan Ro-Ro | PT Dutabahari Menara Line",
  description:
    "Sembilan kapal ro-ro PT Dutabahari Menara Line di lima lintasan yang menghubungkan Jawa, Bali, Lombok, dan Kalimantan Tengah.",
  path: "/bisnis/penumpang-roro",
});

const RORO_CLASSES = FLEET_CLASSES.filter(
  (fleetClass) => fleetClass.category === "Penumpang Ro-Ro",
);

export default function PenumpangRoroPage() {
  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Bisnis Kami", path: "/bisnis" },
    { name: "Penyeberangan Ro-Ro", path: "/bisnis/penumpang-roro" },
  ]);
  const line = MAIN_LINES.find((entry) => entry.id === "penumpang-roro");
  const hero = MEDIA["bisnis"].find((frame) => frame.id === "lini-roro") ?? null;

  return (
    <div>
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
        <p className="font-mono text-xs text-ink-muted">Lini utama</p>
        <h1 className="mt-4 font-display text-pretty text-4xl font-bold tracking-tight md:text-5xl">
          Penyeberangan Ro-Ro
        </h1>
        <p className="mt-6 max-w-[60ch] text-ink-muted">{line?.summary}</p>
        {hero ? (
          <img
            src={avifSrc(hero, 1600)}
            srcSet={avifSrcSet(hero)}
            sizes="(min-width: 1400px) 1400px, 100vw"
            alt={hero.alt}
            width={1600}
            height={900}
            className="mt-10 aspect-[16/9] w-full rounded-card object-cover"
          />
        ) : null}
      </div>

      <section aria-labelledby="lintasan" className="bg-surface-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <SectionHeader
            id="lintasan"
            title="Lintasan"
            description="Lima lintasan dari company profile halaman 03 dan 04. Kolom operator memisahkan lintasan yang dijalankan sendiri dari lintasan afiliasi."
          />
          <RouteTable />
        </div>
      </section>

      <section aria-labelledby="armada-roro" className="bg-surface-2-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <SectionHeader
            id="armada-roro"
            title="Armada Jambo"
            description="Sembilan kapal ro-ro. Panjang dan kapasitas penumpang di bawah berlaku untuk kelas, bukan diukur per kapal."
          />
          <VesselRoster fleetClasses={RORO_CLASSES} />
          <dl className="mt-12 grid gap-8 sm:grid-cols-3">
            {RORO_CLASSES.map((fleetClass) => (
              <div key={fleetClass.slug}>
                <dt className="text-sm text-ink-muted">Panjang kelas</dt>
                <dd className="mt-1 font-display text-3xl font-bold text-ink">
                  {fleetClass.lengthMeters}
                  <span className="ml-2 font-sans text-sm font-normal text-ink-muted">meter</span>
                </dd>
                <dt className="mt-6 text-sm text-ink-muted">Kapasitas</dt>
                <dd className="mt-1 font-display text-3xl font-bold text-ink">
                  {fleetClass.capacityLabel}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="tiket" className="bg-surface-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <SectionHeader
            id="tiket"
            title="Pesan tiket"
            description={`Pemesanan tiket ro-ro dilayani lewat BookJambo, kanal resmi ${COMPANY.abbreviation}.`}
          />
          <ExternalLink
            href="https://dutabahari.id"
            label="Buka BookJambo"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
          />
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(trail) }}
      />
    </div>
  );
}
```

- [ ] **Step 6: Pastikan tidak ada peta rute, jadwal, atau fasilitas karangan**

```bash
grep -nEi "route-map|RouteMap|jadwal|keberangkatan|fasilitas|kantin|musala" "src/app/(site)/bisnis/penumpang-roro/page.tsx" || echo "bersih"
```
Expected: `bersih`. Peta milik beranda; jadwal dan fasilitas tidak ada di PDF.

- [ ] **Step 7: Build, verifikasi, typecheck, lint**

Run: `bun run build && bun run typecheck && bun run lint`
Expected: bersih, `/bisnis/penumpang-roro` muncul di keluaran build.

```bash
bun run dev &
sleep 8
curl -s http://localhost:3000/bisnis/penumpang-roro | grep -c "Tri Sumaja Lines"
kill %1
```
Expected: minimal `1`. Membuktikan kolom operator benar-benar tayang.

- [ ] **Step 8: Commit**

```bash
git add dml-web/src/features/fleet/route-table.tsx dml-web/src/features/fleet/route-table.test.tsx "dml-web/src/app/(site)/bisnis/penumpang-roro/page.tsx"
git commit -m "feat: halaman lini penyeberangan ro-ro dan komponen RouteTable

Kolom operator memisahkan tegas lintasan DML dari Merak-Bakauheni yang
dijalankan PT Tri Sumaja Lines. Tanpa peta rute (milik beranda), tanpa
jadwal dan fasilitas kapal (tidak ada di company profile)."
```

---

## Task 8: Skema dan server action untuk permintaan informasi B2B

**Files:**
- Modify: `src/features/inquiry/schema.ts`
- Modify: `src/features/inquiry/schema.test.ts`
- Modify: `src/features/inquiry/actions.ts`
- Modify: `src/features/inquiry/actions.test.ts`

**Interfaces:**
- Consumes: `inquirySchema` yang sudah ada; `submitInquiry` yang sudah ada.
- Produces: `businessInquirySchema`; tipe `BusinessInquiryInput`; `submitInquiry` yang kini mengisi kolom `company` dan `service` di koleksi `inquiries`.

**Konteks.** Koleksi `inquiries` (`src/payload/collections/Inquiries.ts`) sudah punya kolom `company` dan `service` yang tidak pernah terisi dari form mana pun, karena `inquirySchema` tidak memilikinya. Task ini menutup celah itu tanpa mengubah perilaku form `/kontak` yang sudah ada.

Jangan menyentuh honeypot, blok `try/catch` Payload, atau komentar `react-doctor-disable-next-line`. Ketiganya menyelesaikan bug nyata yang sudah didokumentasikan di tempatnya.

- [ ] **Step 1: Tulis tes skema yang gagal**

Tambahkan ke `src/features/inquiry/schema.test.ts`:

```ts
import { businessInquirySchema } from "./schema";

describe("businessInquirySchema", () => {
  const valid = {
    name: "Budi Santoso",
    company: "PT Energi Nusantara",
    phone: "+6281234567890",
    email: "budi@energi.co.id",
    service: "transportasi-bbm" as const,
    message: "Kami butuh pengangkutan solar rutin ke Kalimantan Tengah.",
  };

  it("menerima isian lengkap yang valid", () => {
    expect(businessInquirySchema.safeParse(valid).success).toBe(true);
  });

  it("menolak nama perusahaan kosong", () => {
    const result = businessInquirySchema.safeParse({ ...valid, company: "" });
    expect(result.success).toBe(false);
  });

  it("menolak layanan di luar dua lini yang ada", () => {
    const result = businessInquirySchema.safeParse({ ...valid, service: "galangan-kapal" });
    expect(result.success).toBe(false);
  });

  it("field opsional boleh tidak diisi", () => {
    const result = businessInquirySchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cargoType).toBeUndefined();
      expect(result.data.volume).toBeUndefined();
    }
  });

  it("tetap mewarisi validasi telepon dari inquirySchema", () => {
    const result = businessInquirySchema.safeParse({ ...valid, phone: "0812" });
    expect(result.success).toBe(false);
  });

  it("tetap mewarisi honeypot dari inquirySchema", () => {
    const result = businessInquirySchema.safeParse({ ...valid, website: "spam" });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `bun run test src/features/inquiry/schema.test.ts`
Expected: FAIL, `businessInquirySchema` tidak diekspor.

- [ ] **Step 3: Tambahkan skema ke `src/features/inquiry/schema.ts`**

Sisipkan setelah `export type InquiryInput`:

```ts
/**
 * Form B2B di /bisnis/transportasi-bbm/permintaan-informasi. Memperluas
 * inquirySchema, bukan menduplikasinya, supaya aturan telepon, email, dan
 * honeypot cuma hidup di satu tempat.
 *
 * `company` dan `service` menutup celah lama: koleksi inquiries sudah punya
 * kedua kolom itu sejak Plan 2 dan tidak pernah terisi dari form mana pun.
 *
 * Tiga field terakhir opsional dengan sengaja. Calon pelanggan yang belum tahu
 * volume atau rutenya tetap harus bisa mengirim pertanyaan; form yang memaksa
 * angka yang belum ada justru membuang lead.
 */
export const businessInquirySchema = inquirySchema.extend({
  company: z.string().trim().min(2, { error: "Nama perusahaan wajib diisi" }),
  service: z.enum(["transportasi-bbm", "penumpang-roro"], {
    error: "Pilih salah satu lini layanan",
  }),
  cargoType: z.string().trim().optional(),
  route: z.string().trim().optional(),
  volume: z.string().trim().optional(),
});

export type BusinessInquiryInput = z.infer<typeof businessInquirySchema>;
```

- [ ] **Step 4: Jalankan tes skema, pastikan lolos**

Run: `bun run test src/features/inquiry/schema.test.ts`
Expected: PASS, termasuk enam tes baru.

- [ ] **Step 5: Tulis tes action yang gagal**

Tambahkan ke `src/features/inquiry/actions.test.ts`, mengikuti pola mock yang sudah dipakai berkas itu:

```ts
it("menyimpan company dan service untuk kirim B2B", async () => {
  const result = await submitInquiry(
    {
      name: "Budi Santoso",
      company: "PT Energi Nusantara",
      phone: "+6281234567890",
      email: "budi@energi.co.id",
      service: "transportasi-bbm",
      message: "Kami butuh pengangkutan solar rutin ke Kalimantan Tengah.",
    },
    "permintaan-informasi-bbm",
  );

  expect(result).toEqual({ ok: true });
  expect(createMock).toHaveBeenCalledWith(
    expect.objectContaining({
      collection: "inquiries",
      data: expect.objectContaining({
        company: "PT Energi Nusantara",
        service: "transportasi-bbm",
        source: "permintaan-informasi-bbm",
      }),
    }),
  );
});

it("kirim dari /kontak tetap tersimpan tanpa company dan service", async () => {
  const result = await submitInquiry(
    {
      name: "Siti Rahayu",
      phone: "+6281234567891",
      email: "siti@example.com",
      message: "Saya ingin bertanya tentang jadwal penyeberangan.",
    },
    "kontak",
  );

  expect(result).toEqual({ ok: true });
  expect(createMock).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({ source: "kontak" }),
    }),
  );
});
```

Kalau `createMock` belum ada namanya di berkas itu, pakai nama variabel mock `payload.create` yang sudah dipakai tes-tes sebelumnya di berkas yang sama. Baca berkasnya dulu; jangan menambah mock kedua yang bertabrakan dengan yang sudah ada.

- [ ] **Step 6: Jalankan tes, pastikan gagal**

Run: `bun run test src/features/inquiry/actions.test.ts`
Expected: FAIL, `company` dan `service` tidak ada di objek `data` yang dikirim ke `payload.create`.

- [ ] **Step 7: Perluas `submitInquiry` di `src/features/inquiry/actions.ts`**

Ganti pemanggilan `inquirySchema.safeParse(input)` dan blok `payload.create` menjadi:

```ts
  // Dua skema, satu action. Form B2B mengirim field tambahan; form /kontak
  // tidak. Coba skema yang lebih luas dulu, lalu jatuh ke yang dasar, supaya
  // kiriman /kontak yang tidak punya company tetap lolos apa adanya.
  const business = businessInquirySchema.safeParse(input);
  const parsed = business.success ? business : inquirySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Periksa kembali isian form." };
  }
```

lalu di dalam `payload.create`:

```ts
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email,
        message: parsed.data.message,
        ...(business.success
          ? { company: business.data.company, service: business.data.service }
          : {}),
        source,
      },
```

Tambahkan `businessInquirySchema` ke baris import dari `./schema`.

- [ ] **Step 8: Jalankan seluruh tes inquiry, pastikan lolos**

Run: `bun run test src/features/inquiry/`
Expected: PASS seluruhnya, termasuk tes lama `/kontak` yang tidak boleh berubah perilakunya.

- [ ] **Step 9: Typecheck dan commit**

Run: `bun run typecheck`
Expected: bersih.

```bash
git add dml-web/src/features/inquiry/schema.ts dml-web/src/features/inquiry/schema.test.ts dml-web/src/features/inquiry/actions.ts dml-web/src/features/inquiry/actions.test.ts
git commit -m "feat: skema dan action untuk permintaan informasi bisnis

Koleksi inquiries sudah punya kolom company dan service sejak Plan 2 dan
tidak pernah terisi dari form mana pun. businessInquirySchema memperluas
inquirySchema, bukan menduplikasinya, supaya aturan telepon, email, dan
honeypot tetap hidup di satu tempat."
```

---

## Task 9: Halaman dan form `/bisnis/transportasi-bbm/permintaan-informasi`

**Files:**
- Create: `src/features/inquiry/business-inquiry-form.tsx`
- Create: `src/features/inquiry/business-inquiry-form.test.tsx`
- Create: `src/app/(site)/bisnis/transportasi-bbm/permintaan-informasi/page.tsx`

**Interfaces:**
- Consumes: `businessInquirySchema`, `BusinessInquiryInput` dari Task 8; `submitInquiry` dari Task 8; `TextField`, `SubmitButton`; `COMPANY.whatsapp`.
- Produces: `BusinessInquiryForm({ whatsappNumber, defaultService })`; route `/bisnis/transportasi-bbm/permintaan-informasi`.

**Konteks.** `searchParams` di Next 16 adalah **Promise**, jadi halaman harus `async` dan menunggu resolusinya. Nilai `?layanan=` yang tidak dikenali diabaikan diam-diam dan field kembali ke default; nilai query tidak pernah dipakai merangkai teks yang ditampilkan.

`ContactForm` yang sudah ada adalah rujukan pola: honeypot `sr-only`, `noValidate`, jaring pengaman `try/catch` di sekitar server action, dan redirect `wa.me` setelah sukses. Ikuti polanya, jangan menyimpang.

- [ ] **Step 1: Tulis tes form yang gagal**

Buat `src/features/inquiry/business-inquiry-form.test.tsx`:

```tsx
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BusinessInquiryForm } from "./business-inquiry-form";

vi.mock("./actions", () => ({
  submitInquiry: vi.fn(async () => ({ ok: true }) as const),
}));

describe("BusinessInquiryForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menampilkan seluruh field wajib dengan label di atas input", () => {
    render(<BusinessInquiryForm whatsappNumber="625116773845" defaultService="transportasi-bbm" />);
    expect(screen.getByLabelText("Nama")).toBeInTheDocument();
    expect(screen.getByLabelText("Nama perusahaan")).toBeInTheDocument();
    expect(screen.getByLabelText("Nomor telepon")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Kebutuhan")).toBeInTheDocument();
  });

  it("memilih layanan sesuai defaultService", () => {
    render(<BusinessInquiryForm whatsappNumber="625116773845" defaultService="penumpang-roro" />);
    expect(screen.getByLabelText("Lini layanan")).toHaveValue("penumpang-roro");
  });

  it("input membawa autocomplete yang benar", () => {
    render(<BusinessInquiryForm whatsappNumber="625116773845" defaultService="transportasi-bbm" />);
    expect(screen.getByLabelText("Nama")).toHaveAttribute("autocomplete", "name");
    expect(screen.getByLabelText("Nama perusahaan")).toHaveAttribute("autocomplete", "organization");
    expect(screen.getByLabelText("Nomor telepon")).toHaveAttribute("autocomplete", "tel");
    expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "email");
  });

  it("menampilkan galat validasi di bawah input saat isian kosong", async () => {
    const user = userEvent.setup();
    render(<BusinessInquiryForm whatsappNumber="625116773845" defaultService="transportasi-bbm" />);
    await user.click(screen.getByRole("button", { name: "Kirim permintaan" }));
    expect(await screen.findByText("Nama wajib diisi")).toBeInTheDocument();
    expect(await screen.findByText("Nama perusahaan wajib diisi")).toBeInTheDocument();
  });

  it("punya honeypot yang tersembunyi dari pembaca layar", () => {
    const { container } = render(
      <BusinessInquiryForm whatsappNumber="625116773845" defaultService="transportasi-bbm" />,
    );
    const honeypot = container.querySelector("#business-website");
    expect(honeypot).not.toBeNull();
    expect(honeypot?.closest("[aria-hidden='true']")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `bun run test src/features/inquiry/business-inquiry-form.test.tsx`
Expected: FAIL, `Failed to resolve import "./business-inquiry-form"`.

- [ ] **Step 3: Tulis `src/features/inquiry/business-inquiry-form.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { businessInquirySchema, type BusinessInquiryInput } from "./schema";
import { submitInquiry } from "./actions";
import { TextField } from "@/components/ui/text-field";
import { SubmitButton } from "@/components/ui/submit-button";

const SERVICE_OPTIONS = [
  { value: "transportasi-bbm", label: "Transportasi BBM" },
  { value: "penumpang-roro", label: "Penyeberangan Ro-Ro" },
] as const;

export function BusinessInquiryForm({
  whatsappNumber,
  defaultService,
}: {
  whatsappNumber: string;
  defaultService: BusinessInquiryInput["service"];
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessInquiryInput>({
    resolver: zodResolver(businessInquirySchema),
    defaultValues: { service: defaultService },
  });

  const onSubmit = async (data: BusinessInquiryInput) => {
    setFormError(null);
    // Jaring pengaman kedua, sama alasannya dengan ContactForm: actions.ts
    // sudah menangkap kegagalan Payload, tapi server action juga bisa gagal
    // sebelum kodenya sempat jalan.
    let result: Awaited<ReturnType<typeof submitInquiry>>;
    try {
      result = await submitInquiry(data, "permintaan-informasi-bbm");
    } catch (error) {
      console.error("submitInquiry gagal", error);
      setFormError("Permintaan gagal terkirim. Periksa koneksi lalu coba lagi.");
      return;
    }
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setSent(true);
    const lines = [
      `Halo, saya ${data.name} dari ${data.company}.`,
      `Lini layanan: ${SERVICE_OPTIONS.find((option) => option.value === data.service)?.label}`,
      data.cargoType ? `Jenis muatan: ${data.cargoType}` : null,
      data.route ? `Rute: ${data.route}` : null,
      data.volume ? `Perkiraan volume: ${data.volume}` : null,
      data.message,
    ].filter(Boolean);
    window.location.assign(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`,
    );
  };

  if (sent) {
    return (
      <p role="status" className="text-ink">
        Permintaan tersimpan. Mengalihkan ke WhatsApp...
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <TextField
        id="business-name"
        label="Nama"
        autoComplete="name"
        register={register("name")}
        error={errors.name?.message}
      />
      <TextField
        id="business-company"
        label="Nama perusahaan"
        autoComplete="organization"
        register={register("company")}
        error={errors.company?.message}
      />
      <TextField
        id="business-phone"
        label="Nomor telepon"
        type="tel"
        autoComplete="tel"
        register={register("phone")}
        error={errors.phone?.message}
      />
      <TextField
        id="business-email"
        label="Email"
        type="email"
        autoComplete="email"
        register={register("email")}
        error={errors.email?.message}
      />

      <div>
        <label htmlFor="business-service" className="text-sm font-medium text-ink">
          Lini layanan
        </label>
        <select
          id="business-service"
          className="mt-2 w-full rounded-input border border-line bg-surface-2 px-4 py-2.5 text-ink transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          {...register("service")}
        >
          {SERVICE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.service?.message ? (
          <p role="alert" className="mt-1.5 text-sm text-danger">
            {errors.service.message}
          </p>
        ) : null}
      </div>

      <TextField
        id="business-cargo"
        label="Jenis muatan (opsional)"
        register={register("cargoType")}
        error={errors.cargoType?.message}
      />
      <TextField
        id="business-route"
        label="Rute (opsional)"
        register={register("route")}
        error={errors.route?.message}
      />
      <TextField
        id="business-volume"
        label="Perkiraan volume (opsional)"
        register={register("volume")}
        error={errors.volume?.message}
      />
      <TextField
        id="business-message"
        label="Kebutuhan"
        multiline
        register={register("message")}
        error={errors.message?.message}
      />

      <div className="sr-only" aria-hidden="true">
        <label htmlFor="business-website">Situs web</label>
        <input
          id="business-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      {formError ? (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      ) : null}
      <SubmitButton pending={isSubmitting} label="Kirim permintaan" pendingLabel="Mengirim..." />
    </form>
  );
}
```

- [ ] **Step 4: Jalankan tes form, pastikan lolos**

Run: `bun run test src/features/inquiry/business-inquiry-form.test.tsx`
Expected: PASS, 5 tes.

- [ ] **Step 5: Tulis halaman**

Buat `src/app/(site)/bisnis/transportasi-bbm/permintaan-informasi/page.tsx`:

```tsx
import type { Metadata } from "next";
import { COMPANY } from "@/content/company";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { BusinessInquiryForm } from "@/features/inquiry/business-inquiry-form";
import type { BusinessInquiryInput } from "@/features/inquiry/schema";

export const metadata: Metadata = buildMetadata({
  title: "Permintaan Informasi Bisnis | PT Dutabahari Menara Line",
  description:
    "Ajukan permintaan informasi untuk transportasi BBM atau penyeberangan ro-ro PT Dutabahari Menara Line.",
  path: "/bisnis/transportasi-bbm/permintaan-informasi",
});

const SERVICES: BusinessInquiryInput["service"][] = ["transportasi-bbm", "penumpang-roro"];

/**
 * Prefill lewat ?layanan=. Nilai yang tidak dikenali diabaikan diam-diam dan
 * field kembali ke default, bukan melempar galat: tautan lama atau salah ketik
 * tidak boleh membuat halaman form gagal dibuka. Nilai query juga tidak pernah
 * dipakai merangkai teks yang ditampilkan.
 *
 * searchParams adalah Promise di Next 16, jadi halaman ini async.
 */
function resolveService(raw: string | string[] | undefined): BusinessInquiryInput["service"] {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return SERVICES.find((service) => service === value) ?? "transportasi-bbm";
}

export default async function PermintaanInformasiPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const defaultService = resolveService(params.layanan);

  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Bisnis Kami", path: "/bisnis" },
    { name: "Transportasi BBM", path: "/bisnis/transportasi-bbm" },
    {
      name: "Permintaan Informasi",
      path: "/bisnis/transportasi-bbm/permintaan-informasi",
    },
  ]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
      <h1 className="font-display text-pretty text-4xl font-bold tracking-tight md:text-5xl">
        Permintaan Informasi Bisnis
      </h1>
      <p className="mt-4 max-w-[60ch] text-ink-muted">
        Isi form di bawah untuk kebutuhan pengangkutan atau kerja sama. Tim kami akan
        menghubungi lewat WhatsApp. Tiga field terakhir opsional, kirim saja meski
        volumenya belum pasti.
      </p>

      <div className="mt-12 grid gap-12 md:grid-cols-[3fr_2fr]">
        <BusinessInquiryForm
          whatsappNumber={COMPANY.whatsapp}
          defaultService={defaultService}
        />
        <aside className="space-y-6 text-sm text-ink-muted">
          <div>
            <p className="font-display font-bold text-ink">Kontak langsung</p>
            <p className="mt-1">{COMPANY.phone}</p>
          </div>
          {COMPANY.offices.map((office) => (
            <div key={office.street}>
              <p className="font-display font-bold text-ink">{office.label}</p>
              <p className="mt-1">{office.street}</p>
              <p>
                {office.city} {office.postalCode ? `${office.postalCode}, ` : ""}
                {office.province}
              </p>
            </div>
          ))}
        </aside>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(trail) }}
      />
    </div>
  );
}
```

- [ ] **Step 6: Verifikasi prefill bekerja dan nilai asing tidak memecahkan halaman**

```bash
docker compose up -d
until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
bun run dev &
sleep 8
curl -s "http://localhost:3000/bisnis/transportasi-bbm/permintaan-informasi?layanan=penumpang-roro" | grep -c 'value="penumpang-roro" selected'
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/bisnis/transportasi-bbm/permintaan-informasi?layanan=galangan-kapal"
kill %1
```
Expected: `1` lalu `200`. Nilai asing menghasilkan halaman normal dengan default `transportasi-bbm`, bukan galat.

Kalau `grep` pertama mengembalikan `0`, periksa apakah React merender atribut `selected` atau `defaultValue`; sesuaikan pola grep, jangan mengubah komponen kalau nilainya sudah benar di DOM.

- [ ] **Step 7: Build, typecheck, lint**

Run: `bun run build && bun run typecheck && bun run lint`
Expected: bersih.

- [ ] **Step 8: Commit**

```bash
git add dml-web/src/features/inquiry/business-inquiry-form.tsx dml-web/src/features/inquiry/business-inquiry-form.test.tsx "dml-web/src/app/(site)/bisnis/transportasi-bbm/permintaan-informasi/page.tsx"
git commit -m "feat: halaman dan form permintaan informasi bisnis

Memakai ulang fitur inquiry yang sudah ada, bukan form kedua dari nol.
Prefill lewat ?layanan=; nilai yang tidak dikenali diabaikan diam-diam
supaya tautan lama tidak membuat halaman form gagal dibuka."
```

---

## Task 10: Tabel legalitas di `/tentang-kami#profil`

**Files:**
- Create: `src/features/about/legal-table.tsx`
- Create: `src/features/about/legal-table.test.tsx`
- Modify: `src/app/(site)/tentang-kami/page.tsx:68-71` (blok "Legalitas dan Sertifikasi")

**Interfaces:**
- Consumes: `LEGAL_DOCUMENTS` dari Task 2.
- Produces: `LegalTable()`, tanpa prop.

**Konteks.** Heading "Legalitas dan Sertifikasi" sudah ada di `tentang-kami/page.tsx:69` dan isinya satu kalimat plus klaster standar. Task ini menambahkan tabelnya di bawah klaster yang sudah ada, tidak menggantinya.

Di bawah 768 px tabel **jatuh ke daftar bertingkat, bukan tabel yang menggulir horizontal**. Kolom penerbit di sini panjang (satu di antaranya 78 karakter), dan tabel gulir horizontal di mobile sudah pernah jadi temuan aksesibilitas di Plan 6. Ini beda perlakuan dari `FleetSpecTable` dan `RouteTable`, yang kolomnya pendek dan angka.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `src/features/about/legal-table.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LegalTable } from "./legal-table";
import { LEGAL_DOCUMENTS } from "@/content/legal-documents";

describe("LegalTable", () => {
  it("menampilkan seluruh sembilan dokumen", () => {
    render(<LegalTable />);
    for (const entry of LEGAL_DOCUMENTS) {
      expect(screen.getAllByText(entry.document).length).toBeGreaterThan(0);
    }
  });

  it("menampilkan nomor dan penerbit tiap dokumen", () => {
    render(<LegalTable />);
    expect(screen.getAllByText("9120001262268").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Direktorat Jenderal Pajak").length).toBeGreaterThan(0);
  });

  it("tabel punya caption untuk pembaca layar", () => {
    render(<LegalTable />);
    expect(screen.getByRole("table")).toHaveAccessibleName();
  });

  it("menyediakan daftar alternatif untuk viewport sempit", () => {
    const { container } = render(<LegalTable />);
    expect(container.querySelector("dl")).not.toBeNull();
  });

  it("menyebut sumber datanya", () => {
    render(<LegalTable />);
    expect(screen.getByText(/company profile/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `bun run test src/features/about/legal-table.test.tsx`
Expected: FAIL, `Failed to resolve import "./legal-table"`.

- [ ] **Step 3: Tulis `src/features/about/legal-table.tsx`**

```tsx
import { LEGAL_DOCUMENTS } from "@/content/legal-documents";

/**
 * Dua penyajian dari satu data, bukan satu tabel yang menggulir.
 *
 * Kolom penerbit di sini panjang, salah satunya 78 karakter, sehingga tabel
 * tiga kolom di 375 px hanya bisa dibaca dengan menggulir mendatar. Tabel
 * gulir mendatar di mobile sudah jadi temuan aksesibilitas di Plan 6, jadi di
 * bawah md data yang sama disajikan sebagai daftar definisi bertingkat.
 * Ini beda perlakuan dari FleetSpecTable dan RouteTable, yang kolomnya pendek
 * dan berisi angka sehingga masih masuk akal digulir.
 */
export function LegalTable() {
  return (
    <div className="mt-8">
      <table className="hidden w-full border-collapse text-left text-sm md:table">
        <caption className="sr-only">
          Dokumen legal PT Dutabahari Menara Line beserta nomor dan penerbitnya
        </caption>
        <thead>
          <tr className="border-b border-surface-3 text-ink-muted">
            <th scope="col" className="py-3 pr-4 font-normal">Dokumen</th>
            <th scope="col" className="py-3 pr-4 font-normal">Nomor</th>
            <th scope="col" className="py-3 font-normal">Diterbitkan oleh</th>
          </tr>
        </thead>
        <tbody>
          {LEGAL_DOCUMENTS.map((entry) => (
            <tr key={entry.number} className="border-b border-surface-3/50 align-top text-ink">
              <td className="py-3 pr-4">{entry.document}</td>
              <td className="py-3 pr-4 font-mono text-xs">{entry.number}</td>
              <td className="py-3 text-xs text-ink-muted">{entry.issuer}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="space-y-6 md:hidden">
        {LEGAL_DOCUMENTS.map((entry) => (
          <div key={entry.number} className="border-b border-surface-3/50 pb-4">
            <dt className="font-display font-bold text-ink">{entry.document}</dt>
            <dd className="mt-1 font-mono text-xs text-ink">{entry.number}</dd>
            <dd className="mt-1 text-xs text-ink-muted">{entry.issuer}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 font-mono text-xs text-ink-muted">
        Sumber: company profile PT Dutabahari Menara Line halaman 06.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `bun run test src/features/about/legal-table.test.tsx`
Expected: PASS, 5 tes.

- [ ] **Step 5: Sisipkan ke `/tentang-kami`**

Di `src/app/(site)/tentang-kami/page.tsx`, tambahkan import:

```tsx
import { LegalTable } from "@/features/about/legal-table";
```

Lalu di dalam `<div>` yang memuat heading "Legalitas dan Sertifikasi", tepat setelah blok `COMPANY.standards.map(...)` ditutup, sisipkan:

```tsx
              <LegalTable />
```

Grid `md:grid-cols-2` yang membungkusnya membuat tabel terjepit di kolom sempit. Ubah pembungkus `Reveal` di seksi `#profil` dari `md:grid-cols-2` jadi satu kolom untuk blok legalitas, dengan memindahkan `<LegalTable />` keluar dari grid dan menaruhnya sebagai saudara di bawah grid:

```tsx
          <Reveal className="mt-8 grid gap-10 md:grid-cols-2">
            {/* blok Visi/Misi dan blok Legalitas tetap seperti sekarang */}
          </Reveal>
          <LegalTable />
```

- [ ] **Step 6: Verifikasi tabel tayang di halaman**

```bash
bun run dev &
sleep 8
curl -s http://localhost:3000/tentang-kami | grep -c "01.474.162.2-731.000"
kill %1
```
Expected: minimal `1`.

- [ ] **Step 7: Jalankan seluruh tes dan gerbang cepat**

Run: `bun run test && bun run typecheck && bun run lint`
Expected: bersih.

- [ ] **Step 8: Commit**

```bash
git add dml-web/src/features/about/legal-table.tsx dml-web/src/features/about/legal-table.test.tsx "dml-web/src/app/(site)/tentang-kami/page.tsx"
git commit -m "feat: tabel dokumen legal di /tentang-kami#profil

Heading Legalitas dan Sertifikasi sudah ada sejak Plan 2 tapi isinya satu
kalimat. Datanya lengkap di company profile hal. 06 dan tidak pernah
diblokir klien.

Di bawah md tabel jatuh ke daftar definisi, bukan gulir mendatar: kolom
penerbit di sini sampai 78 karakter, dan tabel gulir mendatar di mobile
sudah jadi temuan aksesibilitas di Plan 6."
```

---

## Task 11: Sinkronkan `sitemap.ts` dan pakukan dengan tes

**Files:**
- Modify: `src/app/sitemap.ts`
- Create: `src/app/sitemap.test.ts`

**Interfaces:**
- Consumes: `absoluteUrl` dari `@/lib/seo/metadata`.
- Produces: `STATIC_PATHS` diekspor supaya bisa diuji.

**Konteks.** `sitemap.ts` saat ini mengiklankan enam URL yang 404 ke mesin pencari: `/bisnis`, `/bisnis/transportasi-bbm`, `/bisnis/penumpang-roro`, `/bisnis/galangan-kapal`, `/artikel`, dan (setelah Task 5 sampai 9) tiga di antaranya sudah hidup. Yang tersisa setelah plan ini: `/bisnis/galangan-kapal` yang **dicoret permanen**, dan `/artikel` yang menunggu Plan 9.

`/bisnis/galangan-kapal` dicoret karena PT Dutabahari Menara Line Dockyard adalah perusahaan terpisah di Sinar Alam Corporation, bukan lini DML. Keputusan itu sudah tertulis di docblock `src/content/navigation.ts:14-22` dan sudah tercermin di footer; hanya sitemap yang belum ikut.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `src/app/sitemap.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import sitemap, { STATIC_PATHS } from "./sitemap";

/**
 * Path di sitemap dicocokkan ke berkas page.tsx yang benar-benar ada di disk.
 * Tanpa tes ini sitemap bisa melenceng diam-diam dari route, dan cacat persis
 * itu hidup di repo sejak Plan 1: enam URL yang 404 diiklankan ke mesin
 * pencari selama tujuh plan.
 */
function pageFileFor(path: string): string {
  const segment = path === "/" ? "" : path;
  return resolve(process.cwd(), `src/app/(site)${segment}/page.tsx`);
}

describe("sitemap", () => {
  it("setiap path statis punya berkas page.tsx yang benar-benar ada", () => {
    for (const path of STATIC_PATHS) {
      expect(existsSync(pageFileFor(path)), `route hilang untuk ${path}`).toBe(true);
    }
  });

  it("tidak lagi mengiklankan /bisnis/galangan-kapal", () => {
    // DMLD adalah perusahaan terpisah di Sinar Alam Corporation, bukan lini
    // DML. Lihat docblock di src/content/navigation.ts.
    expect(STATIC_PATHS).not.toContain("/bisnis/galangan-kapal");
  });

  it("belum mengiklankan /artikel, itu Plan 9", () => {
    // Dicabut sengaja dan sementara. Begitu Plan 9 membangun koleksi posts
    // dan kedua route artikel, path ini kembali beserta slug dinamisnya.
    expect(STATIC_PATHS).not.toContain("/artikel");
  });

  it("memuat keempat route bisnis baru", () => {
    expect(STATIC_PATHS).toContain("/bisnis");
    expect(STATIC_PATHS).toContain("/bisnis/transportasi-bbm");
    expect(STATIC_PATHS).toContain("/bisnis/penumpang-roro");
    expect(STATIC_PATHS).toContain("/bisnis/transportasi-bbm/permintaan-informasi");
  });

  it("beranda punya prioritas tertinggi", () => {
    const entries = sitemap();
    const home = entries.find((entry) => entry.url.endsWith("/"));
    expect(home?.priority).toBe(1);
  });

  it("setiap entri punya URL absolut", () => {
    for (const entry of sitemap()) {
      expect(entry.url).toMatch(/^https?:\/\//);
    }
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `bun run test src/app/sitemap.test.ts`
Expected: FAIL. `STATIC_PATHS` belum diekspor, dan setelah diekspor, tes route-hilang gagal untuk `/bisnis/galangan-kapal` dan `/artikel`.

- [ ] **Step 3: Perbarui `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/metadata";

/**
 * Diekspor supaya sitemap.test.ts bisa mencocokkan tiap path ke berkas
 * page.tsx yang benar-benar ada. Sebelum Plan 8, daftar ini memuat enam URL
 * yang 404 dan diiklankan ke mesin pencari selama tujuh plan.
 *
 * /bisnis/galangan-kapal dicoret permanen: PT Dutabahari Menara Line Dockyard
 * adalah perusahaan terpisah di dalam Sinar Alam Corporation, bukan lini DML,
 * dan perawatan armada DML sendiri dikerjakan afiliasi Dutabahari Teknik.
 * Lihat docblock di src/content/navigation.ts.
 *
 * /artikel dicabut sementara sampai Plan 9 membangun koleksi posts beserta
 * kedua route-nya. Saat itu path ini kembali, bersama slug artikel published
 * yang ditambahkan secara dinamis.
 */
export const STATIC_PATHS = [
  "/",
  "/tentang-kami",
  "/bisnis",
  "/bisnis/transportasi-bbm",
  "/bisnis/transportasi-bbm/permintaan-informasi",
  "/bisnis/penumpang-roro",
  "/karier",
  "/kontak",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
```

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `bun run test src/app/sitemap.test.ts`
Expected: PASS, 6 tes.

Kalau tes route-hilang gagal untuk salah satu path bisnis, berarti Task 5 sampai 9 belum lengkap. Perbaiki task itu, jangan melonggarkan tes ini.

- [ ] **Step 5: Verifikasi sitemap sungguhan**

```bash
bun run dev &
sleep 8
curl -s http://localhost:3000/sitemap.xml
kill %1
```
Expected: delapan `<url>`, tanpa `galangan-kapal`, tanpa `/artikel`.

- [ ] **Step 6: Commit**

```bash
git add dml-web/src/app/sitemap.ts dml-web/src/app/sitemap.test.ts
git commit -m "fix: sitemap tidak lagi mengiklankan enam URL yang 404

Cacat ini hidup sejak Plan 1. Sekarang dipaku tes yang mencocokkan tiap
path ke berkas page.tsx di disk, jadi ia tidak bisa melenceng lagi diam-
diam.

galangan-kapal dicoret permanen sesuai keputusan yang sudah tertulis di
navigation.ts; /artikel dicabut sementara sampai Plan 9."
```

---

## Task 12: Perbaiki copy usang di `/kontak` dan Misi di `/tentang-kami`

**Files:**
- Modify: `src/app/(site)/kontak/page.tsx:58-72`
- Modify: `src/app/(site)/tentang-kami/page.tsx:60-65` (paragraf Misi)

**Interfaces:** Tidak ada perubahan antarmuka.

**Konteks.** Tiga cacat copy, semuanya konsekuensi Plan 5 yang memangkas lini bisnis dari tiga jadi dua tanpa menyapu halaman lain:

1. `/kontak` menulis "Ketiga lini bisnis kami" padahal `BUSINESS_LINES` yang dirender tinggal dua.
2. `/kontak` memakai `sm:grid-cols-3` untuk daftar dua item, menyisakan satu kolom menganga.
3. `/kontak` menjanjikan "Halaman detail tiap lini menyusul di plan berikutnya." Plan ini adalah plan berikutnya itu.
4. Misi di `/tentang-kami` masih menyebut "galangan kapal" sebagai kegiatan DML: "Mengoperasikan armada transportasi BBM, penyeberangan ro-ro, dan galangan kapal". Itu membantah keputusan dua lini yang sudah dipegang navigasi, footer, beranda, dan sitemap.

- [ ] **Step 1: Perbaiki seksi Kontak per Divisi di `src/app/(site)/kontak/page.tsx`**

Ganti seluruh `<section className="mt-16 ...">` menjadi:

```tsx
      <section className="mt-16 border-t border-surface-3 pt-10">
        <h2 className="font-display text-pretty text-xl font-bold">Kontak per Lini Bisnis</h2>
        <p className="mt-2 max-w-[60ch] text-sm text-ink-muted">
          Kedua lini bisnis kami saat ini melayani lewat satu nomor kontak yang sama.
          Detail armada, lintasan, dan standar operasi ada di halaman masing-masing lini.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {BUSINESS_LINES.map((line) => (
            <li key={line.label} className="rounded-card border border-surface-3 bg-surface-2 p-5">
              <p className="font-display font-bold text-ink">{line.label}</p>
              <p className="mt-2 text-sm text-ink-muted">{COMPANY.phone}</p>
              <Link
                href={line.href}
                className="mt-3 inline-flex text-sm text-accent transition-colors hover:text-accent-hover"
              >
                Lihat detail lini
              </Link>
            </li>
          ))}
        </ul>
      </section>
```

Tambahkan `import Link from "next/link";` di bagian atas berkas kalau belum ada.

- [ ] **Step 2: Perbaiki Misi di `src/app/(site)/tentang-kami/page.tsx`**

Ganti paragraf Misi:

```tsx
              <p className="mt-2 max-w-[50ch] text-ink-muted">
                Mengoperasikan armada transportasi BBM dan penyeberangan ro-ro dengan
                standar keselamatan dan kualitas tertinggi.
              </p>
```

Perawatan kapal dikerjakan afiliasi Dutabahari Teknik, dan galangan adalah perusahaan grup terpisah; keduanya bukan kegiatan DML sendiri. Komentar `{/* draft: visi-misi belum direview klien, konfirmasi sebelum situs live */}` yang ada di atas blok itu **tetap dipertahankan** — copy ini masih menunggu review klien, dan task ini hanya membetulkan kontradiksi faktualnya.

- [ ] **Step 3: Pastikan tidak ada sisa klaim tiga lini di seluruh repo**

```bash
grep -rniE "ketiga lini|tiga lini|dan galangan kapal" src/ || echo "bersih"
```
Expected: `bersih`.

- [ ] **Step 4: Pastikan janji "plan berikutnya" sudah hilang**

```bash
grep -rn "plan berikutnya" "src/app/(site)/" || echo "bersih"
```
Expected: `bersih`.

- [ ] **Step 5: Jalankan tes dan gerbang cepat**

Run: `bun run test && bun run typecheck && bun run lint`
Expected: bersih. Kalau ada tes yang memaku string lama, perbarui tesnya bersama copy-nya.

- [ ] **Step 6: Commit**

```bash
git add "dml-web/src/app/(site)/kontak/page.tsx" "dml-web/src/app/(site)/tentang-kami/page.tsx"
git commit -m "fix: copy yang masih mengklaim tiga lini bisnis

Plan 5 memangkas lini dari tiga jadi dua tapi tidak menyapu halaman lain.
Tersisa: 'Ketiga lini bisnis' di /kontak dengan grid tiga kolom untuk dua
item, dan Misi di /tentang-kami yang masih menyebut galangan kapal sebagai
kegiatan DML. Janji 'halaman detail menyusul di plan berikutnya' diganti
tautan sungguhan, karena plan ini yang menepatinya."
```

---

## Task 13: Hapus `jobPostingJsonLd` yang tidak pernah dipanggil

**Files:**
- Modify: `src/lib/seo/json-ld.ts:53-69`
- Modify: `src/lib/seo/json-ld.test.ts`

**Interfaces:**
- Produces: `json-ld.ts` tanpa `jobPostingJsonLd`. `organizationJsonLd`, `breadcrumbJsonLd`, dan `safeJsonLdString` tidak berubah.

**Konteks.** `jobPostingJsonLd` diekspor dan dites, tapi tidak pernah dipanggil halaman mana pun; satu-satunya pemakainya adalah berkas tesnya sendiri. Tidak ada koleksi lowongan, dan `/karier` sengaja tetap empty state. Menulis ulang delapan baris itu ketika lowongan datang lebih murah daripada memelihara fungsi yang tidak pernah jalan dan tidak pernah terbukti menghasilkan JSON-LD yang valid di halaman sungguhan.

- [ ] **Step 1: Buktikan ulang bahwa ia memang dead code**

```bash
grep -rn "jobPostingJsonLd" src/ tests/
```
Expected: hanya kemunculan di `src/lib/seo/json-ld.ts` dan `src/lib/seo/json-ld.test.ts`. Kalau ada kemunculan lain, **berhenti** dan laporkan; asumsi task ini salah.

- [ ] **Step 2: Hapus fungsi dari `src/lib/seo/json-ld.ts`**

Hapus seluruh blok `export function jobPostingJsonLd(...) { ... }` di akhir berkas. Jangan menyentuh `safeJsonLdString` beserta docblock-nya; docblock itu menjelaskan kenapa escape `<` dipasang di sana, dan Plan 9 akan memakainya untuk JSON-LD artikel.

- [ ] **Step 3: Hapus describe-nya dari `src/lib/seo/json-ld.test.ts`**

Hapus blok `describe("jobPostingJsonLd", ...)` beserta `jobPostingJsonLd` dari daftar import di baris 4.

- [ ] **Step 4: Jalankan tes**

Run: `bun run test src/lib/seo/json-ld.test.ts`
Expected: PASS, tanpa tes `jobPostingJsonLd`.

- [ ] **Step 5: Pastikan `/karier` masih utuh**

```bash
bun run dev &
sleep 8
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/karier
curl -s http://localhost:3000/karier | grep -c "BreadcrumbList"
kill %1
```
Expected: `200` lalu `1`. `/karier` memang tidak pernah memakai `jobPostingJsonLd`; ia hanya memakai `breadcrumbJsonLd`, dan itu yang harus tetap ada.

- [ ] **Step 6: Typecheck, lint, commit**

Run: `bun run typecheck && bun run lint`
Expected: bersih.

```bash
git add dml-web/src/lib/seo/json-ld.ts dml-web/src/lib/seo/json-ld.test.ts
git commit -m "refactor: hapus jobPostingJsonLd yang tidak pernah dipanggil

Diekspor dan dites, tapi satu-satunya pemakainya adalah berkas tesnya
sendiri. Tidak ada koleksi lowongan dan /karier sengaja tetap empty state.
Menulis ulang delapan baris ini nanti lebih murah daripada memelihara
fungsi yang tidak pernah jalan di halaman sungguhan."
```

---

## Task 14: `Reveal` pindah ke `fromTo` + `clearProps`

**Files:**
- Modify: `src/components/motion/reveal.tsx:30-42`
- Modify: `tests/e2e/tentang-kami.spec.ts` (tinjau guard `reducedMotion`)
- Modify: `tests/e2e/a11y-viewport.spec.ts` (tinjau guard `reducedMotion`)

**Interfaces:** Tanda tangan `Reveal({ children, stagger, className })` tidak berubah.

**Konteks.** Audit Plan 6 mencatat ini sebagai "layak jadi task tersendiri kalau pemilik repo mau menutupnya nanti". `Reveal` memakai `gsap.from()`, sedangkan hero sudah memakai `fromTo()` + `clearProps`.

Bedanya nyata. `gsap.from()` menetapkan keadaan awal saat tween dibuat, dan `ScrollTrigger` baru menjalankannya ketika elemen mencapai `top 82%`. Di antara kedua momen itu, elemen berada di `opacity: 0` tanpa ada yang menganimasikannya. Pengguna yang menggulir cepat melihat blok pucat. Guard `reducedMotion: "reduce"` di dua spec Playwright menutupi gejalanya untuk axe, tapi tidak untuk pengguna dengan motion normal.

`fromTo()` menyatakan kedua ujung secara eksplisit, dan `clearProps: "opacity,transform"` di `onComplete` melepas gaya inline setelah selesai sehingga elemen kembali ke keadaan CSS aslinya.

- [ ] **Step 1: Ubah tween di `src/components/motion/reveal.tsx`**

Ganti blok `gsap.from(...)`:

```ts
      gsap.fromTo(
        targets,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger,
          // Melepas gaya inline setelah selesai. Tanpa ini, opacity dan
          // transform hasil tween tetap menempel sebagai style inline dan
          // menang atas CSS mana pun yang mengubah keduanya belakangan.
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: container,
            start: "top 82%",
            once: true,
          },
        },
      );
```

- [ ] **Step 2: Jalankan tes unit**

Run: `bun run test`
Expected: PASS seluruhnya. `Reveal` tidak punya tes unit sendiri karena bergantung penuh pada GSAP dan ScrollTrigger; verifikasi sungguhannya di Step 4 dan Step 5.

- [ ] **Step 3: Bangun dan jalankan e2e dengan guard yang masih terpasang**

```bash
docker compose up -d
until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
bun run test:e2e
```
Expected: seluruh spec lolos. Ini baseline sebelum guard disentuh.

- [ ] **Step 4: Uji apakah guard `reducedMotion` masih dibutuhkan**

Komentari baris `test.use({ contextOptions: { reducedMotion: "reduce" } });` di `tests/e2e/tentang-kami.spec.ts` dan `tests/e2e/a11y-viewport.spec.ts`, lalu jalankan ulang:

```bash
bun run test:e2e
```

Dua kemungkinan, dan keduanya sah:

- **Lolos seluruhnya:** guard memang sudah tidak dibutuhkan. Hapus baris itu beserta blok komentar panjang yang menjelaskannya, dan ganti dengan satu komentar pendek: `// Guard reducedMotion dilepas di Plan 8 setelah Reveal pindah ke fromTo + clearProps.`
- **Ada yang gagal cek kontras axe:** kembalikan guard apa adanya, dan **perbarui komentarnya** supaya tidak lagi menyebut `gsap.from()` sebagai penyebab, karena penyebabnya kini murni window animasi yang masih berjalan saat axe memindai, bukan keadaan awal yang menggantung.

Jangan menebak hasilnya. Jalankan dan ikuti apa yang terjadi.

- [ ] **Step 5: Verifikasi mata sendiri di viewport nyata**

```bash
bun run dev &
sleep 8
```

Buka `http://localhost:3000/tentang-kami`, gulir cepat dari atas ke bawah, dan pastikan tidak ada blok yang tampil pucat lalu menjadi jelas. Ulangi di `http://localhost:3000/bisnis`. Ini pemeriksaan yang tidak bisa digantikan tes mana pun; akar masalah yang ditutup task ini memang hanya terlihat pada gulir cepat.

```bash
kill %1
```

- [ ] **Step 6: Commit**

```bash
git add dml-web/src/components/motion/reveal.tsx dml-web/tests/e2e/tentang-kami.spec.ts dml-web/tests/e2e/a11y-viewport.spec.ts
git commit -m "fix: Reveal pakai fromTo + clearProps, bukan gsap.from

gsap.from menetapkan keadaan awal saat tween dibuat, sedangkan
ScrollTrigger baru menjalankannya di top 82%. Di antara kedua momen itu
elemen duduk di opacity 0 tanpa ada yang menganimasikannya, dan pengguna
yang menggulir cepat melihat blok pucat.

Guard reducedMotion di dua spec menutupi gejalanya untuk axe, tidak untuk
pengguna motion normal. Ditandai audit Plan 6 sebagai layak jadi task
tersendiri."
```

---

## Task 15: Perkuat kunci rate limiter

**Files:**
- Modify: `src/features/inquiry/rate-limit.ts`
- Modify: `src/features/inquiry/rate-limit.test.ts`
- Modify: `src/features/inquiry/actions.ts:43-44`
- Modify: `.env.example`

**Interfaces:**
- Produces: `createRateLimiter` tidak berubah tanda tangannya; ditambah `clientKeyFrom(forwardedFor: string | null, trustedHops: number): string` dan bucket global di `actions.ts`.

**Konteks.** Tercatat sebagai butir 2 dari lima item Plan 2 yang belum ditriase. `actions.ts:44` mengambil entri **paling kiri** dari `x-forwarded-for`, yaitu nilai yang paling sepenuhnya dikendalikan klien: siapa pun bisa mengirim `X-Forwarded-For: 1.2.3.4` dan mendapat bucket baru setiap request.

Setelah plan ini ada dua form publik, bukan satu, jadi ongkos membiarkannya naik.

Perbaikannya realistis, bukan sempurna. Tujuannya menutup pemalsuan sepele, bukan mengklaim perlindungan yang tidak dimiliki proses Node tunggal.

- [ ] **Step 1: Tulis tes yang gagal**

Tambahkan ke `src/features/inquiry/rate-limit.test.ts`:

```ts
import { clientKeyFrom } from "./rate-limit";

describe("clientKeyFrom", () => {
  it("mengambil entri dari kanan sejauh jumlah hop tepercaya", () => {
    // Klien mengarang dua entri pertama; proxy tepercaya menambahkan yang
    // terakhir. Dengan satu hop tepercaya, yang dipakai adalah 203.0.113.9.
    expect(clientKeyFrom("1.2.3.4, 5.6.7.8, 203.0.113.9", 1)).toBe("203.0.113.9");
  });

  it("menghormati jumlah hop lebih dari satu", () => {
    expect(clientKeyFrom("1.2.3.4, 198.51.100.7, 203.0.113.9", 2)).toBe("198.51.100.7");
  });

  it("tidak pernah memakai entri paling kiri yang dikendalikan klien", () => {
    expect(clientKeyFrom("1.2.3.4, 203.0.113.9", 1)).not.toBe("1.2.3.4");
  });

  it("jatuh ke unknown kalau header tidak ada", () => {
    expect(clientKeyFrom(null, 1)).toBe("unknown");
  });

  it("jatuh ke entri paling kanan kalau hop melebihi jumlah entri", () => {
    expect(clientKeyFrom("203.0.113.9", 5)).toBe("203.0.113.9");
  });

  it("memangkas spasi di sekitar entri", () => {
    expect(clientKeyFrom("  1.2.3.4 ,  203.0.113.9  ", 1)).toBe("203.0.113.9");
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `bun run test src/features/inquiry/rate-limit.test.ts`
Expected: FAIL, `clientKeyFrom` tidak diekspor.

- [ ] **Step 3: Tambahkan `clientKeyFrom` ke `src/features/inquiry/rate-limit.ts`**

```ts
/**
 * Ambil alamat klien dari x-forwarded-for dengan cara yang tidak sepele
 * dipalsukan.
 *
 * Header ini disusun kiri ke kanan: entri paling kiri diklaim klien, entri
 * paling kanan ditambahkan proxy terdekat. Kode sebelum Plan 8 memakai entri
 * paling kiri, yang berarti siapa pun bisa mengirim X-Forwarded-For sendiri
 * dan mendapat bucket rate limit baru setiap request.
 *
 * `trustedHops` menyatakan berapa proxy yang berada di depan aplikasi ini.
 * Entri pada posisi itu dihitung dari kanan adalah alamat yang benar-benar
 * dilihat proxy terluar yang kita percayai. Kalau nilainya melebihi jumlah
 * entri, dipakai entri paling kanan, karena mengambil yang lebih kiri hanya
 * akan memilih nilai yang lebih mudah dipalsukan.
 *
 * KETERBATASAN, jangan dibaca lebih kuat dari kenyataannya: penyerang di
 * belakang proxy yang sama tetap berbagi alamat, dan penyerang dengan banyak
 * alamat tetap mendapat banyak bucket. Bucket global di actions.ts yang jadi
 * batas atasnya. Batas sungguhan terhadap penyalahgunaan ada di lapisan
 * infrastruktur.
 */
export function clientKeyFrom(forwardedFor: string | null, trustedHops: number): string {
  if (!forwardedFor) return "unknown";
  const entries = forwardedFor
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
  if (entries.length === 0) return "unknown";
  const hops = Math.max(1, Math.floor(trustedHops));
  const index = Math.max(0, entries.length - hops);
  return entries[index] ?? entries[entries.length - 1] ?? "unknown";
}
```

- [ ] **Step 4: Jalankan tes, pastikan lolos**

Run: `bun run test src/features/inquiry/rate-limit.test.ts`
Expected: PASS, termasuk enam tes baru dan seluruh tes lama `createRateLimiter`.

- [ ] **Step 5: Pakai di `src/features/inquiry/actions.ts`**

Tambahkan ke import dari `./rate-limit`: `clientKeyFrom`.

Tambahkan bucket global di samping limiter per-IP yang sudah ada:

```ts
const rateLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

/**
 * Batas atas yang tetap berlaku kalau penyerang memutar-mutar x-forwarded-for
 * sehingga bucket per-alamat tidak pernah penuh. Angkanya dipilih supaya tidak
 * pernah tersentuh lalu lintas manusia yang wajar: situs company profile
 * dengan dua form lead tidak menerima 200 kiriman dalam sepuluh menit.
 */
const globalLimiter = createRateLimiter({ limit: 200, windowMs: 10 * 60 * 1000 });

const TRUSTED_PROXY_HOPS = Number(process.env.TRUSTED_PROXY_HOPS ?? "1");
```

Ganti blok pengambilan IP dan pemeriksaan limit:

```ts
  const requestHeaders = await headers();
  const ip = clientKeyFrom(requestHeaders.get("x-forwarded-for"), TRUSTED_PROXY_HOPS);

  if (!rateLimiter.check(ip) || !globalLimiter.check("global")) {
    return { ok: false, error: "Terlalu banyak percobaan, coba lagi nanti." };
  }
```

Urutannya disengaja: bucket per-alamat diperiksa lebih dulu supaya penyalahguna tunggal tidak menghabiskan kuota global.

- [ ] **Step 6: Dokumentasikan variabel lingkungan**

Tambahkan ke `.env.example`:

```
# Jumlah proxy tepercaya di depan aplikasi ini. Menentukan entri
# x-forwarded-for mana yang dipakai sebagai kunci rate limit, dihitung dari
# kanan. Default 1 cocok untuk satu reverse proxy. Naikkan kalau ada CDN plus
# load balancer di depannya; salah setel ke angka terlalu besar membuat kunci
# jatuh ke nilai yang dikendalikan klien.
TRUSTED_PROXY_HOPS=1
```

- [ ] **Step 7: Jalankan seluruh tes inquiry dan gerbang cepat**

Run: `bun run test src/features/inquiry/ && bun run typecheck && bun run lint`
Expected: bersih.

- [ ] **Step 8: Commit**

```bash
git add dml-web/src/features/inquiry/rate-limit.ts dml-web/src/features/inquiry/rate-limit.test.ts dml-web/src/features/inquiry/actions.ts dml-web/.env.example
git commit -m "fix: rate limiter tidak lagi percaya entri x-forwarded-for paling kiri

Entri paling kiri adalah nilai yang paling sepenuhnya dikendalikan klien:
siapa pun bisa mengirim header sendiri dan mendapat bucket baru tiap
request. Sekarang entri dipilih dari kanan sejauh TRUSTED_PROXY_HOPS,
ditambah bucket global sebagai batas atas kalau alamat diputar-putar.

Butir 2 dari lima item Plan 2 yang belum ditriase. Ongkosnya naik sejak
ada dua form publik, bukan satu."
```

---

## Task 16: Perluas sweep aksesibilitas dan tulis E2E cabang bisnis

**Files:**
- Modify: `tests/e2e/a11y-viewport.spec.ts:11` (array `ROUTES`)
- Create: `tests/e2e/bisnis.spec.ts`

**Interfaces:**
- Consumes: `runAxeCheck` dari `tests/e2e/axe.ts`.

**Konteks.** `a11y-viewport.spec.ts` sudah menjalankan axe di tiga viewport untuk empat route, dan sudah jadi bagian permanen gerbang `test:e2e` sejak Plan 6. Route baru masuk ke berkas yang sama, bukan berkas terpisah. Menambah empat route menaikkan jumlah tes dari 12 jadi 24.

- [ ] **Step 1: Tambahkan route baru ke sweep**

Di `tests/e2e/a11y-viewport.spec.ts`, ganti array `ROUTES`:

```ts
const ROUTES = [
  "/",
  "/kontak",
  "/tentang-kami",
  "/karier",
  "/bisnis",
  "/bisnis/transportasi-bbm",
  "/bisnis/penumpang-roro",
  "/bisnis/transportasi-bbm/permintaan-informasi",
];
```

- [ ] **Step 2: Tulis `tests/e2e/bisnis.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("navigasi utama membawa ke hub bisnis", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation")
    .first()
    .getByRole("link", { name: "Bisnis Kami" })
    .click();
  await expect(page).toHaveURL(/\/bisnis$/);
  await expect(page.getByRole("heading", { level: 1, name: "Bisnis Kami" })).toBeVisible();
});

test("hub menaut ke kedua halaman lini", async ({ page }) => {
  await page.goto("/bisnis");
  await page.getByRole("link", { name: /Lihat detail Transportasi BBM/ }).click();
  await expect(page).toHaveURL(/\/bisnis\/transportasi-bbm$/);

  await page.goto("/bisnis");
  await page.getByRole("link", { name: /Lihat detail Penyeberangan Ro-Ro/ }).click();
  await expect(page).toHaveURL(/\/bisnis\/penumpang-roro$/);
});

test("halaman lini BBM menampilkan daftar kapal sungguhan", async ({ page }) => {
  await page.goto("/bisnis/transportasi-bbm");
  await expect(page.getByText("MT Ocean River")).toBeVisible();
  await expect(page.getByText("SPOB United X")).toBeVisible();
});

test("tabel lintasan memisahkan operator DML dari Tri Sumaja Lines", async ({ page }) => {
  await page.goto("/bisnis/penumpang-roro");
  const row = page.getByRole("row").filter({ hasText: "Merak - Bakauheni" });
  await expect(row.getByText(/Tri Sumaja Lines/)).toBeVisible();
});

test("tabel lintasan bisa difokuskan keyboard untuk digulir", async ({ page }) => {
  await page.goto("/bisnis/penumpang-roro");
  const region = page.getByRole("region", { name: /lintasan/i });
  await region.focus();
  await expect(region).toBeFocused();
});

test("form permintaan informasi terisi sesuai query param", async ({ page }) => {
  await page.goto("/bisnis/transportasi-bbm/permintaan-informasi?layanan=penumpang-roro");
  await expect(page.getByLabel("Lini layanan")).toHaveValue("penumpang-roro");
});

test("query param yang tidak dikenali tidak memecahkan halaman", async ({ page }) => {
  const response = await page.goto(
    "/bisnis/transportasi-bbm/permintaan-informasi?layanan=galangan-kapal",
  );
  expect(response?.status()).toBe(200);
  await expect(page.getByLabel("Lini layanan")).toHaveValue("transportasi-bbm");
});

test("form permintaan informasi menampilkan galat validasi", async ({ page }) => {
  await page.goto("/bisnis/transportasi-bbm/permintaan-informasi");
  await page.getByRole("button", { name: "Kirim permintaan" }).click();
  await expect(page.getByText("Nama perusahaan wajib diisi")).toBeVisible();
});

test("halaman bisnis terbaca tanpa JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/bisnis");
  await expect(page.getByRole("heading", { level: 1, name: "Bisnis Kami" })).toBeVisible();

  await page.goto("/bisnis/transportasi-bbm");
  await expect(page.getByText("MT Ocean River")).toBeVisible();

  await page.goto("/bisnis/penumpang-roro");
  await expect(page.getByText("Merak - Bakauheni")).toBeVisible();

  await context.close();
});

test("tidak ada aset WebGL yang dimuat di halaman bisnis", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/bisnis/transportasi-bbm");
  await page.waitForLoadState("networkidle");
  // Halaman bisnis adalah dokumen operasional. Model GLB dan loader Draco
  // milik komparator armada 3D di beranda; kalau salah satu terbawa ke sini,
  // pengunjung procurement membayar megabyte untuk sesuatu yang tidak tampil.
  expect(requests.filter((url) => /\.glb$|draco/i.test(url))).toEqual([]);
});
```

- [ ] **Step 3: Jalankan e2e dengan Postgres hidup**

```bash
docker compose up -d
until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
bun run test:e2e
```
Expected: seluruh spec lolos, termasuk 24 tes sweep aksesibilitas (naik dari 12) dan 10 tes baru di `bisnis.spec.ts`.

Kalau axe menemukan pelanggaran di halaman baru, **perbaiki halamannya**, jangan mengecualikan aturannya. Empat aturan aksesibilitas di Global Constraints adalah temuan nyata Plan 6.

- [ ] **Step 4: Commit**

```bash
git add dml-web/tests/e2e/a11y-viewport.spec.ts dml-web/tests/e2e/bisnis.spec.ts
git commit -m "test: sweep aksesibilitas dan e2e untuk cabang bisnis

Empat route baru masuk ke a11y-viewport.spec.ts yang sudah ada, bukan
berkas terpisah: 12 tes jadi 24. bisnis.spec.ts menutup navigasi, prefill
query param, validasi form, pembacaan tanpa JavaScript, dan satu asersi
bahwa tidak ada GLB atau Draco yang terbawa ke halaman bisnis."
```

---

## Task 17: Perbarui README dan lewati gerbang penuh

**Files:**
- Modify: `README.md`

**Interfaces:** Tidak ada perubahan kode.

**Konteks.** Task terakhir. Semua kode sudah masuk; yang tersisa adalah dokumentasi dan pembuktian bahwa seluruh gerbang hijau.

- [ ] **Step 1: Perbarui bagian Struktur di `README.md`**

Ganti baris `src/app/(site)/` menjadi:

```markdown
- `src/app/(site)/`: halaman publik — beranda, bisnis (hub, transportasi BBM,
  penyeberangan ro-ro, permintaan informasi), kontak, karier, tentang kami.
```

Tambahkan setelah baris `src/features/route-map/`:

```markdown
- `src/content/vessels.ts`: 66 nama kapal dari company profile halaman 04,
  dijaga tes konsistensi silang terhadap `vesselCount` di `fleet.ts` dan
  `ROUTE_LEGS` di `ports.ts`. Kalau ketiganya tidak lagi cocok, yang salah
  hampir pasti data baru, bukan `fleet.ts` yang sudah diverifikasi di Plan 5.
- `src/content/legal-documents.ts`: tabel dokumen legal dari company profile
  halaman 06, tayang di `/tentang-kami#profil`.
```

- [ ] **Step 2: Tambahkan bagian baru tentang rate limiter**

Sisipkan setelah bagian "Perintah penting":

```markdown
## Rate limit dan proxy

Dua form publik (`/kontak` dan `/bisnis/transportasi-bbm/permintaan-informasi`)
memakai rate limiter in-memory yang mengunci per alamat klien. Alamat itu
diambil dari `x-forwarded-for` pada posisi `TRUSTED_PROXY_HOPS` **dihitung dari
kanan**, bukan dari entri paling kiri yang sepenuhnya dikendalikan klien.

Setel `TRUSTED_PROXY_HOPS` sesuai jumlah proxy yang benar-benar berada di depan
aplikasi: `1` untuk satu reverse proxy, `2` kalau ada CDN di depannya. Menyetel
angka terlalu besar membuat kunci jatuh ke nilai yang bisa dipalsukan, yang
mengembalikan persis bug yang diperbaiki Plan 8.

Limiter ini in-memory per instance dan tidak tahan deploy multi-instance.
Batas sungguhan terhadap penyalahgunaan tetap ada di lapisan infrastruktur.
```

- [ ] **Step 3: Tambahkan catatan angka armada yang menunggu klien**

Sisipkan sebelum bagian "Menukar placeholder sertifikasi dengan logo resmi":

```markdown
## Angka armada yang masih menunggu konfirmasi klien

Company profile menulis ringkasan 64 kapal (9 ro-ro + 55 pengangkut BBM), tapi
daftar nama kapal di halaman yang sama memuat 66: ro-ro cocok di angka 9,
sedangkan daftar pengangkut BBM berisi 57, bukan 55. Seluruh selisih dua kapal
ada di sisi BBM.

`COMPANY.fleetSummary` memakai angka ringkasan; `VESSELS` di `vessels.ts`
memakai hasil hitung daftar. Tidak ada satu pun tempat di situs yang
menjumlahkan `VESSELS` lalu menampilkannya bersebelahan dengan angka ringkasan,
jadi kedua angka tidak pernah tampil saling membantah. Begitu klien
mengonfirmasi angka yang benar, samakan keduanya dan perbarui
`vessels.test.ts`.

Satu nama, `OB Sahoya 0`, terbaca terpotong di PDF dan ditandai
`belum-terverifikasi`. Jangan menebaknya jadi "Sahoya 04".

Dimensi kapal (panjang, lebar, DWT) tidak ada di company profile sama sekali
dan seluruhnya masih estimasi proporsional. Halaman lini BBM menyatakan ini di
bawah tabel spesifikasinya, bukan cuma di komentar kode.
```

- [ ] **Step 4: Jalankan gerbang penuh**

```bash
docker compose up -d
until docker compose ps --format json | grep -q '"Health":"healthy"'; do sleep 1; done
bun run check
```
Expected: lint bersih, typecheck bersih, seluruh tes unit lolos, build sukses, `doctor` menyisakan **tepat satu** temuan yaitu pengecualian permanen `effect-needs-cleanup` yang sudah terdokumentasi sejak Plan 6, dan lighthouse lolos.

Kalau lighthouse gagal di rentang 5800 sampai 5930 ms, **jangan naikkan ambang di `lighthouserc.json`**. Itu pola kontensi CPU yang sudah didokumentasikan di memori Plan 4. Tutup aplikasi berat, jalankan ulang, dan kalau tetap gagal, catat angkanya dan laporkan sebagai temuan lingkungan, bukan regresi. Yang layak diperiksa lebih dulu: apakah halaman baru memuat aset berat yang seharusnya tidak ada di sana. Task 16 Step 2 sudah memasang asersi otomatis untuk GLB dan Draco.

- [ ] **Step 5: Jalankan e2e penuh**

Run: `bun run test:e2e`
Expected: seluruh spec lolos.

- [ ] **Step 6: Buktikan tidak ada tautan internal yang mati**

```bash
bun run build
bun run start &
sleep 8
for path in / /tentang-kami /bisnis /bisnis/transportasi-bbm /bisnis/penumpang-roro /bisnis/transportasi-bbm/permintaan-informasi /karier /kontak; do
  printf "%s -> " "$path"
  curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000$path"
done
printf "/artikel (diharapkan 404 sampai Plan 9) -> "
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/artikel"
kill %1
```
Expected: delapan `200`, lalu `404` untuk `/artikel`.

`/artikel` masih 404 adalah keadaan yang diketahui dan diterima; ia ditutup Plan 9. `sitemap.ts` sudah tidak mengiklankannya (Task 11), jadi mesin pencari tidak diberi tahu tentang halaman yang tidak ada. Yang masih menaut ke sana adalah `NAV_ITEMS`. **Laporkan ini ke pemilik repo di akhir plan** sebagai satu-satunya tautan internal mati yang tersisa, dan tanyakan apakah item navigasi `/artikel` sebaiknya dicabut sementara sampai Plan 9 selesai, atau dibiarkan karena jeda antar plan diperkirakan pendek.

- [ ] **Step 7: Audit design dan SEO**

Jalankan skill `design-taste-frontend` dan `web-design-guidelines` terhadap empat halaman baru, lalu `seo-audit`. Perbaiki temuan yang murni mekanis. Temuan mana pun yang menyentuh keputusan desain **dibawa ke pemilik repo sebagai keputusan scope, tidak dikerjakan diam-diam** — ini gerbang yang sama yang dipakai Plan 6 dan terbukti benar di sana.

- [ ] **Step 8: Commit**

```bash
git add dml-web/README.md
git commit -m "docs: perbarui README untuk cabang bisnis, rate limit, dan angka armada

Tiga bagian baru: struktur halaman bisnis, cara TRUSTED_PROXY_HOPS dipakai
memilih entri x-forwarded-for, dan catatan selisih 64 vs 66 kapal yang kini
bisa ditunjuk persis ada di sisi BBM.

Gerbang penuh hijau: lint, typecheck, 200+ tes unit, build, doctor (tepat
satu temuan, pengecualian permanen effect-needs-cleanup), lighthouse, dan
test:e2e."
```

---

## Setelah plan ini

**Yang tersisa terbuka, dilaporkan ke pemilik repo:**

1. `/artikel` masih 404 dan `NAV_ITEMS` masih menautinya. Ditutup Plan 9. Lihat Task 17 Step 6 untuk pertanyaan yang perlu dijawab.
2. Selisih 64 vs 66 kapal, `OB Sahoya 0` yang terpotong, dan dimensi kapal yang masih estimasi. Menunggu klien.
3. Logo sertifikasi asli dan status HSSE. Menunggu klien; prosedur tukar sudah di README sejak Plan 6.
4. Logo klien "Trusted by Leading Companies". Di PDF ia satu raster gepeng yang logo-logonya tidak bisa dipisah, dan butuh izin dari masing-masing pemilik merek.
5. Jadwal dan fasilitas kapal ro-ro. Tidak ada di company profile.
6. Merge `denis` ke `main` atau `master`. Repo ini dipakai lebih dari satu orang dan `main` memuat satu commit yang belum ada di `denis`.
7. Copy Visi dan Misi di `/tentang-kami` masih bertanda draft dan belum direview klien. Task 12 hanya membetulkan kontradiksi faktualnya, bukan menyetujui teksnya.

**Plan 9** mengerjakan bagian 10 spec: koleksi `posts`, `/artikel`, `/artikel/[slug]`, hook `revalidatePath`, seksi Artikel Terbaru di beranda, entri sitemap dinamis, dan spec Playwright admin-publish yang sekaligus jadi verifikasi browser pertama untuk `/admin`. Tiga berkas yang disentuh kedua plan tercatat di bagian 18.1 spec.
