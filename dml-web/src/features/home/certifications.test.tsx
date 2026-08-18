import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Certifications } from "./certifications";
import { COMPANY } from "@/content/company";
import { DML_SERVED_PORT_IDS, PORTS } from "@/features/route-map/ports";

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
  it("render setiap butir standar dari setiap klaster", () => {
    render(<Certifications />);
    for (const cluster of COMPANY.standards) {
      expect(screen.getByText(cluster.label)).toBeInTheDocument();
      for (const item of cluster.items) {
        expect(screen.getByText(item.name)).toBeInTheDocument();
      }
    }
  });

  // SAP adalah ERP, bukan sertifikat keselamatan, dan BKI adalah biro
  // klasifikasi. Satu deret pill seragam akan menyamarkan perbedaan itu.
  it("memisahkan ERP dari sistem manajemen lewat klaster berbeda", () => {
    const { container } = render(<Certifications />);
    const clusters = container.querySelectorAll("[data-testid='klaster-standar']");
    expect(clusters.length).toBeGreaterThanOrEqual(3);
    const sapCluster = screen.getByText("SAP").closest("[data-testid='klaster-standar']");
    const ismCluster = screen.getByText("ISM Code").closest("[data-testid='klaster-standar']");
    expect(sapCluster).not.toBe(ismCluster);
  });

  it("render empat metrik", () => {
    const { container } = render(<Certifications />);
    expect(container.querySelectorAll("[data-testid='metrik']")).toHaveLength(4);
  });

  it("render keanggotaan dari company profile", () => {
    const { container } = render(<Certifications />);
    expect(container.querySelectorAll("[data-testid='keanggotaan']")).toHaveLength(
      COMPANY.memberships.length,
    );
    expect(screen.getByText("GAPASDAP")).toBeInTheDocument();
  });

  /**
   * Angka pelabuhan harus turunan data, bukan angka yang diketik. Ia juga
   * harus menyaring dua hal sekaligus: kantor pusat yang ikut hidup di PORTS
   * supaya bisa digambar di peta, dan lintasan Merak-Bakauheni yang
   * dioperasikan afiliasi. Tanpa saringan kedua, situs mengklaim melayani
   * pelabuhan milik perusahaan lain.
   */
  it("jumlah pelabuhan menyaring kantor dan lintasan afiliasi", () => {
    render(<Certifications />);
    const metric = screen.getByText(/pelabuhan dilayani/i).closest("[data-testid='metrik']");
    expect(DML_SERVED_PORT_IDS.length).toBeLessThan(PORTS.length);
    expect(metric?.textContent).toContain(String(DML_SERVED_PORT_IDS.length));
  });
});
