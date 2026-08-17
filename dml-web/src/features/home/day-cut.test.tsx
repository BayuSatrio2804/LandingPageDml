import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DayCut } from "./day-cut";

describe("DayCut", () => {
  it("render paragraf penjelasan ship-to-ship transfer", () => {
    render(<DayCut />);
    expect(screen.getByText(/ship-to-ship/i)).toBeInTheDocument();
  });

  it("render gambar wide anchorage dengan alt text", () => {
    render(<DayCut />);
    expect(screen.getByAltText(/area labuh jangkar/i)).toBeInTheDocument();
  });
});
