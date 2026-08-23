import { describe, expect, it } from "vitest";
import { inquirySchema } from "./schema";

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
