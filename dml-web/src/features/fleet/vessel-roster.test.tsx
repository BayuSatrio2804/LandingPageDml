import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { VesselRoster } from "./vessel-roster";
import { FLEET_CLASSES } from "@/content/fleet";

const BBM_CLASSES = FLEET_CLASSES.filter((fleetClass) => fleetClass.category === "Transportasi BBM");

describe("VesselRoster", () => {
  it("menampilkan judul setiap kelas yang diberikan", () => {
    render(<VesselRoster fleetClasses={BBM_CLASSES} />);
    for (const fleetClass of BBM_CLASSES) {
      expect(screen.getByRole("heading", { name: new RegExp(fleetClass.name, "i") })).toBeInTheDocument();
    }
  });

  it("menampilkan seluruh nama kapal kelas yang diberikan", () => {
    render(<VesselRoster fleetClasses={BBM_CLASSES} />);
    expect(screen.getByText("MT Ocean River")).toBeInTheDocument();
    expect(screen.getByText("SPOB United X")).toBeInTheDocument();
    expect(screen.getByText("TB Teluk Sungkun 08")).toBeInTheDocument();
  });

  it("tidak menampilkan kapal dari kelas yang tidak diberikan", () => {
    render(<VesselRoster fleetClasses={BBM_CLASSES} />);
    expect(screen.queryByText("KMP Jambo X")).not.toBeInTheDocument();
  });

  it("setiap kelas menyebut jumlah kapalnya", () => {
    render(<VesselRoster fleetClasses={BBM_CLASSES} />);
    // SPOB adalah kelas terbesar, 30 kapal.
    expect(screen.getByText(/30 kapal/)).toBeInTheDocument();
  });

  it("memakai daftar bernama supaya pembaca layar bisa melompati per kelas", () => {
    render(<VesselRoster fleetClasses={BBM_CLASSES} />);
    const lists = screen.getAllByRole("list");
    expect(lists.length).toBe(BBM_CLASSES.length);
    for (const list of lists) {
      expect(list).toHaveAccessibleName();
    }
  });
});
