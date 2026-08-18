import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RouteMap, activeLegIndex } from "./route-map";
import { PORTS, ROUTE_LEGS } from "@/features/route-map/ports";

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
