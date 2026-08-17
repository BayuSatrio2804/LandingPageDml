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

  it("variant ghost tidak memakai latar accent", () => {
    render(
      <CtaLink href="/kontak" variant="ghost">
        Hubungi Kami
      </CtaLink>,
    );
    const link = screen.getByRole("link", { name: "Hubungi Kami" });
    expect(link.className).not.toContain("bg-accent");
  });
});
