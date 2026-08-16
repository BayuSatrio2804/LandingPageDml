function expandHex(hex: string): string {
  const raw = hex.replace("#", "");
  if (raw.length === 3) {
    return raw
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return raw;
}

function channelToLinear(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.04045
    ? srgb / 12.92
    : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

/** Luminansi relatif menurut WCAG 2.1, rentang 0 sampai 1. */
export function relativeLuminance(hex: string): number {
  const raw = expandHex(hex);
  const r = channelToLinear(parseInt(raw.slice(0, 2), 16));
  const g = channelToLinear(parseInt(raw.slice(2, 4), 16));
  const b = channelToLinear(parseInt(raw.slice(4, 6), 16));
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
