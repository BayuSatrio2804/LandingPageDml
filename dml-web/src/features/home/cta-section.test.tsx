import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CtaSection } from "./cta-section";

describe("CtaSection", () => {
  it("render satu CTA primer ke /kontak", () => {
    render(<CtaSection />);
    const links = screen.getAllByRole("link", { name: /hubungi kami/i });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/kontak");
  });
});
