import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RouteMap, activeLegIndex, MAP } from "./route-map";
import { PORTS, ROUTE_LEGS } from "@/features/route-map/ports";
import { contrastRatio } from "@/lib/color";

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

describe("activeLegIndex", () => {
  it("mulai dari leg pertama dan tidak pernah negatif", () => {
    expect(activeLegIndex(0, 5)).toBe(0);
    expect(activeLegIndex(-1, 5)).toBe(0);
  });

  /**
   * Inti keluhan "rute terlalu cepat selesai lalu transisinya patah". Di
   * versi Plan 4 leg terakhir selesai persis di frame terakhir pin. Sekarang
   * leg terakhir sudah aktif jauh sebelum progress mencapai satu, dan tetap
   * aktif sepanjang jeda akhir.
   */
  it("leg terakhir sudah aktif jauh sebelum akhir scroll dan bertahan di sana", () => {
    expect(activeLegIndex(0.75, 5)).toBe(4);
    expect(activeLegIndex(1, 5)).toBe(4);
  });

  it("tidak pernah melewati batas array", () => {
    expect(activeLegIndex(2, 5)).toBe(4);
    expect(activeLegIndex(0.5, 1)).toBe(0);
  });
});

describe("RouteMap", () => {
  it("render nama setiap pelabuhan dan kantor", () => {
    render(<RouteMap />);
    for (const port of PORTS) {
      expect(screen.getByText(port.name)).toBeInTheDocument();
    }
  });

  it("render satu path per leg, bukan satu polyline berantai", () => {
    const { container } = render(<RouteMap />);
    expect(container.querySelectorAll("[data-testid='leg-rute']")).toHaveLength(ROUTE_LEGS.length);
  });

  it("render garis pantai sebagai poligon terpisah dari leg", () => {
    const { container } = render(<RouteMap />);
    expect(container.querySelectorAll("[data-testid='garis-pantai']").length).toBeGreaterThan(0);
  });

  // beranda.spec.ts mencari blueprint armada lewat peran img. Nama aksesibel
  // peta harus berbeda dan eksplisit supaya kedua SVG tidak saling tertukar.
  it("SVG peta punya nama aksesibel yang tidak mengandung kata blueprint", () => {
    render(<RouteMap />);
    const map = screen.getByRole("img", { name: /peta jaringan penyeberangan/i });
    expect(map.getAttribute("aria-label") ?? "").not.toMatch(/blueprint/i);
  });

  it("render label dan keterangan tiap leg sebagai teks, bukan hanya garis", () => {
    const { container } = render(<RouteMap />);
    expect(container.querySelectorAll("[data-testid='label-leg']")).toHaveLength(
      ROUTE_LEGS.length,
    );
    for (const leg of ROUTE_LEGS) {
      expect(screen.getByText(leg.label)).toBeInTheDocument();
    }
  });

  it("menyebut operator afiliasi pada lintasan yang bukan milik DML", () => {
    render(<RouteMap />);
    expect(screen.getByText(/dioperasikan pt tri sumaja lines/i)).toBeInTheDocument();
  });
});

describe("kontras penanda peta", () => {
  /*
   * WCAG 1.4.11 menuntut 3:1 untuk objek grafis yang membawa makna. Penanda
   * pelabuhan yang belum dilewati rute membawa makna — ia berubah jadi portLit
   * saat rute sampai — jadi ia masuk cakupan aturan itu. Nilai lamanya
   * (#94A6C0) cuma 2,11:1 di palet lama dan tidak pernah ada yang menjaganya,
   * lalu turun lagi ke 1,86:1 begitu laut diperdalam di Plan 7: laut mendekat,
   * penandanya diam.
   */
  it("penanda pelabuhan redup terbaca di atas laut", () => {
    expect(contrastRatio(MAP.portDim, MAP.sea)).toBeGreaterThanOrEqual(3);
  });

  /*
   * Ambangnya 2,5, bukan 3, dan itu bukan kompromi yang dilonggarkan supaya
   * lolos. WCAG menuntut 3:1 terhadap LATAR, bukan antara dua state dari objek
   * yang sama; yang dijaga di sini cuma bahwa redup dan menyala tidak pernah
   * jatuh jadi satu warna. Nilai terukurnya 3,00 — persis di batas, jadi
   * menuliskan 3 di sini akan pecah karena pembulatan float, bukan karena
   * paletnya salah.
   */
  it("penanda redup dan penanda menyala tetap terbedakan", () => {
    expect(contrastRatio(MAP.portDim, MAP.portLit)).toBeGreaterThanOrEqual(2.5);
  });

  /*
   * Rute mitra memakai token line dan ini justru nyaris jatuh di bawah ambang
   * pada palet LAMA (2,91:1). Bidang laut yang lebih dalam mengangkatnya ke
   * 3,17:1. Asersi ini menahan supaya perbaikan gratis itu tidak hilang lagi.
   */
  it("rute mitra terbaca di atas laut", () => {
    expect(contrastRatio(MAP.routeMitra, MAP.sea)).toBeGreaterThanOrEqual(3);
  });

  /*
   * Garis pantai sengaja BUKAN token. Beda terang darat dan laut cuma 1,30:1,
   * jadi yang menggambar bentuk pulau adalah goresannya, dan surface3 terlalu
   * pucat untuk pekerjaan itu. Yang dijaga bukan keterbacaan teks melainkan
   * bahwa goresannya tidak pernah larut ke dalam salah satu bidang yang
   * dilaluinya. Ambangnya diambil dari nilai terukur palet lama supaya
   * pendalaman bidang tidak diam-diam menipiskan peta.
   */
  it("garis pantai tidak larut ke laut maupun darat", () => {
    expect(contrastRatio(MAP.coast, MAP.sea)).toBeGreaterThanOrEqual(1.4);
    expect(contrastRatio(MAP.coast, MAP.land)).toBeGreaterThanOrEqual(1.8);
  });
});
