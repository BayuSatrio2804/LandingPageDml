import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { OverlayPanel } from "./overlay-panel";

describe("OverlayPanel", () => {
  it("render anaknya", () => {
    render(<OverlayPanel>Isi panel</OverlayPanel>);
    expect(screen.getByText("Isi panel")).toBeInTheDocument();
  });

  // Panel ini satu-satunya jaminan kontras teks di atas foto. Kalau latar
  // buramnya hilang, teks kembali bergantung gradien dan kartu STS jatuh ke
  // rasio di bawah AA lagi, persis cacat yang diaudit di spec bagian 2.1.
  it("selalu punya latar surface buram, bukan sekadar blur", () => {
    const { container } = render(<OverlayPanel>Isi</OverlayPanel>);
    const panel = container.firstElementChild;
    expect(panel?.className).toMatch(/bg-surface\//);
  });

  it("menerima kelas tambahan tanpa membuang kelas dasarnya", () => {
    const { container } = render(<OverlayPanel className="max-w-md">Isi</OverlayPanel>);
    const panel = container.firstElementChild;
    expect(panel?.className).toMatch(/max-w-md/);
    expect(panel?.className).toMatch(/bg-surface\//);
  });
});
