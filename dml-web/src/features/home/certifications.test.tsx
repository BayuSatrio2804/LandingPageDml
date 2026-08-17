import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Certifications } from "./certifications";
import { COMPANY } from "@/content/company";

// jsdom tidak mengimplementasikan window.matchMedia. Reveal (dipakai untuk
// deretan sertifikasi) memanggilnya lewat usePrefersReducedMotion. Stub ini
// hanya supaya pohon render tidak meledak; matches: true (reduced motion)
// memilih jalur render paling sederhana (tanpa GSAP/ScrollTrigger) karena tes
// ini menguji konten, bukan perilaku animasi.
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

describe("Certifications", () => {
  it("render setiap sertifikasi perusahaan", () => {
    render(<Certifications />);
    for (const cert of COMPANY.certifications) {
      expect(screen.getByText(cert)).toBeInTheDocument();
    }
  });

  it("render label jumlah kapal dan total DWT", () => {
    render(<Certifications />);
    expect(screen.getByText(/kapal/i)).toBeInTheDocument();
    expect(screen.getByText(/dwt/i)).toBeInTheDocument();
  });
});
