import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Certifications } from "./certifications";
import type { CompanyProfileData } from "@/lib/cms/company";
import { DML_SERVED_PORT_IDS, PORTS } from "@/features/route-map/ports";

/**
 * Fixture minimal, bukan import dari @/content/company: komponen sekarang
 * menerima company sebagai prop (datanya datang dari CMS lewat halaman
 * beranda). Klaster dan keanggotaan di sini sengaja dicocokkan ke isi asli
 * (SAP, ISM Code, GAPASDAP) karena test-test di bawah menegaskan nama itu.
 */
const COMPANY: CompanyProfileData = {
  legalName: "PT Dutabahari Menara Line",
  shortName: "Dutabahari Menara Line",
  abbreviation: "DML",
  tagline: "From Zero to Hero with Continuous Improvement",
  foundedIso: "1988-11-30",
  founder: "Herman Chandra",
  parent: "Sinar Alam Corporation",
  phone: "+625116773845",
  whatsapp: "625116773845",
  bookingUrl: "https://dutabahari.id",
  offices: [
    { label: "Kantor Pusat DML", street: "Jl. AES Nasution 43", city: "Banjarmasin", postalCode: "70123", province: "Kalimantan Selatan", phone: "+62 511 6773845" },
  ],
  values: [
    { key: "D", term: "Dynamic", description: "Gesit dan mudah menyesuaikan diri." },
    { key: "M", term: "Measurable", description: "Target yang jelas dan terukur." },
    { key: "L", term: "Loyalty", description: "Hubungan jangka panjang." },
  ],
  standards: [
    {
      label: "Sistem manajemen",
      items: [
        { name: "ISO 9001:2015", source: "cp-pdf" },
        { name: "ISM Code", source: "cp-pdf" },
        { name: "ISPS Code", source: "riset-publik" },
        { name: "SIRE", source: "riset-publik" },
      ],
    },
    { label: "Biro klasifikasi", items: [{ name: "Biro Klasifikasi Indonesia (BKI)", source: "cp-pdf" }] },
    { label: "Sistem informasi", items: [{ name: "SAP", source: "cp-pdf" }] },
  ],
  memberships: [
    { name: "Sinar Alam Corporation" },
    { name: "OCIMF", expansion: "Oil Companies International Marine Forum" },
    { name: "GAPASDAP", expansion: "Gabungan Pengusaha Nasional Angkutan Sungai, Danau, dan Penyeberangan" },
    { name: "IMO", expansion: "International Maritime Organization" },
  ],
  fleetSummary: { vessels: 64, passengerVessels: 9, oilTransportVessels: 55, people: 300 },
  groupOffices: [],
  groupUnits: [],
};

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
    render(<Certifications company={COMPANY} />);
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
    const { container } = render(<Certifications company={COMPANY} />);
    const clusters = container.querySelectorAll("[data-testid='klaster-standar']");
    expect(clusters.length).toBeGreaterThanOrEqual(3);
    const sapCluster = screen.getByText("SAP").closest("[data-testid='klaster-standar']");
    const ismCluster = screen.getByText("ISM Code").closest("[data-testid='klaster-standar']");
    expect(sapCluster).not.toBe(ismCluster);
  });

  it("render empat metrik", () => {
    const { container } = render(<Certifications company={COMPANY} />);
    expect(container.querySelectorAll("[data-testid='metrik']")).toHaveLength(4);
  });

  it("render keanggotaan dari company profile", () => {
    const { container } = render(<Certifications company={COMPANY} />);
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
    render(<Certifications company={COMPANY} />);
    const metric = screen.getByText(/pelabuhan dilayani/i).closest("[data-testid='metrik']");
    expect(DML_SERVED_PORT_IDS.length).toBeLessThan(PORTS.length);
    expect(metric?.textContent).toContain(String(DML_SERVED_PORT_IDS.length));
  });
});
