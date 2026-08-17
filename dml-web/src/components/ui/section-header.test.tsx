import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionHeader } from "./section-header";

describe("SectionHeader", () => {
  it("render judul sebagai heading level 2", () => {
    render(<SectionHeader title="Perbandingan Armada" />);
    expect(screen.getByRole("heading", { level: 2, name: "Perbandingan Armada" })).toBeInTheDocument();
  });

  it("render deskripsi saat diberikan", () => {
    render(<SectionHeader title="Rute" description="Empat pelabuhan." />);
    expect(screen.getByText("Empat pelabuhan.")).toBeInTheDocument();
  });

  it("tidak render paragraf saat deskripsi tidak diberikan", () => {
    const { container } = render(<SectionHeader title="Rute" />);
    expect(container.querySelector("p")).toBeNull();
  });

  it("meneruskan id ke heading supaya bisa jadi target anchor", () => {
    render(<SectionHeader title="Silsilah" id="silsilah" />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute("id", "silsilah");
  });
});
