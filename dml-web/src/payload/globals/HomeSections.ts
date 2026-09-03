import type { GlobalConfig } from "payload";
import { revalidateAllGlobalHooks } from "../revalidate-all";

/**
 * Teks section Beranda selain hero. Judul dan paragraf yang dulu hardcode
 * di komponen src/features/home/*. Angka dan daftar (jumlah kapal, kelas
 * armada, standar) tetap dari koleksi lain — di sini cuma label & prosa.
 */
export const HomeSections: GlobalConfig = {
  slug: "home-sections",
  admin: {
    group: "Halaman: Beranda",
    description:
      "Judul dan paragraf tiap bagian Beranda di bawah hero: Ship-to-ship, Afiliasi, Perbandingan Armada, Rute Ro-Ro, Sejak 1988, deret angka, dan ajakan penutup.",
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  hooks: revalidateAllGlobalHooks,
  fields: [
    {
      type: "collapsible",
      label: "Bagian: Ship-to-ship transfer",
      fields: [
        {
          name: "dayCut",
          type: "group",
          label: false,
          fields: [
            { name: "heading", type: "text", required: true },
            { name: "body", type: "textarea", required: true },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Bagian: Perusahaan afiliasi",
      fields: [
        {
          name: "affiliates",
          type: "group",
          label: false,
          fields: [
            { name: "heading", type: "text", required: true },
            { name: "subtext", type: "textarea", required: true },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Bagian: Perbandingan Armada",
      fields: [
        {
          name: "fleetComparator",
          type: "group",
          label: false,
          fields: [
            { name: "heading", type: "text", required: true },
            {
              name: "description",
              type: "textarea",
              required: true,
              admin: { description: "Deskripsi versi 3D (layar lebar)." },
            },
            {
              name: "descriptionStatic",
              type: "textarea",
              required: true,
              admin: { description: "Deskripsi versi sederhana (mobile / hemat gerak)." },
            },
            { name: "dragHint", type: "text", required: true, admin: { description: 'Mis. "Seret untuk memutar".' } },
            { name: "gridHint", type: "text", required: true, admin: { description: 'Mis. "1 kotak grid = 10 m".' } },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Bagian: Rute Penyeberangan Ro-Ro",
      fields: [
        {
          name: "routeMap",
          type: "group",
          label: false,
          fields: [
            { name: "heading", type: "text", required: true },
            { name: "description", type: "textarea", required: true },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Bagian: Sejak 1988",
      fields: [
        {
          name: "since1988",
          type: "group",
          label: false,
          fields: [
            { name: "heading", type: "text", required: true },
            {
              name: "counterCaption",
              type: "textarea",
              required: true,
              admin: { description: "Kalimat di bawah angka tahun beroperasi." },
            },
            {
              name: "foundingSentence",
              type: "textarea",
              required: true,
              admin: {
                description:
                  "Kalimat pendirian. Tulis lengkap — tidak otomatis ambil dari Company Profile.",
              },
            },
            { name: "genealogyLinkLabel", type: "text", required: true },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Bagian: Deret angka (di atas sertifikasi)",
      fields: [
        {
          name: "stats",
          type: "group",
          label: false,
          admin: { description: "Label di bawah tiap angka. Angkanya dihitung otomatis." },
          fields: [
            { name: "shipsLabel", type: "text", required: true },
            { name: "peopleLabel", type: "text", required: true },
            { name: "yearsLabel", type: "text", required: true },
            { name: "portsLabel", type: "text", required: true },
            { name: "membershipsHeading", type: "text", required: true },
          ],
        },
      ],
    },
    {
      type: "collapsible",
      label: "Bagian: Ajakan penutup",
      fields: [
        {
          name: "cta",
          type: "group",
          label: false,
          fields: [
            { name: "heading", type: "text", required: true },
            {
              name: "buttonLabel",
              type: "text",
              required: true,
              admin: { description: "Teks tombol. Tautannya tetap ke /kontak." },
            },
          ],
        },
      ],
    },
  ],
};
