import { describe, expect, it } from "vitest";
import { Posts } from "./Posts";

function fieldNamed(name: string) {
  return Posts.fields.find((field) => "name" in field && field.name === name);
}

describe("Posts", () => {
  it("mengaktifkan draft lewat versions, bukan lewat field _status", () => {
    // _status bukan field yang ditulis tangan. Ia lahir dari versions.drafts,
    // dan perbedaan itu menentukan bentuk migrasinya: drafts membangkitkan
    // tabel versi terpisah (_posts_v beserta anaknya).
    expect(Posts.versions).toMatchObject({ drafts: true });
    expect(fieldNamed("_status")).toBeUndefined();
  });

  it("slug unik dan terindeks", () => {
    expect(fieldNamed("slug")).toMatchObject({
      type: "text",
      unique: true,
      index: true,
    });
  });

  it("coverImage wajib dan menunjuk koleksi media", () => {
    expect(fieldNamed("coverImage")).toMatchObject({
      type: "upload",
      relationTo: "media",
      required: true,
    });
  });

  it("author menunjuk koleksi users", () => {
    expect(fieldNamed("author")).toMatchObject({
      type: "relationship",
      relationTo: "users",
    });
  });

  it("excerpt dibatasi 200 karakter", () => {
    expect(fieldNamed("excerpt")).toMatchObject({ type: "textarea", maxLength: 200 });
  });

  it("pembaca anonim hanya melihat dokumen published", () => {
    // Bukan false. Bentuk where-constraint inilah yang membuat draft tidak
    // pernah bocor sambil tetap terbaca admin yang login.
    const read = Posts.access?.read;
    expect(read).toBeTypeOf("function");
    const anon = read!({ req: { user: null } } as never);
    expect(anon).toEqual({ _status: { equals: "published" } });
  });

  it("pembaca terautentikasi melihat semuanya", () => {
    const read = Posts.access?.read;
    expect(read!({ req: { user: { id: 1 } } } as never)).toBe(true);
  });

  it("tulis hanya untuk user terautentikasi", () => {
    for (const gate of ["create", "update", "delete"] as const) {
      const fn = Posts.access?.[gate];
      expect(fn).toBeTypeOf("function");
      expect(fn!({ req: { user: null } } as never)).toBe(false);
      expect(fn!({ req: { user: { id: 1 } } } as never)).toBe(true);
    }
  });

  it("mengisi slug dari title kalau slug kosong", () => {
    const hook = Posts.hooks?.beforeValidate?.[0];
    expect(hook).toBeTypeOf("function");
    const result = hook!({
      data: { title: "Operasi Ship to Ship di Perairan Dangkal" },
    } as never) as { slug?: string };
    expect(result.slug).toBe("operasi-ship-to-ship-di-perairan-dangkal");
  });

  it("tidak menimpa slug yang sudah diisi tangan", () => {
    const hook = Posts.hooks?.beforeValidate?.[0];
    const result = hook!({
      data: { title: "Judul Baru", slug: "slug-lama" },
    } as never) as { slug?: string };
    expect(result.slug).toBe("slug-lama");
  });
});
