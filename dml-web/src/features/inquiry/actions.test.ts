import { beforeEach, describe, expect, it, vi } from "vitest";

const createMock = vi.fn();
vi.mock("payload", () => ({
  getPayload: vi.fn(async () => ({ create: createMock })),
}));
vi.mock("@payload-config", () => ({ default: {} }));
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers({ "x-forwarded-for": "9.9.9.9" })),
}));

const VALID = {
  name: "Budi Santoso",
  phone: "+6281234567890",
  email: "budi@example.com",
  message: "Saya ingin tanya soal jadwal keberangkatan kapal.",
  website: "",
};

describe("submitInquiry", () => {
  beforeEach(() => {
    createMock.mockReset();
    createMock.mockResolvedValue({ id: "abc123" });
    vi.resetModules();
  });

  it("menyimpan ke collection inquiries saat input valid", async () => {
    const { submitInquiry } = await import("./actions");
    const result = await submitInquiry(VALID, "kontak");
    expect(result).toEqual({ ok: true });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "inquiries",
        data: expect.objectContaining({ name: "Budi Santoso", source: "kontak" }),
      }),
    );
  });

  it("menolak input yang gagal validasi tanpa memanggil Payload", async () => {
    const { submitInquiry } = await import("./actions");
    const result = await submitInquiry({ ...VALID, email: "bukan-email" }, "kontak");
    expect(result.ok).toBe(false);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("menolak diam-diam saat honeypot terisi, tetap melapor sukses ke client", async () => {
    const { submitInquiry } = await import("./actions");
    const result = await submitInquiry({ ...VALID, website: "http://spam.example" }, "kontak");
    expect(result).toEqual({ ok: true });
    expect(createMock).not.toHaveBeenCalled();
  });

  it("menolak setelah rate limit terlampaui dari IP yang sama", async () => {
    const { submitInquiry } = await import("./actions");
    for (let i = 0; i < 5; i += 1) {
      await submitInquiry(VALID, "kontak");
    }
    const sixth = await submitInquiry(VALID, "kontak");
    expect(sixth).toEqual({ ok: false, error: "Terlalu banyak percobaan, coba lagi nanti." });
  });

  it("menyimpan company dan service untuk kirim B2B", async () => {
    const { submitInquiry } = await import("./actions");
    const result = await submitInquiry(
      {
        name: "Budi Santoso",
        company: "PT Energi Nusantara",
        phone: "+6281234567890",
        email: "budi@energi.co.id",
        service: "transportasi-bbm",
        message: "Kami butuh pengangkutan solar rutin ke Kalimantan Tengah.",
      },
      "permintaan-informasi-bbm",
    );

    expect(result).toEqual({ ok: true });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "inquiries",
        data: expect.objectContaining({
          company: "PT Energi Nusantara",
          service: "transportasi-bbm",
          source: "permintaan-informasi-bbm",
        }),
      }),
    );
  });

  it("kirim dari /kontak tetap tersimpan tanpa company dan service", async () => {
    const { submitInquiry } = await import("./actions");
    const result = await submitInquiry(
      {
        name: "Siti Rahayu",
        phone: "+6281234567891",
        email: "siti@example.com",
        message: "Saya ingin bertanya tentang jadwal penyeberangan.",
      },
      "kontak",
    );

    expect(result).toEqual({ ok: true });
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ source: "kontak" }),
      }),
    );
  });
});
