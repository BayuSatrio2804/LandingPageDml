import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Lineage } from "./lineage";
import { TIMELINE } from "@/content/timeline";

// jsdom tidak mengimplementasikan window.matchMedia. LineagePan (client leaf,
// dirender di dalam Lineage) memanggilnya lewat usePrefersReducedMotion. Lineage
// sendiri Server Component murni; stub ini hanya supaya pohon render tidak
// meledak saat LineagePan dipasang, matches: true (reduced motion) memilih
// jalur render paling sederhana (flex-wrap, tanpa ScrollTrigger) karena tes ini
// menguji konten, bukan perilaku GSAP/ScrollTrigger.
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

describe("Lineage", () => {
  it("render satu kartu per entri TIMELINE", () => {
    render(<Lineage />);
    for (const entry of TIMELINE) {
      expect(screen.getByText(String(entry.year))).toBeInTheDocument();
    }
  });

  it("render link ke versi lengkap silsilah", () => {
    render(<Lineage />);
    expect(screen.getByRole("link", { name: /silsilah lengkap/i })).toHaveAttribute(
      "href",
      "/tentang-kami#silsilah",
    );
  });
});
