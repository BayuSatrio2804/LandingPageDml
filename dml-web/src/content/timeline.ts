import type { TimelineEntry } from "./types";

/**
 * Sengaja satu entri. Company profile resmi (`assets/CP DML.pdf` hal. 01)
 * hanya menyebut satu tanggal: pendirian 30 November 1988 di Banjarmasin oleh
 * Herman Chandra. Tahun ekspansi tiap lini bisnis tidak ada di PDF maupun di
 * sumber publik manapun, dan menambah entri buatan sendiri berarti klien bisa
 * mempublikasikan tanggal yang sebenarnya tebakan.
 *
 * Catatan koreksi: sampai Plan 4, entri ini bertahun 1985 mengikuti halaman
 * profil SinarAlam. PDF resmi menyebut 1988, dan PDF yang menang.
 */
export const TIMELINE: TimelineEntry[] = [
  {
    year: 1988,
    label: "PT Dutabahari Menara Line didirikan Herman Chandra di Banjarmasin.", // cp-pdf hal. 01 dan 02
  },
];
