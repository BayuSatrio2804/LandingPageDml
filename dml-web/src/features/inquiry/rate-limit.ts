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
