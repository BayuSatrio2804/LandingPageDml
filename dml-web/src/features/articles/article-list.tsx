import type { Category, Media, Post } from "@/payload/payload-types";

/**
 * Relasi Payload mengembalikan angka saat depth 0 dan objek saat depth
 * lebih tinggi. Query artikel memakai depth 1, tapi komponen tetap
 * menangani bentuk angka supaya ia tidak crash kalau dipanggil dari
 * pemanggil dengan depth berbeda.
 */
export function resolveMedia(value: Post["coverImage"]): Media | null {
  return typeof value === "object" && value !== null ? (value as Media) : null;
}

/** Padanan resolveMedia untuk relasi kategori. */
export function resolveCategory(value: Post["category"]): Category | null {
  return typeof value === "object" && value !== null ? (value as Category) : null;
}
