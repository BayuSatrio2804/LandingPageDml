import type { GlobalConfig } from "payload";
import { revalidateAllGlobalHooks } from "../revalidate-all";
import { THEME_PRESET_LABELS } from "@/lib/theme-presets";

/**
 * Tampilan situs. Untuk sekarang cuma pilihan preset warna aksen (tautan,
 * tombol, judul beraksen, penanda aktif). Bidang halaman dan teks tetap
 * "Navy Selat" apa pun presetnya.
 */
export const Appearance: GlobalConfig = {
  slug: "appearance",
  admin: {
    group: "Situs",
    description:
      "Preset warna aksen situs. Hanya warna tautan/tombol/aksen yang berubah — latar dan teks tetap. Scene 3D di Beranda tetap navy.",
  },
  access: { read: () => true, update: ({ req: { user } }) => Boolean(user) },
  hooks: revalidateAllGlobalHooks,
  fields: [
    {
      name: "theme",
      type: "select",
      required: true,
      defaultValue: "navy",
      options: (Object.keys(THEME_PRESET_LABELS) as Array<keyof typeof THEME_PRESET_LABELS>).map(
        (value) => ({ label: THEME_PRESET_LABELS[value], value }),
      ),
      admin: { description: "Perubahan langsung terlihat setelah Save." },
    },
  ],
};
