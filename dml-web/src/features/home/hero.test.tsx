import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./hero";

/**
 * matches: true memilih jalur reduced motion di HeroJourney: timeline GSAP
 * dilewati dan elemen di-set langsung ke frame akhir lewat gsap.set, jadi
 * aman dirender di jsdom tanpa ScrollTrigger maupun layout nyata.
 *
 * Kontrak lama "tidak ada <img>/<video> di hero" sudah dilepas sejak hero
 * porthole sinematik dipasang: video langit dan tiga lapis gambar (dinding
 * kayu, bingkai kuningan, overlay) adalah bagian dari efeknya, bukan
 * pengganti h1. LCP tetap dijaga lewat video poster + preload="none" dan
 * img tanpa priority, bukan lewat larangan elemen media di hero.
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
  // Judul dibagi h1 (kiri) + h2 (kanan); batas kata dijaga di masing-masing.
  it("headline h1 maksimal tujuh kata", () => {
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

  it("video langit memakai poster dan tidak memaksa preload penuh", () => {
    const { container } = render(<Hero />);
    const video = container.querySelector("video");
    expect(video).toHaveAttribute("poster", "/assets/hero/sky-hero.webp");
    expect(video).toHaveAttribute("preload", "none");
  });
});
