# syntax=docker/dockerfile:1

# Versi bun dipaku ke nilai packageManager di package.json. Membiarkannya
# mengambang berarti image produksi dan mesin pengembangan bisa memakai
# resolver dependency yang berbeda.
FROM oven/bun:1.3.14-slim AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1.3.14-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_SITE_URL dibaca SAAT BUILD, bukan saat runtime: metadataBase
# dan absoluteUrl memakainya, dan nilai NEXT_PUBLIC_ diinlinekan ke bundle.
# Menyerahkannya sebagai environment variable runtime saja menghasilkan
# seluruh canonical dan URL gambar OG menunjuk localhost di produksi,
# sementara situsnya sendiri tetap terlihat normal.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
RUN bun run build

FROM oven/bun:1.3.14-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Dijalankan sebagai pengguna non-root. Direktori upload dibuat dan
# dimilikinya SEBELUM container start, kalau tidak upload pertama gagal
# dengan galat izin yang terbaca seperti bug Payload.
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs \
 && mkdir -p /app/uploads \
 && chown -R nextjs:nodejs /app

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV PAYLOAD_UPLOAD_DIR=/app/uploads
EXPOSE 3000

CMD ["bun", "server.js"]
