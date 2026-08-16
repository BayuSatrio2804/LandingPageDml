const HEX_PATTERN = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Menguraikan hex tiga atau enam digit menjadi tiga kanal 0 sampai 255.
 * Melempar untuk masukan yang tidak sah, karena nilai NaN yang mengalir diam
 * diam akan membuat pemeriksaan kontras lolos tanpa pernah benar benar diuji.
 */
function parseHex(hex: string): [number, number, number] {
  const [, digits] = HEX_PATTERN.exec(hex.trim()) ?? [];
  if (digits === undefined) {
    throw new Error(`Nilai hex tidak sah: ${JSON.stringify(hex)}`);
  }
  const raw =
    digits.length === 3
      ? digits
          .split("")
          .map((c) => c + c)
          .join("")
      : digits;
  return [
    parseInt(raw.slice(0, 2), 16),
    parseInt(raw.slice(2, 4), 16),
    parseInt(raw.slice(4, 6), 16),
  ];
}

/**
 * Ambang 0.04045 adalah titik potong sRGB menurut IEC 61966-2-1. Teks WCAG 2.x
 * menuliskan 0.03928, dan untuk seluruh kanal delapan bit kedua ambang itu
 * memberi hasil yang identik, jadi perbedaannya tekstual, bukan fungsional.
 */
function channelToLinear(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.04045
    ? srgb / 12.92
    : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

/** Luminansi relatif menurut WCAG 2.1, rentang 0 sampai 1. */
export function relativeLuminance(hex: string): number {
  const [red, green, blue] = parseHex(hex);
  const r = channelToLinear(red);
  const g = channelToLinear(green);
  const b = channelToLinear(blue);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Rasio kontras WCAG antara dua warna, rentang 1 sampai 21. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}
