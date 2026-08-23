import { notFound } from "next/navigation";

/**
 * Route ini ada semata-mata supaya error-boundary.spec.ts punya sesuatu yang
 * benar-benar melempar. Di luar pengujian ia 404, jadi ia tidak pernah
 * terjangkau pengunjung.
 *
 * force-dynamic disengaja: tanpa itu halaman ini diprerender saat build dan
 * nilai env dibekukan ke nilai saat build, sehingga saklarnya tidak bisa
 * dinyalakan dari konfigurasi Playwright. Ia juga sengaja TIDAK masuk
 * STATIC_PATHS di sitemap.ts.
 */
export const dynamic = "force-dynamic";

export default async function UjiGalatPage() {
  if (process.env.E2E_UJI_GALAT !== "1") notFound();
  throw new Error("Galat sengaja untuk menguji error boundary.");
}
