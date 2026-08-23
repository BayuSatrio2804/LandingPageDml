import { afterEach, describe, expect, it, vi } from "vitest";
import { createRateLimiter, clientKeyFrom } from "./rate-limit";

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

describe("clientKeyFrom", () => {
  it("mengambil entri dari kanan sejauh jumlah hop tepercaya", () => {
    // Klien mengarang dua entri pertama; proxy tepercaya menambahkan yang
    // terakhir. Dengan satu hop tepercaya, yang dipakai adalah 203.0.113.9.
    expect(clientKeyFrom("1.2.3.4, 5.6.7.8, 203.0.113.9", 1)).toBe("203.0.113.9");
  });

  it("menghormati jumlah hop lebih dari satu", () => {
    expect(clientKeyFrom("1.2.3.4, 198.51.100.7, 203.0.113.9", 2)).toBe("198.51.100.7");
  });

  it("tidak pernah memakai entri paling kiri yang dikendalikan klien", () => {
    expect(clientKeyFrom("1.2.3.4, 203.0.113.9", 1)).not.toBe("1.2.3.4");
  });

  it("jatuh ke unknown kalau header tidak ada", () => {
    expect(clientKeyFrom(null, 1)).toBe("unknown");
  });

  it("jatuh ke entri paling kanan kalau hop melebihi jumlah entri", () => {
    expect(clientKeyFrom("203.0.113.9", 5)).toBe("203.0.113.9");
  });

  it("memangkas spasi di sekitar entri", () => {
    expect(clientKeyFrom("  1.2.3.4 ,  203.0.113.9  ", 1)).toBe("203.0.113.9");
  });
});
