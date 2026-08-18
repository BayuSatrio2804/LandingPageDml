import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DayCut } from "./day-cut";

describe("DayCut", () => {
  it("render paragraf penjelasan ship-to-ship", () => {
    render(<DayCut />);
    expect(screen.getByText(/memindahkan bahan bakar langsung antar kapal/i)).toBeInTheDocument();
  });

  it("paragraf memakai warna ink, bukan ink-muted di atas foto", () => {
    render(<DayCut />);
    const paragraph = screen.getByText(/memindahkan bahan bakar langsung antar kapal/i);
    expect(paragraph.className).toMatch(/text-ink\b/);
    expect(paragraph.className).not.toMatch(/text-ink-muted/);
  });

  // Panel scrim, bukan gradien, yang menjamin kontras. Gradien boleh ada
  // sebagai lapisan tambahan tapi tidak boleh jadi satu-satunya.
  it("paragraf duduk di dalam panel scrim", () => {
    render(<DayCut />);
    const panel = screen.getByText(/memindahkan bahan bakar langsung antar kapal/i).closest("div");
    expect(panel?.className).toMatch(/bg-surface\//);
  });

  it("seksi setinggi viewport dinamis", () => {
    const { container } = render(<DayCut />);
    const section = container.querySelector("section");
    expect(section?.className).toMatch(/min-h-\[100dvh\]/);
    expect(section?.className).not.toMatch(/h-screen/);
  });
});
