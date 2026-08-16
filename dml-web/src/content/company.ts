import type { Company } from "./types";

/**
 * Seluruh angka di bawah berasal dari sumber publik: SinarAlam Corporation,
 * ptdml.com, MagicPort, dan arsip Banjarmasin Post.
 * Wajib dikonfirmasi klien sebelum situs live.
 */
export const COMPANY: Company = {
  legalName: "PT Dutabahari Menara Line",
  shortName: "Dutabahari Menara Line",
  foundedIso: "1985-11-30", // unverified: SinarAlam Corporation
  founder: "Herman Chandra", // unverified: SinarAlam Corporation
  parent: "SinarAlam Corporation",
  phone: "+625113268280", // unverified: SinarAlam Corporation
  offices: [
    {
      label: "Kantor Pusat",
      street: "Jl. Kapten Piere Tendean 174",
      city: "Banjarmasin",
      postalCode: "70123",
      province: "Kalimantan Selatan",
    },
    {
      label: "Kantor Gadang",
      street: "Jl. AES Nasution, Gadang",
      city: "Banjarmasin Tengah",
      postalCode: "70122",
      province: "Kalimantan Selatan",
    },
  ],
  certifications: ["ISM Code", "ISPS Code", "SIRE", "ISO 9001:2015"],
  fleetSummary: {
    vessels: 15, // unverified: MagicPort
    totalDwt: 40546, // unverified: MagicPort
  },
};
