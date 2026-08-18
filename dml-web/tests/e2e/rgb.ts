/** Mengubah "#RRGGBB" jadi bentuk "rgb(r, g, b)" seperti yang dikembalikan getComputedStyle. */
export function hexToRgbString(hex: string): string {
  const digits = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(digits.slice(index, index + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
}
