import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LatestArticlesView } from "./latest-articles";
import type { Post } from "@/payload/payload-types";

function post(id: number, title: string): Post {
  return {
    id,
    title,
    slug: `artikel-${id}`,
    excerpt: "Ringkasan.",
    category: "operasi",
    publishedAt: "2026-08-23T00:00:00.000Z",
    coverImage: { id, alt: "Kapal", url: "/media/a.jpg", width: 1600, height: 900 },
    content: {},
    author: { id: 1, name: "Redaksi DML" },
    updatedAt: "2026-08-23T00:00:00.000Z",
    createdAt: "2026-08-23T00:00:00.000Z",
  } as unknown as Post;
}

describe("LatestArticlesView", () => {
  it("tidak merender apa pun saat koleksi kosong", () => {
    // Beranda adalah halaman penjualan. "Belum ada artikel" di sana
    // melemahkan tanpa memberi apa pun, jadi seksinya hilang seluruhnya.
    const { container } = render(<LatestArticlesView posts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("merender seksi saat ada artikel", () => {
    render(<LatestArticlesView posts={[post(1, "Artikel satu")]} />);
    expect(screen.getByRole("heading", { name: "Artikel Terbaru" })).toBeInTheDocument();
  });

  it("menaut ke tiap artikel dan ke daftar lengkap", () => {
    render(<LatestArticlesView posts={[post(1, "Artikel satu")]} />);
    expect(screen.getByRole("link", { name: /artikel satu/i })).toHaveAttribute(
      "href",
      "/artikel/artikel-1",
    );
    expect(screen.getByRole("link", { name: /semua artikel/i })).toHaveAttribute(
      "href",
      "/artikel",
    );
  });

  it("menampilkan paling banyak tiga artikel", () => {
    render(
      <LatestArticlesView
        posts={[post(1, "Satu"), post(2, "Dua"), post(3, "Tiga"), post(4, "Empat")]}
      />,
    );
    expect(screen.getAllByTestId("artikel-terbaru")).toHaveLength(3);
  });
});
