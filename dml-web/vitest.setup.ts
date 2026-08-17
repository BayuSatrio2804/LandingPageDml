import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

/**
 * jsdom tidak mengimplementasikan IntersectionObserver. Polyfill minimal ini
 * dipasang sekali di sini (bukan per file tes) supaya semua hook/komponen
 * yang memakainya (mis. useCounter, AnchorNav) bisa dirender tanpa crash.
 * Test yang perlu mensimulasikan intersection tetap bisa mengganti global
 * ini sendiri dengan vi.stubGlobal.
 */
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  constructor() {}
  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve(): void {}
}

if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;
}

/**
 * jsdom juga tidak mengimplementasikan matchMedia. Default aman: tidak ada
 * preferensi reduced motion (matches: false), supaya hook yang bergantung
 * padanya (usePrefersReducedMotion) tidak melempar error saat dirender di
 * tes yang tidak secara eksplisit memock matchMedia sendiri.
 */
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
