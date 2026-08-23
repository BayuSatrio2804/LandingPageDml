import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LegalTable } from "./legal-table";
import { LEGAL_DOCUMENTS } from "@/content/legal-documents";

describe("LegalTable", () => {
  it("menampilkan seluruh sembilan dokumen", () => {
    render(<LegalTable />);
    for (const entry of LEGAL_DOCUMENTS) {
      expect(screen.getAllByText(entry.document).length).toBeGreaterThan(0);
    }
  });

  it("menampilkan nomor dan penerbit tiap dokumen", () => {
    render(<LegalTable />);
    expect(screen.getAllByText("9120001262268").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Direktorat Jenderal Pajak").length).toBeGreaterThan(0);
  });

  it("tabel punya caption untuk pembaca layar", () => {
    render(<LegalTable />);
    expect(screen.getByRole("table")).toHaveAccessibleName();
  });

  it("menyediakan daftar alternatif untuk viewport sempit", () => {
    const { container } = render(<LegalTable />);
    expect(container.querySelector("dl")).not.toBeNull();
  });

  it("menyebut sumber datanya", () => {
    render(<LegalTable />);
    expect(screen.getByText(/company profile/i)).toBeInTheDocument();
  });
});
