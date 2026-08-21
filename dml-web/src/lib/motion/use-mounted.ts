"use client";

import { useSyncExternalStore } from "react";

function subscribe(): () => void {
  // Status "sudah mounted" tidak pernah berubah lagi setelah hidrasi, jadi
  // tidak ada apa pun untuk dilanggan — hook ini murni membaca perbedaan
  // snapshot server/klien, sama seperti usePrefersReducedMotion.
  return () => {};
}

/**
 * Sama seperti usePrefersReducedMotion/useIsDesktop: dipakai untuk menunda
 * sesuatu sampai setelah hidrasi (mis. memasang <Image> supaya tidak jadi
 * kandidat LCP) tanpa memanggil setState di dalam efek, yang memicu render
 * bertingkat dan ditolak aturan react-hooks/set-state-in-effect.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
