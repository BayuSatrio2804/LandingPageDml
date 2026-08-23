import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().trim().min(2, { error: "Nama wajib diisi" }),
  phone: z
    .string()
    .trim()
    .regex(/^\+\d{8,15}$/, { error: "Format nomor telepon internasional, contoh +6281234567890" }),
  email: z.email({ error: "Alamat email tidak valid" }),
  message: z.string().trim().min(10, { error: "Pesan minimal 10 karakter" }),
  website: z.string().max(0, { error: "Bidang ini harus kosong" }).optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

/**
 * Form B2B di /bisnis/transportasi-bbm/permintaan-informasi. Memperluas
 * inquirySchema, bukan menduplikasinya, supaya aturan telepon, email, dan
 * honeypot cuma hidup di satu tempat.
 *
 * `company` dan `service` menutup celah lama: koleksi inquiries sudah punya
 * kedua kolom itu sejak Plan 2 dan tidak pernah terisi dari form mana pun.
 *
 * Tiga field terakhir opsional dengan sengaja. Calon pelanggan yang belum tahu
 * volume atau rutenya tetap harus bisa mengirim pertanyaan; form yang memaksa
 * angka yang belum ada justru membuang lead.
 */
export const businessInquirySchema = inquirySchema.extend({
  company: z.string().trim().min(2, { error: "Nama perusahaan wajib diisi" }),
  service: z.enum(["transportasi-bbm", "penumpang-roro"], {
    error: "Pilih salah satu lini layanan",
  }),
  cargoType: z.string().trim().optional(),
  route: z.string().trim().optional(),
  volume: z.string().trim().optional(),
});

export type BusinessInquiryInput = z.infer<typeof businessInquirySchema>;
