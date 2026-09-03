import Link from "next/link";
import type { CompanyProfileData, SiteNavigationData } from "@/lib/cms/company";
import { getCompanyProfile, getSiteNavigation } from "@/lib/cms/company";
import { MODEL_CREDITS } from "@/content/model-credits";
import { ExternalLink } from "./external-link";

/**
 * Kaki halaman navy. Sejak Plan 5 ini adalah penutup, bukan seksi yang
 * membalik tema di tengah scroll: bidang navy solid menahan halaman terang
 * supaya tidak berakhir menggantung di putih. Sejak Plan 7 kepala halaman
 * memakai pita navy yang sama (site-header.tsx), jadi kaki halaman ini bukan
 * lagi satu-satunya blok berwarna penuh di halaman.
 *
 * Teks sekundernya memakai token surface-3 apa adanya, bukan putih beropasitas.
 * surface3 di atas accent terukur 7,96:1 sejak palet Plan 7 (naik dari 6,64:1
 * di palet lama); putih 60 persen jatuh jauh di bawah itu dan atribusi
 * lisensi CC BY di bawah wajib tetap lolos AA.
 *
 * Dipisah dari SiteFooter (pembungkus async) supaya bisa dites tanpa
 * database: React Testing Library tidak bisa merender Server Component
 * async langsung (pola sama seperti LatestArticlesView/LatestArticles di
 * features/articles/latest-articles.tsx).
 */
export function SiteFooterView({
  company,
  footerGroups,
}: {
  company: CompanyProfileData;
  footerGroups: SiteNavigationData["footerGroups"];
}) {
  return (
    <footer className="bg-accent text-on-accent">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-4 py-16 md:grid-cols-[2fr_1fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-xl font-bold">{company.legalName}</p>
          <p className="mt-3 max-w-[38ch] text-sm text-surface-3">
            Perusahaan pelayaran Banjarmasin sejak 1988. Bagian dari{" "}
            {company.parent}.
          </p>
          <address className="mt-6 space-y-4 not-italic text-sm text-surface-3">
            {company.offices.map((office) => (
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

        {footerGroups.map((group) => (
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
            {new Date().getFullYear()} {company.legalName}
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

export async function SiteFooter() {
  const [company, { footerGroups }] = await Promise.all([getCompanyProfile(), getSiteNavigation()]);
  return <SiteFooterView company={company} footerGroups={footerGroups} />;
}
