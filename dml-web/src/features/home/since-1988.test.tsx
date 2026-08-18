import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Since1988 } from "./since-1988";
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

describe("Since1988", () => {
  it("render heading Sejak 1988", () => {
    render(<Since1988 />);
    expect(screen.getByRole("heading", { level: 2, name: /sejak 1988/i })).toBeInTheDocument();
  });

  // Tahun 1985 sempat tersebar ke judul seksi, headline hero, footer, dan
  // metadata. Tes ini menahannya supaya tidak diam-diam kembali.
  it("tidak menyebut 1985 di mana pun", () => {
    const { container } = render(<Since1988 />);
    expect(container.textContent).not.toMatch(/1985/);
  });

  it("render tautan ke silsilah lengkap", () => {
    render(<Since1988 />);
    expect(screen.getByRole("link", { name: /silsilah lengkap/i })).toHaveAttribute(
      "href",
      "/tentang-kami#silsilah",
    );
  });

  // Nama pendiri dibaca dari COMPANY, bukan ditulis ulang di prosa. Dua sumber
  // untuk fakta yang sama pasti berbeda cepat atau lambat.
  it("menyebut pendiri dari COMPANY.founder", () => {
    render(<Since1988 />);
    expect(screen.getByText(new RegExp(COMPANY.founder, "i"))).toBeInTheDocument();
  });

  it("render tiga nilai perusahaan", () => {
    const { container } = render(<Since1988 />);
    expect(container.querySelectorAll("[data-testid='nilai-perusahaan']")).toHaveLength(3);
    expect(screen.getByText("Measurable")).toBeInTheDocument();
  });
});
