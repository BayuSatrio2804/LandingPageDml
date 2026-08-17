import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "./site-footer";
import { MODEL_CREDITS } from "@/content/model-credits";

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
  // sama saja dengan tidak mencantumkannya.
  it("baris kredit memakai warna ink-muted, bukan warna yang lebih redup lagi", () => {
    render(<SiteFooter />);
    const line = screen.getByTestId("kredit-model");
    expect(line.className).toMatch(/text-ink-muted/);
  });
});
