"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onStoreChange: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

/**
 * Di server dan selama hidrasi kita belum tahu preferensi pengguna, dan pilihan
 * yang aman adalah tidak menganimasikan apa pun. React memakai snapshot server
 * ini untuk render pertama, lalu beralih ke nilai asli setelah hidrasi selesai,
 * jadi tidak ada mismatch.
 */
function getServerSnapshot(): boolean {
  return true;
}

/**
 * matchMedia adalah external store, jadi useSyncExternalStore adalah API React
 * yang memang untuk ini. Versi useState plus useEffect memanggil setState
 * sinkron di dalam efek, yang memicu render bertingkat dan ditolak aturan
 * react-hooks/set-state-in-effect.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
