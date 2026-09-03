import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CERTIFICATIONS_SEED } from "./certifications-seed";
import { COMPANY_PROFILE_SEED } from "./company-seed";

const here = import.meta.url;
const CERT_DIR = fileURLToPath(new URL("../../../public/assets/cert/", here));

describe("CERTIFICATIONS_SEED", () => {
  it("berisi tiga lencana", () => {
    expect(CERTIFICATIONS_SEED).toHaveLength(3);
  });

  it("setiap badgeFile benar-benar ada di public/assets/cert/", () => {
    for (const cert of CERTIFICATIONS_SEED) {
      expect(existsSync(`${CERT_DIR}${cert.badgeFile}`), `badge hilang: ${cert.badgeFile}`).toBe(
        true,
      );
    }
  });

  it("setiap nama yang bersumber cp-pdf benar-benar ada di COMPANY_PROFILE_SEED.standards", () => {
    const known = COMPANY_PROFILE_SEED.standards.flatMap((cluster) =>
      cluster.items.map((item) => item.name),
    );
    for (const cert of CERTIFICATIONS_SEED) {
      if (cert.source !== "cp-pdf") continue;
      expect(known, `${cert.name} tidak ada di COMPANY_PROFILE_SEED.standards`).toContain(cert.name);
    }
  });

  it("setiap lencana punya alt text bahasa Indonesia non-kosong", () => {
    for (const cert of CERTIFICATIONS_SEED) {
      expect(cert.alt.trim().length).toBeGreaterThan(0);
    }
  });
});
