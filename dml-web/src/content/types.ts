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
