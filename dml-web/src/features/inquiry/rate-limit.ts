type RateLimitEntry = { count: number; windowStart: number };

/**
 * In-memory, bukan Postgres-backed. Deployment adalah satu container tanpa
 * horizontal scaling (spec bagian 15), jadi state yang reset saat restart
 * adalah tradeoff yang diterima untuk form lead bervolume rendah, bukan
 * kelalaian.
 */
export function createRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}): { check(key: string): boolean } {
  const store = new Map<string, RateLimitEntry>();

  return {
    check(key: string): boolean {
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || now - entry.windowStart >= windowMs) {
        store.set(key, { count: 1, windowStart: now });
        return true;
      }

      if (entry.count >= limit) return false;

      entry.count += 1;
      return true;
    },
  };
}

/**
 * Ambil alamat klien dari x-forwarded-for dengan cara yang tidak sepele
 * dipalsukan.
 *
 * Header ini disusun kiri ke kanan: entri paling kiri diklaim klien, entri
 * paling kanan ditambahkan proxy terdekat. Kode sebelum Plan 8 memakai entri
 * paling kiri, yang berarti siapa pun bisa mengirim X-Forwarded-For sendiri
 * dan mendapat bucket rate limit baru setiap request.
 *
 * `trustedHops` menyatakan berapa proxy yang berada di depan aplikasi ini.
 * Entri pada posisi itu dihitung dari kanan adalah alamat yang benar-benar
 * dilihat proxy terluar yang kita percayai. Kalau nilainya melebihi jumlah
 * entri, dipakai entri paling kanan, karena mengambil yang lebih kiri hanya
 * akan memilih nilai yang lebih mudah dipalsukan.
 *
 * KETERBATASAN, jangan dibaca lebih kuat dari kenyataannya: penyerang di
 * belakang proxy yang sama tetap berbagi alamat, dan penyerang dengan banyak
 * alamat tetap mendapat banyak bucket. Bucket global di actions.ts yang jadi
 * batas atasnya. Batas sungguhan terhadap penyalahgunaan ada di lapisan
 * infrastruktur.
 */
export function clientKeyFrom(forwardedFor: string | null, trustedHops: number): string {
  if (!forwardedFor) return "unknown";
  const entries = forwardedFor
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
  if (entries.length === 0) return "unknown";
  const hops = Math.max(1, Math.floor(trustedHops));
  const index = Math.max(0, entries.length - hops);
  return entries[index] ?? entries[entries.length - 1] ?? "unknown";
}
