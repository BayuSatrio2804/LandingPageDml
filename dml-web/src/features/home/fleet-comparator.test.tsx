import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FleetComparator } from "./fleet-comparator";
import { FLEET_CLASSES_SEED } from "@/lib/cms/fleet-classes-seed";

const FLEET_CLASSES = FLEET_CLASSES_SEED.map((fleetClass) => ({ ...fleetClass, vesselCount: 0 }));

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

describe("FleetComparator", () => {
  it("render heading seksi", () => {
    render(<FleetComparator fleetClasses={FLEET_CLASSES} />);
    expect(screen.getByRole("heading", { level: 2, name: "Perbandingan Armada" })).toBeInTheDocument();
  });

  it("render tabel spesifikasi untuk pembaca layar di semua kondisi", () => {
    render(<FleetComparator fleetClasses={FLEET_CLASSES} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  // matchMedia distub matches: true, artinya reduced motion. Kontraknya:
  // tidak ada canvas sama sekali, blueprint SVG yang tampil.
  it("saat reduced motion, blueprint yang tampil dan canvas tidak pernah dipasang", () => {
    const { container } = render(<FleetComparator fleetClasses={FLEET_CLASSES} />);
    expect(container.querySelector("canvas")).toBeNull();
    expect(screen.getAllByRole("img", { name: /blueprint skematik/i })).toHaveLength(
      FLEET_CLASSES.length,
    );
  });
});
