#!/usr/bin/env bun
import { writeFile } from "node:fs/promises";
import { MAP_BOUNDS } from "../src/features/route-map/projection";

const SOURCE =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_land.geojson";
const OUT = new URL("../src/features/route-map/coastline.json", import.meta.url).pathname;
const MAX_BYTES = 60_000;

/**
 * Toleransi Douglas-Peucker dalam derajat. 0,01 derajat sekitar 1,1 km, cukup
 * halus untuk zoom terjauh peta ini dan cukup kasar untuk membuang puluhan
 * ribu titik pantai berlekuk yang tidak pernah terlihat.
 */
const TOLERANCE = 0.01;

type Ring = number[][];

function insideBounds(point: number[]): boolean {
  const lon = point[0] ?? 0;
  const lat = point[1] ?? 0;
  return (
    lon >= MAP_BOUNDS.minLon &&
    lon <= MAP_BOUNDS.maxLon &&
    lat >= MAP_BOUNDS.minLat &&
    lat <= MAP_BOUNDS.maxLat
  );
}

function perpendicularDistance(point: number[], start: number[], end: number[]): number {
  const px = point[0] ?? 0;
  const py = point[1] ?? 0;
  const sx = start[0] ?? 0;
  const sy = start[1] ?? 0;
  const ex = end[0] ?? 0;
  const ey = end[1] ?? 0;
  const dx = ex - sx;
  const dy = ey - sy;
  if (dx === 0 && dy === 0) return Math.hypot(px - sx, py - sy);
  const t = ((px - sx) * dx + (py - sy) * dy) / (dx * dx + dy * dy);
  const clamped = Math.min(1, Math.max(0, t));
  return Math.hypot(px - (sx + clamped * dx), py - (sy + clamped * dy));
}

function simplify(ring: Ring, tolerance: number): Ring {
  if (ring.length < 3) return ring;
  let maxDistance = 0;
  let index = 0;
  for (let i = 1; i < ring.length - 1; i += 1) {
    const distance = perpendicularDistance(ring[i]!, ring[0]!, ring[ring.length - 1]!);
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }
  if (maxDistance <= tolerance) return [ring[0]!, ring[ring.length - 1]!];
  const left = simplify(ring.slice(0, index + 1), tolerance);
  const right = simplify(ring.slice(index), tolerance);
  return [...left.slice(0, -1), ...right];
}

function round(ring: Ring): Ring {
  return ring.map(([lon, lat]) => [Number(lon!.toFixed(3)), Number(lat!.toFixed(3))]);
}

async function main(): Promise<void> {
  console.log(`Mengunduh ${SOURCE}`);
  const response = await fetch(SOURCE);
  if (!response.ok) throw new Error(`Gagal mengunduh garis pantai: HTTP ${response.status}`);
  const geojson = (await response.json()) as {
    features: { geometry: { type: string; coordinates: unknown } }[];
  };

  const polygons: Ring[] = [];
  for (const feature of geojson.features) {
    const { type, coordinates } = feature.geometry;
    const candidates =
      type === "Polygon"
        ? [(coordinates as Ring[])[0]!]
        : type === "MultiPolygon"
          ? (coordinates as Ring[][]).map((polygon) => polygon[0]!)
          : [];

    for (const ring of candidates) {
      if (!ring.some(insideBounds)) continue;
      const simplified = round(simplify(ring, TOLERANCE));
      if (simplified.length >= 4) polygons.push(simplified);
    }
  }

  const payload = JSON.stringify({ polygons });
  if (payload.length > MAX_BYTES) {
    throw new Error(
      `coastline.json ${payload.length} byte, melewati anggaran ${MAX_BYTES}. Naikkan TOLERANCE.`,
    );
  }

  await writeFile(OUT, payload);
  console.log(`OK ${polygons.length} poligon, ${payload.length} byte, ditulis ke ${OUT}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
