import Link from "next/link";
import { NAV_ITEMS } from "@/content/navigation";
import { COMPANY } from "@/content/company";
import { ExternalLink } from "./external-link";
import { MobileMenu } from "./mobile-menu";

export function SiteHeader() {
  return (
    /*
     * Pita navy penuh, sepasang dengan kaki halaman. Solid, bukan bg-accent/90:
     * contrast-tokens.spec.ts membandingkan latar efektif dengan nilai accent
     * persis, dan varian beropasitas menghasilkan rgba(...) yang tidak cocok,
     * jadi seluruh header akan dilewati diam-diam oleh pemeriksaan itu.
     *
     * text-on-accent dipasang di elemen header, bukan per-anak, supaya wordmark
     * dan ikon hamburger ikut putih. Ikon bukan simpul teks, jadi e2e tidak
     * akan pernah menangkapnya kalau ia tertinggal mewarisi ink.
     *
     * Tautan nav memakai surface-3 dan menguat ke on-accent saat hover. Dua
     * warna itu, dan cuma dua itu, yang ada di allowlist e2e.
     */
    <header className="isolate sticky top-0 z-40 h-16 border-b border-on-accent/20 bg-accent text-on-accent md:h-[72px]">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-4 md:px-8">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight"
        >
          {COMPANY.shortName}
        </Link>

        <nav aria-label="Navigasi utama" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                {item.external ? (
                  <ExternalLink
                    href={item.href}
                    label={item.label}
                    className="inline-flex items-center gap-1 text-sm text-surface-3 transition-colors hover:text-on-accent"
                  />
                ) : (
                  <Link
                    href={item.href}
                    className="text-sm text-surface-3 transition-colors hover:text-on-accent"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <MobileMenu items={NAV_ITEMS} />
      </div>
    </header>
  );
}
