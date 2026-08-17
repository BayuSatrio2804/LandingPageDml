import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RouteMap } from "./route-map";
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
  // peta harus berbeda dan eksplisit supaya kedua SVG tidak saling tertukar
  // ketika selector diperketat di Step 5.
  it("SVG peta punya nama aksesibel yang tidak mengandung kata blueprint", () => {
    render(<RouteMap />);
    const map = screen.getByRole("img", { name: /peta jaringan penyeberangan/i });
    expect(map).toBeInTheDocument();
    expect(map.getAttribute("aria-label") ?? "").not.toMatch(/blueprint/i);
  });

  it("render label tiap leg sebagai teks, bukan hanya garis", () => {
    render(<RouteMap />);
    for (const leg of ROUTE_LEGS) {
      expect(screen.getByText(leg.label)).toBeInTheDocument();
    }
  });
});
