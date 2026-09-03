import { describe, expect, it, vi, beforeEach } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

// vi.mock dihoisting ke atas berkas oleh vitest, sebelum const biasa
// sempat dievaluasi. vi.hoisted memastikan listPublishedPosts sudah ada
// saat factory di bawah ini dieksekusi.
const { listPublishedPosts } = vi.hoisted(() => ({ listPublishedPosts: vi.fn() }));
vi.mock("@/features/articles/queries", () => ({ listPublishedPosts }));

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

beforeEach(() => {
  listPublishedPosts.mockReset();
  listPublishedPosts.mockResolvedValue([]);
});

describe("sitemap", () => {
  it("setiap path statis punya berkas page.tsx yang benar-benar ada", () => {
    for (const path of STATIC_PATHS) {
      expect(existsSync(pageFileFor(path)), `route hilang untuk ${path}`).toBe(true);
    }
  });

  it("tidak lagi mengiklankan /bisnis/galangan-kapal", () => {
    // DMLD adalah perusahaan terpisah di Sinar Alam Corporation, bukan lini
    // DML. Lihat docblock di src/lib/cms/company-seed.ts.
    expect(STATIC_PATHS).not.toContain("/bisnis/galangan-kapal");
  });

  it("kembali mengiklankan /artikel sejak Plan 9", () => {
    expect(STATIC_PATHS).toContain("/artikel");
  });

  it("memuat keempat route bisnis", () => {
    expect(STATIC_PATHS).toContain("/bisnis");
    expect(STATIC_PATHS).toContain("/bisnis/transportasi-bbm");
    expect(STATIC_PATHS).toContain("/bisnis/penumpang-roro");
    expect(STATIC_PATHS).toContain("/bisnis/transportasi-bbm/permintaan-informasi");
  });

  it("beranda punya prioritas tertinggi", async () => {
    const entries = await sitemap();
    const home = entries.find((entry) => entry.url.endsWith("/"));
    expect(home?.priority).toBe(1);
  });

  it("setiap entri punya URL absolut", async () => {
    for (const entry of await sitemap()) {
      expect(entry.url).toMatch(/^https?:\/\//);
    }
  });

  it("menambahkan satu entri per artikel published", async () => {
    listPublishedPosts.mockResolvedValue([
      { slug: "operasi-sts", updatedAt: "2026-08-23T00:00:00.000Z" },
      { slug: "sejak-1988", updatedAt: "2026-08-22T00:00:00.000Z" },
    ]);
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls.some((url) => url.endsWith("/artikel/operasi-sts"))).toBe(true);
    expect(urls.some((url) => url.endsWith("/artikel/sejak-1988"))).toBe(true);
  });

  it("hanya memuat artikel yang lewat pintu query published", async () => {
    // Penyaringan draft milik queries.ts. Tes ini menjaga sitemap tetap
    // memakai pintu itu dan tidak pernah query koleksi posts sendiri.
    await sitemap();
    expect(listPublishedPosts).toHaveBeenCalled();
  });

  it("tidak meledak kalau database tidak bisa dihubungi", async () => {
    // Sitemap yang gagal berarti build gagal. Kehilangan entri artikel
    // sementara jauh lebih ringan daripada situs yang tidak bisa dibangun.
    listPublishedPosts.mockRejectedValue(new Error("koneksi ditolak"));
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls.some((url) => url.endsWith("/artikel"))).toBe(true);
  });
});
