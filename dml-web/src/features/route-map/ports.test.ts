import { describe, expect, it } from "vitest";
import { PORTS } from "./ports";

describe("PORTS", () => {
  it("berisi tepat 4 pelabuhan sesuai rute ro-ro", () => {
    expect(PORTS).toHaveLength(4);
    expect(PORTS.map((p) => p.name)).toEqual(["Ketapang", "Lembar", "Tanjung Perak Surabaya", "Kumai"]);
  });
});
