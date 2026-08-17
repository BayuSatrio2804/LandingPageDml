import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Since1985, yearsOperating } from "./since-1985";
import { COMPANY } from "@/content/company";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

describe("yearsOperating", () => {
  it("menghitung tahun penuh sejak tanggal pendirian", () => {
    expect(yearsOperating("1985-11-30", new Date("2026-08-18T00:00:00Z"))).toBe(40);
  });

  it("belum menambah tahun sebelum tanggal ulang tahun terlewati", () => {
    expect(yearsOperating("1985-11-30", new Date("2026-11-29T00:00:00Z"))).toBe(40);
    expect(yearsOperating("1985-11-30", new Date("2026-11-30T00:00:00Z"))).toBe(41);
  });
});

describe("Since1985", () => {
  it("render heading Sejak 1985", () => {
    render(<Since1985 />);
    expect(screen.getByRole("heading", { level: 2, name: /sejak 1985/i })).toBeInTheDocument();
  });

  it("render tautan ke silsilah lengkap", () => {
    render(<Since1985 />);
    expect(screen.getByRole("link", { name: /silsilah lengkap/i })).toHaveAttribute(
      "href",
      "/tentang-kami#silsilah",
    );
  });

  // Nama pendiri dan tahun dibaca dari COMPANY, bukan dari prosa
  // TIMELINE[0].label yang kebetulan mengulang keduanya. Dua sumber untuk
  // fakta yang sama pasti berbeda cepat atau lambat.
  it("menyebut pendiri dari COMPANY.founder", () => {
    render(<Since1985 />);
    expect(screen.getByText(new RegExp(COMPANY.founder, "i"))).toBeInTheDocument();
  });
});
