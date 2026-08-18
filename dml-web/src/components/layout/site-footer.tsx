import Link from "next/link";
import { COMPANY } from "@/content/company";
import { FOOTER_GROUPS } from "@/content/navigation";
import { MODEL_CREDITS } from "@/content/model-credits";
import { ExternalLink } from "./external-link";

/**
 * Kaki halaman navy, satu-satunya blok berwarna penuh di halaman. Ini bukan
 * seksi yang membalik tema di tengah scroll, melainkan penutup: pthis.id
 * memakai pola yang sama (footer background var(--c-primary), tautan #ced9ea),
 * dan blok itu yang menahan halaman terang supaya tidak berakhir menggantung
 * di putih.
 *
 * Teks sekundernya memakai token surface-3 apa adanya, bukan putih beropasitas.
 * #CED9EA di atas navy terukur 6,6:1; putih 60 persen jatuh jauh di bawah itu
 * dan atribusi lisensi CC BY di bawah wajib tetap lolos AA.
 */
export function SiteFooter() {
  return (
    <footer className="bg-accent text-on-accent">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-16 md:grid-cols-[2fr_1fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-xl font-bold">{COMPANY.legalName}</p>
          <p className="mt-3 max-w-[38ch] text-sm text-surface-3">
            Perusahaan pelayaran Banjarmasin sejak 1988. Bagian dari{" "}
            {COMPANY.parent}.
          </p>
          <address className="mt-6 space-y-4 not-italic text-sm text-surface-3">
            {COMPANY.offices.map((office) => (
              <div key={office.street}>
                <p className="text-on-accent">{office.label}</p>
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
          </div>
        ))}
      </div>

      <div className="border-t border-on-accent/20">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-6 text-xs text-surface-3 md:flex-row md:items-center md:justify-between md:px-8">
          <p>
            {new Date().getFullYear()} {COMPANY.legalName}
          </p>
          {/* Atribusi CC BY adalah syarat lisensi model 3D, jadi baris ini
              tidak boleh disembunyikan di balik disclosure atau diredupkan
              di bawah kontras AA. */}
          <p data-testid="kredit-model" className="text-xs text-surface-3">
            Model 3D:{" "}
            {MODEL_CREDITS.map((credit, index) => (
              <span key={credit.id}>
                {index > 0 ? ", " : ""}
                <a href={credit.modelUrl} className="underline decoration-on-accent/40 underline-offset-2 hover:text-on-accent hover:decoration-on-accent" rel="noopener noreferrer" target="_blank">
                  {credit.title}
                </a>{" "}
                oleh{" "}
                <a href={credit.authorUrl} className="underline decoration-on-accent/40 underline-offset-2 hover:text-on-accent hover:decoration-on-accent" rel="noopener noreferrer" target="_blank">
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
