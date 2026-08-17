export type MediaSetId = "hero-malam" | "hari" | "lini-bisnis";

export type MediaAsset = {
  id: string;
  basePath: string;
  widths: readonly number[];
  alt: string;
};

const STANDARD_WIDTHS = [640, 1080, 1600, 2400] as const;

export const MEDIA: Record<MediaSetId, MediaAsset[]> = {
  "hero-malam": [
    { id: "dji-0811", basePath: "/media/hero-malam/dji-0811", widths: STANDARD_WIDTHS, alt: "Dua kapal STS bersandar malam hari dari udara, lampu sorot deck menyala di haluan" },
    { id: "dji-0812", basePath: "/media/hero-malam/dji-0812", widths: STANDARD_WIDTHS, alt: "Dua kapal STS bersandar malam hari, tampak selang dan manifold di antara lambung" },
    { id: "dji-0813", basePath: "/media/hero-malam/dji-0813", widths: STANDARD_WIDTHS, alt: "Dua kapal STS bersandar malam hari, sudut pandang udara sedikit bergeser" },
    { id: "dji-0814", basePath: "/media/hero-malam/dji-0814", widths: STANDARD_WIDTHS, alt: "Dua kapal STS bersandar malam hari, geladak hijau menyala di bawah lampu deck" },
    { id: "dji-0815", basePath: "/media/hero-malam/dji-0815", widths: STANDARD_WIDTHS, alt: "Dua kapal STS bersandar malam hari, air laut gelap di sekeliling lambung" },
    { id: "dji-0816", basePath: "/media/hero-malam/dji-0816", widths: STANDARD_WIDTHS, alt: "Dua kapal STS bersandar malam hari, pandangan udara dari sisi haluan" },
    { id: "dji-0817", basePath: "/media/hero-malam/dji-0817", widths: STANDARD_WIDTHS, alt: "Dua kapal STS bersandar malam hari, lampu sorot memantul di permukaan air" },
    { id: "dji-0818", basePath: "/media/hero-malam/dji-0818", widths: STANDARD_WIDTHS, alt: "Dua kapal STS bersandar malam hari, sudut pandang udara agak menjauh" },
    { id: "dji-0819", basePath: "/media/hero-malam/dji-0819", widths: STANDARD_WIDTHS, alt: "Dua kapal STS bersandar malam hari, struktur deck dan tangga terlihat jelas" },
    { id: "dji-0820", basePath: "/media/hero-malam/dji-0820", widths: STANDARD_WIDTHS, alt: "Dua kapal STS bersandar malam hari, pandangan udara penutup dari operasi STS" },
  ],
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

export function webpSrc(asset: MediaAsset, width: number): string {
  return `${asset.basePath}-${width}.webp`;
}
