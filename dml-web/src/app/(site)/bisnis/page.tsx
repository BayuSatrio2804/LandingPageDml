import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MAIN_LINES, AFFILIATES } from "@/content/business-lines";
import { COMPANY } from "@/content/company";
import { MEDIA, avifSrc } from "@/lib/media/manifest";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, safeJsonLdString } from "@/lib/seo/json-ld";
import { SectionHeader } from "@/components/ui/section-header";
import { CtaLink } from "@/components/ui/cta-link";

export const metadata: Metadata = buildMetadata({
  title: "Bisnis Kami | PT Dutabahari Menara Line",
  description:
    "Dua lini yang dijalankan PT Dutabahari Menara Line sendiri, transportasi BBM dan penyeberangan ro-ro, serta tiga perusahaan afiliasi di sekitarnya.",
  path: "/bisnis",
});

const LINE_MEDIA: Record<string, string> = {
  "transportasi-bbm": "lini-bbm",
  "penumpang-roro": "lini-roro",
};

const LINE_HREF: Record<string, string> = {
  "transportasi-bbm": "/bisnis/transportasi-bbm",
  "penumpang-roro": "/bisnis/penumpang-roro",
};

export default function BisnisPage() {
  const trail = breadcrumbJsonLd([
    { name: "Beranda", path: "/" },
    { name: "Bisnis Kami", path: "/bisnis" },
  ]);

  return (
    <div>
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
        <h1 className="font-display text-pretty text-4xl font-bold tracking-tight md:text-5xl">
          Bisnis Kami
        </h1>
        <p className="mt-6 max-w-[60ch] text-ink-muted">
          {COMPANY.legalName} menjalankan dua lini secara langsung, transportasi BBM dan
          penyeberangan ro-ro. Di sekitarnya ada tiga perusahaan afiliasi di dalam{" "}
          {COMPANY.parent} yang melayani kebutuhan berbeda.
        </p>
      </div>

      <section aria-labelledby="lini-utama" className="bg-surface-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <SectionHeader id="lini-utama" title="Lini utama" />
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {MAIN_LINES.map((line) => {
              const mediaId = LINE_MEDIA[line.id];
              const asset = mediaId
                ? (MEDIA["bisnis"].find((frame) => frame.id === mediaId) ?? null)
                : null;
              const href = LINE_HREF[line.id] ?? "/bisnis";
              return (
                <article
                  key={line.id}
                  className="overflow-hidden rounded-card border border-surface-3 bg-surface-2"
                >
                  {asset ? (
                    <Image
                      src={avifSrc(asset, 1080)}
                      alt={asset.alt}
                      width={1080}
                      height={720}
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="aspect-[3/2] w-full object-cover"
                    />
                  ) : null}
                  <div className="p-8">
                    <h3 className="font-display text-pretty text-2xl font-bold text-ink md:text-3xl">
                      {line.title}
                    </h3>
                    <p className="mt-2 font-mono text-xs text-ink-muted">{line.operator}</p>
                    <p className="mt-4 max-w-[46ch] text-ink">{line.summary}</p>
                    {line.metric ? (
                      <p className="mt-6 font-display text-3xl font-bold text-accent">
                        {line.metric.value}{" "}
                        <span className="font-sans text-sm font-normal text-ink-muted">
                          {line.metric.label}
                        </span>
                      </p>
                    ) : null}
                    <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-ink-muted">
                      {line.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                    <Link
                      href={href}
                      className="mt-8 inline-flex text-sm font-medium text-accent transition-colors hover:text-accent-hover"
                    >
                      Lihat detail {line.title}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="afiliasi" className="bg-surface-2-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          {/*
            Blok ini sengaja lebih kecil, tanpa foto, dan diberi garis kiri yang
            menyatakan ia bersandar di bawah dua lini utama, mengikuti kurung
            siku di company profile halaman 03. Menyamakan bobotnya dengan lini
            utama berarti mengklaim rute Merak-Bakauheni sebagai rute DML,
            padahal itu dioperasikan PT Tri Sumaja Lines.
          */}
          <SectionHeader
            id="afiliasi"
            title="Perusahaan afiliasi"
            description={`Tiga perusahaan di dalam ${COMPANY.parent} yang berdiri sendiri dan tidak dijalankan ${COMPANY.abbreviation}.`}
          />
          <div className="mt-10 grid gap-6 border-l border-surface-3 pl-6 md:grid-cols-3">
            {AFFILIATES.map((affiliate) => (
              <article
                key={affiliate.id}
                className="rounded-card border border-surface-3 bg-surface p-6"
              >
                <h3 className="font-display text-pretty text-lg font-bold text-ink">
                  {affiliate.title}
                </h3>
                <p className="mt-3 text-sm text-ink-muted">{affiliate.summary}</p>
                <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-ink-muted">
                  {affiliate.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="angka" className="bg-surface-wash py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8">
          <SectionHeader id="angka" title="Skala operasi" />
          <dl className="mt-10 grid gap-8 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-ink-muted">Armada</dt>
              <dd className="mt-1 font-display text-4xl font-bold text-ink">
                {COMPANY.fleetSummary.vessels}
                <span className="ml-2 font-sans text-sm font-normal text-ink-muted">kapal</span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-muted">Orang</dt>
              <dd className="mt-1 font-display text-4xl font-bold text-ink">
                &gt;{COMPANY.fleetSummary.people}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-muted">Berdiri</dt>
              <dd className="mt-1 font-display text-4xl font-bold text-ink">
                {COMPANY.foundedIso.slice(0, 4)}
              </dd>
            </div>
          </dl>
          <div className="mt-12">
            <CtaLink href="/bisnis/transportasi-bbm/permintaan-informasi">
              Ajukan permintaan informasi
            </CtaLink>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(trail) }}
      />
    </div>
  );
}
