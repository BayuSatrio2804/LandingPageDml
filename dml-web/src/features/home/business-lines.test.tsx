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
