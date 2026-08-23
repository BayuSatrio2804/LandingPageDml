#!/usr/bin/env bun
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE, loadOgFont, toOgSafeImageDataUri } from "../src/lib/seo/og-template";

/**
 * Membangkitkan kartu OG korporat. Dijalankan sekali, hasilnya di-commit;
 * ini bukan langkah build. Lihat spec Plan 9 bagian 5.2.
 *
 * Percobaan pertama task ini memakai konvensi berkas opengraph-image.tsx
 * milik Next supaya seluruh halaman dalam grup (site) mewarisi gambar ini
 * otomatis. Itu terbukti gagal: buildMetadata() memanggil generateMetadata
 * yang mengembalikan objek openGraph miliknya sendiri di SETIAP halaman
 * (title, description, url per halaman), dan aturan merge Next bersifat
 * shallow-replace per key -- openGraph anak menggantikan seluruh openGraph
 * induk, bukan digabung field per field. Diverifikasi empiris: dari 7 rute
 * yang diperiksa, cuma "/" yang mewarisi gambarnya; 6 sisanya nihil
 * og:image sama sekali. Kembali ke pendekatan skrip-dan-commit spec asli
 * memecahkan ini tuntas: satu path statis, di-set eksplisit di
 * buildMetadata(), tidak bergantung pada mekanisme inheritance yang ternyata
 * tidak berlaku di sini.
 */
const OUT_PATH = path.join(process.cwd(), "public/og-corporate.png");

async function main() {
  const [font, foto] = await Promise.all([
    loadOgFont(),
    readFile(path.join(process.cwd(), "public/media/bisnis/hub-bisnis-1600.webp")),
  ]);

  const imageUrl = await toOgSafeImageDataUri(foto);

  const response = new ImageResponse(
    (
      <OgCard
        kicker="Sejak 1988, Banjarmasin"
        title="Transportasi BBM dan penyeberangan ro-ro"
        imageUrl={imageUrl}
      />
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "GT America", data: font, style: "normal", weight: 700 }],
    },
  );

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(OUT_PATH, buffer);
  console.log(`og-corporate.png ditulis: ${buffer.length} bytes`);
}

main();
