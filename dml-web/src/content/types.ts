export type Office = {
  label: string;
  street: string;
  city: string;
  postalCode: string;
  province: string;
};

export type Company = {
  legalName: string;
  shortName: string;
  foundedIso: string;
  founder: string;
  parent: string;
  phone: string;
  whatsapp: string;
  offices: Office[];
  certifications: string[];
  fleetSummary: { vessels: number; totalDwt: number };
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
  altText: string;
};
