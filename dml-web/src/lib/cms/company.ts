import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Company, FooterGroup, GroupUnit, NavItem, Office } from "@/content/types";

/**
 * Jembatan antara global Payload `company-profile`/`site-navigation` dan
 * bentuk tipe `Company`/`NavItem`/`FooterGroup` yang sudah dipakai seluruh
 * komponen sejak era src/content/company.ts dan navigation.ts statis.
 *
 * Dipetakan persis ke tipe lama supaya JSX komponen konsumen tidak perlu
 * berubah sama sekali — cuma sumber datanya yang pindah dari import statis
 * ke hasil fetch ini. Server-only: memanggil payload.findGlobal butuh
 * koneksi database, jadi HANYA boleh dipanggil dari Server Component.
 *
 * Dibungkus React cache(): layout, header, dan footer sama-sama memanggil
 * fungsi ini di satu render yang sama. Tanpa cache(), itu tiga query
 * database terpisah untuk data yang identik di request yang sama.
 */

function toOffice(office: {
  label: string;
  street: string;
  city: string;
  postalCode?: string | null;
  province: string;
  phone?: string | null;
  fax?: string | null;
}): Office {
  return {
    label: office.label,
    street: office.street,
    city: office.city,
    province: office.province,
    ...(office.postalCode ? { postalCode: office.postalCode } : {}),
    ...(office.phone ? { phone: office.phone } : {}),
    ...(office.fax ? { fax: office.fax } : {}),
  };
}

export type CompanyProfileData = Company & {
  groupOffices: Office[];
  groupUnits: GroupUnit[];
};

export const getCompanyProfile = cache(async (): Promise<CompanyProfileData> => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({ slug: "company-profile" });

  return {
    legalName: doc.legalName,
    shortName: doc.shortName,
    abbreviation: doc.abbreviation,
    tagline: doc.tagline,
    foundedIso: doc.foundedIso,
    founder: doc.founder,
    parent: doc.parent,
    phone: doc.phone,
    whatsapp: doc.whatsapp,
    bookingUrl: doc.bookingUrl,
    offices: doc.offices.map(toOffice),
    values: doc.values.map((value) => ({
      key: value.key,
      term: value.term,
      description: value.description,
    })),
    standards: doc.standards.map((cluster) => ({
      label: cluster.label,
      items: cluster.items.map((item) => ({ name: item.name, source: item.source })),
    })),
    memberships: doc.memberships.map((membership) => ({
      name: membership.name,
      ...(membership.expansion ? { expansion: membership.expansion } : {}),
    })),
    fleetSummary: {
      vessels: doc.fleetSummary.vessels,
      passengerVessels: doc.fleetSummary.passengerVessels,
      oilTransportVessels: doc.fleetSummary.oilTransportVessels,
      people: doc.fleetSummary.people,
    },
    groupOffices: doc.groupOffices.map(toOffice),
    groupUnits: doc.groupUnits.map((unit) => ({
      sector: unit.sector,
      companies: unit.companies,
    })),
  };
});

export type SiteNavigationData = {
  navItems: NavItem[];
  footerGroups: FooterGroup[];
};

export const getSiteNavigation = cache(async (): Promise<SiteNavigationData> => {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({ slug: "site-navigation" });

  return {
    navItems: doc.navItems.map((item) => ({
      label: item.label,
      href: item.href,
      ...(item.external ? { external: item.external } : {}),
    })),
    footerGroups: doc.footerGroups.map((group) => ({
      heading: group.heading,
      items: group.items.map((item) => ({
        label: item.label,
        href: item.href,
        ...(item.external ? { external: item.external } : {}),
      })),
    })),
  };
});
