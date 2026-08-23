export type MediaSetId = "hari" | "lini-bisnis";

export type MediaAsset = {
  id: string;
  basePath: string;
  widths: readonly number[];
  alt: string;
};

const STANDARD_WIDTHS = [640, 1080, 1600, 2400] as const;

export const MEDIA: Record<MediaSetId, MediaAsset[]> = {
  hari: [
    { id: "dji-0030", basePath: "/media/hari/dji-0030", widths: STANDARD_WIDTHS, alt: "Trio kapal STS di area labuh jangkar siang hari, deretan kapal lain terlihat di garis cakrawala" },
  ],
  "lini-bisnis": [
    { id: "transportasi-bbm", basePath: "/media/lini-bisnis/transportasi-bbm", widths: STANDARD_WIDTHS, alt: "Motor tanker Sri Yuliani dan MT AS Marine Satu bersandar STS membawa BBM" },
    { id: "penumpang-roro", basePath: "/media/lini-bisnis/penumpang-roro", widths: STANDARD_WIDTHS, alt: "KMP Jambo X bersandar di ramp pelabuhan penyeberangan, pintu rampa terbuka" },
    { id: "operasi-sts", basePath: "/media/lini-bisnis/operasi-sts", widths: STANDARD_WIDTHS, alt: "Dua kapal tanker, Sri Yuliani dan MT AS Marine Satu, bersandar STS haluan-ke-haluan dilihat dari sudut udara oblique, geladak hijau dan crane kapal terlihat siang hari berawan di laut terbuka" },
  ],
};

export function avifSrc(asset: MediaAsset, width: number): string {
  return `${asset.basePath}-${width}.avif`;
}

export function avifSrcSet(asset: MediaAsset): string {
  return asset.widths.map((width) => `${avifSrc(asset, width)} ${width}w`).join(", ");
}
