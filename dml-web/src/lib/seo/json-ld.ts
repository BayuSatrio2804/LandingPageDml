import { COMPANY } from "@/content/company";
import { absoluteUrl, SITE_URL } from "./metadata";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.legalName,
    url: SITE_URL,
    foundingDate: COMPANY.foundedIso,
    founder: { "@type": "Person", name: COMPANY.founder },
    parentOrganization: { "@type": "Organization", name: COMPANY.parent },
    telephone: COMPANY.phone,
    address: COMPANY.offices.map((office) => ({
      "@type": "PostalAddress",
      streetAddress: office.street,
      addressLocality: office.city,
      postalCode: office.postalCode,
      addressRegion: office.province,
      addressCountry: "ID",
    })),
  };
}

export function breadcrumbJsonLd(
  trail: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: absoluteUrl(entry.path),
    })),
  };
}

/**
 * JSON-LD artikel. Field opsional dihilangkan sepenuhnya kalau tidak ada,
 * bukan diisi string kosong: validator structured data memperlakukan
 * properti kosong sebagai kesalahan, sementara properti yang absen memang
 * boleh absen untuk tipe Article.
 */
export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  publishedAt: string;
  updatedAt: string;
  imageUrl?: string;
  authorName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    mainEntityOfPage: absoluteUrl(input.path),
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    publisher: {
      "@type": "Organization",
      name: COMPANY.legalName,
      url: SITE_URL,
    },
    ...(input.imageUrl ? { image: input.imageUrl } : {}),
    ...(input.authorName
      ? { author: { "@type": "Person", name: input.authorName } }
      : {}),
  };
}

/**
 * Satu Service per lini bisnis. Fieldnya diambil dari business-lines.ts yang
 * sudah ada; tidak ada data perusahaan baru yang lahir di berkas ini.
 *
 * areaServed sengaja tidak diisi. Cakupan wilayah yang tepat tidak ada di
 * company profile, dan menuliskan "Indonesia" adalah klaim yang tidak
 * berdasar untuk data terstruktur yang justru dibaca mesin.
 */
export function serviceJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    provider: {
      "@type": "Organization",
      name: COMPANY.legalName,
      url: SITE_URL,
    },
  };
}

/**
 * LocalBusiness berdampingan dengan Organization di root, sesuai master spec
 * bagian 12. Keduanya mendeskripsikan badan yang sama dari sudut berbeda:
 * Organization untuk identitas korporat dan induknya, LocalBusiness untuk
 * tempat yang bisa didatangi beserta teleponnya.
 */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: COMPANY.legalName,
    url: SITE_URL,
    telephone: COMPANY.phone,
    address: COMPANY.offices.map((office) => ({
      "@type": "PostalAddress",
      streetAddress: office.street,
      addressLocality: office.city,
      ...(office.postalCode ? { postalCode: office.postalCode } : {}),
      addressRegion: office.province,
      addressCountry: "ID",
    })),
  };
}

/**
 * JSON.stringify biasa tidak meng-escape "<", jadi field string apa pun yang
 * kebetulan memuat "</script>" bisa menutup tag lebih awal dan menyuntik
 * markup. COMPANY sekarang statis dan aman, tapi Plan 4 akan memakai fungsi
 * ini juga untuk JSON-LD artikel yang datang dari input admin di Payload,
 * jadi escape-nya dipasang di sini, sekali, bukan di titik pemakaian.
 */
export function safeJsonLdString(data: unknown): string {
  // Backslash ganda di sini disengaja: string literal "<" (backslash
  // tunggal) langsung diresolusi compiler jadi karakter "<" itu sendiri,
  // artinya replace jadi no-op. "\\u003c" (backslash ganda) menghasilkan
  // nilai string runtime berupa enam karakter literal <, yang aman
  // ditulis ke HTML tapi tetap didekode balik jadi "<" oleh JSON.parse.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
