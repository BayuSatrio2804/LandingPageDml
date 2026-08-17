import { describe, expect, it } from "vitest";
import { MOTION } from "./tokens";

describe("MOTION", () => {
  it("durasi naik dari fast ke slow", () => {
    expect(MOTION.fast).toBeLessThan(MOTION.base);
    expect(MOTION.base).toBeLessThan(MOTION.slow);
  });

  it("setiap durasi positif dan di bawah dua detik", () => {
    for (const key of ["fast", "base", "slow"] as const) {
      expect(MOTION[key]).toBeGreaterThan(0);
      expect(MOTION[key]).toBeLessThan(2);
    }
  });

  it("nama easing memakai easing GSAP yang valid", () => {
    expect(MOTION.ease).toMatch(/^[a-z]+[0-9]*\.(in|out|inOut)$/);
    expect(MOTION.easeInOut).toMatch(/^[a-z]+[0-9]*\.(in|out|inOut)$/);
  });
});
