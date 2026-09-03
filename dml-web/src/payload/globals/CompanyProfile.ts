import type { GlobalConfig } from "payload";

/**
 * Profil perusahaan, admin-editable. Dulu ini seluruhnya hardcode di
 * src/content/company.ts (lihat riwayat file itu untuk sumber data asli:
 * company profile PDF klien). Field di sini sengaja dicocokkan persis ke
 * tipe `Company`/`Office`/`CoreValue`/`Standard`/`Membership`/
 * `FleetSummary`/`GroupUnit` di src/content/types.ts supaya kode konsumen
 * (halaman, komponen) butuh perubahan minimal saat berpindah dari import
 * statis ke data CMS ini.
 *
 * `values` (D/M/L) adalah satu-satunya sumber nilai inti sejak CMS Fase 3:
 * about.ts sempat punya salinan sendiri berbahasa Indonesia (Dinamis/
 * Terukur/Setia) yang berbeda kata dari sini, sudah direkonsiliasi — kata
 * Indonesia itulah yang sekarang dipakai di sini, dan about.ts tidak lagi
 * punya salinannya.
 */
export const CompanyProfile: GlobalConfig = {
  slug: "company-profile",
  admin: {
    group: "Perusahaan",
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Identitas",
          fields: [
            { name: "legalName", type: "text", required: true },
            { name: "shortName", type: "text", required: true },
            { name: "abbreviation", type: "text", required: true },
            { name: "tagline", type: "text", required: true },
            { name: "foundedIso", type: "date", required: true },
            { name: "founder", type: "text", required: true },
            { name: "parent", type: "text", required: true },
            { name: "phone", type: "text", required: true },
            {
              name: "whatsapp",
              type: "text",
              required: true,
              admin: { description: "Format E.164 tanpa tanda plus, untuk tautan wa.me." },
            },
            { name: "bookingUrl", type: "text", required: true },
          ],
        },
        {
          label: "Kantor DML",
          fields: [
            {
              name: "offices",
              type: "array",
              required: true,
              minRows: 1,
              fields: [
                { name: "label", type: "text", required: true },
                { name: "street", type: "text", required: true },
                { name: "city", type: "text", required: true },
                { name: "postalCode", type: "text" },
                { name: "province", type: "text", required: true },
                { name: "phone", type: "text" },
                { name: "fax", type: "text" },
              ],
            },
          ],
        },
        {
          label: "Nilai Inti",
          fields: [
            {
              name: "values",
              type: "array",
              required: true,
              minRows: 3,
              maxRows: 3,
              admin: {
                description: "Tiga huruf DML sebagai nilai. Urutan baris adalah urutan tampil.",
              },
              fields: [
                {
                  name: "key",
                  type: "select",
                  required: true,
                  options: ["D", "M", "L"],
                },
                { name: "term", type: "text", required: true },
                { name: "description", type: "textarea", required: true },
              ],
            },
          ],
        },
        {
          label: "Standar & Keanggotaan",
          fields: [
            {
              name: "standards",
              type: "array",
              required: true,
              fields: [
                { name: "label", type: "text", required: true },
                {
                  name: "items",
                  type: "array",
                  required: true,
                  fields: [
                    { name: "name", type: "text", required: true },
                    {
                      name: "source",
                      type: "select",
                      required: true,
                      options: ["cp-pdf", "riset-publik", "belum-terverifikasi"],
                    },
                  ],
                },
              ],
            },
            {
              name: "memberships",
              type: "array",
              required: true,
              fields: [
                { name: "name", type: "text", required: true },
                {
                  name: "expansion",
                  type: "text",
                  admin: { description: "Kepanjangan akronim, opsional." },
                },
              ],
            },
          ],
        },
        {
          label: "Ringkasan Armada",
          fields: [
            {
              name: "fleetSummary",
              type: "group",
              fields: [
                { name: "vessels", type: "number", required: true },
                { name: "passengerVessels", type: "number", required: true },
                { name: "oilTransportVessels", type: "number", required: true },
                { name: "people", type: "number", required: true },
              ],
            },
          ],
        },
        {
          label: "Struktur Grup",
          fields: [
            {
              name: "groupOffices",
              type: "array",
              required: true,
              admin: { description: "Kantor Sinar Alam Corporation, bukan kantor DML sendiri." },
              fields: [
                { name: "label", type: "text", required: true },
                { name: "street", type: "text", required: true },
                { name: "city", type: "text", required: true },
                { name: "postalCode", type: "text" },
                { name: "province", type: "text", required: true },
                { name: "phone", type: "text" },
                { name: "fax", type: "text" },
              ],
            },
            {
              name: "groupUnits",
              type: "array",
              required: true,
              admin: { description: "Peta sektor usaha grup, dipakai halaman Tentang Kami." },
              fields: [
                { name: "sector", type: "text", required: true },
                { name: "companies", type: "text", hasMany: true, required: true },
              ],
            },
          ],
        },
      ],
    },
  ],
};
