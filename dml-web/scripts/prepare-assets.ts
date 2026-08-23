#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import sharp from "sharp";
import { MEDIA, type MediaAsset } from "../src/lib/media/manifest";

const RAW_DIR = new URL("../../assets/_raw/", import.meta.url).pathname;
const PUBLIC_MEDIA_DIR = new URL("../public/media/", import.meta.url).pathname;

/**
 * Peta manual dari basePath manifest ke lokasi file mentah hasil unzip.
 * Diisi tangan karena kurasi frame adalah keputusan manusia, bukan
 * sesuatu yang bisa ditebak dari nama arsip.
 *
 * Set hero-malam (DJI_0811-0820) dihapus di Plan 6 bersama hero lama. Berkas
 * mentahnya masih ada di assets/_raw/sts-sri-yuliani/; kalau set itu
 * dibutuhkan lagi, kembalikan entrinya di sini dan di MEDIA lalu jalankan
 * bun run prepare-assets.
 */
const RAW_SOURCE: Record<string, string> = {
  "/media/hari/dji-0030": "sts-06-juli/DJI_0030.JPG",
  "/media/lini-bisnis/transportasi-bbm": "sts-sri-yuliani/DJI_0660.JPG",
  "/media/lini-bisnis/penumpang-roro": "kapal-kapal/DJI_0322.JPG",
  "/media/lini-bisnis/operasi-sts": "sts-sri-yuliani/DJI_0750.JPG",
};

async function processAsset(asset: MediaAsset): Promise<void> {
  const rawRelative = RAW_SOURCE[asset.basePath];
  if (!rawRelative) {
    throw new Error(`Tidak ada pemetaan RAW_SOURCE untuk ${asset.basePath}`);
  }
  const rawPath = `${RAW_DIR}${rawRelative}`;
  if (!existsSync(rawPath)) {
    throw new Error(`File mentah tidak ditemukan: ${rawPath}`);
  }

  const outDir = `${PUBLIC_MEDIA_DIR}${asset.basePath.replace("/media/", "")}`.replace(/\/[^/]+$/, "");
  await mkdir(outDir, { recursive: true });

  const outBase = `${PUBLIC_MEDIA_DIR}${asset.basePath.replace("/media/", "")}`;

  for (const width of asset.widths) {
    // EXIF/GPS sengaja tidak dipertahankan: sharp strip semua metadata
    // secara default ketika withMetadata() TIDAK dipanggil. JANGAN
    // tambahkan withMetadata({ exif: {} }) di sini -- itu justru
    // MENGAKTIFKAN mode retensi metadata sharp, dan override kosong tidak
    // menghapus apa pun, sehingga EXIF asli (termasuk GPSLatitude/
    // GPSLongitude milik drone DJI) tetap lolos ke file output.
    // Diverifikasi empiris: exiv2 -pa pada AVIF hasil withMetadata({exif:{}})
    // masih menunjukkan Exif.GPSInfo.GPSLatitude/GPSLongitude penuh.
    const pipeline = sharp(rawPath).rotate().resize({ width, withoutEnlargement: true });
    await pipeline.clone().avif({ quality: 45 }).toFile(`${outBase}-${width}.avif`);
    await pipeline.clone().webp({ quality: 65 }).toFile(`${outBase}-${width}.webp`);
  }

  console.log(`OK ${asset.basePath} (${asset.widths.length} lebar x 2 format)`);
}

async function main(): Promise<void> {
  const allAssets = Object.values(MEDIA).flat();
  for (const asset of allAssets) {
    await processAsset(asset);
  }
  console.log(`Selesai. ${allAssets.length} aset diproses.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
