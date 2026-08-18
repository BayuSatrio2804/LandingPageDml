import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BusinessLines } from "./business-lines";
import { Affiliates } from "./affiliates";
import { AFFILIATES, MAIN_LINES } from "@/content/business-lines";

// matches: true memilih jalur reduced motion, yaitu jalur statis yang juga
// dilihat pengguna tanpa JavaScript. Itu jalur yang paling penting diuji:
// kalau ia rusak, tidak ada animasi yang bisa menyelamatkannya.
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
  it("render dua lini utama sebagai bab terpisah", () => {
    const { container } = render(<BusinessLines />);
    expect(container.querySelectorAll("[data-testid='bab-lini-bisnis']")).toHaveLength(
      MAIN_LINES.length,
    );
    expect(screen.getByText("Transportasi BBM")).toBeInTheDocument();
    expect(screen.getByText("Penyeberangan Ro-Ro")).toBeInTheDocument();
  });

  // STS bukan lini bisnis di company profile resmi, ia cara kerja di dalam
  // lini transportasi BBM dan sudah punya seksinya sendiri. Kartu ketiga di
  // versi Plan 4 membuat satu halaman menjelaskan STS dua kali.
  it("tidak lagi memperlakukan ship-to-ship sebagai lini bisnis", () => {
    render(<BusinessLines />);
    expect(screen.queryByText(/ship-to-ship \(sts\)/i)).toBeNull();
  });

  it("kartu tidak punya link ke /bisnis", () => {
    render(<BusinessLines />);
    for (const link of screen.queryAllByRole("link")) {
      expect(link.getAttribute("href")).not.toMatch(/^\/bisnis/);
    }
  });

  /**
   * Kontrak inti perbaikan Plan 5, ditulis sebagai properti bukan sebagai
   * angka. Cacat lamanya adalah lapisan foto yang diberi opacity di bawah satu
   * lewat trigger kartu berikutnya, sehingga kartu tengah tidak pernah tampil
   * penuh. Selama pergantiannya memakai clip-path dan bukan opacity, kondisi
   * itu tidak bisa muncul lagi.
   */
  it("lapisan media tidak pernah memakai opacity sebagai alat transisi", () => {
    const { container } = render(<BusinessLines />);
    for (const layer of container.querySelectorAll("[data-testid='media-lini-bisnis']")) {
      expect(layer.getAttribute("style") ?? "").not.toMatch(/opacity/);
      expect(layer.className).not.toMatch(/opacity-/);
    }
  });

  it("jalur statis merender media tiap bab lewat absolute inset-0", () => {
    const { container } = render(<BusinessLines />);
    const layers = container.querySelectorAll("[data-testid='media-lini-bisnis']");
    expect(layers).toHaveLength(MAIN_LINES.length);
    for (const layer of layers) {
      expect(layer.className).toMatch(/absolute/);
      expect(layer.className).toMatch(/inset-0/);
      expect(layer.className).not.toMatch(/h-full/);
    }
  });
});

describe("Affiliates", () => {
  it("render tiga perusahaan afiliasi", () => {
    const { container } = render(<Affiliates />);
    expect(container.querySelectorAll("[data-testid='baris-afiliasi']")).toHaveLength(
      AFFILIATES.length,
    );
  });

  // Merak-Bakauheni dioperasikan PT Tri Sumaja Lines. Ia boleh tampil di
  // beranda, tapi harus di blok afiliasi, bukan di antara lini yang
  // dijalankan DML sendiri.
  it("menempatkan Merak-Bakauheni di bawah Tri Sumaja Lines", () => {
    render(<Affiliates />);
    const row = screen.getByText("PT Tri Sumaja Lines").closest("[data-testid='baris-afiliasi']");
    expect(row?.textContent).toContain("Merak - Bakauheni");
  });
});
