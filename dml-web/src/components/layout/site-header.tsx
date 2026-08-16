import Link from "next/link";
import { NAV_ITEMS } from "@/content/navigation";
import { COMPANY } from "@/content/company";
import { ExternalLink } from "./external-link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-surface-3 bg-surface/85 backdrop-blur md:h-[72px]">
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
                    className="inline-flex items-center gap-1 text-sm text-ink-muted transition-colors hover:text-ink"
                  />
                ) : (
                  <Link
                    href={item.href}
                    className="text-sm text-ink-muted transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Menu mobile dibangun di Task 9 sebagai satu-satunya client leaf di header. */}
      </div>
    </header>
  );
}
