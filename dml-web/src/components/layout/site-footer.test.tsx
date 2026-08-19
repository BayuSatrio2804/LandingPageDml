import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "./site-footer";
import { MODEL_CREDITS } from "@/content/model-credits";
import { TOKENS } from "@/lib/tokens";
import { contrastRatio } from "@/lib/color";

describe("SiteFooter", () => {
  it("menyebut setiap model dan penulisnya", () => {
    render(<SiteFooter />);
    for (const credit of MODEL_CREDITS) {
      expect(screen.getByText(new RegExp(credit.title, "i"))).toBeInTheDocument();
      expect(screen.getByRole("link", { name: credit.author })).toHaveAttribute(
        "href",
        credit.authorUrl,
      );
    }
  });

  // Syarat lisensi CC BY, bukan hiasan. Kredit dengan kontras di bawah AA
  // sama saja dengan tidak mencantumkannya. Sejak kaki halaman jadi bidang
  // navy, yang diuji bukan lagi nama kelasnya melainkan rasionya terhadap
  // latar kaki halaman: putih beropasitas akan lolos pemeriksaan nama kelas
  // tapi gagal di angka.
  it("baris kredit tetap lolos AA di atas latar kaki halaman", () => {
    render(<SiteFooter />);
    const line = screen.getByTestId("kredit-model");
    expect(line.className).toMatch(/text-surface-3/);
    expect(line.className).not.toMatch(/text-(on-accent|surface-3)\/\d/);
    expect(contrastRatio(TOKENS.surface3, TOKENS.accent)).toBeGreaterThanOrEqual(4.5);
  });
});
