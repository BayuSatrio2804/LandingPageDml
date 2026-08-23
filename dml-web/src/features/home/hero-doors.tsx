"use client";

import Image from "next/image";
import { MEDIA, avifSrc, type MediaAsset } from "@/lib/media/manifest";

export const DOORS = [
  {
    key: "bbm",
    label: "Transportasi BBM",
    value: 55,
    unit: "Tanker",
    desc: "Pengangkutan bahan bakar dan transfer ship-to-ship untuk klien korporat.",
    mediaId: "operasi-sts",
  },
  {
    key: "roro",
    label: "Penyeberangan Ro-Ro",
    value: 9,
    unit: "Kapal",
    desc: "Penyeberangan untuk penumpang dan kendaraan, dengan tiket daring.",
    mediaId: "penumpang-roro",
  },
] as const;

/**
 * Path dan alt-text foto datang dari MEDIA, bukan ditulis di sini. Sebelum
 * Plan 6 hero menulis "/media/lini-bisnis/operasi-sts-2400.webp" secara
 * harfiah beserta alt-text-nya sendiri, jadi foto yang sama punya dua alt-text
 * berbeda tergantung seksi mana yang menampilkannya.
 */
function assetFor(mediaId: string): MediaAsset {
  const asset = MEDIA["lini-bisnis"].find((entry) => entry.id === mediaId);
  if (!asset) throw new Error(`MEDIA['lini-bisnis'] tidak punya id ${mediaId}`);
  return asset;
}

/**
 * Dua panel foto berbelahan diagonal plus garis jahitannya. Belahannya dibaca
 * dari custom property --hero-split lewat clip-path di globals.css; komponen ini
 * tidak pernah menulis nilai itu, use-hero-choreography yang menulisnya.
 *
 * Lihat KONTRAK LCP di hero.tsx: seluruh isi komponen ini hanya boleh dirender
 * ketika `mounted` true.
 */
export function HeroDoors({
  mounted,
  kbRefs,
}: {
  mounted: boolean;
  kbRefs: React.RefObject<(HTMLDivElement | null)[]>;
}) {
  return (
    <>
      {mounted
        ? DOORS.map((door, index) => (
            <div
              key={door.key}
              data-hero-panel
              className={`absolute inset-0 ${index === 0 ? "hero-panel-a" : "hero-panel-b"}`}
            >
              <div
                ref={(el) => {
                  kbRefs.current[index] = el;
                }}
                className="absolute -inset-y-[7%] -inset-x-[5%]"
              >
                {(() => {
                  const asset = assetFor(door.mediaId);
                  return (
                    <Image
                      src={avifSrc(asset, 2400)}
                      alt={asset.alt}
                      fill
                      sizes="100vw"
                      className={
                        index === 0
                          ? "object-cover brightness-60 contrast-125 saturate-60"
                          : "object-cover brightness-95 contrast-105 saturate-105"
                      }
                    />
                  );
                })()}
              </div>
              {/* Gradasi per sisi: BBM lebih dingin dan industrial, Ro-Ro
                  lebih terang. Tanpa ini belahannya cuma terbaca sebagai
                  garis, bukan sebagai dua lini bisnis. */}
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    index === 0
                      ? "linear-gradient(160deg,rgba(12,32,72,0.52) 0%,rgba(6,16,38,0.68) 100%)"
                      : "linear-gradient(200deg,rgba(96,138,190,0.16) 0%,rgba(10,22,48,0.42) 100%)",
                }}
              />
            </div>
          ))
        : null}
      <div aria-hidden="true" className="hero-seam absolute inset-0 bg-white/42" />
    </>
  );
}
