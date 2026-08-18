import Link from "next/link";
import { COMPANY } from "@/content/company";
import { FOOTER_GROUPS } from "@/content/navigation";
import { MODEL_CREDITS } from "@/content/model-credits";
import { ExternalLink } from "./external-link";

export function SiteFooter() {
  return (
    <footer className="border-t border-surface-3 bg-surface-2">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-16 md:grid-cols-[2fr_1fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-xl font-bold">{COMPANY.legalName}</p>
          <p className="mt-3 max-w-[38ch] text-sm text-ink-muted">
            Perusahaan pelayaran Banjarmasin sejak 1988. Bagian dari{" "}
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
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-6 text-xs text-ink-muted md:flex-row md:items-center md:justify-between md:px-8">
          <p>
            {new Date().getFullYear()} {COMPANY.legalName}
          </p>
          {/* Atribusi CC BY adalah syarat lisensi model 3D, jadi baris ini
              tidak boleh disembunyikan di balik disclosure atau diredupkan
              di bawah kontras AA. */}
          <p data-testid="kredit-model" className="text-xs text-ink-muted">
            Model 3D:{" "}
            {MODEL_CREDITS.map((credit, index) => (
              <span key={credit.id}>
                {index > 0 ? ", " : ""}
                <a href={credit.modelUrl} className="hover:text-ink" rel="noopener noreferrer" target="_blank">
                  {credit.title}
                </a>{" "}
                oleh{" "}
                <a href={credit.authorUrl} className="hover:text-ink" rel="noopener noreferrer" target="_blank">
                  {credit.author}
                </a>
              </span>
            ))}
            . Lisensi CC BY 4.0.
          </p>
        </div>
      </div>
    </footer>
  );
}
