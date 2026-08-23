import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { TOKENS } from "@/lib/tokens";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/**
 * ImageResponse merender lewat Satori, yang tidak mengenal next/font dan
 * tidak membaca CSS variable. Fontnya harus diserahkan sebagai ArrayBuffer.
 * Kalau langkah ini dilewati, gambar tetap terbentuk memakai font fallback
 * dan kegagalannya senyap: tidak ada error, cuma tipografi yang salah.
 *
 * Satori/ImageResponse cuma mengenal ttf, otf, dan woff -- BUKAN woff2, dan
 * kegagalannya di sini tidak senyap: build langsung gagal dengan "Unsupported
 * OpenType signature wOF2". Berkas .woff2 di direktori ini dipakai next/font
 * untuk render di browser; .ttf ini turunan sekali-jalan darinya lewat
 * `woff2_decompress`, khusus untuk jalur Satori.
 */
export async function loadOgFont(): Promise<ArrayBuffer> {
  const file = path.join(process.cwd(), "src/fonts/GTAmerica-ExtendedBold.ttf");
  const buffer = await readFile(file);
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
}

/**
 * Satori (mesin di balik ImageResponse) tidak bisa mendekode WebP: `<img>`
 * berisi data URI atau URL WebP membuat build gagal senyap-tapi-fatal ("u2 is
 * not iterable" / "Spread syntax requires ...iterable not be null or
 * undefined" -- tanpa kata "webp" sama sekali di pesannya, jadi tidak
 * tertebak dari galatnya sendiri). Ditemukan empiris lewat isolasi manual di
 * luar Next, bukan didokumentasikan di mana pun.
 *
 * Foto korporat (Task 14) dan cover artikel dari Payload (Task 15) dua-
 * duanya WebP: cover artikel ikut karena Media.ts tidak memaksa format
 * output, jadi apa pun yang diunggah editor lewat /admin tetap format
 * aslinya. Menormalkan ke JPEG di sini, satu tempat, membuat kedua sisi
 * pemanggil aman tanpa perlu tahu format sumbernya -- termasuk kalau nanti
 * ada yang mengunggah PNG atau AVIF.
 */
export async function toOgSafeImageDataUri(bytes: Buffer): Promise<string> {
  const jpeg = await sharp(bytes).jpeg({ quality: 82 }).toBuffer();
  return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
}

/**
 * Satu komposisi untuk kartu korporat dan kartu artikel. Satori hanya
 * mendukung sebagian CSS, jadi gayanya ditulis inline dan flexbox eksplisit,
 * bukan lewat class Tailwind: Satori tidak memproses Tailwind sama sekali.
 */
export function OgCard({
  kicker,
  title,
  imageUrl,
}: {
  kicker: string;
  title: string;
  imageUrl?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        backgroundColor: TOKENS.heroGround,
        position: "relative",
      }}
    >
      {imageUrl ? (
        // Satori merender markup ini sendiri dan tidak mengenal next/image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          width={OG_SIZE.width}
          height={OG_SIZE.height}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.55,
          }}
        />
      ) : null}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "64px",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, color: TOKENS.accentLift }}>{kicker}</div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 62,
            lineHeight: 1.1,
            color: "#FFFFFF",
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", marginTop: 32, fontSize: 24, color: "#C3CEDE" }}>
          PT Dutabahari Menara Line
        </div>
      </div>
    </div>
  );
}
