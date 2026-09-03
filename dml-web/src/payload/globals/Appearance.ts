import type { GlobalConfig } from "payload";
import { revalidateAllGlobalHooks } from "../revalidate-all";
import { THEME_PRESET_LABELS, isAccentSafe } from "@/lib/theme-presets";

/**
 * Tampilan situs. Untuk sekarang cuma warna aksen (tautan, tombol, judul
 * beraksen, penanda aktif). Bidang halaman dan teks tetap "Navy Selat"
 * apa pun pilihannya, dan scene 3D di Beranda tetap navy.
 */
export const Appearance: GlobalConfig = {
  slug: "appearance",
  admin: {
    group: "Situs",
    description:
      "Warna aksen situs. Pilih preset, atau 'Kustom' untuk hex sendiri. Latar & teks tetap. Perubahan langsung terlihat setelah Save.",
  },
  access: { read: () => true, update: ({ req: { user } }) => Boolean(user) },
  hooks: revalidateAllGlobalHooks,
  fields: [
    {
      name: "theme",
      type: "select",
      required: true,
      defaultValue: "navy",
      options: (
        Object.keys(THEME_PRESET_LABELS) as Array<keyof typeof THEME_PRESET_LABELS>
      ).map((value) => ({ label: THEME_PRESET_LABELS[value], value })),
    },
    {
      name: "customAccent",
      type: "text",
      admin: {
        condition: (data) => data?.theme === "custom",
        description:
          "Hex warna aksen, mis. #3A1F5C. Harus cukup gelap (kontras cukup dengan latar terang, kaki, dan teks putih); kalau tidak, situs otomatis pakai navy.",
        placeholder: "#3A1F5C",
      },
      validate: (value: string | null | undefined, { siblingData }: { siblingData: { theme?: string } }) => {
        if (siblingData?.theme !== "custom") return true;
        if (!value) return "Isi hex warna aksen, atau ganti Theme ke preset.";
        return isAccentSafe(value)
          ? true
          : "Warna ini terlalu terang — kontrasnya tidak cukup untuk teks putih / kaki halaman. Pilih yang lebih gelap.";
      },
    },
  ],
};
