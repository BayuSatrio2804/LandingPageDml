import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { clampProgress, useScrollProgress } from "./use-scroll-progress";

describe("clampProgress", () => {
  it("meneruskan nilai di dalam rentang apa adanya", () => {
    expect(clampProgress(0)).toBe(0);
    expect(clampProgress(0.42)).toBe(0.42);
    expect(clampProgress(1)).toBe(1);
  });

  it("menjepit nilai di luar rentang", () => {
    expect(clampProgress(-3)).toBe(0);
    expect(clampProgress(1.8)).toBe(1);
  });

  // Nilai non-finite pernah muncul dari ScrollTrigger saat elemen dipin lalu
  // di-refresh dengan tinggi nol. Tanpa guard ini, NaN merambat ke useFrame
  // dan menghasilkan array opacity nol seluruhnya, yaitu canvas tak terlihat
  // tanpa error apa pun. Bekas kasus ini ada di komentar fleet-comparator.tsx.
  it("mengembalikan nol untuk NaN dan Infinity", () => {
    expect(clampProgress(Number.NaN)).toBe(0);
    expect(clampProgress(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("useScrollProgress", () => {
  // disabled dipakai FleetComparator (Task 11) dan HeroCanvas (Task 12) untuk
  // menahan ScrollTrigger sampai kondisinya terpenuhi. Jalur ini juga yang
  // membuat ref tidak pernah menyentuh registerGsap saat dinonaktifkan, jadi
  // aman dipanggil di jsdom tanpa WebGL maupun layout nyata.
  it("mengembalikan ref nol dan tidak memasang ScrollTrigger saat disabled", () => {
    const target: React.RefObject<HTMLElement | null> = { current: null };
    const { result } = renderHook(() => useScrollProgress(target, { end: "+=100%", disabled: true }));
    expect(result.current.current).toBe(0);
  });
});
