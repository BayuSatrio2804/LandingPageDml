import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ArticleList, resolveMedia, CATEGORY_LABELS } from "./article-list";
import type { Post } from "@/payload/payload-types";

function post(overrides: Partial<Post> = {}): Post {
  return {
    id: 1,
    title: "Operasi ship to ship di perairan dangkal",
    slug: "operasi-sts",
    excerpt: "Ringkasan singkat.",
    category: "operasi",
    publishedAt: "2026-08-23T00:00:00.000Z",
    coverImage: {
      id: 9,
      alt: "Kapal tanker",
      url: "/media/kapal.jpg",
      width: 1600,
      height: 900,
    },
    content: {},
    author: { id: 1, name: "Redaksi DML" },
    updatedAt: "2026-08-23T00:00:00.000Z",
    createdAt: "2026-08-23T00:00:00.000Z",
    ...overrides,
  } as unknown as Post;
}

describe("ArticleList", () => {
  it("menampilkan empty state saat tidak ada artikel", () => {
    render(<ArticleList posts={[]} />);
    expect(screen.getByText("Belum ada artikel")).toBeInTheDocument();
  });

  it("artikel pertama tampil sebagai sorotan dengan excerpt", () => {
    render(<ArticleList posts={[post()]} />);
    const sorotan = screen.getByTestId("artikel-sorotan");
    expect(within(sorotan).getByText("Ringkasan singkat.")).toBeInTheDocument();
  });

  it("artikel berikutnya masuk daftar, bukan sorotan kedua", () => {
    render(
      <ArticleList
        posts={[post(), post({ id: 2, slug: "kedua", title: "Artikel kedua" })]}
      />,
    );
    expect(screen.getAllByTestId("artikel-sorotan")).toHaveLength(1);
    expect(screen.getAllByTestId("artikel-baris")).toHaveLength(1);
  });

  it("tiap artikel menaut ke slug-nya", () => {
    render(<ArticleList posts={[post()]} />);
    expect(
      screen.getByRole("link", { name: /operasi ship to ship/i }),
    ).toHaveAttribute("href", "/artikel/operasi-sts");
  });

  it("menampilkan tanggal terbit dalam bahasa Indonesia", () => {
    render(<ArticleList posts={[post()]} />);
    expect(screen.getByText("23 Agustus 2026")).toBeInTheDocument();
  });

  it("menampilkan label kategori manusiawi, bukan nilai enum", () => {
    render(<ArticleList posts={[post()]} />);
    expect(screen.getByText("Operasi")).toBeInTheDocument();
    expect(screen.queryByText("operasi")).toBeNull();
  });
});

describe("resolveMedia", () => {
  it("mengembalikan objek media saat depth mengembangkannya", () => {
    expect(resolveMedia({ id: 9, url: "/media/a.jpg" } as never)?.url).toBe("/media/a.jpg");
  });

  it("mengembalikan null saat relasi masih berupa id", () => {
    // depth:0 mengembalikan angka. Komponen tidak boleh crash karenanya.
    expect(resolveMedia(9 as never)).toBeNull();
  });
});

describe("CATEGORY_LABELS", () => {
  it("memuat keempat kategori koleksi", () => {
    expect(Object.keys(CATEGORY_LABELS).sort()).toEqual([
      "armada",
      "keselamatan",
      "operasi",
      "perusahaan",
    ]);
  });
});
