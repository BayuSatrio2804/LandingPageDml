import { describe, expect, it } from "vitest";
import { FLEET_MODEL_BY_SLUG, MODEL_CREDITS } from "./model-credits";
import { FLEET_CLASSES_SEED as FLEET_CLASSES } from "@/lib/cms/fleet-classes-seed";

describe("MODEL_CREDITS", () => {
  // Seluruh model berlisensi CC Attribution, bukan CC0. Kredit yang hilang
  // bukan cuma soal sopan santun, itu pelanggaran syarat lisensi.
  it("setiap entri punya penulis, tautan penulis, dan nama lisensi", () => {
    expect(MODEL_CREDITS.length).toBeGreaterThan(0);
    for (const credit of MODEL_CREDITS) {
      expect(credit.author.trim()).not.toBe("");
      expect(credit.authorUrl).toMatch(/^https:\/\/sketchfab\.com\//);
      expect(credit.modelUrl).toMatch(/^https:\/\/sketchfab\.com\/3d-models\//);
      expect(credit.license).toMatch(/CC/);
    }
  });

  it("setiap id unik", () => {
    expect(new Set(MODEL_CREDITS.map((c) => c.id)).size).toBe(MODEL_CREDITS.length);
  });

  it("setiap localPath menunjuk ke public/models", () => {
    for (const credit of MODEL_CREDITS) {
      expect(credit.localPath).toMatch(/^\/models\/[a-z0-9-]+\.glb$/);
    }
  });
});

describe("FLEET_MODEL_BY_SLUG", () => {
  it("punya entri untuk setiap kelas armada", () => {
    for (const fleetClass of FLEET_CLASSES) {
      expect(FLEET_MODEL_BY_SLUG).toHaveProperty(fleetClass.slug);
    }
  });

  // SPOB dan oil barge tidak punya model di sumber manapun, jadi keduanya
  // memang null dan dibangun dari geometri di Task 11. Test ini yang
  // memastikan keduanya tidak diam-diam dipetakan ke model tanker.
  it("SPOB dan oil barge tidak dipetakan ke model apa pun", () => {
    expect(FLEET_MODEL_BY_SLUG["spob"]).toBeNull();
    expect(FLEET_MODEL_BY_SLUG["oil-barge"]).toBeNull();
  });

  it("tiga kelas sisanya dipetakan ke berkas yang terdaftar di MODEL_CREDITS", () => {
    const paths = new Set(MODEL_CREDITS.map((c) => c.localPath));
    for (const slug of ["motor-tanker", "tugboat", "ro-ro-ferry"]) {
      const path = FLEET_MODEL_BY_SLUG[slug];
      expect(path).not.toBeNull();
      expect(paths.has(path as string)).toBe(true);
    }
  });
});
