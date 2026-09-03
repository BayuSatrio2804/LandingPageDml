import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FleetSpecTable } from "./spec-table";
import { FLEET_CLASSES_SEED } from "@/lib/cms/fleet-classes-seed";

const FLEET_CLASSES = FLEET_CLASSES_SEED.map((fleetClass) => ({ ...fleetClass, vesselCount: 0 }));

describe("FleetSpecTable", () => {
  it("render sebagai table dengan satu baris per kelas kapal", () => {
    render(<FleetSpecTable fleetClasses={FLEET_CLASSES} />);
    const table = screen.getByRole("table");
    const rows = table.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(FLEET_CLASSES.length);
  });

  it("kolom DWT menampilkan tanda hubung untuk kelas tanpa DWT", () => {
    render(<FleetSpecTable fleetClasses={FLEET_CLASSES} />);
    const ferryRow = screen.getByText("Ro-Ro Ferry (KMP Jambo X)").closest("tr");
    expect(ferryRow?.textContent).toContain("-");
  });
});
