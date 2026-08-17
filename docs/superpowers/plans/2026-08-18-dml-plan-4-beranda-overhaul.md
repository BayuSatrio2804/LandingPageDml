# Overhaul Beranda (Plan 4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun ulang delapan seksi beranda `dml-web` menjadi satu halaman sinematik dengan artefak 3D nyata, peta rute bergeografi asli, dan tanpa cacat layout yang ada sekarang.

**Architecture:** Empat lapis. Lapis 1 komponen bersama (`SectionHeader`, `OverlayPanel`, `useScrollProgress`, token motion) yang dipakai semua seksi. Lapis 2 seksi non-3D yang cuma butuh HTML dan GSAP. Lapis 3 pipeline aset build-time (model GLB dan garis pantai) yang keluarannya di-commit. Lapis 4 dua canvas R3F yang mount lazy dan membaca progress scroll lewat ref, tidak pernah lewat React state. GSAP hanya memegang pin dan progress; R3F memegang seluruh isi canvas.

**Tech Stack:** Next.js 16.3.1 (App Router, Turbopack), React 19.2.8, Tailwind v4, GSAP 3.13 + ScrollTrigger + SplitText, three 0.185 + `@react-three/fiber` 9.7 + `@react-three/drei` 10.7.8, Vitest 4 + Testing Library, Playwright 1.62, Lighthouse CI 0.15, Bun 1.3.14.

## Global Constraints

Setiap task tunduk pada seluruh butir ini. Nilainya disalin apa adanya dari spec `docs/superpowers/specs/2026-08-18-dml-plan-4-beranda-overhaul-design.md`.

- **Bahasa.** Seluruh teks yang terlihat pengguna, komentar kode, dan pesan commit dalam Bahasa Indonesia. Komentar hanya ditulis kalau menjelaskan *kenapa*, bukan *apa*.
- **Tanda pisah em (`—`) dan en (`–`) dilarang** di seluruh teks yang terlihat pengguna. Master spec §7.10. Pakai tanda hubung biasa.
- **Larangan beranda tetap berlaku** (master spec §7.10): tidak ada marquee, custom cursor, scroll cue, eyebrow bernomor seksi, dot status dekoratif, strip lokasi atau cuaca, fake screenshot dari div, pill di atas foto, caption kredit foto palsu, label versi.
- **Anggaran eyebrow: maksimal 2 di seluruh halaman.** Rencana memakai nol.
- **R3F dan GSAP tidak pernah di pohon komponen yang sama** (master spec §4.2). ScrollTrigger menulis ke ref objek biasa; `useFrame` membacanya. Tidak ada React state untuk nilai kontinu, tidak ada tween GSAP yang menyentuh objek milik canvas.
- **Aksen `--color-accent` (#FF5A1F) tidak pernah jadi latar yang menampung teks `--color-ink`.** Satu-satunya latar aksen adalah tombol CTA, yang memakai `--color-on-accent` (#0A1418). Digagalkan `tests/e2e/contrast-tokens.spec.ts` kalau dilanggar.
- **Satu label per intent CTA.** Seluruh CTA primer beranda berbunyi persis "Hubungi Kami" dan mengarah ke `/kontak`, dengan komentar `// TODO(plan-bisnis): arahkan ke /bisnis/transportasi-bbm/permintaan-informasi setelah halaman itu dibangun`.
- **Viewport penuh selalu `min-h-[100dvh]`, tidak pernah `h-screen`.**
- **`prefers-reduced-motion: reduce` mematikan seluruh motion dan seluruh canvas.** Tidak ada canvas di viewport di bawah 768 px.
- **Ambang `lighthouserc.json` tidak disentuh sampai Task 13.** `largest-contentful-paint` tetap 5000, `cumulative-layout-shift` tetap 0.1, `categories:seo` tetap 0.95.
- **Anggaran model:** maksimal 700 kB per berkas, maksimal 2,2 MB total di `public/models/`. Tidak ada berkas HDRI.
- **Data tidak dikarang.** Angka baru wajib diturunkan dari `src/content/`. Nilai yang tidak bisa diverifikasi ditandai `// unverified: <alasan>`.
- **Gerbang per task:** `bun run lint && bun run typecheck && bun run test` hijau sebelum commit. `bun run doctor` dijalankan di task yang menyentuh komponen client atau R3F (Task 1, 2, 3, 4, 5, 7, 10, 11, 12).
- **Commit setiap task.** Format pesan mengikuti riwayat repo: `feat:`, `fix:`, `test:`, `docs:`, `chore:`.

---

### Task 1: Fondasi bersama, komponen dan token motion

Empat berkas yang dipakai hampir semua task berikutnya. Dikerjakan lebih dulu supaya tidak ada seksi yang menciptakan salinannya sendiri.

**Files:**
- Create: `src/lib/motion/tokens.ts`
- Create: `src/lib/motion/tokens.test.ts`
- Create: `src/lib/motion/use-scroll-progress.ts`
- Create: `src/lib/motion/use-scroll-progress.test.ts`
- Create: `src/components/ui/section-header.tsx`
- Create: `src/components/ui/section-header.test.tsx`
- Create: `src/components/ui/overlay-panel.tsx`
- Create: `src/components/ui/overlay-panel.test.tsx`

**Interfaces:**
- Consumes: `@/lib/motion/gsap` (`gsap`, `registerGsap`, `ScrollTrigger`), sudah ada.
- Produces:
  - `MOTION: { readonly fast: 0.3; readonly base: 0.6; readonly slow: 1.1; readonly ease: "power3.out"; readonly easeInOut: "power2.inOut"; readonly scrub: 1 }`
  - `clampProgress(value: number): number`
  - `useScrollProgress(targetRef: React.RefObject<HTMLElement | null>, options: ScrollProgressOptions): React.RefObject<number>` dengan `type ScrollProgressOptions = { end: string; pin?: boolean; scrub?: number | boolean; disabled?: boolean }`
  - `<SectionHeader title={string} description?={string} id?={string} className?={string} />`
  - `<OverlayPanel align?={"start" | "center"} className?={string}>{children}</OverlayPanel>`

- [ ] **Step 1: Tulis test yang gagal untuk token dan clampProgress**

Buat `src/lib/motion/tokens.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { MOTION } from "./tokens";

describe("MOTION", () => {
  it("durasi naik dari fast ke slow", () => {
    expect(MOTION.fast).toBeLessThan(MOTION.base);
    expect(MOTION.base).toBeLessThan(MOTION.slow);
  });

  it("setiap durasi positif dan di bawah dua detik", () => {
    for (const key of ["fast", "base", "slow"] as const) {
      expect(MOTION[key]).toBeGreaterThan(0);
      expect(MOTION[key]).toBeLessThan(2);
    }
  });

  it("nama easing memakai easing GSAP yang valid", () => {
    expect(MOTION.ease).toMatch(/^[a-z]+[0-9]*\.(in|out|inOut)$/);
    expect(MOTION.easeInOut).toMatch(/^[a-z]+[0-9]*\.(in|out|inOut)$/);
  });
});
```

Buat `src/lib/motion/use-scroll-progress.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { clampProgress } from "./use-scroll-progress";

describe("clampProgress", () => {
  it("meneruskan nilai di dalam rentang apa adanya", () => {
    expect(clampProgress(0)).toBe(0);
    expect(clampProgress(0.42)).toBe(0.42);
    expect(clampProgress(1)).toBe(1);
  });

  it("menjepit nilai di luar rentang", () => {
    expect(clampProgress(-3)).toBe(0);
    expect(clampProgress(1.8)).toBe(1);
  });

  // Nilai non-finite pernah muncul dari ScrollTrigger saat elemen dipin lalu
  // di-refresh dengan tinggi nol. Tanpa guard ini, NaN merambat ke useFrame
  // dan menghasilkan array opacity nol seluruhnya, yaitu canvas tak terlihat
  // tanpa error apa pun. Bekas kasus ini ada di komentar fleet-comparator.tsx.
  it("mengembalikan nol untuk NaN dan Infinity", () => {
    expect(clampProgress(Number.NaN)).toBe(0);
    expect(clampProgress(Number.POSITIVE_INFINITY)).toBe(0);
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `bun run test -- src/lib/motion/tokens.test.ts src/lib/motion/use-scroll-progress.test.ts`
Expected: FAIL, `Failed to resolve import "./tokens"` dan `"./use-scroll-progress"`.

- [ ] **Step 3: Tulis implementasi minimal**

Buat `src/lib/motion/tokens.ts`:

```ts
/**
 * Satu sumber durasi dan easing supaya gerak antar seksi terasa satu tangan.
 * Nilai di sini dipakai langsung sebagai argumen GSAP, jadi format easing
 * mengikuti penamaan GSAP, bukan cubic-bezier CSS.
 */
export const MOTION = {
  fast: 0.3,
  base: 0.6,
  slow: 1.1,
  ease: "power3.out",
  easeInOut: "power2.inOut",
  scrub: 1,
} as const;
```

Buat `src/lib/motion/use-scroll-progress.ts`:

```ts
"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, ScrollTrigger } from "./gsap";
import { MOTION } from "./tokens";

export type ScrollProgressOptions = {
  end: string;
  pin?: boolean;
  scrub?: number | boolean;
  disabled?: boolean;
};

export function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/**
 * Satu-satunya jembatan dari ScrollTrigger ke dalam boundary R3F. Nilai
 * ditulis ke ref, bukan ke state: progress berubah tiap frame scroll, dan
 * setState di sana akan me-render ulang seluruh pohon React 60 kali sedetik.
 * Konsumen membacanya di dalam useFrame.
 */
export function useScrollProgress(
  targetRef: React.RefObject<HTMLElement | null>,
  { end, pin = false, scrub = MOTION.scrub, disabled = false }: ScrollProgressOptions,
): React.RefObject<number> {
  const progressRef = useRef(0);

  useEffect(() => {
    const target = targetRef.current;
    if (disabled || !target) return;
    registerGsap();

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: target,
        start: "top top",
        end,
        pin,
        scrub,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progressRef.current = clampProgress(self.progress);
        },
      });
    }, targetRef);

    return () => ctx.revert();
  }, [targetRef, end, pin, scrub, disabled]);

  return progressRef;
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `bun run test -- src/lib/motion/tokens.test.ts src/lib/motion/use-scroll-progress.test.ts`
Expected: PASS, 6 test.

- [ ] **Step 5: Tulis test yang gagal untuk SectionHeader dan OverlayPanel**

Buat `src/components/ui/section-header.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionHeader } from "./section-header";

describe("SectionHeader", () => {
  it("render judul sebagai heading level 2", () => {
    render(<SectionHeader title="Perbandingan Armada" />);
    expect(screen.getByRole("heading", { level: 2, name: "Perbandingan Armada" })).toBeInTheDocument();
  });

  it("render deskripsi saat diberikan", () => {
    render(<SectionHeader title="Rute" description="Empat pelabuhan." />);
    expect(screen.getByText("Empat pelabuhan.")).toBeInTheDocument();
  });

  it("tidak render paragraf saat deskripsi tidak diberikan", () => {
    const { container } = render(<SectionHeader title="Rute" />);
    expect(container.querySelector("p")).toBeNull();
  });

  it("meneruskan id ke heading supaya bisa jadi target anchor", () => {
    render(<SectionHeader title="Silsilah" id="silsilah" />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute("id", "silsilah");
  });
});
```

Buat `src/components/ui/overlay-panel.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { OverlayPanel } from "./overlay-panel";

describe("OverlayPanel", () => {
  it("render anaknya", () => {
    render(<OverlayPanel>Isi panel</OverlayPanel>);
    expect(screen.getByText("Isi panel")).toBeInTheDocument();
  });

  // Panel ini satu-satunya jaminan kontras teks di atas foto. Kalau latar
  // buramnya hilang, teks kembali bergantung gradien dan kartu STS jatuh ke
  // rasio di bawah AA lagi, persis cacat yang diaudit di spec bagian 2.1.
  it("selalu punya latar surface buram, bukan sekadar blur", () => {
    const { container } = render(<OverlayPanel>Isi</OverlayPanel>);
    const panel = container.firstElementChild;
    expect(panel?.className).toMatch(/bg-surface\//);
  });

  it("menerima kelas tambahan tanpa membuang kelas dasarnya", () => {
    const { container } = render(<OverlayPanel className="max-w-md">Isi</OverlayPanel>);
    const panel = container.firstElementChild;
    expect(panel?.className).toMatch(/max-w-md/);
    expect(panel?.className).toMatch(/bg-surface\//);
  });
});
```

- [ ] **Step 6: Jalankan test, pastikan gagal**

Run: `bun run test -- src/components/ui/section-header.test.tsx src/components/ui/overlay-panel.test.tsx`
Expected: FAIL, `Failed to resolve import "./section-header"` dan `"./overlay-panel"`.

- [ ] **Step 7: Tulis implementasi minimal**

Buat `src/components/ui/section-header.tsx`:

```tsx
export function SectionHeader({
  title,
  description,
  id,
  className,
}: {
  title: string;
  description?: string;
  id?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 id={id} className="font-display text-3xl font-bold text-ink md:text-5xl">
        {title}
      </h2>
      {description ? <p className="mt-4 max-w-[55ch] text-ink-muted">{description}</p> : null}
    </div>
  );
}
```

Buat `src/components/ui/overlay-panel.tsx`:

```tsx
/**
 * Panel scrim untuk teks yang duduk di atas foto. Latar surface 85 persen
 * adalah bagian yang menjamin kontras; backdrop-blur cuma kosmetik dan tidak
 * boleh jadi satu-satunya lapisan, karena browser yang menolak backdrop-filter
 * akan menyisakan teks di atas foto telanjang.
 *
 * Props sisanya diteruskan apa adanya supaya pemanggil bisa menempelkan
 * data-testid dan atribut ARIA tanpa membungkusnya lagi dengan div tambahan.
 */
export function OverlayPanel({
  children,
  align = "start",
  className,
  ...rest
}: React.ComponentPropsWithoutRef<"div"> & {
  align?: "start" | "center";
}) {
  const alignment = align === "center" ? "text-center" : "text-left";
  return (
    <div
      {...rest}
      className={`rounded-card border border-surface-3 bg-surface/85 p-6 backdrop-blur-sm md:p-8 ${alignment} ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 8: Jalankan test, pastikan lulus**

Run: `bun run test -- src/components/ui src/lib/motion`
Expected: PASS, seluruh test di dua direktori itu hijau.

- [ ] **Step 9: Jalankan gerbang**

Run: `bun run lint && bun run typecheck && bun run doctor`
Expected: ketiganya keluar dengan kode 0.

- [ ] **Step 10: Commit**

```bash
git add src/lib/motion/tokens.ts src/lib/motion/tokens.test.ts \
  src/lib/motion/use-scroll-progress.ts src/lib/motion/use-scroll-progress.test.ts \
  src/components/ui/section-header.tsx src/components/ui/section-header.test.tsx \
  src/components/ui/overlay-panel.tsx src/components/ui/overlay-panel.test.tsx
git commit -m "feat: fondasi bersama beranda, token motion, jembatan scroll, header dan panel scrim"
```

---

### Task 2: Perbaiki sticky-stack lini bisnis

Memperbaiki cacat audit spec §2.1 nomor 1: `min-h-screen` di induk plus `h-full` di anak membuat kartu kolaps ke tinggi teks. Ini penyebab tunggal dua keluhan pengguna sekaligus.

**Files:**
- Modify: `src/features/home/business-lines.tsx` (tulis ulang penuh)
- Modify: `src/features/home/business-lines.test.tsx`
- Depends on: `src/components/ui/overlay-panel.tsx` dari Task 1, tidak diubah lagi di sini

**Interfaces:**
- Consumes: `OverlayPanel` dan `MOTION` dari Task 1; `MEDIA`, `avifSrc` dari `@/lib/media/manifest`; `CtaLink`; `FLEET_CLASSES` dari `@/content/fleet`.
- Produces: `<BusinessLines />` tanpa perubahan nama ekspor.

- [ ] **Step 1: Tulis test yang gagal**

Ganti isi `src/features/home/business-lines.test.tsx` dengan berikut. Tiga test lama dipertahankan apa adanya, tiga test baru ditambahkan di bawahnya.

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BusinessLines } from "./business-lines";

// jsdom tidak mengimplementasikan window.matchMedia. BusinessLines memanggilnya
// lewat usePrefersReducedMotion langsung di komponen client ini, jadi stub
// perlu dipasang di sini juga. matches: true (reduced motion) memilih jalur
// render paling sederhana karena tes ini menguji markup, bukan perilaku GSAP.
beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

describe("BusinessLines", () => {
  it("render tiga kartu lini bisnis dengan judul", () => {
    render(<BusinessLines />);
    expect(screen.getByText("Transportasi BBM")).toBeInTheDocument();
    expect(screen.getByText("Penumpang Ro-Ro")).toBeInTheDocument();
    expect(screen.getByText("Layanan Ship-to-Ship (STS)")).toBeInTheDocument();
  });

  it("kartu tidak punya link ke /bisnis", () => {
    render(<BusinessLines />);
    const links = screen.queryAllByRole("link");
    for (const link of links) {
      expect(link.getAttribute("href")).not.toMatch(/^\/bisnis/);
    }
  });

  it("CTA di seksi ini mengarah ke /kontak", () => {
    render(<BusinessLines />);
    expect(screen.getByRole("link", { name: /hubungi kami/i })).toHaveAttribute("href", "/kontak");
  });

  // Cacat audit spec bagian 2.1 nomor 1. Induk sticky memakai min-h-screen
  // (tinggi auto), jadi h-full di anak dihitung terhadap auto dan kolaps ke
  // tinggi konten. Lapisan media harus absolute inset-0, bukan h-full, supaya
  // kartu benar-benar setinggi viewport.
  it("lapisan media mengisi kartu lewat absolute inset-0, bukan h-full", () => {
    const { container } = render(<BusinessLines />);
    const cards = container.querySelectorAll("[data-testid='kartu-lini-bisnis']");
    expect(cards).toHaveLength(3);
    for (const card of cards) {
      const media = card.querySelector("[data-testid='media-lini-bisnis']");
      expect(media?.className).toMatch(/absolute/);
      expect(media?.className).toMatch(/inset-0/);
      expect(media?.className).not.toMatch(/h-full/);
    }
  });

  it("setiap kartu setinggi viewport dinamis", () => {
    const { container } = render(<BusinessLines />);
    for (const card of container.querySelectorAll("[data-testid='kartu-lini-bisnis']")) {
      expect(card.className).toMatch(/min-h-\[100dvh\]/);
      expect(card.className).not.toMatch(/h-screen/);
    }
  });

  // Deskripsi panjang di kartu STS adalah yang paling rentan hilang di atas
  // lambung putih. Teksnya harus text-ink dan duduk di dalam panel scrim,
  // bukan mengandalkan gradien seperti versi sebelumnya.
  it("deskripsi kartu duduk di panel scrim dengan warna ink", () => {
    const { container } = render(<BusinessLines />);
    const sts = screen.getByText(/ship-to-ship transfer/i);
    expect(sts.className).toMatch(/text-ink\b/);
    const panel = sts.closest("[data-testid='panel-lini-bisnis']");
    expect(panel).not.toBeNull();
    expect(panel?.className).toMatch(/bg-surface\//);
    expect(container.querySelectorAll("[data-testid='panel-lini-bisnis']")).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `bun run test -- src/features/home/business-lines.test.tsx`
Expected: FAIL pada tiga test baru, `expect(received).toHaveLength(3)` menerima 0 karena `data-testid` belum ada.

- [ ] **Step 3: Tulis ulang komponen**

Ganti isi `src/features/home/business-lines.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/motion/gsap";
import { MOTION } from "@/lib/motion/tokens";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { MEDIA, avifSrc } from "@/lib/media/manifest";
import { OverlayPanel } from "@/components/ui/overlay-panel";
import { CtaLink } from "@/components/ui/cta-link";

/**
 * Deskripsi STS sengaja dipendekkan. Penjelasan panjang soal ship-to-ship
 * sudah jadi isi seksi 2 (day-cut.tsx); mengulangnya di sini membuat kartu
 * ketiga jadi blok teks terpanjang di atas foto paling terang, yang persis
 * kombinasi yang gagal di audit.
 */
const CARDS = [
  {
    title: "Transportasi BBM",
    description:
      "Motor tanker, oil barge, dan SPOB melayani kontrak jangka panjang di hampir seluruh Kalimantan.",
    classes: ["Motor Tanker", "Oil Barge", "SPOB", "Tugboat"],
    mediaId: "transportasi-bbm",
  },
  {
    title: "Penumpang Ro-Ro",
    description:
      "Armada KMP Jambo menghubungkan Ketapang, Lembar, Tanjung Perak, dan Kumai dengan kabin ber-AC dan fasilitas medis.",
    classes: ["Ro-Ro Ferry"],
    mediaId: "penumpang-roro",
  },
  {
    title: "Layanan Ship-to-Ship (STS)",
    description:
      "Ship-to-ship transfer memindahkan BBM langsung antar kapal di tengah perairan, tanpa antre sandar pelabuhan.",
    classes: ["Motor Tanker", "Oil Barge"],
    mediaId: "operasi-sts",
  },
] as const;

export function BusinessLines() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLImageElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (reduced || !section) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const cards = cardRefs.current.filter((el): el is HTMLDivElement => el !== null);
      const media = mediaRefs.current.filter((el): el is HTMLImageElement => el !== null);

      cards.slice(0, -1).forEach((card, index) => {
        const next = cards[index + 1];
        if (!next) return;
        ScrollTrigger.create({
          trigger: next,
          start: "top bottom",
          end: "top top",
          scrub: true,
          onUpdate: (self) => {
            gsap.set(card, { scale: 1 - self.progress * 0.08, opacity: 1 - self.progress * 0.45 });
          },
        });
      });

      // Zoom keluar per kartu. Alasannya satu kalimat: foto yang mengecil saat
      // kartunya mengunci membuat mata membaca kartu sebagai bidang yang
      // mendarat, bukan gambar diam yang kebetulan lewat.
      media.forEach((layer) => {
        gsap.fromTo(
          layer,
          { scale: 1.08 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: layer,
              start: "top bottom",
              end: "top top",
              scrub: MOTION.scrub,
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} className="relative">
      {CARDS.map((card, index) => {
        const media = MEDIA["lini-bisnis"].find((asset) => asset.id === card.mediaId);
        if (!media) return null;
        return (
          <div
            key={card.title}
            data-testid="kartu-lini-bisnis"
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className="sticky top-0 flex min-h-[100dvh] items-end overflow-hidden bg-surface"
            style={{ zIndex: index + 1 }}
          >
            <Image
              data-testid="media-lini-bisnis"
              ref={(el) => {
                mediaRefs.current[index] = el;
              }}
              src={avifSrc(media, 2400)}
              alt={media.alt}
              fill
              sizes="100vw"
              className="absolute inset-0 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
            <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-12 px-4 pb-16 md:px-8 md:pb-24">
              <OverlayPanel
                className="col-span-12 md:col-span-6 lg:col-span-5"
                data-testid="panel-lini-bisnis"
              >
                <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">{card.title}</h2>
                <p className="mt-4 max-w-[46ch] text-ink">{card.description}</p>
                <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-ink-muted">
                  {card.classes.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
                {index === CARDS.length - 1 && (
                  <div className="mt-8">
                    {/* TODO(plan-bisnis): arahkan ke /bisnis/transportasi-bbm/permintaan-informasi setelah halaman itu dibangun */}
                    <CtaLink href="/kontak">Hubungi Kami</CtaLink>
                  </div>
                )}
              </OverlayPanel>
            </div>
          </div>
        );
      })}
    </section>
  );
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `bun run test -- src/features/home/business-lines.test.tsx src/components/ui/overlay-panel.test.tsx`
Expected: PASS, 6 test di business-lines dan 3 di overlay-panel.

- [ ] **Step 5: Verifikasi visual bahwa cacatnya benar-benar hilang**

Jalankan `bun run dev`, buka beranda di 1440x900, gulir ke seksi lini bisnis. Yang harus terlihat: tiap kartu mengisi tinggi viewport penuh, foto tidak lagi jadi pita di tengah, dan deskripsi kartu STS terbaca jelas di atas panel. Kalau masih ada pita, tinggi belum benar dan `absolute inset-0` belum terpasang di lapisan media.

- [ ] **Step 6: Jalankan gerbang**

Run: `bun run lint && bun run typecheck && bun run doctor`
Expected: ketiganya keluar dengan kode 0.

- [ ] **Step 7: Commit**

```bash
git add src/features/home/business-lines.tsx src/features/home/business-lines.test.tsx
git commit -m "fix: kartu lini bisnis kolaps ke tinggi teks, ganti ke kartu 100dvh dengan panel scrim"
```

---

### Task 3: Seksi potong ke siang dengan zoom parallax

**Files:**
- Modify: `src/features/home/day-cut.tsx` (tulis ulang penuh)
- Modify: `src/features/home/day-cut.test.tsx`
- Create: `src/features/home/day-cut-media.tsx`

**Interfaces:**
- Consumes: `OverlayPanel`, `MOTION` dari Task 1; `MEDIA`, `avifSrc`.
- Produces: `<DayCut />` (Server Component) dan `<DayCutMedia frame={MediaAsset} />` (client leaf).

Alasan pemecahan: `DayCut` sekarang Server Component murni dan harus tetap begitu supaya paragrafnya ada di HTML server. Parallax butuh `"use client"`, jadi lapisan medianya dipisah ke leaf sendiri, pola yang sama dengan `Hero` dan `NightSequence`.

- [ ] **Step 1: Tulis test yang gagal**

Ganti isi `src/features/home/day-cut.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DayCut } from "./day-cut";

describe("DayCut", () => {
  it("render paragraf penjelasan ship-to-ship", () => {
    render(<DayCut />);
    expect(screen.getByText(/ship-to-ship transfer memindahkan bbm/i)).toBeInTheDocument();
  });

  it("paragraf memakai warna ink, bukan ink-muted di atas foto", () => {
    render(<DayCut />);
    const paragraph = screen.getByText(/ship-to-ship transfer memindahkan bbm/i);
    expect(paragraph.className).toMatch(/text-ink\b/);
    expect(paragraph.className).not.toMatch(/text-ink-muted/);
  });

  // Panel scrim, bukan gradien, yang menjamin kontras. Gradien boleh ada
  // sebagai lapisan tambahan tapi tidak boleh jadi satu-satunya.
  it("paragraf duduk di dalam panel scrim", () => {
    render(<DayCut />);
    const panel = screen.getByText(/ship-to-ship transfer memindahkan bbm/i).closest("div");
    expect(panel?.className).toMatch(/bg-surface\//);
  });

  it("seksi setinggi viewport dinamis", () => {
    const { container } = render(<DayCut />);
    const section = container.querySelector("section");
    expect(section?.className).toMatch(/min-h-\[100dvh\]/);
    expect(section?.className).not.toMatch(/h-screen/);
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `bun run test -- src/features/home/day-cut.test.tsx`
Expected: FAIL pada test kedua dan ketiga, paragraf masih `text-ink` tanpa panel dan seksi masih `min-h-[80vh]`.

- [ ] **Step 3: Buat leaf klien untuk parallax**

Buat `src/features/home/day-cut-media.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, registerGsap } from "@/lib/motion/gsap";
import { MOTION } from "@/lib/motion/tokens";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { type MediaAsset, avifSrc } from "@/lib/media/manifest";

/**
 * Zoom keluar plus drift vertikal yang lebih lambat dari halaman. Alasannya
 * satu kalimat: potongan malam ke siang adalah potongan film, dan kamera yang
 * menjauh memberi jeda sebelum halaman berpindah dari suasana ke informasi.
 */
export function DayCutMedia({ frame }: { frame: MediaAsset }) {
  const layerRef = useRef<HTMLImageElement | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const layer = layerRef.current;
    const section = layer?.closest("section");
    if (reduced || !layer || !section) return;
    registerGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        layer,
        { scale: 1.12, yPercent: -4 },
        {
          scale: 1,
          yPercent: 4,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: MOTION.scrub,
          },
        },
      );
    });

    return () => ctx.revert();
  }, [reduced]);

  return (
    <Image
      ref={layerRef}
      src={avifSrc(frame, 2400)}
      alt={frame.alt}
      fill
      sizes="100vw"
      className="absolute inset-0 object-cover"
    />
  );
}
```

- [ ] **Step 4: Tulis ulang seksi**

Ganti isi `src/features/home/day-cut.tsx`:

```tsx
import { MEDIA } from "@/lib/media/manifest";
import { OverlayPanel } from "@/components/ui/overlay-panel";
import { DayCutMedia } from "./day-cut-media";

export function DayCut() {
  const frame = MEDIA["hari"][0];
  if (!frame) {
    throw new Error("MEDIA['hari'] harus punya minimal 1 frame");
  }

  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden bg-surface-2">
      <DayCutMedia frame={frame} />
      <div className="absolute inset-0 bg-gradient-to-r from-surface-2/80 via-surface-2/30 to-transparent" />
      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-12 px-4 md:px-8">
        <OverlayPanel className="col-span-12 md:col-span-6 lg:col-span-5">
          <p className="max-w-[50ch] text-lg leading-relaxed text-ink md:text-xl">
            Ship-to-ship transfer memindahkan BBM langsung antar kapal di tengah perairan,
            tanpa menunggu antrean sandar pelabuhan. Bagi distribusi bahan bakar di Kalimantan,
            ini yang membuat pasokan sampai tepat waktu ke titik yang sulit dijangkau jetty
            konvensional.
          </p>
        </OverlayPanel>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Jalankan test, pastikan lulus**

Run: `bun run test -- src/features/home/day-cut.test.tsx`
Expected: PASS, 4 test.

- [ ] **Step 6: Jalankan gerbang**

Run: `bun run lint && bun run typecheck && bun run doctor`
Expected: ketiganya keluar dengan kode 0.

- [ ] **Step 7: Commit**

```bash
git add src/features/home/day-cut.tsx src/features/home/day-cut.test.tsx src/features/home/day-cut-media.tsx
git commit -m "feat: seksi potong ke siang dengan zoom parallax dan panel scrim"
```

---

### Task 4: Ganti seksi Silsilah dengan Sejak 1985

Memperbaiki cacat audit spec §2.1 nomor 5. `TIMELINE` berisi satu entri, jadi horizontal pan tidak pernah aktif dan menyisakan satu kartu menempel kiri.

**Files:**
- Create: `src/features/home/since-1985.tsx`
- Create: `src/features/home/since-1985.test.tsx`
- Delete: `src/features/home/lineage.tsx`
- Delete: `src/features/home/lineage.test.tsx`
- Delete: `src/features/timeline/lineage-pan.tsx`
- Modify: `src/app/(site)/page.tsx`
- Modify: `tests/e2e/no-js.spec.ts:47-52`
- Modify: `tests/e2e/beranda.spec.ts:25`

**Interfaces:**
- Consumes: `COMPANY` dari `@/content/company`, `useCounter`, `SectionHeader`, `MEDIA`, `avifSrc`.
- Produces: `<Since1985 />`, dan `yearsOperating(foundedIso: string, now: Date): number`.

Sebelum menghapus, verifikasi tidak ada konsumen lain:

```bash
grep -rn "lineage-pan\|LineagePan\|from \"./lineage\"\|home/lineage" src tests
```
Hasil yang diharapkan hanya `lineage.tsx`, `lineage.test.tsx`, dan `page.tsx`. `TIMELINE` sendiri tetap dipakai `src/app/(site)/tentang-kami/page.tsx` dan tidak boleh disentuh.

- [ ] **Step 1: Tulis test yang gagal**

Buat `src/features/home/since-1985.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Since1985, yearsOperating } from "./since-1985";
import { COMPANY } from "@/content/company";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

describe("yearsOperating", () => {
  it("menghitung tahun penuh sejak tanggal pendirian", () => {
    expect(yearsOperating("1985-11-30", new Date("2026-08-18T00:00:00Z"))).toBe(40);
  });

  it("belum menambah tahun sebelum tanggal ulang tahun terlewati", () => {
    expect(yearsOperating("1985-11-30", new Date("2026-11-29T00:00:00Z"))).toBe(40);
    expect(yearsOperating("1985-11-30", new Date("2026-11-30T00:00:00Z"))).toBe(41);
  });
});

describe("Since1985", () => {
  it("render heading Sejak 1985", () => {
    render(<Since1985 />);
    expect(screen.getByRole("heading", { level: 2, name: /sejak 1985/i })).toBeInTheDocument();
  });

  it("render tautan ke silsilah lengkap", () => {
    render(<Since1985 />);
    expect(screen.getByRole("link", { name: /silsilah lengkap/i })).toHaveAttribute(
      "href",
      "/tentang-kami#silsilah",
    );
  });

  // Nama pendiri dan tahun dibaca dari COMPANY, bukan dari prosa
  // TIMELINE[0].label yang kebetulan mengulang keduanya. Dua sumber untuk
  // fakta yang sama pasti berbeda cepat atau lambat.
  it("menyebut pendiri dari COMPANY.founder", () => {
    render(<Since1985 />);
    expect(screen.getByText(new RegExp(COMPANY.founder, "i"))).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `bun run test -- src/features/home/since-1985.test.tsx`
Expected: FAIL, `Failed to resolve import "./since-1985"`.

- [ ] **Step 3: Tulis komponen**

Buat `src/features/home/since-1985.tsx`:

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { COMPANY } from "@/content/company";
import { MEDIA, avifSrc } from "@/lib/media/manifest";
import { SectionHeader } from "@/components/ui/section-header";
import { useCounter } from "@/lib/motion/use-counter";

/**
 * Menghitung tahun penuh, bukan selisih tahun kalender: perusahaan berdiri 30
 * November, jadi sepanjang Januari sampai November angkanya masih tahun
 * sebelumnya. Selisih getFullYear saja akan menaikkannya sepuluh bulan lebih
 * awal.
 */
export function yearsOperating(foundedIso: string, now: Date): number {
  const founded = new Date(foundedIso);
  let years = now.getUTCFullYear() - founded.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - founded.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < founded.getUTCDate())) {
    years -= 1;
  }
  return years;
}

function YearCounter({ target }: { target: number }) {
  const { ref, value } = useCounter(target);
  return (
    <p
      ref={ref as React.RefObject<HTMLParagraphElement>}
      className="font-mono text-7xl leading-none text-accent md:text-9xl"
    >
      {value}
    </p>
  );
}

export function Since1985() {
  const years = yearsOperating(COMPANY.foundedIso, new Date());
  const frame = MEDIA["lini-bisnis"].find((asset) => asset.id === "transportasi-bbm");

  return (
    <section className="bg-surface py-24 md:py-32">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-8 px-4 md:px-8">
        <div className="col-span-12 md:col-span-7">
          <SectionHeader title="Sejak 1985" />
          <div className="mt-12">
            <YearCounter target={years} />
            <p className="mt-4 max-w-[34ch] text-ink-muted">
              tahun mengangkut bahan bakar dan orang di perairan Kalimantan.
            </p>
          </div>
        </div>

        <div className="col-span-12 md:col-span-5">
          {frame ? (
            <div className="relative aspect-4/3 overflow-hidden rounded-card">
              <Image
                src={avifSrc(frame, 1600)}
                alt={frame.alt}
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
          <p className="mt-6 max-w-[42ch] text-ink">
            {COMPANY.legalName} didirikan {COMPANY.founder} di Banjarmasin, dan kini bagian dari{" "}
            {COMPANY.parent}.
          </p>
          <Link
            href="/tentang-kami#silsilah"
            className="mt-6 inline-block text-sm font-medium text-accent hover:text-accent-hover"
          >
            Lihat silsilah lengkap
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `bun run test -- src/features/home/since-1985.test.tsx`
Expected: PASS, 5 test.

- [ ] **Step 5: Pasang di halaman dan hapus komponen lama**

Ubah `src/app/(site)/page.tsx`, ganti baris impor `Lineage` dan pemakaiannya:

```tsx
import { Hero } from "@/features/home/hero";
import { DayCut } from "@/features/home/day-cut";
import { BusinessLines } from "@/features/home/business-lines";
import { FleetComparator } from "@/features/home/fleet-comparator";
import { RouteMap } from "@/features/home/route-map";
import { Since1985 } from "@/features/home/since-1985";
import { Certifications } from "@/features/home/certifications";
import { CtaSection } from "@/features/home/cta-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <DayCut />
      <BusinessLines />
      <FleetComparator />
      <RouteMap />
      <Since1985 />
      <Certifications />
      <CtaSection />
    </>
  );
}
```

Lalu hapus berkas lama:

```bash
git rm src/features/home/lineage.tsx src/features/home/lineage.test.tsx src/features/timeline/lineage-pan.tsx
rmdir src/features/timeline 2>/dev/null || true
```

- [ ] **Step 6: Perbarui spec e2e**

Di `tests/e2e/no-js.spec.ts`, ganti blok assertion Silsilah:

```ts
  await expect(page.getByRole("heading", { name: "Sejak 1985" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Lihat silsilah lengkap" })).toHaveAttribute(
    "href",
    "/tentang-kami#silsilah",
  );
```

Di `tests/e2e/beranda.spec.ts`, ganti satu baris:

```ts
    await expect(page.getByRole("heading", { name: "Sejak 1985" })).toBeVisible();
```

- [ ] **Step 7: Jalankan test dan gerbang**

Run: `bun run test && bun run lint && bun run typecheck && bun run doctor`
Expected: seluruh unit test hijau, tidak ada modul yatim, ketiga gerbang keluar 0.

- [ ] **Step 8: Commit**

```bash
git add -A src/features src/app/\(site\)/page.tsx tests/e2e/no-js.spec.ts tests/e2e/beranda.spec.ts
git commit -m "feat: ganti seksi silsilah horizontal-pan dengan pernyataan Sejak 1985"
```

---

### Task 5: Pipeline peta, garis pantai asli dan koordinat geografis

**Files:**
- Create: `scripts/prepare-map.ts`
- Create: `src/features/route-map/projection.ts`
- Create: `src/features/route-map/projection.test.ts`
- Modify: `src/features/route-map/ports.ts` (tulis ulang penuh)
- Modify: `src/features/route-map/ports.test.ts`
- Create: `src/features/route-map/coastline.json` (dihasilkan skrip, di-commit)
- Modify: `package.json` (tambah skrip `prepare-map`)

**Interfaces:**
- Consumes: tidak ada dari task lain.
- Produces:
  - `type LatLon = { lat: number; lon: number }`
  - `type Point = { x: number; y: number }`
  - `type MapBounds = { minLon: number; maxLon: number; minLat: number; maxLat: number }`
  - `MAP_BOUNDS: MapBounds`
  - `VIEWBOX: { width: 1000; height: 620 }`
  - `mercatorY(lat: number): number`
  - `project(coord: LatLon): Point` (ke ruang viewBox `VIEWBOX`)
  - `type Port = { id: string; name: string; lat: number; lon: number; kind: "pelabuhan" | "kantor" }`
  - `PORTS: Port[]`
  - `type RouteLeg = { id: string; fromId: string; toId: string; label: string }`
  - `ROUTE_LEGS: RouteLeg[]`
  - `type Coastline = { polygons: number[][][] }` isi `coastline.json`

- [ ] **Step 1: Tulis test yang gagal untuk proyeksi**

Buat `src/features/route-map/projection.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { MAP_BOUNDS, VIEWBOX, mercatorY, project } from "./projection";

describe("mercatorY", () => {
  it("khatulistiwa jadi nol", () => {
    expect(mercatorY(0)).toBeCloseTo(0, 10);
  });

  it("simetris terhadap khatulistiwa", () => {
    expect(mercatorY(-8.145)).toBeCloseTo(-mercatorY(8.145), 10);
  });

  it("monoton naik terhadap lintang", () => {
    expect(mercatorY(10)).toBeGreaterThan(mercatorY(5));
    expect(mercatorY(-2)).toBeGreaterThan(mercatorY(-9));
  });
});

describe("project", () => {
  it("sudut barat laut bbox jadi titik asal viewBox", () => {
    const p = project({ lat: MAP_BOUNDS.maxLat, lon: MAP_BOUNDS.minLon });
    expect(p.x).toBeCloseTo(0, 6);
    expect(p.y).toBeCloseTo(0, 6);
  });

  it("sudut tenggara bbox jadi sudut jauh viewBox", () => {
    const p = project({ lat: MAP_BOUNDS.minLat, lon: MAP_BOUNDS.maxLon });
    expect(p.x).toBeCloseTo(VIEWBOX.width, 6);
    expect(p.y).toBeCloseTo(VIEWBOX.height, 6);
  });

  // Lintang lebih utara harus menghasilkan y lebih kecil. SVG menaruh y=0 di
  // atas, sedangkan Mercator menaruh lintang besar di atas, jadi sumbunya
  // memang harus dibalik. Test ini yang menangkap kalau pembalikan itu hilang.
  it("lintang lebih utara memberi y lebih kecil", () => {
    const utara = project({ lat: -2.74, lon: 111.73 });
    const selatan = project({ lat: -8.725, lon: 111.73 });
    expect(utara.y).toBeLessThan(selatan.y);
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `bun run test -- src/features/route-map/projection.test.ts`
Expected: FAIL, `Failed to resolve import "./projection"`.

- [ ] **Step 3: Tulis proyeksi**

Buat `src/features/route-map/projection.ts`:

```ts
export type LatLon = { lat: number; lon: number };
export type Point = { x: number; y: number };
export type MapBounds = { minLon: number; maxLon: number; minLat: number; maxLat: number };

/**
 * Kotak yang memuat seluruh jaringan ro-ro plus kantor pusat Banjarmasin,
 * dengan sisa ruang secukupnya supaya label pelabuhan tidak terpotong tepi.
 */
export const MAP_BOUNDS: MapBounds = {
  minLon: 109,
  maxLon: 118,
  minLat: -10,
  maxLat: -1,
};

export const VIEWBOX = { width: 1000, height: 620 } as const;

/**
 * Mercator hanya perlu diterapkan pada sumbu lintang; bujur linear apa adanya.
 * Tanpa ini, jarak Kumai ke Surabaya akan terlihat lebih pendek dari
 * seharusnya relatif terhadap jarak Ketapang ke Lembar, dan seluruh gunanya
 * memakai koordinat asli hilang.
 */
export function mercatorY(lat: number): number {
  const clamped = Math.min(85, Math.max(-85, lat));
  const rad = (clamped * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

export function project({ lat, lon }: LatLon): Point {
  const top = mercatorY(MAP_BOUNDS.maxLat);
  const bottom = mercatorY(MAP_BOUNDS.minLat);
  const x = ((lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * VIEWBOX.width;
  const y = ((top - mercatorY(lat)) / (top - bottom)) * VIEWBOX.height;
  return { x, y };
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `bun run test -- src/features/route-map/projection.test.ts`
Expected: PASS, 7 test.

- [ ] **Step 5: Tulis test yang gagal untuk ports dan legs**

Ganti isi `src/features/route-map/ports.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { PORTS, ROUTE_LEGS } from "./ports";
import { MAP_BOUNDS } from "./projection";

describe("PORTS", () => {
  it("punya empat pelabuhan dan satu kantor", () => {
    expect(PORTS.filter((p) => p.kind === "pelabuhan")).toHaveLength(4);
    expect(PORTS.filter((p) => p.kind === "kantor")).toHaveLength(1);
  });

  it("setiap id unik", () => {
    expect(new Set(PORTS.map((p) => p.id)).size).toBe(PORTS.length);
  });

  it("setiap koordinat berada di dalam bbox peta", () => {
    for (const port of PORTS) {
      expect(port.lon).toBeGreaterThanOrEqual(MAP_BOUNDS.minLon);
      expect(port.lon).toBeLessThanOrEqual(MAP_BOUNDS.maxLon);
      expect(port.lat).toBeGreaterThanOrEqual(MAP_BOUNDS.minLat);
      expect(port.lat).toBeLessThanOrEqual(MAP_BOUNDS.maxLat);
    }
  });

  // Ketapang yang dimaksud adalah Banyuwangi, Jawa Timur, bukan Ketapang,
  // Kalimantan Barat. Disimpulkan dari pasangan rutenya ke Lembar di master
  // spec bagian 2. Ketapang Kalbar ada di lintang sekitar -1,8; kalau angka
  // itu yang masuk, test ini gagal.
  it("Ketapang berada di Jawa Timur, bukan Kalimantan Barat", () => {
    const ketapang = PORTS.find((p) => p.id === "ketapang");
    expect(ketapang?.lat).toBeLessThan(-7);
  });
});

describe("ROUTE_LEGS", () => {
  it("punya tiga leg terpisah, bukan satu rantai", () => {
    expect(ROUTE_LEGS).toHaveLength(3);
  });

  it("setiap ujung leg merujuk id pelabuhan yang ada", () => {
    const ids = new Set(PORTS.filter((p) => p.kind === "pelabuhan").map((p) => p.id));
    for (const leg of ROUTE_LEGS) {
      expect(ids.has(leg.fromId)).toBe(true);
      expect(ids.has(leg.toId)).toBe(true);
    }
  });

  it("tidak ada leg yang berujung di dirinya sendiri", () => {
    for (const leg of ROUTE_LEGS) {
      expect(leg.fromId).not.toBe(leg.toId);
    }
  });
});
```

- [ ] **Step 6: Jalankan test, pastikan gagal**

Run: `bun run test -- src/features/route-map/ports.test.ts`
Expected: FAIL, `ROUTE_LEGS` belum diekspor dan `PORTS` masih bertipe lama.

- [ ] **Step 7: Tulis ulang ports.ts**

Ganti isi `src/features/route-map/ports.ts`:

```ts
export type Port = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  kind: "pelabuhan" | "kantor";
};

export type RouteLeg = {
  id: string;
  fromId: string;
  toId: string;
  label: string;
};

/**
 * Koordinat geografis asli, bukan posisi tangan di ruang SVG seperti versi
 * sebelumnya. "Ketapang" di sini adalah Ketapang, Banyuwangi, Jawa Timur,
 * disimpulkan dari pasangan rutenya ke Lembar (Lombok) dan Tanjung Perak di
 * master spec bagian 2, bukan dari nama saja.
 */
export const PORTS: Port[] = [
  { id: "ketapang", name: "Ketapang", lat: -8.145, lon: 114.383, kind: "pelabuhan" }, // unverified: disimpulkan dari pasangan rute, wajib konfirmasi klien
  { id: "lembar", name: "Lembar", lat: -8.725, lon: 116.07, kind: "pelabuhan" }, // unverified: koordinat pelabuhan publik
  { id: "tanjung-perak", name: "Tanjung Perak Surabaya", lat: -7.2, lon: 112.73, kind: "pelabuhan" }, // unverified: koordinat pelabuhan publik
  { id: "kumai", name: "Kumai", lat: -2.74, lon: 111.73, kind: "pelabuhan" }, // unverified: koordinat pelabuhan publik
  { id: "banjarmasin", name: "Banjarmasin", lat: -3.32, lon: 114.59, kind: "kantor" },
];

/**
 * Tiga leg terpisah, bukan satu polyline berantai. Versi sebelumnya menyambung
 * keempat pelabuhan berurutan, yang menyiratkan satu rute tunggal yang tidak
 * pernah ada. Sumber: master spec bagian 2, Lini 2.
 */
export const ROUTE_LEGS: RouteLeg[] = [
  { id: "ketapang-lembar", fromId: "ketapang", toId: "lembar", label: "Ketapang ke Lembar, sejak Desember 2020" },
  { id: "perak-lembar", fromId: "tanjung-perak", toId: "lembar", label: "Tanjung Perak ke Lembar, 25 sampai 28 jam" },
  { id: "kumai-perak", fromId: "kumai", toId: "tanjung-perak", label: "Kumai ke Surabaya, sejak Juni 2025" },
];
```

- [ ] **Step 8: Jalankan test, pastikan lulus**

Run: `bun run test -- src/features/route-map`
Expected: PASS, 14 test.

- [ ] **Step 9: Tulis skrip garis pantai**

Buat `scripts/prepare-map.ts`:

```ts
#!/usr/bin/env bun
import { writeFile } from "node:fs/promises";
import { MAP_BOUNDS } from "../src/features/route-map/projection";

const SOURCE =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_land.geojson";
const OUT = new URL("../src/features/route-map/coastline.json", import.meta.url).pathname;
const MAX_BYTES = 60_000;

/**
 * Toleransi Douglas-Peucker dalam derajat. 0,01 derajat sekitar 1,1 km, cukup
 * halus untuk zoom terjauh peta ini dan cukup kasar untuk membuang puluhan
 * ribu titik pantai berlekuk yang tidak pernah terlihat.
 */
const TOLERANCE = 0.01;

type Ring = number[][];

function insideBounds([lon, lat]: number[]): boolean {
  return (
    lon >= MAP_BOUNDS.minLon &&
    lon <= MAP_BOUNDS.maxLon &&
    lat >= MAP_BOUNDS.minLat &&
    lat <= MAP_BOUNDS.maxLat
  );
}

function perpendicularDistance(point: number[], start: number[], end: number[]): number {
  const [px, py] = point;
  const [sx, sy] = start;
  const [ex, ey] = end;
  const dx = ex - sx;
  const dy = ey - sy;
  if (dx === 0 && dy === 0) return Math.hypot(px - sx, py - sy);
  const t = ((px - sx) * dx + (py - sy) * dy) / (dx * dx + dy * dy);
  const clamped = Math.min(1, Math.max(0, t));
  return Math.hypot(px - (sx + clamped * dx), py - (sy + clamped * dy));
}

function simplify(ring: Ring, tolerance: number): Ring {
  if (ring.length < 3) return ring;
  let maxDistance = 0;
  let index = 0;
  for (let i = 1; i < ring.length - 1; i += 1) {
    const distance = perpendicularDistance(ring[i]!, ring[0]!, ring[ring.length - 1]!);
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }
  if (maxDistance <= tolerance) return [ring[0]!, ring[ring.length - 1]!];
  const left = simplify(ring.slice(0, index + 1), tolerance);
  const right = simplify(ring.slice(index), tolerance);
  return [...left.slice(0, -1), ...right];
}

function round(ring: Ring): Ring {
  return ring.map(([lon, lat]) => [Number(lon!.toFixed(3)), Number(lat!.toFixed(3))]);
}

async function main(): Promise<void> {
  console.log(`Mengunduh ${SOURCE}`);
  const response = await fetch(SOURCE);
  if (!response.ok) throw new Error(`Gagal mengunduh garis pantai: HTTP ${response.status}`);
  const geojson = (await response.json()) as {
    features: { geometry: { type: string; coordinates: unknown } }[];
  };

  const polygons: Ring[] = [];
  for (const feature of geojson.features) {
    const { type, coordinates } = feature.geometry;
    const candidates =
      type === "Polygon"
        ? [(coordinates as Ring[])[0]!]
        : type === "MultiPolygon"
          ? (coordinates as Ring[][][]).map((polygon) => polygon[0]!)
          : [];

    for (const ring of candidates) {
      if (!ring.some(insideBounds)) continue;
      const simplified = round(simplify(ring, TOLERANCE));
      if (simplified.length >= 4) polygons.push(simplified);
    }
  }

  const payload = JSON.stringify({ polygons });
  if (payload.length > MAX_BYTES) {
    throw new Error(
      `coastline.json ${payload.length} byte, melewati anggaran ${MAX_BYTES}. Naikkan TOLERANCE.`,
    );
  }

  await writeFile(OUT, payload);
  console.log(`OK ${polygons.length} poligon, ${payload.length} byte, ditulis ke ${OUT}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 10: Daftarkan skrip dan jalankan**

Tambahkan ke `package.json` bagian `scripts`, sesudah baris `prepare-assets`:

```json
    "prepare-map": "bun scripts/prepare-map.ts",
```

Run: `bun run prepare-map`
Expected: mencetak jumlah poligon dan ukuran byte di bawah 60000, membuat `src/features/route-map/coastline.json`. Kalau melampaui anggaran, naikkan `TOLERANCE` ke `0.02` dan jalankan lagi.

- [ ] **Step 11: Jalankan gerbang**

Run: `bun run lint && bun run typecheck && bun run test`
Expected: ketiganya keluar dengan kode 0.

- [ ] **Step 12: Commit**

```bash
git add scripts/prepare-map.ts src/features/route-map/projection.ts \
  src/features/route-map/projection.test.ts src/features/route-map/ports.ts \
  src/features/route-map/ports.test.ts src/features/route-map/coastline.json package.json
git commit -m "feat: pipeline garis pantai Natural Earth dan koordinat geografis asli pelabuhan"
```

---

### Task 6: Seksi sertifikasi jadi band data

**Files:**
- Modify: `src/features/home/certifications.tsx` (tulis ulang penuh)
- Modify: `src/features/home/certifications.test.tsx`

**Interfaces:**
- Consumes: `COMPANY`, `useCounter`, `yearsOperating` dari Task 4, `SectionHeader`, dan `PORTS` bertipe baru dari Task 5.
- Produces: `<Certifications />` tanpa perubahan nama ekspor.

Task ini sengaja berjalan **sesudah** Task 5. `PORTS` versi Task 5 berisi lima entri: empat pelabuhan ditambah kantor pusat Banjarmasin. Metrik "Pelabuhan dilayani" karena itu wajib menyaring `kind === "pelabuhan"`, bukan memakai `PORTS.length` mentah, yang akan mengklaim lima pelabuhan padahal cuma ada empat.

- [ ] **Step 1: Tulis test yang gagal**

Ganti isi `src/features/home/certifications.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Certifications } from "./certifications";
import { COMPANY } from "@/content/company";
import { PORTS } from "@/features/route-map/ports";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

describe("Certifications", () => {
  it("render setiap sertifikasi perusahaan", () => {
    render(<Certifications />);
    for (const cert of COMPANY.certifications) {
      expect(screen.getByText(cert)).toBeInTheDocument();
    }
  });

  it("render empat metrik", () => {
    const { container } = render(<Certifications />);
    expect(container.querySelectorAll("[data-testid='metrik']")).toHaveLength(4);
  });

  // Menulis "4" langsung akan melenceng begitu rute bertambah. Angka
  // pelabuhan harus turunan dari PORTS, dan test ini yang menjaganya.
  // Kantor pusat Banjarmasin ikut ada di PORTS tapi bukan pelabuhan yang
  // dilayani, jadi PORTS.length mentah akan mengklaim lima.
  it("jumlah pelabuhan menyaring kantor, bukan memakai PORTS.length mentah", () => {
    render(<Certifications />);
    const label = screen.getByText(/pelabuhan dilayani/i);
    const metric = label.closest("[data-testid='metrik']");
    const jumlahPelabuhan = PORTS.filter((port) => port.kind === "pelabuhan").length;
    expect(jumlahPelabuhan).toBeLessThan(PORTS.length);
    expect(metric?.textContent).toContain(String(jumlahPelabuhan));
  });

  it("mengelompokkan sertifikasi jadi dua klaster berlabel", () => {
    render(<Certifications />);
    expect(screen.getByText("Operasi kapal")).toBeInTheDocument();
    expect(screen.getByText("Galangan")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `bun run test -- src/features/home/certifications.test.tsx`
Expected: FAIL, `toHaveLength(4)` menerima 0 karena `data-testid='metrik'` belum ada.

- [ ] **Step 3: Tulis ulang komponen**

Ganti isi `src/features/home/certifications.tsx`:

```tsx
"use client";

import { COMPANY } from "@/content/company";
import { PORTS } from "@/features/route-map/ports";
import { useCounter } from "@/lib/motion/use-counter";
import { yearsOperating } from "./since-1985";
import { Reveal } from "@/components/motion/reveal";

/**
 * Sertifikasi dikelompokkan karena ISO 9001 berlaku untuk galangan, bukan
 * untuk operasi kapal. Satu deret pill seragam menyamarkan perbedaan itu.
 */
const CERT_CLUSTERS = [
  { label: "Operasi kapal", certs: ["ISM Code", "ISPS Code", "SIRE"] },
  { label: "Galangan", certs: ["ISO 9001:2015"] },
] as const;

function Metric({ value, label, format }: { value: number; label: string; format?: "id" }) {
  const counter = useCounter(value);
  const shown = format === "id" ? counter.value.toLocaleString("id-ID") : String(counter.value);
  return (
    <div data-testid="metrik" className="px-6 py-8 first:pl-0 md:border-l md:border-surface-3">
      <p
        ref={counter.ref as React.RefObject<HTMLParagraphElement>}
        className="font-mono text-4xl text-accent md:text-5xl"
      >
        {shown}
      </p>
      <p className="mt-2 text-sm text-ink-muted">{label}</p>
    </div>
  );
}

export function Certifications() {
  const years = yearsOperating(COMPANY.foundedIso, new Date());
  // Kantor pusat ikut hidup di PORTS supaya bisa digambar di peta, tapi ia
  // bukan pelabuhan yang dilayani. Tanpa saringan ini metriknya mengklaim
  // lima pelabuhan padahal cuma empat.
  const servedPorts = PORTS.filter((port) => port.kind === "pelabuhan").length;

  return (
    <section className="bg-surface-2 py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="grid grid-cols-2 border-y border-surface-3 md:grid-cols-4">
          <Metric value={COMPANY.fleetSummary.vessels} label="Kapal" />
          <Metric value={COMPANY.fleetSummary.totalDwt} label="Total DWT" format="id" />
          <Metric value={years} label="Tahun beroperasi" />
          <Metric value={servedPorts} label="Pelabuhan dilayani" />
        </div>

        <Reveal className="mt-16 grid gap-10 md:grid-cols-2" stagger={0.08}>
          {CERT_CLUSTERS.map((cluster) => (
            <div key={cluster.label}>
              <p className="font-mono text-xs text-ink-muted">{cluster.label}</p>
              <ul className="mt-4 flex flex-wrap gap-3">
                {cluster.certs.map((cert) => (
                  <li
                    key={cert}
                    className="rounded-full border border-surface-3 px-4 py-2 font-mono text-sm text-ink"
                  >
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `bun run test -- src/features/home/certifications.test.tsx`
Expected: PASS, 4 test.

- [ ] **Step 5: Jalankan gerbang**

Run: `bun run lint && bun run typecheck && bun run doctor`
Expected: ketiganya keluar dengan kode 0.

- [ ] **Step 6: Commit**

```bash
git add src/features/home/certifications.tsx src/features/home/certifications.test.tsx
git commit -m "feat: seksi sertifikasi jadi band data empat metrik dengan klaster sertifikasi"
```

---

### Task 7: Seksi rute ro-ro dengan peta asli

Memperbaiki cacat audit spec §2.1 nomor 2, 3, dan 4.

**Files:**
- Modify: `src/features/home/route-map.tsx` (tulis ulang penuh)
- Create: `src/features/home/route-map.test.tsx`
- Modify: `tests/e2e/beranda.spec.ts:41`

**Interfaces:**
- Consumes: `PORTS`, `ROUTE_LEGS`, `project`, `VIEWBOX` dari Task 5; `coastline.json`; `SectionHeader`, `OverlayPanel`, `MOTION`.
- Produces: `<RouteMap />` tanpa perubahan nama ekspor.

- [ ] **Step 1: Tulis test yang gagal**

Buat `src/features/home/route-map.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RouteMap } from "./route-map";
import { PORTS, ROUTE_LEGS } from "@/features/route-map/ports";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

describe("RouteMap", () => {
  it("render nama setiap pelabuhan dan kantor", () => {
    render(<RouteMap />);
    for (const port of PORTS) {
      expect(screen.getByText(port.name)).toBeInTheDocument();
    }
  });

  it("render satu path per leg, bukan satu polyline berantai", () => {
    const { container } = render(<RouteMap />);
    expect(container.querySelectorAll("[data-testid='leg-rute']")).toHaveLength(ROUTE_LEGS.length);
  });

  it("render garis pantai sebagai poligon terpisah dari leg", () => {
    const { container } = render(<RouteMap />);
    expect(container.querySelectorAll("[data-testid='garis-pantai']").length).toBeGreaterThan(0);
  });

  // beranda.spec.ts mencari blueprint armada lewat peran img. Nama aksesibel
  // peta harus berbeda dan eksplisit supaya kedua SVG tidak saling tertukar
  // ketika selector diperketat di Step 5.
  it("SVG peta punya nama aksesibel yang tidak mengandung kata blueprint", () => {
    render(<RouteMap />);
    const map = screen.getByRole("img", { name: /peta jaringan penyeberangan/i });
    expect(map).toBeInTheDocument();
    expect(map.getAttribute("aria-label") ?? "").not.toMatch(/blueprint/i);
  });

  it("render label tiap leg sebagai teks, bukan hanya garis", () => {
    render(<RouteMap />);
    for (const leg of ROUTE_LEGS) {
      expect(screen.getByText(leg.label)).toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `bun run test -- src/features/home/route-map.test.tsx`
Expected: FAIL, `Unable to find an accessible element with the role "img"` karena label lama masih menyebut empat pelabuhan berantai.

- [ ] **Step 3: Tulis ulang komponen**

Ganti isi `src/features/home/route-map.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap } from "@/lib/motion/gsap";
import { MOTION } from "@/lib/motion/tokens";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { PORTS, ROUTE_LEGS } from "@/features/route-map/ports";
import { VIEWBOX, project } from "@/features/route-map/projection";
import { SectionHeader } from "@/components/ui/section-header";
import { OverlayPanel } from "@/components/ui/overlay-panel";
import coastline from "@/features/route-map/coastline.json";

const PORT_BY_ID = new Map(PORTS.map((port) => [port.id, port]));

function coastlinePath(ring: number[][]): string {
  return (
    ring
      .map((coord, index) => {
        const { x, y } = project({ lon: coord[0] ?? 0, lat: coord[1] ?? 0 });
        return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ") + " Z"
  );
}

function legPath(fromId: string, toId: string): string {
  const from = PORT_BY_ID.get(fromId);
  const to = PORT_BY_ID.get(toId);
  if (!from || !to) return "";
  const a = project(from);
  const b = project(to);
  // Busur, bukan garis lurus. Tiga leg yang berbagi Lembar dan Surabaya akan
  // saling menimpa kalau semuanya lurus; lengkungan kecil memisahkannya tanpa
  // memalsukan jaraknya.
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2 - Math.hypot(b.x - a.x, b.y - a.y) * 0.12;
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${midX.toFixed(1)} ${midY.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

export function RouteMap() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const mapRef = useRef<SVGSVGElement | null>(null);
  const legRefs = useRef<(SVGPathElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const map = mapRef.current;
    if (reduced || !section || !map) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const legs = legRefs.current.filter((el): el is SVGPathElement => el !== null);
      for (const leg of legs) {
        const length = leg.getTotalLength();
        gsap.set(leg, { strokeDasharray: length, strokeDashoffset: length });
      }

      // Satu timeline men-scrub tiga hal sekaligus: zoom peta dari seluruh
      // bbox ke koridor rute, dan tiap leg menggambar dirinya berurutan.
      // Alasannya satu kalimat: urutan gambar menjelaskan jaringan lebih cepat
      // daripada tiga garis yang muncul bersamaan.
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=200%",
          pin: true,
          scrub: MOTION.scrub,
          invalidateOnRefresh: true,
        },
      });

      timeline.fromTo(map, { scale: 1, transformOrigin: "50% 50%" }, { scale: 1.25, ease: "none" }, 0);
      legs.forEach((leg, index) => {
        timeline.to(leg, { strokeDashoffset: 0, ease: "none" }, index * 0.8);
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} className="relative flex min-h-[100dvh] items-center overflow-hidden bg-surface-2">
      <svg
        ref={mapRef}
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Peta jaringan penyeberangan ro-ro antara Jawa Timur, Lombok, dan Kalimantan Tengah"
      >
        {coastline.polygons.map((ring, index) => (
          <path
            key={index}
            data-testid="garis-pantai"
            d={coastlinePath(ring)}
            fill="#18292F"
            stroke="#111E24"
            strokeWidth={1}
          />
        ))}

        {ROUTE_LEGS.map((leg, index) => (
          <path
            key={leg.id}
            data-testid="leg-rute"
            ref={(el) => {
              legRefs.current[index] = el;
            }}
            d={legPath(leg.fromId, leg.toId)}
            fill="none"
            stroke="#FF5A1F"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        ))}

        {PORTS.map((port) => {
          const { x, y } = project(port);
          return (
            <g key={port.id}>
              <circle cx={x} cy={y} r={port.kind === "kantor" ? 4 : 6} fill={port.kind === "kantor" ? "#8FA1A8" : "#FF5A1F"} />
              <text x={x + 12} y={y + 4} fontSize={14} fill="#F2EFE9" fontFamily="var(--font-mono)">
                {port.name}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-12 px-4 md:px-8">
        <OverlayPanel className="col-span-12 md:col-span-5">
          <SectionHeader
            title="Rute Penyeberangan Ro-Ro"
            description="Tiga leg penyeberangan yang menghubungkan Jawa Timur, Lombok, dan Kalimantan Tengah."
          />
          <ul className="mt-8 space-y-3 font-mono text-sm text-ink">
            {ROUTE_LEGS.map((leg) => (
              <li key={leg.id}>{leg.label}</li>
            ))}
          </ul>
        </OverlayPanel>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `bun run test -- src/features/home/route-map.test.tsx`
Expected: PASS, 5 test.

- [ ] **Step 5: Perketat selector e2e supaya tidak tertukar dengan peta**

Di `tests/e2e/beranda.spec.ts`, ganti baris di blok "beranda mobile":

```ts
    await expect(page.getByRole("img", { name: /blueprint skematik/i }).first()).toBeVisible();
```

Nama aksesibel blueprint berasal dari `FleetClass.altText`, yang setiap entrinya diawali "Blueprint skematik" (lihat `src/content/fleet.ts`), jadi selector ini menargetkan blueprint dan tidak akan pernah cocok dengan peta.

- [ ] **Step 6: Jalankan gerbang**

Run: `bun run lint && bun run typecheck && bun run doctor`
Expected: ketiganya keluar dengan kode 0.

- [ ] **Step 7: Commit**

```bash
git add src/features/home/route-map.tsx src/features/home/route-map.test.tsx tests/e2e/beranda.spec.ts
git commit -m "feat: peta rute ro-ro dengan garis pantai asli dan tiga leg terpisah"
```

---

### Task 8: Pipeline model 3D

**Files:**
- Create: `scripts/prepare-models.ts`
- Create: `src/content/model-credits.ts`
- Create: `src/content/model-credits.test.ts`
- Modify: `package.json` (devDependency `@gltf-transform/cli`, skrip `prepare-models`)
- Modify: `.env.example`
- Modify: `.gitignore` repo root (tambah `assets/_raw/models/`)

**Interfaces:**
- Consumes: tidak ada dari task lain.
- Produces:
  - `type ModelCredit = { id: string; title: string; author: string; authorUrl: string; modelUrl: string; license: string; sketchfabUid: string; localPath: string }`
  - `MODEL_CREDITS: ModelCredit[]`
  - `FLEET_MODEL_BY_SLUG: Record<string, string | null>` memetakan slug `FleetClass` ke path GLB di `public/`, `null` untuk kelas yang dibangun dari geometri.
  - Berkas `public/models/tanker.glb`, `public/models/ferry.glb`, `public/models/tugboat.glb`.

- [ ] **Step 1: Pasang dependency**

Run: `bun add -d @gltf-transform/cli@4.4.2`
Expected: `package.json` bertambah devDependency, `bun.lock` berubah.

- [ ] **Step 2: Tulis test yang gagal**

Buat `src/content/model-credits.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { FLEET_MODEL_BY_SLUG, MODEL_CREDITS } from "./model-credits";
import { FLEET_CLASSES } from "./fleet";

describe("MODEL_CREDITS", () => {
  // Seluruh model berlisensi CC Attribution, bukan CC0. Kredit yang hilang
  // bukan cuma soal sopan santun, itu pelanggaran syarat lisensi.
  it("setiap entri punya penulis, tautan penulis, dan nama lisensi", () => {
    expect(MODEL_CREDITS.length).toBeGreaterThan(0);
    for (const credit of MODEL_CREDITS) {
      expect(credit.author.trim()).not.toBe("");
      expect(credit.authorUrl).toMatch(/^https:\/\/sketchfab\.com\//);
      expect(credit.modelUrl).toMatch(/^https:\/\/sketchfab\.com\/3d-models\//);
      expect(credit.license).toMatch(/CC/);
    }
  });

  it("setiap id unik", () => {
    expect(new Set(MODEL_CREDITS.map((c) => c.id)).size).toBe(MODEL_CREDITS.length);
  });

  it("setiap localPath menunjuk ke public/models", () => {
    for (const credit of MODEL_CREDITS) {
      expect(credit.localPath).toMatch(/^\/models\/[a-z0-9-]+\.glb$/);
    }
  });
});

describe("FLEET_MODEL_BY_SLUG", () => {
  it("punya entri untuk setiap kelas armada", () => {
    for (const fleetClass of FLEET_CLASSES) {
      expect(FLEET_MODEL_BY_SLUG).toHaveProperty(fleetClass.slug);
    }
  });

  // SPOB dan oil barge tidak punya model di sumber manapun, jadi keduanya
  // memang null dan dibangun dari geometri di Task 11. Test ini yang
  // memastikan keduanya tidak diam-diam dipetakan ke model tanker.
  it("SPOB dan oil barge tidak dipetakan ke model apa pun", () => {
    expect(FLEET_MODEL_BY_SLUG["spob"]).toBeNull();
    expect(FLEET_MODEL_BY_SLUG["oil-barge"]).toBeNull();
  });

  it("tiga kelas sisanya dipetakan ke berkas yang terdaftar di MODEL_CREDITS", () => {
    const paths = new Set(MODEL_CREDITS.map((c) => c.localPath));
    for (const slug of ["motor-tanker", "tugboat", "ro-ro-ferry"]) {
      const path = FLEET_MODEL_BY_SLUG[slug];
      expect(path).not.toBeNull();
      expect(paths.has(path as string)).toBe(true);
    }
  });
});
```

- [ ] **Step 3: Jalankan test, pastikan gagal**

Run: `bun run test -- src/content/model-credits.test.ts`
Expected: FAIL, `Failed to resolve import "./model-credits"`.

- [ ] **Step 4: Tulis data kredit**

Buat `src/content/model-credits.ts`:

```ts
export type ModelCredit = {
  id: string;
  title: string;
  author: string;
  authorUrl: string;
  modelUrl: string;
  license: string;
  sketchfabUid: string;
  localPath: string;
};

/**
 * Seluruh model berlisensi CC Attribution 4.0, bukan CC0, jadi kredit yang
 * terlihat di situs adalah syarat lisensi. Nama penulis dan URL diambil dari
 * GET /v3/models/{uid} pada 18 Agustus 2026, bukan ditulis dari ingatan.
 */
export const MODEL_CREDITS: ModelCredit[] = [
  {
    id: "tanker",
    title: "Tanker Ship",
    author: "Art Blender",
    authorUrl: "https://sketchfab.com/ArtBlender",
    modelUrl: "https://sketchfab.com/3d-models/tanker-ship-96ebf61af42b4062ae98a6ad848e1a25",
    license: "CC BY 4.0",
    sketchfabUid: "96ebf61af42b4062ae98a6ad848e1a25",
    localPath: "/models/tanker.glb",
  },
  {
    id: "ferry",
    title: "Hailuoto car ferry L/A Meriluoto",
    author: "Snowsoup",
    authorUrl: "https://sketchfab.com/snowsoup",
    modelUrl:
      "https://sketchfab.com/3d-models/hailuoto-car-ferry-la-meriluoto-44eaf2dd56b74e76a310d2e532957dbe",
    license: "CC BY 4.0",
    sketchfabUid: "44eaf2dd56b74e76a310d2e532957dbe",
    localPath: "/models/ferry.glb",
  },
  {
    id: "tugboat",
    title: "Rastar 3200 tugboat",
    author: "Brout",
    authorUrl: "https://sketchfab.com/davidbroutian",
    modelUrl: "https://sketchfab.com/3d-models/rastar-3200-tugboat-1bbadbe4ab0a4b2599cd3f450942e6fe",
    license: "CC BY 4.0",
    sketchfabUid: "1bbadbe4ab0a4b2599cd3f450942e6fe",
    localPath: "/models/tugboat.glb",
  },
];

/**
 * SPOB dan oil barge sengaja null. Tidak ada model kedua tipe kapal itu di
 * sumber manapun; keduanya tipe khas Indonesia. Fleet comparator membangun
 * lambungnya dari geometri dan menyamakan materialnya ke model di atas.
 */
export const FLEET_MODEL_BY_SLUG: Record<string, string | null> = {
  "motor-tanker": "/models/tanker.glb",
  "oil-barge": null,
  spob: null,
  tugboat: "/models/tugboat.glb",
  "ro-ro-ferry": "/models/ferry.glb",
};
```

- [ ] **Step 5: Jalankan test, pastikan lulus**

Run: `bun run test -- src/content/model-credits.test.ts`
Expected: PASS, 6 test.

- [ ] **Step 6: Tulis skrip pipeline**

Buat `scripts/prepare-models.ts`:

```ts
#!/usr/bin/env bun
import { mkdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { MODEL_CREDITS } from "../src/content/model-credits";

const RAW_DIR = new URL("../../assets/_raw/models/", import.meta.url).pathname;
const OUT_DIR = new URL("../public/models/", import.meta.url).pathname;
const MAX_BYTES_PER_MODEL = 700_000;
const MAX_BYTES_TOTAL = 2_200_000;

/**
 * Rasio simplify per model. Angka ini hasil inspeksi visual, bukan rumus:
 * lambung tanker punya banyak permukaan datar besar yang tahan desimasi
 * agresif, sedangkan tugboat sudah rendah poligon sejak awal dan rusak kalau
 * dipangkas sekeras itu.
 */
const SIMPLIFY_RATIO: Record<string, number> = {
  tanker: 0.2,
  ferry: 0.35,
  tugboat: 0.6,
};

function requireToken(): string {
  const token = process.env.SKETCHFAB_TOKEN;
  if (!token) {
    throw new Error(
      "SKETCHFAB_TOKEN tidak diisi. Isi di .env.local, ambil dari sketchfab.com/settings/password.",
    );
  }
  return token;
}

async function downloadRaw(uid: string, target: string, token: string): Promise<void> {
  if (existsSync(target)) {
    console.log(`Lewati unduh, sudah ada: ${target}`);
    return;
  }
  const response = await fetch(`https://api.sketchfab.com/v3/models/${uid}/download`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!response.ok) throw new Error(`Gagal minta tautan unduh ${uid}: HTTP ${response.status}`);
  const payload = (await response.json()) as { glb?: { url: string } };
  const url = payload.glb?.url;
  if (!url) throw new Error(`Sketchfab tidak menyediakan varian glb untuk ${uid}`);

  const file = await fetch(url);
  if (!file.ok) throw new Error(`Gagal mengunduh glb ${uid}: HTTP ${file.status}`);
  await writeFile(target, new Uint8Array(await file.arrayBuffer()));
  console.log(`Terunduh ${target}`);
}

async function optimize(input: string, output: string, ratio: number): Promise<void> {
  const proc = Bun.spawn(
    [
      "bunx",
      "--bun",
      "@gltf-transform/cli@4.4.2",
      "optimize",
      input,
      output,
      "--compress",
      "quantize",
      "--texture-compress",
      "webp",
      "--texture-size",
      "1024",
      "--simplify",
      "true",
      "--simplify-ratio",
      String(ratio),
      "--simplify-error",
      "0.001",
    ],
    { stdout: "inherit", stderr: "inherit" },
  );
  const code = await proc.exited;
  if (code !== 0) throw new Error(`gltf-transform optimize gagal untuk ${input}, kode ${code}`);
}

async function main(): Promise<void> {
  const token = requireToken();
  await mkdir(RAW_DIR, { recursive: true });
  await mkdir(OUT_DIR, { recursive: true });

  let total = 0;
  for (const credit of MODEL_CREDITS) {
    const raw = `${RAW_DIR}${credit.id}.glb`;
    const out = `${OUT_DIR}${credit.id}.glb`;
    const ratio = SIMPLIFY_RATIO[credit.id] ?? 0.3;

    await downloadRaw(credit.sketchfabUid, raw, token);
    await optimize(raw, out, ratio);

    const { size } = await stat(out);
    total += size;
    console.log(`${credit.id}: ${(size / 1000).toFixed(0)} kB`);
    if (size > MAX_BYTES_PER_MODEL) {
      throw new Error(
        `${credit.id} ${size} byte, melewati anggaran ${MAX_BYTES_PER_MODEL}. Turunkan SIMPLIFY_RATIO atau ganti ke kandidat cadangan.`,
      );
    }
  }

  if (total > MAX_BYTES_TOTAL) {
    throw new Error(`Total ${total} byte, melewati anggaran ${MAX_BYTES_TOTAL}.`);
  }
  console.log(`Selesai. Total ${(total / 1000).toFixed(0)} kB.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 7: Daftarkan skrip, env, dan gitignore**

Tambahkan ke `package.json` bagian `scripts`, sesudah `prepare-map`:

```json
    "prepare-models": "bun scripts/prepare-models.ts",
```

Tambahkan ke akhir `.env.example`:

```
# Token API Sketchfab, hanya dibutuhkan saat menjalankan bun run prepare-models.
# Ambil dari sketchfab.com/settings/password. Tidak dipakai saat build atau runtime.
SKETCHFAB_TOKEN=
```

Tambahkan ke `.gitignore` di root repo (bukan `dml-web/.gitignore`), sesudah baris yang sudah mengabaikan `assets/_raw`:

```
assets/_raw/models/
```

- [ ] **Step 8: Jalankan pipeline**

Run: `bun run prepare-models`
Expected: tiga berkas di `public/models/`, masing-masing di bawah 700 kB, total di bawah 2,2 MB. Kalau salah satu melewati anggaran, skrip keluar non-nol; turunkan nilai di `SIMPLIFY_RATIO` untuk model itu dan jalankan lagi. Kalau tetap tidak bisa, ganti entri `tanker` di `MODEL_CREDITS` ke kandidat cadangan UID `0b857798b11649fb86ced9475274684c` (Oil Tanker oleh Gman The Cruise Dude, 159.190 tris) dan catat pergantiannya di laporan task.

- [ ] **Step 9: Verifikasi model bisa dibuka**

Run: `bunx --bun @gltf-transform/cli@4.4.2 inspect public/models/tanker.glb`
Expected: laporan mencetak jumlah mesh, material, dan tekstur tanpa error validasi.

- [ ] **Step 10: Jalankan gerbang**

Run: `bun run lint && bun run typecheck && bun run test`
Expected: ketiganya keluar dengan kode 0.

- [ ] **Step 11: Commit**

```bash
git add scripts/prepare-models.ts src/content/model-credits.ts src/content/model-credits.test.ts \
  package.json bun.lock .env.example public/models ../.gitignore
git commit -m "feat: pipeline model 3D Sketchfab dengan gerbang anggaran ukuran dan data kredit lisensi"
```

---

### Task 9: Baris kredit model di footer dan ritme seksi CTA

**Files:**
- Modify: `src/components/layout/site-footer.tsx`
- Create: `src/components/layout/site-footer.test.tsx`
- Modify: `src/features/home/cta-section.tsx`
- Create: `tests/e2e/kredit-model.spec.ts`

**Interfaces:**
- Consumes: `MODEL_CREDITS` dari Task 8.
- Produces: tidak ada API baru.

- [ ] **Step 1: Tulis test yang gagal**

Buat `src/components/layout/site-footer.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "./site-footer";
import { MODEL_CREDITS } from "@/content/model-credits";

describe("SiteFooter", () => {
  it("menyebut setiap model dan penulisnya", () => {
    render(<SiteFooter />);
    for (const credit of MODEL_CREDITS) {
      expect(screen.getByText(new RegExp(credit.title, "i"))).toBeInTheDocument();
      expect(screen.getByRole("link", { name: credit.author })).toHaveAttribute(
        "href",
        credit.authorUrl,
      );
    }
  });

  // Syarat lisensi CC BY, bukan hiasan. Kredit dengan kontras di bawah AA
  // sama saja dengan tidak mencantumkannya.
  it("baris kredit memakai warna ink-muted, bukan warna yang lebih redup lagi", () => {
    render(<SiteFooter />);
    const line = screen.getByTestId("kredit-model");
    expect(line.className).toMatch(/text-ink-muted/);
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `bun run test -- src/components/layout/site-footer.test.tsx`
Expected: FAIL, `Unable to find an element by: [data-testid="kredit-model"]`.

- [ ] **Step 3: Tambahkan baris kredit**

Di `src/components/layout/site-footer.tsx`, tambahkan impor di atas:

```tsx
import { MODEL_CREDITS } from "@/content/model-credits";
```

Lalu ganti blok bar bawah (`<div className="border-t border-surface-3">` sampai penutupnya):

```tsx
      <div className="border-t border-surface-3">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-6 text-xs text-ink-muted md:flex-row md:items-center md:justify-between md:px-8">
          <p>
            {new Date().getFullYear()} {COMPANY.legalName}
          </p>
          {/* Atribusi CC BY adalah syarat lisensi model 3D, jadi baris ini
              tidak boleh disembunyikan di balik disclosure atau diredupkan
              di bawah kontras AA. */}
          <p data-testid="kredit-model" className="text-xs text-ink-muted">
            Model 3D:{" "}
            {MODEL_CREDITS.map((credit, index) => (
              <span key={credit.id}>
                {index > 0 ? ", " : ""}
                <a href={credit.modelUrl} className="hover:text-ink" rel="noopener noreferrer" target="_blank">
                  {credit.title}
                </a>{" "}
                oleh{" "}
                <a href={credit.authorUrl} className="hover:text-ink" rel="noopener noreferrer" target="_blank">
                  {credit.author}
                </a>
              </span>
            ))}
            . Lisensi CC BY 4.0.
          </p>
        </div>
      </div>
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `bun run test -- src/components/layout/site-footer.test.tsx`
Expected: PASS, 2 test.

- [ ] **Step 5: Tulis e2e**

Buat `tests/e2e/kredit-model.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("kredit model 3D hadir di footer dan tertaut ke Sketchfab", async ({ page }) => {
  await page.goto("/");
  const credit = page.getByTestId("kredit-model");
  await expect(credit).toBeVisible();
  await expect(credit.getByRole("link", { name: "Art Blender" })).toHaveAttribute(
    "href",
    "https://sketchfab.com/ArtBlender",
  );
});
```

- [ ] **Step 6: Samakan ritme vertikal seksi CTA**

Spec §6.1 menetapkan seksi konten memakai `py-24 md:py-32`. `cta-section.tsx` masih `py-24` saja, jadi ia satu-satunya seksi yang tidak melebar di desktop. Ubah satu baris di `src/features/home/cta-section.tsx`:

```tsx
    <section className="bg-surface py-24 md:py-32">
```

Tidak ada perubahan lain di berkas itu. CTA-nya sudah "Hubungi Kami" ke `/kontak` dan sudah sesuai aturan satu label per intent.

- [ ] **Step 7: Jalankan gerbang**

Run: `bun run lint && bun run typecheck && bun run test`
Expected: ketiganya keluar dengan kode 0.

- [ ] **Step 8: Commit**

```bash
git add src/components/layout/site-footer.tsx src/components/layout/site-footer.test.tsx \
  src/features/home/cta-section.tsx tests/e2e/kredit-model.spec.ts
git commit -m "feat: baris atribusi CC BY model 3D di footer dan samakan ritme seksi CTA"
```

---

### Task 10: Panggung 3D bersama

Lingkungan pencahayaan dan util kamera yang dipakai hero dan comparator. Dipisah supaya kedua canvas punya bahasa material yang sama persis, yang jadi syarat agar dua lambung buatan di Task 11 menyatu dengan model GLB.

**Files:**
- Create: `src/features/home/three/fit-camera.ts`
- Create: `src/features/home/three/fit-camera.test.ts`
- Create: `src/features/home/three/stage.tsx`
- Create: `src/features/home/three/materials.ts`
- Create: `src/features/home/three/materials.test.ts`

**Interfaces:**
- Consumes: `three`, `@react-three/fiber`, `@react-three/drei`.
- Produces:
  - `fitCameraDistance(radius: number, fovDegrees: number, margin?: number): number`
  - `<Stage />` (dipakai sebagai anak `<Canvas>`, merender `Environment` + `Lightformer` + `ContactShadows`)
  - `HULL_MATERIAL: { color: string; metalness: number; roughness: number }` dan `DECK_MATERIAL`, `ACCENT_LINE_COLOR`

- [ ] **Step 1: Tulis test yang gagal**

Buat `src/features/home/three/fit-camera.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { fitCameraDistance } from "./fit-camera";

describe("fitCameraDistance", () => {
  it("jarak sebanding lurus dengan radius objek", () => {
    const kecil = fitCameraDistance(1, 45);
    const besar = fitCameraDistance(2, 45);
    expect(besar).toBeCloseTo(kecil * 2, 10);
  });

  // Ini inti perbaikan cacat audit bagian 2.1 nomor 6: kamera tetap di
  // [4, 2, 4] memotong lambung 95 m. Fov lebih lebar harus memberi jarak
  // lebih dekat untuk radius yang sama.
  it("fov lebih lebar memberi jarak lebih dekat", () => {
    expect(fitCameraDistance(1, 60)).toBeLessThan(fitCameraDistance(1, 30));
  });

  it("margin menambah jarak secara proporsional", () => {
    expect(fitCameraDistance(1, 45, 2)).toBeCloseTo(fitCameraDistance(1, 45, 1) * 2, 10);
  });

  it("radius nol memberi jarak nol, bukan NaN", () => {
    expect(fitCameraDistance(0, 45)).toBe(0);
  });
});
```

Buat `src/features/home/three/materials.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DECK_MATERIAL, HULL_MATERIAL, ACCENT_LINE_COLOR } from "./materials";

describe("material panggung", () => {
  // Dua lambung di comparator dibangun dari geometri dan harus menyatu dengan
  // tiga model GLB dalam satu frame. Satu-satunya cara itu terjadi adalah
  // kalau nilainya datang dari satu tempat, bukan dipilih ulang per komponen.
  it("lambung dan geladak memakai rentang metalness dan roughness yang wajar", () => {
    for (const material of [HULL_MATERIAL, DECK_MATERIAL]) {
      expect(material.metalness).toBeGreaterThanOrEqual(0);
      expect(material.metalness).toBeLessThanOrEqual(1);
      expect(material.roughness).toBeGreaterThan(0);
      expect(material.roughness).toBeLessThanOrEqual(1);
      expect(material.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("garis ukur memakai token aksen situs", () => {
    expect(ACCENT_LINE_COLOR).toBe("#FF5A1F");
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `bun run test -- src/features/home/three`
Expected: FAIL, `Failed to resolve import "./fit-camera"` dan `"./materials"`.

- [ ] **Step 3: Tulis util kamera dan material**

Buat `src/features/home/three/fit-camera.ts`:

```ts
/**
 * Jarak kamera supaya bola pembatas objek muat penuh di dalam frustum
 * vertikal. Tanpa ini, kamera bernilai tetap akan memotong kelas kapal
 * terpanjang dan menyisakan ruang kosong besar di kelas terpendek, yaitu
 * cacat yang diaudit di spec bagian 2.1 nomor 6.
 *
 * Fungsi murni tanpa impor three: radius dihitung pemanggil dari data kelas
 * kapal, sehingga aritmetika kamera bisa diuji tanpa WebGL sama sekali.
 */
export function fitCameraDistance(radius: number, fovDegrees: number, margin = 1.15): number {
  if (radius <= 0) return 0;
  const half = (fovDegrees * Math.PI) / 360;
  return (radius / Math.sin(half)) * margin;
}
```

Buat `src/features/home/three/materials.ts`:

```ts
/**
 * Satu bahasa material untuk seluruh lambung, baik yang datang dari model GLB
 * maupun yang dibangun dari geometri. Nilai lambung diambil dari material
 * model tanker setelah dinormalisasi pipeline, bukan dipilih terpisah, supaya
 * lima kelas di comparator terbaca sebagai satu keluarga.
 */
export const HULL_MATERIAL = {
  color: "#2A3B42",
  metalness: 0.65,
  roughness: 0.45,
} as const;

export const DECK_MATERIAL = {
  color: "#1B2C33",
  metalness: 0.3,
  roughness: 0.8,
} as const;

export const ACCENT_LINE_COLOR = "#FF5A1F";
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `bun run test -- src/features/home/three`
Expected: PASS, 6 test.

- [ ] **Step 5: Tulis panggung**

Buat `src/features/home/three/stage.tsx`:

```tsx
"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

/**
 * Lingkungan prosedural, nol byte. Berkas HDRI 1k dari Poly Haven berukuran
 * 1,5 MB, yaitu dua kali seluruh anggaran model halaman ini, dan menambah satu
 * kewajiban atribusi lagi. Susunan lightformer di bawah memberi highlight
 * memanjang yang dibutuhkan lambung logam supaya terbaca sebagai permukaan,
 * bukan siluet, tanpa mengunduh apa pun.
 */
export function Stage() {
  return (
    <>
      <Environment resolution={256}>
        <Lightformer intensity={2.4} position={[0, 6, -8]} scale={[12, 3, 1]} color="#FFE3CC" />
        <Lightformer intensity={1.1} position={[-8, 3, 4]} scale={[8, 2, 1]} color="#9FC4D8" />
        <Lightformer intensity={0.7} position={[8, 2, 4]} scale={[6, 2, 1]} color="#4C6773" />
        <Lightformer intensity={0.5} position={[0, -4, 0]} scale={[14, 6, 1]} rotation={[Math.PI / 2, 0, 0]} color="#0A1418" />
      </Environment>
      <directionalLight position={[6, 8, 4]} intensity={1.2} color="#FFD9BC" />
      <ContactShadows position={[0, -0.01, 0]} opacity={0.55} scale={40} blur={2.4} far={12} />
    </>
  );
}
```

- [ ] **Step 6: Jalankan gerbang**

Run: `bun run lint && bun run typecheck && bun run test && bun run doctor`
Expected: keempatnya keluar dengan kode 0.

- [ ] **Step 7: Commit**

```bash
git add src/features/home/three
git commit -m "feat: panggung 3D bersama, lingkungan lightformer nol byte dan util fit kamera"
```

---

### Task 11: Fleet comparator 3D realistis

**Files:**
- Modify: `src/features/home/fleet-comparator.tsx` (tulis ulang penuh)
- Create: `src/features/home/fleet-comparator.test.tsx`
- Modify: `src/features/home/fleet-3d/fleet-canvas.tsx` (tulis ulang penuh)
- Create: `src/features/home/fleet-3d/class-index.ts`
- Create: `src/features/home/fleet-3d/class-index.test.ts`

`src/features/home/fleet-3d/hull-geometry.ts` dan `hull-geometry.test.ts` tidak disentuh. Geometrinya sudah benar; yang berubah cuma materialnya, dan material datang dari Task 10.

**Interfaces:**
- Consumes: `Stage`, `fitCameraDistance`, `HULL_MATERIAL`, `DECK_MATERIAL`, `ACCENT_LINE_COLOR` dari Task 10; `FLEET_MODEL_BY_SLUG` dari Task 8; `useScrollProgress` dari Task 1; `FLEET_CLASSES`.
- Produces:
  - `activeClassIndex(progress: number, count: number): { index: number; blend: number }`
  - `<FleetComparator />`, `<FleetCanvas progressRef={React.RefObject<number>} onActiveIndexChange={(index: number) => void} />`

- [ ] **Step 1: Tulis test yang gagal untuk pemilih kelas**

Buat `src/features/home/fleet-3d/class-index.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { activeClassIndex } from "./class-index";

describe("activeClassIndex", () => {
  it("progress nol memilih kelas pertama tanpa blend", () => {
    expect(activeClassIndex(0, 5)).toEqual({ index: 0, blend: 0 });
  });

  // Batas akhir adalah tempat versi lama diam-diam rusak: index melewati
  // panjang array, opacity semua nol, canvas kosong tanpa error.
  it("progress satu memilih kelas terakhir, bukan indeks di luar batas", () => {
    expect(activeClassIndex(1, 5)).toEqual({ index: 4, blend: 0 });
  });

  it("progress di tengah dua kelas memberi blend proporsional", () => {
    const { index, blend } = activeClassIndex(0.125, 5);
    expect(index).toBe(0);
    expect(blend).toBeCloseTo(0.5, 6);
  });

  it("menjepit progress di luar rentang", () => {
    expect(activeClassIndex(-1, 5).index).toBe(0);
    expect(activeClassIndex(2, 5).index).toBe(4);
  });

  it("satu kelas saja tidak pernah membagi dengan nol", () => {
    expect(activeClassIndex(0.5, 1)).toEqual({ index: 0, blend: 0 });
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `bun run test -- src/features/home/fleet-3d/class-index.test.ts`
Expected: FAIL, `Failed to resolve import "./class-index"`.

- [ ] **Step 3: Tulis pemilih kelas**

Buat `src/features/home/fleet-3d/class-index.ts`:

```ts
/**
 * Memetakan progress scroll ke pasangan kelas yang sedang di-crossfade.
 * Dipisah dari canvas supaya bisa diuji tanpa WebGL: aritmetika batas di sini
 * yang dulu menghasilkan indeks di luar batas dan canvas kosong senyap.
 */
export function activeClassIndex(
  progress: number,
  count: number,
): { index: number; blend: number } {
  if (count <= 1) return { index: 0, blend: 0 };
  const clamped = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
  const position = clamped * (count - 1);
  const index = Math.min(Math.floor(position), count - 1);
  return { index, blend: position - index };
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `bun run test -- src/features/home/fleet-3d/class-index.test.ts`
Expected: PASS, 5 test.

- [ ] **Step 5: Tulis test yang gagal untuk seksi**

Buat `src/features/home/fleet-comparator.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FleetComparator } from "./fleet-comparator";
import { FLEET_CLASSES } from "@/content/fleet";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

describe("FleetComparator", () => {
  it("render heading seksi", () => {
    render(<FleetComparator />);
    expect(screen.getByRole("heading", { level: 2, name: "Perbandingan Armada" })).toBeInTheDocument();
  });

  it("render tabel spesifikasi untuk pembaca layar di semua kondisi", () => {
    render(<FleetComparator />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  // matchMedia distub matches: true, artinya reduced motion. Kontraknya:
  // tidak ada canvas sama sekali, blueprint SVG yang tampil.
  it("saat reduced motion, blueprint yang tampil dan canvas tidak pernah dipasang", () => {
    const { container } = render(<FleetComparator />);
    expect(container.querySelector("canvas")).toBeNull();
    expect(screen.getAllByRole("img", { name: /blueprint skematik/i })).toHaveLength(
      FLEET_CLASSES.length,
    );
  });
});
```

- [ ] **Step 6: Jalankan test, pastikan gagal**

Run: `bun run test -- src/features/home/fleet-comparator.test.tsx`
Expected: FAIL pada test pertama, heading masih dirender langsung tanpa `SectionHeader` dan belum punya level yang dicari.

- [ ] **Step 7: Tulis ulang canvas**

Ganti isi `src/features/home/fleet-3d/fleet-canvas.tsx`:

```tsx
"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { FLEET_CLASSES } from "@/content/fleet";
import { FLEET_MODEL_BY_SLUG } from "@/content/model-credits";
import { Stage } from "../three/stage";
import { fitCameraDistance } from "../three/fit-camera";
import { DECK_MATERIAL, HULL_MATERIAL, ACCENT_LINE_COLOR } from "../three/materials";
import { buildHullGeometry, buildSuperstructureGeometry } from "./hull-geometry";
import { activeClassIndex } from "./class-index";

const FOV = 40;

/**
 * Lambung dari model GLB. Materialnya ditimpa nilai bersama supaya tiga model
 * unduhan dan dua lambung buatan tidak terbaca sebagai dua kualitas berbeda
 * dalam satu frame.
 */
function ModelHull({ url, lengthMeters }: { url: string; lengthMeters: number }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => {
    const copy = scene.clone(true);
    const box = new THREE.Box3().setFromObject(copy);
    const size = new THREE.Vector3();
    box.getSize(size);
    // Skala dunia disamakan ke satuan yang dipakai hull-geometry.ts: meter
    // dibagi sepuluh. Tanpa normalisasi ini, satu model bisa seribu kali lebih
    // besar dari yang lain dan perbandingan skala jadi tidak ada artinya.
    const scale = size.x > 0 ? lengthMeters / 10 / size.x : 1;
    copy.scale.setScalar(scale);
    // Titik asal tiap GLB ada di tempat berbeda, ada yang di lunas ada yang di
    // tengah lambung. ContactShadows di Stage duduk tetap di y=0, jadi tanpa
    // normalisasi ini sebagian lambung akan mengambang di atas bayangannya dan
    // sebagian lagi tenggelam menembusnya.
    copy.position.y = -new THREE.Box3().setFromObject(copy).min.y;
    copy.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.material = new THREE.MeshStandardMaterial({
          color: HULL_MATERIAL.color,
          metalness: HULL_MATERIAL.metalness,
          roughness: HULL_MATERIAL.roughness,
        });
      }
    });
    return copy;
  }, [scene, lengthMeters]);

  return <primitive object={cloned} />;
}

/**
 * Lambung untuk kelas yang tidak punya model. SPOB dan oil barge tipe kapal
 * khas Indonesia dan tidak ada di sumber manapun, jadi keduanya dibangun dari
 * primitif dan diberi material yang sama persis dengan model di atas.
 */
function BuiltHull({ index }: { index: number }) {
  const fleetClass = FLEET_CLASSES[index];
  const hullGeometry = useMemo(() => (fleetClass ? buildHullGeometry(fleetClass) : null), [fleetClass]);
  const superGeometry = useMemo(
    () => (fleetClass ? buildSuperstructureGeometry(fleetClass) : null),
    [fleetClass],
  );

  if (!hullGeometry || !superGeometry) return null;

  return (
    <group>
      <mesh geometry={hullGeometry}>
        <meshStandardMaterial
          color={HULL_MATERIAL.color}
          metalness={HULL_MATERIAL.metalness}
          roughness={HULL_MATERIAL.roughness}
        />
      </mesh>
      <mesh geometry={superGeometry} position={[0, 0.6, 0]}>
        <meshStandardMaterial
          color={DECK_MATERIAL.color}
          metalness={DECK_MATERIAL.metalness}
          roughness={DECK_MATERIAL.roughness}
        />
      </mesh>
    </group>
  );
}

function ClassGroup({
  index,
  opacityRef,
}: {
  index: number;
  opacityRef: React.RefObject<number[]>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const fleetClass = FLEET_CLASSES[index];
  const modelUrl = fleetClass ? FLEET_MODEL_BY_SLUG[fleetClass.slug] : null;

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    const opacity = opacityRef.current[index] ?? 0;
    group.visible = opacity > 0.01;
    group.traverse((node) => {
      if (node instanceof THREE.Mesh && node.material instanceof THREE.MeshStandardMaterial) {
        node.material.transparent = true;
        node.material.opacity = opacity;
      }
    });
  });

  if (!fleetClass) return null;

  return (
    <group ref={groupRef}>
      {modelUrl ? (
        <ModelHull url={modelUrl} lengthMeters={fleetClass.lengthMeters} />
      ) : (
        <BuiltHull index={index} />
      )}
    </group>
  );
}

/**
 * Grid tetap sepanjang 10 m per kotak. Tidak ikut berganti saat kelas berganti,
 * jadi mata punya patokan tetap dan perbedaan panjang antar kelas benar-benar
 * terbaca sebagai perbedaan ukuran, bukan perubahan jarak kamera.
 */
function ScaleGrid() {
  return (
    <gridHelper args={[20, 20, ACCENT_LINE_COLOR, "#18292F"]} position={[0, -0.02, 0]} />
  );
}

function Rig({
  progressRef,
  onActiveIndexChange,
}: {
  progressRef: React.RefObject<number>;
  onActiveIndexChange: (index: number) => void;
}) {
  const initialOpacity = useMemo(() => FLEET_CLASSES.map(() => 0), []);
  const opacityRef = useRef<number[]>(initialOpacity);
  const lastIndexRef = useRef(-1);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ camera }, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.12;

    const { index, blend } = activeClassIndex(progressRef.current ?? 0, FLEET_CLASSES.length);
    opacityRef.current = FLEET_CLASSES.map((_, i) => {
      if (i === index) return 1 - blend;
      if (i === index + 1) return blend;
      return 0;
    });

    // Kamera mengikuti ukuran kelas aktif, bukan berdiri di posisi tetap.
    const active = FLEET_CLASSES[index];
    if (active) {
      const radius = active.lengthMeters / 20;
      const distance = fitCameraDistance(radius, FOV);
      const target = new THREE.Vector3(distance * 0.72, distance * 0.38, distance * 0.72);
      camera.position.lerp(target, Math.min(1, delta * 2.2));
      camera.lookAt(0, 0, 0);
    }

    if (index !== lastIndexRef.current) {
      lastIndexRef.current = index;
      onActiveIndexChange(index);
    }
  });

  return (
    <group ref={groupRef}>
      {FLEET_CLASSES.map((fleetClass, index) => (
        <ClassGroup key={fleetClass.slug} index={index} opacityRef={opacityRef} />
      ))}
    </group>
  );
}

export function FleetCanvas({
  progressRef,
  onActiveIndexChange,
}: {
  progressRef: React.RefObject<number>;
  onActiveIndexChange: (index: number) => void;
}) {
  return (
    <Canvas camera={{ position: [8, 4, 8], fov: FOV }} dpr={[1, 1.5]}>
      <Stage />
      <ScaleGrid />
      <Rig progressRef={progressRef} onActiveIndexChange={onActiveIndexChange} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </Canvas>
  );
}

for (const url of Object.values(FLEET_MODEL_BY_SLUG)) {
  if (url) useGLTF.preload(url);
}
```

- [ ] **Step 8: Tulis ulang seksi comparator**

Ganti isi `src/features/home/fleet-comparator.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { useScrollProgress } from "@/lib/motion/use-scroll-progress";
import { FLEET_CLASSES } from "@/content/fleet";
import { BlueprintSvg } from "@/features/fleet/blueprint-svg";
import { FleetSpecTable } from "@/features/fleet/spec-table";
import { SectionHeader } from "@/components/ui/section-header";

const FleetCanvas = dynamic(() => import("./fleet-3d/fleet-canvas").then((mod) => mod.FleetCanvas), {
  ssr: false,
});

const DESKTOP_QUERY = "(min-width: 768px)";

function subscribeDesktop(onStoreChange: () => void): () => void {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

function getDesktopSnapshot(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

/**
 * Sama seperti usePrefersReducedMotion: server dan render pertama saat hidrasi
 * belum tahu lebar viewport asli. useSyncExternalStore menjaga snapshot server
 * konsisten untuk render pertama, lalu React sendiri yang menyinkronkannya.
 */
function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribeDesktop, getDesktopSnapshot, () => true);
}

export function FleetComparator() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();
  const canvasEnabled = isDesktop && !reduced;
  const [canvasVisible, setCanvasVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const progressRef = useScrollProgress(sectionRef, {
    end: "+=300%",
    pin: true,
    disabled: !canvasEnabled,
  });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !canvasEnabled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCanvasVisible(true);
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [canvasEnabled]);

  const handleActiveIndexChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const active = FLEET_CLASSES[activeIndex] ?? FLEET_CLASSES[0];

  return (
    <section ref={sectionRef} className="relative min-h-[100dvh] bg-surface py-24 md:py-0">
      <div className="mx-auto grid max-w-[1400px] grid-cols-12 gap-8 px-4 md:min-h-[100dvh] md:items-center md:px-8">
        <div className="col-span-12 md:col-span-4">
          <SectionHeader
            title="Perbandingan Armada"
            description="Lima kelas kapal, dari SPOB terkecil sampai motor tanker terbesar, dalam satu skala."
          />
          {canvasEnabled && active ? (
            <dl className="mt-12 space-y-4 font-mono text-sm">
              <div>
                <dt className="text-ink-muted">Kelas</dt>
                <dd className="text-2xl text-ink">{active.name}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Panjang</dt>
                <dd className="text-ink">{active.lengthMeters} m</dd>
              </div>
              <div>
                <dt className="text-ink-muted">DWT</dt>
                <dd className="text-ink">{active.dwt === null ? "-" : active.dwt.toLocaleString("id-ID")}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Kapasitas</dt>
                <dd className="text-ink">{active.capacityLabel}</dd>
              </div>
            </dl>
          ) : null}
        </div>

        <div className="col-span-12 md:col-span-8">
          {canvasEnabled ? (
            <div className="h-[60vh] md:h-[75vh]">
              {canvasVisible && (
                <FleetCanvas progressRef={progressRef} onActiveIndexChange={handleActiveIndexChange} />
              )}
            </div>
          ) : (
            <BlueprintSvg fleetClasses={FLEET_CLASSES} />
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <FleetSpecTable fleetClasses={FLEET_CLASSES} />
      </div>
    </section>
  );
}
```

- [ ] **Step 9: Jalankan test, pastikan lulus**

Run: `bun run test -- src/features/home/fleet-comparator.test.tsx src/features/home/fleet-3d`
Expected: PASS, 3 test seksi ditambah test hull-geometry dan class-index yang sudah ada.

- [ ] **Step 10: Checkpoint browser wajib, delta 2 spec**

Jalankan `bun run dev`, buka beranda di 1440x900, gulir perlahan melewati seluruh pin comparator. Yang harus terlihat: lima lambung berganti berurutan, setiap lambung muat penuh dalam frame tanpa terpotong, grid tetap ukurannya, dan dua lambung buatan (SPOB, Oil Barge) tidak terlihat berbeda kualitas dari tiga model unduhan.

Periksa juga dua hal yang tidak bisa dilihat dari test: bayangan kontak menempel di lunas tiap lambung, bukan mengambang atau tertembus; dan grid 20 unit (satu kotak sama dengan 10 m) benar-benar terbaca sebagai patokan skala di kedua ujung, motor tanker 95 m dan tugboat 32 m. Kalau di kelas terkecil grid justru jadi kekacauan visual, yang perlu diubah adalah luas gridnya, bukan jarak kameranya.

Kalau kedua lambung buatan jelas terlihat lebih kasar sampai mengganggu, jalankan jalan mundur yang sudah disetujui di spec §9 Delta 2: seluruh comparator kembali ke estetika wireframe blueprint dengan mengganti `meshStandardMaterial` di `BuiltHull` dan `ModelHull` menjadi `lineSegments` berwarna `ACCENT_LINE_COLOR` di atas `meshBasicMaterial` gelap. Catat keputusan dan alasannya di laporan task.

- [ ] **Step 11: Jalankan gerbang**

Run: `bun run lint && bun run typecheck && bun run doctor`
Expected: ketiganya keluar dengan kode 0. `doctor` khususnya harus bersih dari `three-no-object-construction-in-render` dan `r3f-no-inline-resource-prop`.

- [ ] **Step 12: Commit**

```bash
git add src/features/home/fleet-comparator.tsx src/features/home/fleet-comparator.test.tsx \
  src/features/home/fleet-3d
git commit -m "feat: fleet comparator 3D dengan model asli, fit kamera per kelas, dan grid skala tetap"
```

---

### Task 12: Hero 3D

**Files:**
- Modify: `src/features/home/hero.tsx` (tulis ulang penuh)
- Modify: `src/features/home/hero.test.tsx`
- Create: `src/features/home/hero-canvas.tsx`
- Create: `src/features/home/hero-headline.tsx`
- Delete: `src/features/home/sequence/night-sequence.tsx`
- Create: `tests/e2e/hero.spec.ts`

**Interfaces:**
- Consumes: `Stage`, `fitCameraDistance` dari Task 10; `MODEL_CREDITS` dari Task 8; `useScrollProgress`, `MOTION` dari Task 1; `MEDIA`, `avifSrc`; `CtaLink`.
- Produces: `<Hero />` (Server Component), `<HeroCanvas />` (client leaf), `<HeroHeadline />` (client leaf).

Sebelum menghapus `night-sequence.tsx`, verifikasi konsumennya:

```bash
grep -rn "night-sequence\|NightSequence" src tests
```
Hasil yang diharapkan hanya `hero.tsx`.

- [ ] **Step 1: Tulis test yang gagal**

Ganti isi `src/features/home/hero.test.tsx`:

```tsx
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./hero";

/**
 * Vitest tidak menghormati batas Server Component, jadi HeroCanvas dan
 * HeroHeadline ikut dirender di sini. matches: true memilih jalur reduced
 * motion di keduanya: HeroCanvas berhenti sebelum memasang canvas, dan
 * HeroHeadline mengembalikan heading utuh tanpa memanggil SplitText, yang
 * memang tidak bisa memecah baris di jsdom karena tidak ada layout. Pola stub
 * ini sama dengan business-lines.test.tsx dan certifications.test.tsx.
 *
 * Menyandarkan assertion "tidak ada canvas" pada default global di
 * vitest.setup.ts akan membuat test ini diam-diam terbalik kalau default itu
 * berubah, jadi stubnya ditulis eksplisit di sini.
 */
beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

describe("Hero", () => {
  it("render headline sebagai h1", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  // Disiplin hero master spec: headline maksimal dua baris di desktop.
  // Versi lama tiga baris. Batas kata adalah proksi yang bisa diuji.
  it("headline maksimal tujuh kata", () => {
    render(<Hero />);
    const words = screen.getByRole("heading", { level: 1 }).textContent?.trim().split(/\s+/) ?? [];
    expect(words.length).toBeLessThanOrEqual(7);
  });

  it("subteks maksimal dua puluh kata", () => {
    render(<Hero />);
    const subtext = screen.getByTestId("hero-subteks").textContent?.trim().split(/\s+/) ?? [];
    expect(subtext.length).toBeLessThanOrEqual(20);
  });

  it("CTA primer mengarah ke kontak", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: /hubungi kami/i })).toHaveAttribute("href", "/kontak");
  });

  // Kontrak LCP: poster harus ada di HTML server dengan priority, apa pun
  // yang terjadi pada canvas. Ini yang menjaga ambang Lighthouse tetap 5000.
  it("poster hero dirender sebagai gambar prioritas di HTML server", () => {
    const { container } = render(<Hero />);
    const poster = container.querySelector("[data-testid='hero-poster'] img, img[data-testid='hero-poster']");
    expect(poster).not.toBeNull();
    expect(poster?.getAttribute("src")).toMatch(/dji-0815/);
  });

  it("tidak ada canvas di HTML server", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector("canvas")).toBeNull();
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `bun run test -- src/features/home/hero.test.tsx`
Expected: FAIL pada test kedua (headline sekarang sembilan kata) dan test `hero-subteks` (testid belum ada).

- [ ] **Step 3: Tulis canvas hero**

Buat `src/features/home/hero-canvas.tsx`:

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Stage } from "./three/stage";
import { fitCameraDistance } from "./three/fit-camera";
import { HULL_MATERIAL } from "./three/materials";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { useScrollProgress } from "@/lib/motion/use-scroll-progress";

const MODEL_URL = "/models/tanker.glb";
const FOV = 38;

function Vessel() {
  const { scene } = useGLTF(MODEL_URL);
  const prepared = useMemo(() => {
    const copy = scene.clone(true);
    const box = new THREE.Box3().setFromObject(copy);
    const size = new THREE.Vector3();
    box.getSize(size);
    const scale = size.x > 0 ? 9.5 / size.x : 1;
    copy.scale.setScalar(scale);
    copy.position.y = -box.min.y * scale;
    copy.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.material = new THREE.MeshStandardMaterial({
          color: HULL_MATERIAL.color,
          metalness: HULL_MATERIAL.metalness,
          roughness: HULL_MATERIAL.roughness,
        });
      }
    });
    return copy;
  }, [scene]);

  return <primitive object={prepared} />;
}

/**
 * Tiga beat kamera yang dijahit jadi satu gerakan: masuk, memutar melewati
 * lambung, lalu terangkat dan menunduk ke geladak. Alasannya satu kalimat:
 * skala kapal hanya terbaca kalau kamera bergerak melewatinya.
 */
function CameraRig({ progressRef }: { progressRef: React.RefObject<number> }) {
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }, delta) => {
    const progress = progressRef.current ?? 0;
    const near = fitCameraDistance(5.4, FOV);
    const far = near * 2.1;

    const distance = THREE.MathUtils.lerp(far, near, Math.min(1, progress * 1.6));
    const yaw = THREE.MathUtils.degToRad(-20 + progress * 35);
    const height = THREE.MathUtils.lerp(distance * 0.16, distance * 0.44, progress);

    target.set(Math.sin(yaw) * distance, height, Math.cos(yaw) * distance);
    camera.position.lerp(target, Math.min(1, delta * 2.5));
    camera.lookAt(0, THREE.MathUtils.lerp(1.4, 0.4, progress), 0);
  });

  return null;
}

export function HeroCanvas() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const reduced = usePrefersReducedMotion();

  const progressRef = useScrollProgress(sectionRef, {
    end: "+=120%",
    pin: true,
    disabled: reduced || !mounted,
  });

  /**
   * Satu efek, bukan dua. Versi dua efek (satu mengisi sectionRef, satu
   * memasang canvas) bergantung pada urutan pemanggilan efek: efek di dalam
   * useScrollProgress terdaftar lebih dulu karena hook-nya dipanggil di atas,
   * jadi ia bisa berjalan saat sectionRef masih null dan pin tidak pernah
   * terpasang. Mengisi sectionRef di sini, sebelum setMounted, membuat urutan
   * itu tidak lagi jadi soal.
   *
   * Penundaannya sendiri yang menjaga LCP: poster next/image yang mengecat
   * pertama dan tetap jadi elemen LCP. Kalau canvas dipasang di render
   * pertama, WebGL ikut bersaing di jendela pengukuran LCP tanpa mengubah apa
   * yang sebenarnya dilihat pengguna lebih dulu.
   */
  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    const section = document.getElementById("hero");
    if (!(section instanceof HTMLElement)) return;
    sectionRef.current = section;

    const timer = window.setTimeout(() => setMounted(true), 600);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  if (reduced || !mounted) return null;

  return (
    <div
      className="absolute inset-0 transition-opacity duration-700"
      style={{ opacity: ready ? 1 : 0 }}
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 3, 26], fov: FOV }}
        dpr={[1, 1.5]}
        onCreated={() => setReady(true)}
      >
        <Stage />
        <Vessel />
        <CameraRig progressRef={progressRef} />
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL);
```

- [ ] **Step 4: Tulis leaf headline**

Buat `src/features/home/hero-headline.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, SplitText } from "@/lib/motion/gsap";
import { MOTION } from "@/lib/motion/tokens";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";

/**
 * Mask-reveal per baris. Reduced motion tidak sekadar mempercepat animasi:
 * SplitText memecah DOM heading jadi banyak div, jadi jalur reduced motion
 * mengembalikan heading utuh tanpa pernah memecahnya sama sekali.
 */
export function HeroHeadline({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (reduced || !node) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const split = new SplitText(node, { type: "lines", linesClass: "overflow-hidden" });
      gsap.from(split.lines, {
        yPercent: 110,
        duration: MOTION.slow,
        ease: MOTION.ease,
        stagger: 0.12,
      });
      return () => split.revert();
    }, ref);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <h1
      ref={ref}
      className="max-w-[14ch] font-display text-4xl font-bold tracking-tight text-ink md:text-6xl"
    >
      {children}
    </h1>
  );
}
```

- [ ] **Step 5: Tulis ulang hero**

Ganti isi `src/features/home/hero.tsx`:

```tsx
import Image from "next/image";
import { CtaLink } from "@/components/ui/cta-link";
import { MEDIA, avifSrc } from "@/lib/media/manifest";
import { HeroCanvas } from "./hero-canvas";
import { HeroHeadline } from "./hero-headline";

export function Hero() {
  const frames = MEDIA["hero-malam"];
  const posterFrame = frames[4];
  if (!posterFrame) {
    throw new Error("MEDIA['hero-malam'] harus punya minimal 5 frame untuk poster tengah");
  }

  return (
    <section id="hero" className="relative flex min-h-[100dvh] items-end overflow-hidden pt-24 pb-16 md:pb-24">
      {/* Poster tetap elemen LCP di setiap kondisi: tanpa JS, saat reduced
          motion, di mobile, dan bahkan saat canvas aktif. Canvas hanya
          menumpuk di atasnya setelah idle, dan poster tidak pernah dilepas
          dari DOM supaya kegagalan WebGL tidak menyisakan layar kosong. */}
      <Image
        data-testid="hero-poster"
        src={avifSrc(posterFrame, 1600)}
        alt={posterFrame.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <HeroCanvas />
      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 md:px-8">
        <HeroHeadline>Menggerakkan energi Kalimantan sejak 1985.</HeroHeadline>
        <p data-testid="hero-subteks" className="mt-4 max-w-[45ch] text-ink">
          Armada BBM, penyeberangan ro-ro, dan galangan kapal dalam satu grup pelayaran Banjarmasin.
        </p>
        <div className="mt-8">
          {/* TODO(plan-bisnis): arahkan ke /bisnis/transportasi-bbm/permintaan-informasi setelah halaman itu dibangun */}
          <CtaLink href="/kontak">Hubungi Kami</CtaLink>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Hapus sekuens malam lama**

```bash
git rm src/features/home/sequence/night-sequence.tsx
rmdir src/features/home/sequence 2>/dev/null || true
```

- [ ] **Step 7: Jalankan test, pastikan lulus**

Run: `bun run test -- src/features/home/hero.test.tsx`
Expected: PASS, 6 test.

- [ ] **Step 8: Tulis e2e kontrak render hero**

Buat `tests/e2e/hero.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("hero tanpa JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("headline, subteks, CTA, dan poster tetap hadir", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByTestId("hero-subteks")).toBeVisible();
    await expect(page.getByRole("link", { name: /hubungi kami/i }).first()).toBeVisible();
    await expect(page.getByTestId("hero-poster")).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});

test.describe("hero dengan reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("canvas tidak pernah dipasang", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(3000);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.getByTestId("hero-poster")).toBeVisible();
  });
});

test.describe("hero di mobile", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("canvas tidak pernah dipasang di viewport kecil", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(3000);
    await expect(page.locator("canvas")).toHaveCount(0);
  });
});
```

- [ ] **Step 9: Jalankan gerbang**

Run: `bun run lint && bun run typecheck && bun run doctor`
Expected: ketiganya keluar dengan kode 0.

- [ ] **Step 10: Commit**

```bash
git add -A src/features/home tests/e2e/hero.spec.ts
git commit -m "feat: hero 3D dengan artefak tanker, tiga beat kamera, dan poster tetap elemen LCP"
```

---

### Task 13: Gerbang akhir dan keputusan ambang LCP

**Files:**
- Modify: `lighthouserc.json` (hanya kalau langkah ukur gagal)
- Create: `.superpowers/sdd/2026-08-18-dml-plan-4/progress.md`

**Interfaces:**
- Consumes: seluruh task sebelumnya.
- Produces: catatan hasil ukur dan keputusan ambang.

- [ ] **Step 1: Jalankan seluruh e2e**

Run: `bun run test:e2e`
Expected: seluruh spec hijau, termasuk `no-js`, `reduced-motion`, `beranda`, `contrast-tokens`, `hero`, `kredit-model`.

Kalau `contrast-tokens.spec.ts` gagal, ada elemen berlatar aksen yang memakai teks ink. Cari elemennya dari nama kelas yang dicetak assertion, lalu ganti teksnya ke `text-on-accent` atau ganti latarnya ke surface. Jangan melonggarkan test itu.

- [ ] **Step 2: Ukur Lighthouse dengan ambang yang belum disentuh**

Run: `bun run lighthouse`
Expected: laporan tertulis ke `.lighthouseci/`. Catat angka `largest-contentful-paint`, `cumulative-layout-shift`, dan skor SEO.

- [ ] **Step 3: Putuskan ambang berdasarkan angka, bukan sebaliknya**

Kalau langkah 2 lulus, `lighthouserc.json` tidak disentuh sama sekali dan catat di laporan bahwa pelonggaran yang disetujui tidak terpakai.

Kalau langkah 2 gagal di `largest-contentful-paint`, naikkan ambang ke angka terukur ditambah 10 persen, dibulatkan ke atas ke ratusan milidetik terdekat, dengan batas atas 6000. Contoh, kalau terukur 5240 ms, ambang jadi 5800.

```json
        "largest-contentful-paint": ["error", { "maxNumericValue": 5800 }],
```

Kalau angka terukur melewati 5455 ms (yang berarti ambang barunya akan lebih dari 6000), jangan naikkan ambang. Perbaiki hero: naikkan penundaan `setTimeout` di `hero-canvas.tsx` dari 600 ms, atau ganti pemicunya jadi scroll pertama pengguna dengan `ScrollTrigger.create({ trigger: section, start: "top top", once: true, onEnter: () => setMounted(true) })`, lalu ukur ulang.

`cumulative-layout-shift` dan `categories:seo` tidak boleh diubah dalam kondisi apa pun.

- [ ] **Step 4: Verifikasi visual seluruh halaman di dua viewport**

Jalankan `bun run build && bun run start`, lalu tangkap layar tiap seksi di 1440x900 dan 375x812. Bandingkan dengan cacat yang tercatat di spec §2.1. Yang harus benar-benar hilang: pita kartu lini bisnis, ruang kosong di kanan peta, kartu silsilah tunggal menempel kiri, dan lambung terpotong di comparator.

- [ ] **Step 5: Tulis ledger**

Buat `.superpowers/sdd/2026-08-18-dml-plan-4/progress.md` berisi: daftar 13 task dengan status, angka Lighthouse yang terukur, keputusan ambang LCP beserta alasannya, hasil checkpoint browser Delta 2 (PBR dipertahankan atau mundur ke wireframe), ukuran akhir tiap berkas di `public/models/` dan `coastline.json`, dan daftar item `// unverified` baru yang perlu konfirmasi klien (koordinat Ketapang).

- [ ] **Step 6: Jalankan gerbang penuh**

Run: `bun run check`
Expected: lint, typecheck, test, build, doctor, dan lighthouse seluruhnya lulus.

- [ ] **Step 7: Commit**

```bash
git add lighthouserc.json .superpowers/sdd/2026-08-18-dml-plan-4/progress.md
git commit -m "chore: gerbang akhir Plan 4, ukur Lighthouse dan tutup ledger overhaul beranda"
```
