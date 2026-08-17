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
