export type ModelCredit = {
  id: string;
  title: string;
  author: string;
  authorUrl: string;
  modelUrl: string;
  license: string;
  sketchfabUid: string;
  localPath: string;
};

/**
 * Seluruh model berlisensi CC Attribution 4.0, bukan CC0, jadi kredit yang
 * terlihat di situs adalah syarat lisensi. Nama penulis dan URL diambil dari
 * GET /v3/models/{uid} pada 18 Agustus 2026, bukan ditulis dari ingatan.
 */
export const MODEL_CREDITS: ModelCredit[] = [
  {
    id: "tanker",
    title: "Tanker Ship",
    author: "Art Blender",
    authorUrl: "https://sketchfab.com/ArtBlender",
    modelUrl: "https://sketchfab.com/3d-models/tanker-ship-96ebf61af42b4062ae98a6ad848e1a25",
    license: "CC BY 4.0",
    sketchfabUid: "96ebf61af42b4062ae98a6ad848e1a25",
    localPath: "/models/tanker.glb",
  },
  {
    id: "ferry",
    title: "Hailuoto car ferry L/A Meriluoto",
    author: "Snowsoup",
    authorUrl: "https://sketchfab.com/snowsoup",
    modelUrl:
      "https://sketchfab.com/3d-models/hailuoto-car-ferry-la-meriluoto-44eaf2dd56b74e76a310d2e532957dbe",
    license: "CC BY 4.0",
    sketchfabUid: "44eaf2dd56b74e76a310d2e532957dbe",
    localPath: "/models/ferry.glb",
  },
  {
    id: "tugboat",
    title: "Rastar 3200 tugboat",
    author: "Brout",
    authorUrl: "https://sketchfab.com/davidbroutian",
    modelUrl: "https://sketchfab.com/3d-models/rastar-3200-tugboat-1bbadbe4ab0a4b2599cd3f450942e6fe",
    license: "CC BY 4.0",
    sketchfabUid: "1bbadbe4ab0a4b2599cd3f450942e6fe",
    localPath: "/models/tugboat.glb",
  },
];

/**
 * SPOB dan oil barge sengaja null. Tidak ada model kedua tipe kapal itu di
 * sumber manapun; keduanya tipe khas Indonesia. Fleet comparator membangun
 * lambungnya dari geometri dan menyamakan materialnya ke model di atas.
 */
export const FLEET_MODEL_BY_SLUG: Record<string, string | null> = {
  "motor-tanker": "/models/tanker.glb",
  "oil-barge": null,
  spob: null,
  tugboat: "/models/tugboat.glb",
  "ro-ro-ferry": "/models/ferry.glb",
};
