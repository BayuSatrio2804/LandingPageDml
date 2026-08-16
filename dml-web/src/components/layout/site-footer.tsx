import Link from "next/link";
import { COMPANY } from "@/content/company";
import { FOOTER_GROUPS } from "@/content/navigation";
import { ExternalLink } from "./external-link";

export function SiteFooter() {
  return (
    <footer className="border-t border-surface-3 bg-surface-2">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-16 md:grid-cols-[2fr_1fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-xl font-bold">{COMPANY.legalName}</p>
          <p className="mt-3 max-w-[38ch] text-sm text-ink-muted">
            Perusahaan pelayaran Banjarmasin sejak 1985. Bagian dari{" "}
            {COMPANY.parent}.
          </p>
          <address className="mt-6 space-y-4 not-italic text-sm text-ink-muted">
            {COMPANY.offices.map((office) => (
              <div key={office.street}>
                <p className="text-ink">{office.label}</p>
                <p>{office.street}</p>
                <p>
                  {office.city} {office.postalCode}, {office.province}
                </p>
              </div>
            ))}
          </address>
        </div>

        {FOOTER_GROUPS.map((group) => (
          <div key={group.heading}>
            <p className="font-display text-sm font-bold">{group.heading}</p>
            <ul className="mt-4 space-y-3">
              {group.items.map((item) => (
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
          </div>
        ))}
      </div>

      <div className="border-t border-surface-3">
        <div className="mx-auto max-w-[1400px] px-4 py-6 text-xs text-ink-muted md:px-8">
          <p>
            {new Date().getFullYear()} {COMPANY.legalName}
          </p>
        </div>
      </div>
    </footer>
  );
}
