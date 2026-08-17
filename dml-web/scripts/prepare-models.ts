#!/usr/bin/env bun
import { mkdir, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { MODEL_CREDITS } from "../src/content/model-credits";

const RAW_DIR = new URL("../../assets/_raw/models/", import.meta.url).pathname;
const OUT_DIR = new URL("../public/models/", import.meta.url).pathname;
const MAX_BYTES_PER_MODEL = 700_000;
const MAX_BYTES_TOTAL = 2_200_000;

/**
 * Rasio simplify per model. Angka ini hasil inspeksi visual, bukan rumus:
 * lambung tanker punya banyak permukaan datar besar yang tahan desimasi
 * agresif, sedangkan tugboat sudah rendah poligon sejak awal dan rusak kalau
 * dipangkas sekeras itu.
 */
const SIMPLIFY_RATIO: Record<string, number> = {
  tanker: 0.2,
  ferry: 0.35,
  tugboat: 0.6,
};

function requireToken(): string {
  const token = process.env.SKETCHFAB_TOKEN;
  if (!token) {
    throw new Error(
      "SKETCHFAB_TOKEN tidak diisi. Isi di .env.local, ambil dari sketchfab.com/settings/password.",
    );
  }
  return token;
}

async function downloadRaw(uid: string, target: string, token: string): Promise<void> {
  if (existsSync(target)) {
    console.log(`Lewati unduh, sudah ada: ${target}`);
    return;
  }
  const response = await fetch(`https://api.sketchfab.com/v3/models/${uid}/download`, {
    headers: { Authorization: `Token ${token}` },
  });
  if (!response.ok) throw new Error(`Gagal minta tautan unduh ${uid}: HTTP ${response.status}`);
  const payload = (await response.json()) as { glb?: { url: string } };
  const url = payload.glb?.url;
  if (!url) throw new Error(`Sketchfab tidak menyediakan varian glb untuk ${uid}`);

  const file = await fetch(url);
  if (!file.ok) throw new Error(`Gagal mengunduh glb ${uid}: HTTP ${file.status}`);
  await writeFile(target, new Uint8Array(await file.arrayBuffer()));
  console.log(`Terunduh ${target}`);
}

/**
 * Draco, bukan quantize. Diverifikasi saat implementasi: ketiga model dari
 * Sketchfab (tanker, ferry, tugboat) punya lambung tunggal ditambah puluhan
 * bagian kecil terpisah (railing, pipa, tangga) yang masing-masing sudah
 * dekat jumlah segitiga minimalnya. meshoptimizer simplify tidak bisa
 * menembus lantai itu berapa pun --simplify-ratio dan --simplify-error
 * dilonggarkan (diuji sampai ratio=0, error=0.08): tanker mentok di sekitar
 * 5 MB dengan quantize. Draco meraih 214 kB pada model yang sama karena ia
 * mengompresi konektivitas dan posisi lewat pengkodean aritmetika, bukan
 * mengurangi jumlah segitiga. Ini jalan mundur yang sudah didokumentasikan
 * di spec §4.2 poin 5; decoder di-self-host dari
 * node_modules/three/examples/jsm/libs/draco/gltf/ ke public/draco/
 * (~245 kB wasm + wrapper, dimuat lazy hanya saat GLB Draco didekode, tidak
 * pernah masuk bundel awal), dipasang lewat useGLTF(url, "/draco/").
 */
async function optimize(input: string, output: string, ratio: number): Promise<void> {
  const proc = Bun.spawn(
    [
      "bunx",
      "--bun",
      "@gltf-transform/cli@4.4.2",
      "optimize",
      input,
      output,
      "--compress",
      "draco",
      "--texture-compress",
      "webp",
      "--texture-size",
      "1024",
      "--simplify",
      "true",
      "--simplify-ratio",
      String(ratio),
      "--simplify-error",
      "0.02",
    ],
    { stdout: "inherit", stderr: "inherit" },
  );
  const code = await proc.exited;
  if (code !== 0) throw new Error(`gltf-transform optimize gagal untuk ${input}, kode ${code}`);
}

async function main(): Promise<void> {
  const token = requireToken();
  await mkdir(RAW_DIR, { recursive: true });
  await mkdir(OUT_DIR, { recursive: true });

  let total = 0;
  for (const credit of MODEL_CREDITS) {
    const raw = `${RAW_DIR}${credit.id}.glb`;
    const out = `${OUT_DIR}${credit.id}.glb`;
    const ratio = SIMPLIFY_RATIO[credit.id] ?? 0.3;

    await downloadRaw(credit.sketchfabUid, raw, token);
    await optimize(raw, out, ratio);

    const { size } = await stat(out);
    total += size;
    console.log(`${credit.id}: ${(size / 1000).toFixed(0)} kB`);
    if (size > MAX_BYTES_PER_MODEL) {
      throw new Error(
        `${credit.id} ${size} byte, melewati anggaran ${MAX_BYTES_PER_MODEL}. Turunkan SIMPLIFY_RATIO atau ganti ke kandidat cadangan.`,
      );
    }
  }

  if (total > MAX_BYTES_TOTAL) {
    throw new Error(`Total ${total} byte, melewati anggaran ${MAX_BYTES_TOTAL}.`);
  }
  console.log(`Selesai. Total ${(total / 1000).toFixed(0)} kB.`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
