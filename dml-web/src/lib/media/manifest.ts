export type MediaSetId = "hari" | "lini-bisnis" | "bisnis" | "alur-sts";

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
  bisnis: [
    { id: "hub-bisnis", basePath: "/media/bisnis/hub-bisnis", widths: STANDARD_WIDTHS, alt: "Foto udara dermaga penyeberangan dengan beberapa kapal ro-ro bersandar di jetty, kawasan pemukiman dan pelabuhan terlihat di latar" },
    { id: "lini-bbm", basePath: "/media/bisnis/lini-bbm", widths: STANDARD_WIDTHS, alt: "Dua motor tanker, Sri Yuliani dan MT AS Marine Satu, bersandar sisi-ke-sisi dilihat dari atas, geladak hijau dan crane kapal terlihat" },
    { id: "lini-roro", basePath: "/media/bisnis/lini-roro", widths: STANDARD_WIDTHS, alt: "KMP Jambo IX dan KMP Jambo X, kapal ro-ro PT Dutabahari Menara Line, bersandar berdampingan di dermaga dengan nama kapal terlihat jelas di lambung" },
  ],
  "alur-sts": [
    { id: "alur-sts-1", basePath: "/media/alur-sts/alur-sts-1", widths: STANDARD_WIDTHS, alt: "Motor tanker Sri Yuliani bersandar dengan tongkang biru di laut lepas, kapal-kapal lain terlihat di kejauhan pada siang hari cerah" },
    { id: "alur-sts-2", basePath: "/media/alur-sts/alur-sts-2", widths: STANDARD_WIDTHS, alt: "SPOB United X bersandar sisi-ke-sisi dengan Sri Yuliani dilihat dari atas, tali tambat dan fender terlihat menahan kedua kapal" },
    { id: "alur-sts-3", basePath: "/media/alur-sts/alur-sts-3", widths: STANDARD_WIDTHS, alt: "Dua awak kapal berseragam oranye menyeberangi jembatan penghubung antar geladak tanker untuk memasang selang transfer BBM" },
  ],
};

export function avifSrc(asset: MediaAsset, width: number): string {
  return `${asset.basePath}-${width}.avif`;
}

export function avifSrcSet(asset: MediaAsset): string {
  return asset.widths.map((width) => `${avifSrc(asset, width)} ${width}w`).join(", ");
}
