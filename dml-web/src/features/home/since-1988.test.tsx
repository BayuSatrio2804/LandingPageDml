import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Since1988 } from "./since-1988";
import type { CompanyProfileData } from "@/lib/cms/company";

/**
 * Fixture minimal, bukan import dari @/content/company: komponen sekarang
 * menerima company sebagai prop (datanya datang dari CMS lewat halaman
 * beranda), jadi test tidak lagi bergantung pada data produksi.
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
  standards: [{ label: "Sistem manajemen", items: [{ name: "ISO 9001:2015", source: "cp-pdf" }] }],
  memberships: [{ name: "Sinar Alam Corporation" }],
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

describe("Since1988", () => {
  it("render heading Sejak 1988", () => {
    render(<Since1988 company={COMPANY} />);
    expect(screen.getByRole("heading", { level: 2, name: /sejak 1988/i })).toBeInTheDocument();
  });

  // Tahun 1985 sempat tersebar ke judul seksi, headline hero, footer, dan
  // metadata. Tes ini menahannya supaya tidak diam-diam kembali.
  it("tidak menyebut 1985 di mana pun", () => {
    const { container } = render(<Since1988 company={COMPANY} />);
    expect(container.textContent).not.toMatch(/1985/);
  });

  it("render tautan ke silsilah lengkap", () => {
    render(<Since1988 company={COMPANY} />);
    expect(screen.getByRole("link", { name: /silsilah lengkap/i })).toHaveAttribute(
      "href",
      "/tentang-kami#jati-diri",
    );
  });

  // Nama pendiri dibaca dari prop company, bukan ditulis ulang di prosa. Dua
  // sumber untuk fakta yang sama pasti berbeda cepat atau lambat.
  it("menyebut pendiri dari company.founder", () => {
    render(<Since1988 company={COMPANY} />);
    expect(screen.getByText(new RegExp(COMPANY.founder, "i"))).toBeInTheDocument();
  });

  it("render tiga nilai perusahaan", () => {
    const { container } = render(<Since1988 company={COMPANY} />);
    expect(container.querySelectorAll("[data-testid='nilai-perusahaan']")).toHaveLength(3);
    expect(screen.getByText("Measurable")).toBeInTheDocument();
  });
});
