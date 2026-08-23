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
