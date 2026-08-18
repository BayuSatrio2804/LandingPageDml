export type Segment = {
  /** Item yang sedang di panggung. */
  index: number;
  /** 0 sampai 1, seberapa jauh item ini sudah menyeberang ke item berikutnya. */
  blend: number;
};

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** Percepatan-perlambatan Hermite. Crossfade linear terbaca patah di ujungnya. */
export function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/**
 * Memetakan progress scroll ke "item mana yang sedang tampil, dan seberapa
 * jauh ia sudah menyeberang ke item berikutnya".
 *
 * Perbedaan penting dari versi Plan 4 (activeClassIndex): di sana blend mulai
 * bergerak begitu progress lebih besar dari nol, jadi kelas pertama sudah
 * meleleh jadi kelas kedua sebelum pengguna selesai membacanya, dan kelas
 * terakhir baru penuh tepat di frame terakhir pin, yang berarti tidak pernah
 * benar-benar terlihat. Keduanya persis dua keluhan yang dilaporkan.
 *
 * Di sini tiap item memiliki satu iris progress yang sama besar. Di dalam
 * irisnya, item DIAM selama (1 - transition) bagian, baru menyeberang di sisa
 * bagiannya. Item terakhir tidak punya tujuan penyeberangan, jadi seluruh
 * irisnya jadi jeda diam. Untuk lima item dan transition 0,35, artinya kelas
 * terakhir berdiri penuh selama 20 persen terakhir scroll, jauh sebelum pin
 * dilepas.
 */
export function segmentAt(progress: number, count: number, transition = 0.35): Segment {
  if (count <= 1) return { index: 0, blend: 0 };
  const safeTransition = Math.min(0.9, Math.max(0.05, transition));
  const raw = clamp01(progress) * count;
  const index = Math.min(Math.floor(raw), count - 1);
  if (index === count - 1) return { index, blend: 0 };

  const within = raw - index;
  const holdEnd = 1 - safeTransition;
  if (within <= holdEnd) return { index, blend: 0 };
  return { index, blend: smoothstep((within - holdEnd) / safeTransition) };
}

/**
 * Opasitas per item dari satu Segment. Dipisah supaya komponen 3D dan komponen
 * DOM memakai aritmetika yang sama persis dan tidak pernah tidak sinkron.
 */
export function segmentOpacities(segment: Segment, count: number): number[] {
  return Array.from({ length: count }, (_, i) => {
    if (i === segment.index) return 1 - segment.blend;
    if (i === segment.index + 1) return segment.blend;
    return 0;
  });
}
