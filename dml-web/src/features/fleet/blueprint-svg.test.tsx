import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlueprintSvg } from "./blueprint-svg";
import { FLEET_CLASSES_SEED } from "@/lib/cms/fleet-classes-seed";

const FLEET_CLASSES = FLEET_CLASSES_SEED.map((fleetClass) => ({ ...fleetClass, vesselCount: 0 }));

describe("BlueprintSvg", () => {
  it("render satu svg per kelas kapal dengan title untuk screen reader", () => {
    render(<BlueprintSvg fleetClasses={FLEET_CLASSES} />);
    for (const fleetClass of FLEET_CLASSES) {
      expect(screen.getByText(fleetClass.altText)).toBeInTheDocument();
    }
  });
});
