"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 768px)";

function subscribe(onStoreChange: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

/**
 * Sama seperti usePrefersReducedMotion: server dan render pertama saat hidrasi
 * belum tahu lebar viewport asli, jadi snapshot server harus tetap konstan dan
 * React sendiri yang menyinkronkannya setelah hidrasi.
 *
 * Dipakai untuk memutuskan apakah sebuah seksi boleh membajak scroll. Seksi
 * yang dipaku selama beberapa layar bekerja baik dengan roda scroll, tapi di
 * layar sentuh ia menahan gestur pengguna dan memampatkan peta ke pita tipis
 * di tengah viewport tinggi. Di bawah 768 px, seksi-seksi itu memilih tata
 * letak bertumpuk biasa.
 */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
