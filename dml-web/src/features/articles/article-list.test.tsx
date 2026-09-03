import { describe, expect, it } from "vitest";
import { resolveMedia, resolveCategory } from "./article-list";

describe("resolveMedia", () => {
  it("mengembalikan objek media saat depth mengembangkannya", () => {
    expect(resolveMedia({ id: 9, url: "/media/a.jpg" } as never)?.url).toBe("/media/a.jpg");
  });

  it("mengembalikan null saat relasi masih berupa id", () => {
    // depth:0 mengembalikan angka. Komponen tidak boleh crash karenanya.
    expect(resolveMedia(9 as never)).toBeNull();
  });
});

describe("resolveCategory", () => {
  it("mengembalikan objek kategori saat depth mengembangkannya", () => {
    expect(resolveCategory({ id: 3, name: "Operasi", slug: "operasi" } as never)?.name).toBe(
      "Operasi",
    );
  });

  it("mengembalikan null saat relasi masih berupa id", () => {
    expect(resolveCategory(3 as never)).toBeNull();
  });
});
