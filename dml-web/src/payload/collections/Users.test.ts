import { describe, expect, it } from "vitest";
import { Users } from "./Users";

describe("Users", () => {
  it("punya field name yang wajib diisi", () => {
    const name = Users.fields.find(
      (field) => "name" in field && field.name === "name",
    );
    expect(name).toBeDefined();
    expect(name).toMatchObject({ type: "text", required: true });
  });

  it("memakai name sebagai judul, bukan email", () => {
    // Sebelum Plan 9 nilainya "email", yang membuat daftar user dan dropdown
    // relasi penulis di admin menampilkan alamat email sebagai judul baris.
    expect(Users.admin?.useAsTitle).toBe("name");
  });
});
