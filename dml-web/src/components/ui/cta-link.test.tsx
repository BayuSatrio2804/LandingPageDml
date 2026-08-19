import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CtaLink } from "./cta-link";

describe("CtaLink", () => {
  it("render sebagai link dengan href yang diberikan", () => {
    render(<CtaLink href="/kontak">Hubungi Kami</CtaLink>);
    const link = screen.getByRole("link", { name: "Hubungi Kami" });
    expect(link).toHaveAttribute("href", "/kontak");
  });

  it("variant filled memakai teks on-accent, bukan ink, di atas latar accent", () => {
    render(<CtaLink href="/kontak">Hubungi Kami</CtaLink>);
    const link = screen.getByRole("link", { name: "Hubungi Kami" });
    expect(link.className).toContain("bg-accent");
    expect(link.className).toContain("text-on-accent");
    expect(link.className).not.toContain("text-ink ");
  });

  // Yang dilarang adalah latar terisi saat diam. Isian accent-soft pada hover
  // justru yang membuat ghost punya umpan balik di halaman terang, dan
  // pemeriksaan "tidak mengandung bg-accent" apa adanya akan ikut melarangnya.
  it("variant ghost tidak memakai latar terisi saat diam", () => {
    render(
      <CtaLink href="/kontak" variant="ghost">
        Hubungi Kami
      </CtaLink>,
    );
    const link = screen.getByRole("link", { name: "Hubungi Kami" });
    const restingClasses = link.className
      .split(" ")
      .filter((name) => !name.includes(":"));
    expect(restingClasses.some((name) => name.startsWith("bg-"))).toBe(false);
    expect(link.className).toContain("border-line");
  });
});
