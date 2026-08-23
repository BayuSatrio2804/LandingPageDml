import { getPayload } from "payload";
import config from "@payload-config";
import type { Post } from "@/payload/payload-types";

/**
 * Satu-satunya pintu query artikel di seluruh aplikasi, dan itu disengaja.
 *
 * Local API payload.find() memakai overrideAccess: true secara default,
 * jadi access.read pada koleksi Posts TIDAK berlaku untuk Server Component.
 * Penyaringan draft harus dilakukan di sini, di kode aplikasi. Menyebar
 * payload.find({ collection: "posts" }) ke banyak berkas berarti cepat atau
 * lambat ada satu yang lupa menyaring, dan artikel draft tayang ke publik
 * dengan build hijau serta seluruh tes unit hijau.
 *
 * Kalau suatu saat butuh query artikel yang belum ditangani di sini,
 * tambahkan fungsinya di berkas ini. Jangan memanggil payload.find untuk
 * koleksi posts dari tempat lain.
 */
export const PUBLISHED_WHERE = { _status: { equals: "published" } } as const;

async function client() {
  return getPayload({ config });
}

/**
 * Kegagalan database TIDAK dilempar oleh fungsi daftar, dan ini keputusan
 * arsitektur, bukan penanganan galat yang malas.
 *
 * `next build` memprerender `/` (seksi Artikel Terbaru), `/artikel`, dan
 * memanggil generateStaticParams untuk `/artikel/[slug]`. Kalau ketiganya
 * melempar saat database tidak terjangkau, build gagal di setiap lingkungan
 * yang tidak punya Postgres, dan yang paling penting: di stage builder
 * Dockerfile, yang memang tidak berada di jaringan yang sama dengan service
 * database saat `docker compose up --build` berjalan.
 *
 * Situs yang tayang tanpa artikel sementara jauh lebih ringan daripada situs
 * yang tidak bisa dibangun sama sekali. Hook revalidasi memulihkan isinya
 * pada publikasi berikutnya, dan `/` juga memasang `revalidate` sebagai
 * jaring kedua.
 *
 * findPublishedPost sengaja TIDAK ikut aturan ini; lihat komentarnya sendiri.
 */
export async function listPublishedPosts(limit?: number): Promise<Post[]> {
  try {
    const payload = await client();
    const result = await payload.find({
      collection: "posts",
      where: PUBLISHED_WHERE,
      sort: "-publishedAt",
      depth: 1,
      ...(limit === undefined ? {} : { limit }),
    });
    return result.docs as Post[];
  } catch (error) {
    console.error("artikel: gagal memuat daftar", error);
    return [];
  }
}

/**
 * Ini SATU-SATUNYA query artikel yang melempar saat database gagal, dan
 * bedanya disengaja. Menelan galat di sini mengubah gangguan database sesaat
 * jadi 404 untuk artikel yang sebenarnya ada, dan 404 dibaca mesin pencari
 * sebagai sinyal permanen. Melempar berarti error boundary yang tampil
 * dengan status 500, yang justru sinyal sementara.
 */
export async function findPublishedPost(slug: string): Promise<Post | null> {
  const payload = await client();
  const result = await payload.find({
    collection: "posts",
    where: { and: [{ slug: { equals: slug } }, PUBLISHED_WHERE] },
    depth: 1,
    limit: 1,
  });
  return (result.docs[0] as Post | undefined) ?? null;
}

export async function listPublishedSlugs(): Promise<string[]> {
  try {
    const payload = await client();
    const result = await payload.find({
      collection: "posts",
      where: PUBLISHED_WHERE,
      depth: 0,
      limit: 1000,
      select: { slug: true },
    });
    return (result.docs as Array<{ slug: string }>).map((doc) => doc.slug);
  } catch (error) {
    console.error("artikel: gagal memuat slug", error);
    return [];
  }
}
