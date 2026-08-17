import type { TimelineEntry } from "./types";

/**
 * Sengaja satu entri. Spec dan sumber publik yang tersedia (SinarAlam
 * Corporation, ptdml.com, MagicPort, arsip Banjarmasin Post) hanya
 * mengonfirmasi tanggal pendirian. Tahun ekspansi tiap lini bisnis tidak
 * ada di sumber manapun, dan menambah entri buatan sendiri berarti klien
 * bisa mempublikasikan tanggal yang sebenarnya tebakan.
 */
export const TIMELINE: TimelineEntry[] = [
  {
    year: 1985,
    label: "PT Dutabahari Menara Line didirikan oleh Herman Chandra di Banjarmasin.", // unverified: SinarAlam Corporation
  },
];
