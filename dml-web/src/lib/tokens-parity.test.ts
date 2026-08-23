import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { TOKENS, type TokenName } from "./tokens";

/*
 * tokens.ts dan blok @theme di globals.css memuat nilai yang sama dua kali:
 * TypeScript membutuhkannya untuk menghitung rasio kontras, Tailwind
 * membutuhkannya untuk membangkitkan utility. Sampai Plan 6 kesamaan itu cuma
 * komentar, dan komentar tidak menahan apa pun. Palet Navy Selat masuk lewat
 * suntingan tangan di kedua berkas; suntingan berikutnya yang cuma menyentuh
 * satu sisi akan lolos setiap gerbang dan tampil sebagai warna yang salah.
 */
// import.meta.url disimpan ke variabel dulu: Vite mengenali pola literal
// `new URL("...", import.meta.url)` sebagai referensi aset statis dan
// menulis ulang ke semantik browser (self.location), yang bukan URL file://
// di lingkungan jsdom vitest. Memutus pola sintaksisnya menghindari itu.
const here = import.meta.url;
const CSS = readFileSync(fileURLToPath(new URL("../app/globals.css", here)), "utf8");

/** camelCase di tokens.ts jadi kebab-case di custom property Tailwind. */
function cssVarName(token: TokenName): string {
  return `--color-${token.replace(/([A-Z])/g, "-$1").replace(/(\d+)/g, "-$1").toLowerCase()}`;
}

function readThemeBlock(): Map<string, string> {
  const match = CSS.match(/@theme\s*\{([\s\S]*?)\n\}/);
  if (!match?.[1]) throw new Error("blok @theme tidak ditemukan di globals.css");
  const entries = new Map<string, string>();
  for (const line of match[1].split("\n")) {
    const declaration = line.match(/^\s*(--color-[a-z0-9-]+)\s*:\s*([^;]+);/);
    if (declaration?.[1] && declaration[2]) {
      entries.set(declaration[1], declaration[2].trim().toLowerCase());
    }
  }
  return entries;
}

describe("kesamaan TOKENS dan blok @theme", () => {
  const theme = readThemeBlock();

  it("setiap token punya custom property dengan nilai yang sama", () => {
    for (const [name, value] of Object.entries(TOKENS) as [TokenName, string][]) {
      const variable = cssVarName(name);
      expect(theme.has(variable), `${variable} tidak ada di blok @theme`).toBe(true);
      expect(theme.get(variable), `${variable} berbeda dari TOKENS.${name}`).toBe(
        value.toLowerCase(),
      );
    }
  });

  it("tidak ada custom property warna yang tidak punya pasangan di TOKENS", () => {
    const expected = new Set(
      (Object.keys(TOKENS) as TokenName[]).map((name) => cssVarName(name)),
    );
    const yatim = [...theme.keys()].filter((variable) => !expected.has(variable));
    expect(yatim, "custom property warna tanpa pasangan di tokens.ts").toEqual([]);
  });
});
