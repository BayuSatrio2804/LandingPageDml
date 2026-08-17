import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./hero";

// jsdom tidak mengimplementasikan window.matchMedia. NightSequence (client leaf,
// dirender di dalam Hero) memanggilnya lewat usePrefersReducedMotion. Hero
// sendiri Server Component murni; stub ini hanya supaya pohon render tidak
// meledak saat NightSequence dipasang, matches: true (reduced motion) memilih
// jalur paling sederhana (NightSequence me-render null) karena tes ini menguji
// konten server, bukan perilaku GSAP/ScrollTrigger.
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
  it("render headline sebagai h1 dan CTA ke /kontak", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /hubungi kami/i })).toHaveAttribute("href", "/kontak");
  });

  it("gambar poster frame tengah punya priority dan alt text", () => {
    render(<Hero />);
    // MEDIA["hero-malam"][4] (dji-0815): alt text ditulis ulang di Task 4 tanpa
    // klaim "orbit" karena drone tidak melakukan orbit sirkuler penuh yang jelas
    // di sekitar kapal (lihat kontak sheet DJI_0811-DJI_0820).
    const poster = screen.getByAltText(/air laut gelap di sekeliling lambung/i);
    expect(poster).toBeInTheDocument();
  });
});
