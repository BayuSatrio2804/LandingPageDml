import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { COMPANY, GROUP_UNITS } from "@/content/company";
import { GroupStructure } from "./group-structure";

describe("GroupStructure", () => {
  it("menampilkan setiap sektor grup", () => {
    render(<GroupStructure />);
    for (const unit of GROUP_UNITS) {
      expect(screen.getByText(unit.sector)).toBeInTheDocument();
    }
  });

  it("menampilkan setiap perusahaan anggota", () => {
    render(<GroupStructure />);
    for (const unit of GROUP_UNITS) {
      for (const company of unit.companies) {
        expect(screen.getAllByText(company).length).toBeGreaterThan(0);
      }
    }
  });

  /*
   * Gunanya seksi ini adalah menunjukkan posisi DML di dalam grup. Daftar
   * datar tanpa penanda membuat pembaca harus memindai empat sektor untuk
   * menemukan perusahaan yang sedang mereka baca profilnya.
   */
  it("menandai DML sendiri di dalam daftar", () => {
    render(<GroupStructure />);
    const self = screen.getByTestId("grup-diri-sendiri");
    expect(self).toHaveTextContent(COMPANY.legalName);
  });

  it("menyebut induk grupnya", () => {
    render(<GroupStructure />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(COMPANY.parent);
  });
});
