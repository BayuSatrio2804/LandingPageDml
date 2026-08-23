#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import sharp from "sharp";
import { CERT_BADGES } from "../src/content/certifications";
import { TOKENS } from "../src/lib/tokens";

/**
 * Membangkitkan placeholder logo sertifikasi. Dijalankan sekali, hasilnya
 * di-commit; ini bukan langkah build. Begitu klien mengirim logo resmi,
 * timpa berkas PNG di public/assets/cert/ dengan nama yang sama dan script
 * ini tidak perlu dijalankan lagi.
 *
 * Placeholder mencantumkan nama standarnya sebagai teks supaya tidak terbaca
 * sebagai kotak kosong saat direview, dan memakai token palet supaya tidak
 * menabrak bidang navy hero.
 */
const OUT_DIR = new URL("../public/assets/cert/", import.meta.url).pathname;
const WIDTH = 240;
const HEIGHT = 160;

function placeholderSvg(label: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" rx="12" fill="${TOKENS.surface2}"/>
  <rect x="6" y="6" width="${WIDTH - 12}" height="${HEIGHT - 12}" rx="8" fill="none"
        stroke="${TOKENS.line}" stroke-width="2" stroke-dasharray="8 6"/>
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 - 4}" text-anchor="middle"
        font-family="sans-serif" font-size="24" font-weight="700" fill="${TOKENS.accent}">${label}</text>
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 26}" text-anchor="middle"
        font-family="sans-serif" font-size="13" fill="${TOKENS.inkMuted}">placeholder</text>
</svg>`;
}

await mkdir(OUT_DIR, { recursive: true });

for (const badge of CERT_BADGES) {
  const fileName = badge.assetPath.split("/").pop();
  if (!fileName) throw new Error(`assetPath tidak sah: ${badge.assetPath}`);
  const out = `${OUT_DIR}${fileName}`;
  await sharp(Buffer.from(placeholderSvg(badge.name))).png({ compressionLevel: 9 }).toFile(out);
  console.log(`${badge.name} -> ${out}`);
}
