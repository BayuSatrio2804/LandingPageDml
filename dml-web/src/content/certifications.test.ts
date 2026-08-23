import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CERT_BADGES } from "./certifications";
import { COMPANY } from "./company";

// import.meta.url disimpan ke variabel dulu: Vite mengenali pola literal
// `new URL("...", import.meta.url)` sebagai referensi aset statis dan
// menulis ulang ke semantik browser (self.location), yang bukan URL file://
// di lingkungan jsdom vitest. Memutus pola sintaksisnya menghindari itu.
const here = import.meta.url;
const PUBLIC_DIR = fileURLToPath(new URL("../../public/", here));

describe("CERT_BADGES", () => {
  it("berisi tiga lencana", () => {
    expect(CERT_BADGES).toHaveLength(3);
  });

  /*
   * Ini kontrak inti task ini. Sebelum Plan 6, hero memuat array literal yang
   * menyebut HSSE, sementara COMPANY.standards tidak pernah memuatnya. Dua
   * daftar sertifikasi yang tidak saling tahu adalah cara paling mudah untuk
   * memasang klaim yang tidak didukung dokumen ke halaman depan.
   */
  it("setiap nama yang bersumber cp-pdf benar-benar ada di COMPANY.standards", () => {
    const known = COMPANY.standards.flatMap((cluster) => cluster.items.map((item) => item.name));
    for (const badge of CERT_BADGES) {
      if (badge.source !== "cp-pdf") continue;
      expect(known, `${badge.name} tidak ada di COMPANY.standards`).toContain(badge.name);
    }
  });

  /*
   * Bug yang memicu task ini: hero merujuk /assets/cert/iso-9001.png dan dua
   * saudaranya, dan public/assets/ tidak pernah ada. Tiga gambar rusak di
   * setiap desktop, dan tak satu pun tes menangkapnya karena elemennya cuma
   * dipasang setelah hidrasi. Tes ini yang menahannya kambuh — termasuk nanti
   * saat placeholder ditukar aset asli klien dan nama filenya berubah.
   */
  it("setiap path aset benar-benar ada di public/", () => {
    for (const badge of CERT_BADGES) {
      const absolute = `${PUBLIC_DIR}${badge.assetPath.replace(/^\//, "")}`;
      expect(existsSync(absolute), `aset hilang: ${badge.assetPath}`).toBe(true);
    }
  });

  it("setiap lencana punya alt text bahasa Indonesia non-kosong", () => {
    for (const badge of CERT_BADGES) {
      expect(badge.alt.trim().length).toBeGreaterThan(0);
    }
  });
});
