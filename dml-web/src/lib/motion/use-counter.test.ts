import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCounter } from "./use-counter";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useCounter", () => {
  it("mulai dari 0 sebelum elemen masuk viewport", () => {
    const { result } = renderHook(() => useCounter(15));
    expect(result.current.value).toBe(0);
  });

  it("mengembalikan ref untuk dipasang ke elemen target", () => {
    const { result } = renderHook(() => useCounter(15));
    expect(result.current.ref).toBeDefined();
  });

  it("langsung menampilkan nilai akhir ketika pengguna meminta reduced motion", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    const { result } = renderHook(() => useCounter(15));
    expect(result.current.value).toBe(15);
  });
});
