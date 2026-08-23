import { describe, expect, it } from "vitest";
import { inquirySchema, businessInquirySchema } from "./schema";

const VALID = {
  name: "Budi Santoso",
  phone: "+6281234567890",
  email: "budi@example.com",
  message: "Saya ingin tanya soal jadwal keberangkatan kapal.",
  website: "",
};

describe("inquirySchema", () => {
  it("menerima input yang valid", () => {
    expect(inquirySchema.safeParse(VALID).success).toBe(true);
  });

  it("menolak nama kosong", () => {
    const result = inquirySchema.safeParse({ ...VALID, name: "" });
    expect(result.success).toBe(false);
  });

  it("menolak email tidak valid", () => {
    const result = inquirySchema.safeParse({ ...VALID, email: "bukan-email" });
    expect(result.success).toBe(false);
  });

  it("menolak nomor telepon yang bukan format internasional", () => {
    const result = inquirySchema.safeParse({ ...VALID, phone: "0812xxxx" });
    expect(result.success).toBe(false);
  });

  it("menolak pesan yang terlalu pendek", () => {
    const result = inquirySchema.safeParse({ ...VALID, message: "singkat" });
    expect(result.success).toBe(false);
  });

  it("menerima honeypot kosong dan menolak honeypot terisi", () => {
    expect(inquirySchema.safeParse(VALID).success).toBe(true);
    const bot = inquirySchema.safeParse({ ...VALID, website: "http://spam.example" });
    expect(bot.success).toBe(false);
  });

  it("menerima honeypot yang tidak dikirim sama sekali", () => {
    const withoutHoneypot: Record<string, unknown> = { ...VALID };
    delete withoutHoneypot.website;
    expect(inquirySchema.safeParse(withoutHoneypot).success).toBe(true);
  });
});

describe("businessInquirySchema", () => {
  const valid = {
    name: "Budi Santoso",
    company: "PT Energi Nusantara",
    phone: "+6281234567890",
    email: "budi@energi.co.id",
    service: "transportasi-bbm" as const,
    message: "Kami butuh pengangkutan solar rutin ke Kalimantan Tengah.",
  };

  it("menerima isian lengkap yang valid", () => {
    expect(businessInquirySchema.safeParse(valid).success).toBe(true);
  });

  it("menolak nama perusahaan kosong", () => {
    const result = businessInquirySchema.safeParse({ ...valid, company: "" });
    expect(result.success).toBe(false);
  });

  it("menolak layanan di luar dua lini yang ada", () => {
    const result = businessInquirySchema.safeParse({ ...valid, service: "galangan-kapal" });
    expect(result.success).toBe(false);
  });

  it("field opsional boleh tidak diisi", () => {
    const result = businessInquirySchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cargoType).toBeUndefined();
      expect(result.data.volume).toBeUndefined();
    }
  });

  it("tetap mewarisi validasi telepon dari inquirySchema", () => {
    const result = businessInquirySchema.safeParse({ ...valid, phone: "0812" });
    expect(result.success).toBe(false);
  });

  it("tetap mewarisi honeypot dari inquirySchema", () => {
    const result = businessInquirySchema.safeParse({ ...valid, website: "spam" });
    expect(result.success).toBe(false);
  });
});
