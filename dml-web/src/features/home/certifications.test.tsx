import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Certifications } from "./certifications";
import { COMPANY } from "@/content/company";
import { PORTS } from "@/features/route-map/ports";

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

describe("Certifications", () => {
  it("render setiap sertifikasi perusahaan", () => {
    render(<Certifications />);
    for (const cert of COMPANY.certifications) {
      expect(screen.getByText(cert)).toBeInTheDocument();
    }
  });

  it("render empat metrik", () => {
    const { container } = render(<Certifications />);
    expect(container.querySelectorAll("[data-testid='metrik']")).toHaveLength(4);
  });

  // Menulis "4" langsung akan melenceng begitu rute bertambah. Angka
  // pelabuhan harus turunan dari PORTS, dan test ini yang menjaganya.
  // Kantor pusat Banjarmasin ikut ada di PORTS tapi bukan pelabuhan yang
  // dilayani, jadi PORTS.length mentah akan mengklaim lima.
  it("jumlah pelabuhan menyaring kantor, bukan memakai PORTS.length mentah", () => {
    render(<Certifications />);
    const label = screen.getByText(/pelabuhan dilayani/i);
    const metric = label.closest("[data-testid='metrik']");
    const jumlahPelabuhan = PORTS.filter((port) => port.kind === "pelabuhan").length;
    expect(jumlahPelabuhan).toBeLessThan(PORTS.length);
    expect(metric?.textContent).toContain(String(jumlahPelabuhan));
  });

  it("mengelompokkan sertifikasi jadi dua klaster berlabel", () => {
    render(<Certifications />);
    expect(screen.getByText("Operasi kapal")).toBeInTheDocument();
    expect(screen.getByText("Galangan")).toBeInTheDocument();
  });
});
