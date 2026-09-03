import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CLIENTS_SEED } from "./clients-seed";

const here = import.meta.url;
const CLIENTS_DIR = fileURLToPath(new URL("../../../public/assets/clients/", here));

describe("CLIENTS_SEED", () => {
  it("berisi enam klien", () => {
    expect(CLIENTS_SEED).toHaveLength(6);
  });

  it("setiap logoFile yang diisi benar-benar ada di public/assets/clients/", () => {
    for (const client of CLIENTS_SEED) {
      if (!client.logoFile) continue;
      expect(existsSync(`${CLIENTS_DIR}${client.logoFile}`), `logo hilang: ${client.logoFile}`).toBe(
        true,
      );
    }
  });

  it("AKR Corporindo satu-satunya tanpa logo (placeholder teks)", () => {
    const noLogo = CLIENTS_SEED.filter((client) => !client.logoFile);
    expect(noLogo).toHaveLength(1);
    expect(noLogo[0]?.name).toBe("AKR Corporindo");
  });

  it("tidak ada nama klien duplikat", () => {
    const names = CLIENTS_SEED.map((client) => client.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
