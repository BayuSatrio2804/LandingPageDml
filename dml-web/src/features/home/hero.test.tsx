import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./hero";

/**
 * Vitest tidak menghormati batas Server Component, jadi HeroCanvas dan
 * HeroHeadline ikut dirender di sini. matches: true memilih jalur reduced
 * motion di keduanya: HeroCanvas berhenti sebelum memasang canvas, dan
 * HeroHeadline mengembalikan heading utuh tanpa memanggil SplitText, yang
 * memang tidak bisa memecah baris di jsdom karena tidak ada layout. Pola stub
 * ini sama dengan business-lines.test.tsx dan certifications.test.tsx.
 *
 * Menyandarkan assertion "tidak ada canvas" pada default global di
 * vitest.setup.ts akan membuat test ini diam-diam terbalik kalau default itu
 * berubah, jadi stubnya ditulis eksplisit di sini.
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
  // Versi lama tiga baris. Batas kata adalah proksi yang bisa diuji.
  it("headline maksimal tujuh kata", () => {
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

  // Kontrak LCP setelah poster dilepas: kandidat LCP hero adalah teks yang
  // dicat dari HTML server, bukan gambar yang menunggu jaringan. Assertion-nya
  // "tidak ada <img> di hero" karena itu yang bisa diam-diam kembali: satu
  // gambar dekoratif yang ditambahkan nanti akan merebut kembali peran LCP dan
  // menghidupkan lagi risiko ambang Lighthouse 5000.
  it("hero tidak merender gambar apa pun di HTML server", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("heading", { level: 1 }).textContent?.trim()).not.toHaveLength(0);
  });

  it("tidak ada canvas di HTML server", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector("canvas")).toBeNull();
  });
});
