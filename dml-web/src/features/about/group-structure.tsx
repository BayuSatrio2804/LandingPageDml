import { COMPANY, GROUP_UNITS } from "@/content/company";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeader } from "@/components/ui/section-header";

/**
 * Struktur grup Sinar Alam, cp-pdf hal. 01. Data ini ada di src/content sejak
 * Plan 5 tapi tidak pernah dirender sampai Plan 6 — komentarnya bahkan
 * menyatakan halaman ini memakainya, padahal tidak ada import sama sekali.
 *
 * Dikelompokkan per sektor, bukan sebagai daftar datar, karena empat sektornya
 * bukan kategori yang setara: satu transportir, satu galangan, dan seterusnya.
 * Meratakan semuanya jadi satu daftar menghapus justru informasi yang membuat
 * seksi ini layak ada.
 */
export function GroupStructure() {
  return (
    <section id="grup" className="scroll-mt-24 bg-surface-wash py-20 md:py-28">
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <SectionHeader
          title={`Bagian dari ${COMPANY.parent}`}
          description={`${COMPANY.shortName} beroperasi sebagai salah satu unit usaha grup. Berikut sektor dan perusahaan yang menaunginya.`}
        />
        <Reveal className="mt-8 grid gap-8 md:grid-cols-2">
          {GROUP_UNITS.map((unit) => (
            <div key={unit.sector} className="rounded-card border border-surface-3 bg-surface-2 p-6">
              <p className="font-mono text-xs tracking-[0.16em] text-ink-muted uppercase">
                {unit.sector}
              </p>
              <ul className="mt-4 space-y-2">
                {unit.companies.map((company) => {
                  const isSelf = company === COMPANY.legalName;
                  return (
                    <li
                      key={company}
                      data-testid={isSelf ? "grup-diri-sendiri" : undefined}
                      className={
                        isSelf
                          ? "font-medium text-accent before:mr-2 before:content-['▸']"
                          : "text-ink-muted"
                      }
                    >
                      {company}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
