import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

type Listener = (event: MediaQueryListEvent) => void;

function mockMatchMedia(initialMatches: boolean) {
  const listeners = new Set<Listener>();
  const mql = {
    matches: initialMatches,
    media: "(prefers-reduced-motion: reduce)",
    addEventListener: (_: string, cb: Listener) => listeners.add(cb),
    removeEventListener: (_: string, cb: Listener) => listeners.delete(cb),
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mql),
  );
  return {
    emit(matches: boolean) {
      mql.matches = matches;
      listeners.forEach((cb) => cb({ matches } as MediaQueryListEvent));
    },
    listenerCount: () => listeners.size,
  };
}

describe("usePrefersReducedMotion", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("mengembalikan false ketika pengguna tidak meminta reduced motion", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it("mengembalikan true ketika pengguna meminta reduced motion", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it("bereaksi ketika preferensi berubah saat halaman terbuka", () => {
    const media = mockMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
    act(() => media.emit(true));
    expect(result.current).toBe(true);
  });

  it("melepas listener saat unmount", () => {
    const media = mockMatchMedia(false);
    const { unmount } = renderHook(() => usePrefersReducedMotion());
    expect(media.listenerCount()).toBe(1);
    unmount();
    expect(media.listenerCount()).toBe(0);
  });
});
