import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BusinessLines } from "./business-lines";

// jsdom tidak mengimplementasikan window.matchMedia. BusinessLines memanggilnya
// lewat usePrefersReducedMotion langsung di komponen client ini (bukan lewat
// leaf terpisah seperti Hero/NightSequence), jadi stub perlu dipasang di sini
// juga. matches: true (reduced motion) memilih jalur render paling sederhana
// karena tes ini menguji markup, bukan perilaku GSAP/ScrollTrigger.
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
});
