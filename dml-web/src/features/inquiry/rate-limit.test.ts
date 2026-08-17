import { afterEach, describe, expect, it, vi } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("mengizinkan submission sampai batas limit", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 10_000 });
    expect(limiter.check("1.2.3.4")).toBe(true);
    expect(limiter.check("1.2.3.4")).toBe(true);
    expect(limiter.check("1.2.3.4")).toBe(true);
  });

  it("menolak submission setelah melewati limit dalam window yang sama", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 10_000 });
    expect(limiter.check("1.2.3.4")).toBe(true);
    expect(limiter.check("1.2.3.4")).toBe(true);
    expect(limiter.check("1.2.3.4")).toBe(false);
  });

  it("mengizinkan lagi setelah window berlalu", () => {
    vi.useFakeTimers();
    const limiter = createRateLimiter({ limit: 1, windowMs: 10_000 });
    expect(limiter.check("1.2.3.4")).toBe(true);
    expect(limiter.check("1.2.3.4")).toBe(false);
    vi.advanceTimersByTime(10_001);
    expect(limiter.check("1.2.3.4")).toBe(true);
  });

  it("menghitung IP secara terpisah", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 10_000 });
    expect(limiter.check("1.2.3.4")).toBe(true);
    expect(limiter.check("5.6.7.8")).toBe(true);
    expect(limiter.check("1.2.3.4")).toBe(false);
  });
});
