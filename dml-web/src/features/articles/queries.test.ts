import { describe, expect, it, vi, beforeEach } from "vitest";

const find = vi.fn();
vi.mock("payload", () => ({ getPayload: async () => ({ find }) }));
vi.mock("@payload-config", () => ({ default: {} }));

import {
  PUBLISHED_WHERE,
  listPublishedPosts,
  findPublishedPost,
  listPublishedSlugs,
} from "./queries";

beforeEach(() => {
  find.mockReset();
  find.mockResolvedValue({ docs: [] });
});

describe("query artikel", () => {
  it("selalu menyaring published, karena overrideAccess Local API default true", () => {
    expect(PUBLISHED_WHERE).toEqual({ _status: { equals: "published" } });
  });

  it("listPublishedPosts menyaring published dan mengurut terbaru dulu", async () => {
    await listPublishedPosts();
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "posts",
        where: PUBLISHED_WHERE,
        sort: "-publishedAt",
      }),
    );
  });

  it("listPublishedPosts meneruskan limit", async () => {
    await listPublishedPosts(3);
    expect(find).toHaveBeenCalledWith(expect.objectContaining({ limit: 3 }));
  });

  it("findPublishedPost mencari slug DAN status sekaligus", async () => {
    await findPublishedPost("operasi-sts");
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { and: [{ slug: { equals: "operasi-sts" } }, PUBLISHED_WHERE] },
      }),
    );
  });

  it("findPublishedPost mengembalikan null kalau tidak ketemu", async () => {
    expect(await findPublishedPost("tidak-ada")).toBeNull();
  });

  it("listPublishedSlugs mengembalikan slug saja", async () => {
    find.mockResolvedValue({ docs: [{ slug: "a" }, { slug: "b" }] });
    expect(await listPublishedSlugs()).toEqual(["a", "b"]);
  });

  it("daftar mengembalikan array kosong, bukan melempar, saat database tidak terjangkau", async () => {
    // next build memprerender / dan /artikel, dan generateStaticParams
    // memanggil listPublishedSlugs. Kalau ketiganya melempar, build gagal di
    // lingkungan mana pun yang tidak punya Postgres, termasuk stage builder
    // di dalam Docker. Situs tanpa artikel jauh lebih ringan daripada situs
    // yang tidak bisa dibangun.
    find.mockRejectedValue(new Error("koneksi ditolak"));
    expect(await listPublishedPosts()).toEqual([]);
    expect(await listPublishedSlugs()).toEqual([]);
  });

  it("findPublishedPost TETAP melempar saat database gagal", async () => {
    // Sengaja beda dari dua di atas. Menelan galat di sini berarti gangguan
    // database sesaat berubah jadi 404 untuk artikel yang sebenarnya ada,
    // dan 404 adalah sinyal permanen bagi mesin pencari. Melempar berarti
    // error boundary yang tampil, dan status kodenya 500, bukan 404.
    find.mockRejectedValue(new Error("koneksi ditolak"));
    await expect(findPublishedPost("a")).rejects.toThrow();
  });
});
