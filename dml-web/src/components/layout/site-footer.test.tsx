import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooterView } from "./site-footer";
import { MODEL_CREDITS } from "@/content/model-credits";
import { TOKENS } from "@/lib/tokens";
import { contrastRatio } from "@/lib/color";
import type { CompanyProfileData } from "@/lib/cms/company";

/**
 * SiteFooterView, bukan SiteFooter: SiteFooter adalah pembungkus async yang
 * memanggil payload.findGlobal, dan React Testing Library tidak bisa
 * merender Server Component async langsung.
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

const FOOTER_GROUPS = [
  {
    heading: "Bisnis",
    items: [{ label: "Transportasi BBM", href: "/bisnis/transportasi-bbm" }],
  },
];

describe("SiteFooterView", () => {
  it("menyebut setiap model dan penulisnya", () => {
    render(<SiteFooterView company={COMPANY} footerGroups={FOOTER_GROUPS} />);
    for (const credit of MODEL_CREDITS) {
      expect(screen.getByText(new RegExp(credit.title, "i"))).toBeInTheDocument();
      expect(screen.getByRole("link", { name: credit.author })).toHaveAttribute(
        "href",
        credit.authorUrl,
      );
    }
  });

  // Syarat lisensi CC BY, bukan hiasan. Kredit dengan kontras di bawah AA
  // sama saja dengan tidak mencantumkannya. Sejak kaki halaman jadi bidang
  // navy, yang diuji bukan lagi nama kelasnya melainkan rasionya terhadap
  // latar kaki halaman: putih beropasitas akan lolos pemeriksaan nama kelas
  // tapi gagal di angka.
  it("baris kredit tetap lolos AA di atas latar kaki halaman", () => {
    render(<SiteFooterView company={COMPANY} footerGroups={FOOTER_GROUPS} />);
    const line = screen.getByTestId("kredit-model");
    expect(line.className).toMatch(/text-surface-3/);
    expect(line.className).not.toMatch(/text-(on-accent|surface-3)\/\d/);
    expect(contrastRatio(TOKENS.surface3, TOKENS.accent)).toBeGreaterThanOrEqual(4.5);
  });
});
