/**
 * Penanda asal setiap fakta. Company profile PDF (`assets/CP DML.pdf`, Canva,
 * 5 Agustus 2026) adalah sumber utama sejak Plan 5; sisa fakta yang masih
 * berasal dari riset publik Plan 1 ditandai berbeda supaya klien tahu persis
 * baris mana yang belum punya dasar dokumen resmi.
 */
export type SourceTag = "cp-pdf" | "riset-publik";

export type Office = {
  label: string;
  street: string;
  city: string;
  postalCode?: string;
  province: string;
  phone?: string;
  fax?: string;
};

export type CoreValue = {
  /** Huruf awalnya membentuk DML. Urutan di array adalah urutan tampil. */
  key: "D" | "M" | "L";
  term: string;
  description: string;
};

export type Standard = {
  name: string;
  source: SourceTag;
};

/**
 * Sertifikat, sistem manajemen, dan software ERP berada di halaman yang sama
 * di PDF tapi bukan kategori yang sama. Klaster menjaga perbedaan itu tetap
 * terbaca, dan mencegah SAP tampil seolah-olah sertifikat keselamatan.
 */
export type StandardCluster = {
  label: string;
  items: Standard[];
};

export type Membership = {
  name: string;
  /** Kepanjangan akronim, ditampilkan sebagai keterangan kecil. */
  expansion?: string;
};

export type FleetSummary = {
  /** Angka utama di PDF halaman 02 dan 04. */
  vessels: number;
  passengerVessels: number;
  oilTransportVessels: number;
  people: number;
};

export type Company = {
  legalName: string;
  shortName: string;
  abbreviation: string;
  tagline: string;
  foundedIso: string;
  founder: string;
  parent: string;
  phone: string;
  whatsapp: string;
  /** Kantor milik DML sendiri. Kantor induk grup ada di GROUP_OFFICES. */
  offices: Office[];
  values: CoreValue[];
  standards: StandardCluster[];
  memberships: Membership[];
  fleetSummary: FleetSummary;
};

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export type FooterGroup = {
  heading: string;
  items: NavItem[];
};

export type TimelineEntry = {
  year: number;
  label: string;
};

export type FleetClass = {
  slug: string;
  name: string;
  category: string;
  lengthMeters: number;
  beamMeters: number;
  dwt: number | null;
  capacityLabel: string;
  passengerCapacity: number | null;
  /** Jumlah kapal kelas ini menurut daftar armada PDF halaman 04. */
  vesselCount: number;
  altText: string;
};

/**
 * Satu lini bisnis di beranda. `kind` memisahkan lini yang dijalankan DML
 * sendiri dari perusahaan afiliasi, karena keduanya tidak boleh diklaim
 * dengan kalimat yang sama.
 */
export type BusinessLine = {
  id: string;
  kind: "lini-utama" | "afiliasi";
  number: string;
  title: string;
  operator: string;
  summary: string;
  bullets: string[];
  metric: { value: string; label: string } | null;
  mediaId: string | null;
};

export type GroupUnit = {
  sector: string;
  companies: string[];
};
