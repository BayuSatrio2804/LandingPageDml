/**
 * Memetakan progress scroll ke pasangan kelas yang sedang di-crossfade.
 * Dipisah dari canvas supaya bisa diuji tanpa WebGL: aritmetika batas di sini
 * yang dulu menghasilkan indeks di luar batas dan canvas kosong senyap.
 */
export function activeClassIndex(
  progress: number,
  count: number,
): { index: number; blend: number } {
  if (count <= 1) return { index: 0, blend: 0 };
  const clamped = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
  const position = clamped * (count - 1);
  const index = Math.min(Math.floor(position), count - 1);
  return { index, blend: position - index };
}
