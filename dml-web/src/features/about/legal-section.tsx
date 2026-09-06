"use client";

import { useState } from "react";
import Image from "next/image";
import { gsap } from "@/lib/motion/gsap";
import { MEDIA, avifSrc } from "@/lib/media/manifest";
import { groupedLegalDocuments } from "@/content/about";
import type { LegalDocument, Membership, StandardCluster } from "@/content/types";
import { useSectionMotion } from "@/lib/motion/use-section-motion";
import { revealBatch } from "@/lib/motion/reveal-batch";
import { MOTION } from "@/lib/motion/tokens";
import { ABOUT_PAGE_DEFAULTS, type AboutPageData } from "./about-defaults";

const FIELD_PHOTO = MEDIA["lini-bisnis"].find((asset) => asset.id === "operasi-sts")!;

/**
 * Tiga standar yang ditonjolkan di kepala seksi. Penandanya TIPOGRAFIS
 * (ISO / ISM / HSSE dalam cakram bergaris), bukan logo: berkas logo yang ada
 * di public/assets/cert cuma unduhan generik, dan memasang logo pihak lain di
 * halaman klien tanpa berkas resmi bukan pilihan yang aman. Kalau klien
 * mengirim logo resminya, ganti <span> cakram dengan <Image>.
 */
const CERT_HIGHLIGHTS = [
  { tag: "ISO", title: "ISO 9001:2015", caption: "Sistem manajemen mutu" },
  { tag: "ISM", title: "ISM Code", caption: "Manajemen keselamatan pelayaran" },
  { tag: "HSSE", title: "HSSE", caption: "Health, safety, security & environment" },
] as const;

export function LegalSection({
  legalDocuments,
  standards,
  memberships,
  copy = ABOUT_PAGE_DEFAULTS.legal,
}: {
  legalDocuments: LegalDocument[];
  standards: StandardCluster[];
  memberships: Membership[];
  copy?: AboutPageData["legal"];
}) {
  const groups = groupedLegalDocuments(legalDocuments).filter((group) => group.docs.length > 0);
  const [activeId, setActiveId] = useState(groups[0]?.id ?? "");
  const active = groups.find((group) => group.id === activeId) ?? groups[0];

  const totalDocs = groups.reduce((sum, group) => sum + group.docs.length, 0);
  const totalStandards = standards.reduce((sum, cluster) => sum + cluster.items.length, 0);

  const root = useSectionMotion<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope);
    revealBatch(scope);

    // Kartu sertifikasi masuk berurutan; glow-nya baru bergerak saat hover.
    q("[data-cert-card]").forEach((card, index) => {
      gsap.fromTo(
        card,
        { y: 26, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: MOTION.base,
          ease: MOTION.ease,
          delay: index * 0.1,
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: card, start: "top 92%", once: true },
        },
      );
    });
  });

  /*
   * Sapuan baris dokumen dan glow kartu sertifikasi dijalankan GSAP, bukan
   * hover: variant, karena easing masuk/keluarnya beda (expo.out lalu
   * power2.in) — satu transition CSS cuma bisa satu kurva untuk dua arah.
   */
  const wipeHover = (on: boolean) => (event: React.MouseEvent<HTMLElement>) => {
    const wipe = event.currentTarget.querySelector("[data-wipe]");
    if (!wipe) return;
    gsap.to(wipe, {
      scaleX: on ? 1 : 0,
      duration: on ? 0.55 : 0.35,
      ease: on ? "expo.out" : "power2.in",
    });
  };

  const glowHover = (on: boolean) => (event: React.MouseEvent<HTMLElement>) => {
    const glow = event.currentTarget.querySelector("[data-cert-glow]");
    if (!glow) return;
    gsap.to(glow, {
      opacity: on ? 1 : 0,
      x: on ? 60 : 0,
      duration: on ? 0.9 : 0.5,
      ease: on ? "expo.out" : "power2.in",
    });
  };

  // Baris dokumen tab baru dianimasikan setiap kali tab berganti; key pada
  // wrapper memaksa remount, dan efek di dalamnya (lihat DocRows) yang
  // menjalankan stagger-nya.
  return (
    <section
      ref={root}
      id="legal"
      data-index-section="legal"
      aria-labelledby="legal-title"
      className="relative overflow-hidden bg-surface-2 py-30"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(56%_62%_at_6%_12%,var(--color-surface)_0%,transparent_58%),radial-gradient(46%_56%_at_96%_88%,var(--color-surface)_0%,transparent_60%)]"
      />

      <div className="relative mx-auto max-w-350 px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="min-w-70 flex-1">
            <p className="m-0 font-mono text-[11px] tracking-[0.2em] text-ink-muted uppercase">
              Kepatuhan &amp; perizinan
            </p>
            <h2
              id="legal-title"
              data-reveal="clip"
              className="mt-3.5 mb-0 font-display text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.03] font-bold tracking-[-0.02em] text-ink"
            >
              {copy.heading}
            </h2>
          </div>

          <div className="flex gap-8 rounded-xl border border-line/40 bg-surface px-7 py-5">
            <div>
              <p className="m-0 flex items-baseline gap-2">
                <span className="font-display text-[2rem] leading-none font-bold text-accent">
                  {totalDocs}
                </span>
                <span className="font-mono text-[11px] tracking-[0.16em] text-ink-muted uppercase">
                  dokumen
                </span>
              </p>
              <p className="mt-2 mb-0 text-[13px] text-ink-muted">Terdaftar dan aktif</p>
            </div>
            <div aria-hidden="true" className="w-px bg-accent-soft" />
            <div>
              <p className="m-0 flex items-baseline gap-2">
                <span className="font-display text-[2rem] leading-none font-bold text-accent">
                  {totalStandards}
                </span>
                <span className="font-mono text-[11px] tracking-[0.16em] text-ink-muted uppercase">
                  standar
                </span>
              </p>
              <p className="mt-2 mb-0 text-[13px] text-ink-muted">Sistem manajemen &amp; klasifikasi</p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-[repeat(auto-fit,minmax(min(100%,15.5rem),1fr))] gap-5">
          {CERT_HIGHLIGHTS.map((cert) => (
            <article
              key={cert.tag}
              data-cert-card=""
              onMouseEnter={glowHover(true)}
              onMouseLeave={glowHover(false)}
              className="relative flex flex-wrap items-center gap-4.5 overflow-hidden rounded-[14px] bg-dark-field p-6.5"
            >
              <span
                data-cert-glow=""
                aria-hidden="true"
                className="absolute -top-2/5 -left-1/5 h-[180%] w-7/10 bg-[radial-gradient(50%_50%_at_50%_50%,var(--color-accent-lift)_0%,transparent_70%)] opacity-0"
              />
              <span
                aria-hidden="true"
                className="relative grid size-16 shrink-0 place-items-center rounded-full border border-on-accent/28 font-mono text-[13px] tracking-[0.06em] text-surface-3"
              >
                {cert.tag}
              </span>
              <div className="relative min-w-32.5 flex-1">
                <p className="m-0 font-display text-base font-bold text-on-accent">{cert.title}</p>
                <p className="mt-1.5 mb-0 text-[13px] leading-[1.5] text-on-accent/72">
                  {cert.caption}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div
          data-reveal=""
          className="mt-5 overflow-hidden rounded-[14px] border border-line/40 bg-surface shadow-[0_24px_54px_-44px_rgb(15_27_46/0.5)]"
        >
          <div
            role="tablist"
            aria-label="Kelompok dokumen legal"
            className="flex flex-wrap gap-2 border-b border-accent-soft bg-surface-2/70 px-5.5 py-4"
          >
            {groups.map((group) => {
              const on = group.id === active?.id;
              return (
                <button
                  key={group.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActiveId(group.id)}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-[13px] transition-colors duration-300 ${
                    on
                      ? "border-accent bg-accent text-on-accent"
                      : "border-accent-soft bg-transparent text-ink-muted hover:border-accent hover:text-ink"
                  }`}
                >
                  {group.label}
                  <span className={`font-mono text-[11px] ${on ? "text-surface-3" : "text-line"}`}>
                    {group.docs.length}
                  </span>
                </button>
              );
            })}
          </div>

          <DocRows key={active?.id} docs={active?.docs ?? []} onHover={wipeHover} />
        </div>

        <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] items-stretch gap-5">
          <div
            data-reveal=""
            className="flex flex-col rounded-[14px] border border-line/40 bg-surface p-6.5 shadow-[0_24px_54px_-44px_rgb(15_27_46/0.5)]"
          >
            <p className="m-0 border-b border-accent-soft pb-4.5 font-mono text-[11px] tracking-[0.16em] text-ink-muted uppercase">
              {copy.standardsLabel}
            </p>
            <div className="mt-5.5 flex flex-1 flex-col justify-between gap-5.5">
              {standards.map((cluster) => (
                <div key={cluster.label}>
                  <p className="m-0 text-sm text-ink">{cluster.label}</p>
                  <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
                    {cluster.items.map((item) => (
                      <li
                        key={item.name}
                        title={
                          item.source !== "cp-pdf"
                            ? "Dari riset publik, belum tercantum di company profile resmi"
                            : "Tercantum di company profile resmi"
                        }
                        className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-3.75 py-1.75 font-mono text-xs whitespace-nowrap text-accent transition-colors duration-300 hover:bg-accent hover:text-on-accent"
                      >
                        {item.name}
                        {item.source !== "cp-pdf" ? (
                          <span
                            aria-label="belum tercantum di company profile resmi"
                            className="block size-1.25 rounded-full bg-line"
                          />
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="m-0 border-t border-accent-soft pt-5 text-xs leading-[1.6] text-line">
                {copy.footnote}
              </p>
            </div>
          </div>

          <div
            data-reveal=""
            className="rounded-[14px] border border-line/40 bg-surface p-6.5 shadow-[0_24px_54px_-44px_rgb(15_27_46/0.5)]"
          >
            <p className="m-0 border-b border-accent-soft pb-4.5 font-mono text-[11px] tracking-[0.16em] text-ink-muted uppercase">
              {copy.membershipsLabel}
            </p>
            <ul className="mt-5.5 flex list-none flex-col gap-4 p-0">
              {memberships.map((membership) => (
                <li key={membership.name}>
                  <p className="m-0 text-sm text-ink">{membership.name}</p>
                  {membership.expansion ? (
                    <p className="mt-1 mb-0 text-xs leading-[1.5] text-line">
                      {membership.expansion}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/*
          Band foto lebar penuh menutup seksi. Sebelumnya foto ini duduk di
          kolom kiri dan tingginya harus mengikuti kolom kanan — hasilnya
          selalu ada satu kolom menggantung. Sebagai band, tidak ada track
          yang perlu disamakan.
        */}
        <div
          data-reveal=""
          className="relative mt-5 min-h-70 overflow-hidden rounded-[14px] bg-dark-field"
        >
          <Image
            src={avifSrc(FIELD_PHOTO, 1600)}
            alt="Operasi transfer bahan bakar antar kapal"
            fill
            sizes="(max-width: 1024px) 100vw, 1400px"
            className="object-cover opacity-80"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-100 from-dark-field from-12% via-dark-field/80 via-52% to-dark-field/10"
          />
          <div className="relative flex min-h-70 flex-wrap items-end justify-between gap-7 p-9">
            <div className="max-w-[46ch]">
              <p className="m-0 font-mono text-[11px] tracking-[0.16em] text-surface-3 uppercase">
                Di lapangan
              </p>
              <p className="mt-3.5 mb-0 font-display text-[clamp(1.15rem,2vw,1.75rem)] leading-[1.2] font-bold text-on-accent text-pretty">
                Setiap operasi berjalan di bawah DOC dan ISM Code.
              </p>
              <p className="mt-3.5 mb-0 text-sm leading-relaxed text-on-accent/78">
                Transfer bahan bakar antar kapal, diawasi standar keselamatan yang sama di seluruh
                armada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Dipisah jadi komponen sendiri supaya `key={active.id}` di pemanggilnya
 * memaksa remount tiap tab berganti — itu yang memicu stagger baris dokumen.
 * Tanpa remount, GSAP harus dipanggil manual dari efek yang mengawasi state,
 * dan baris yang belum pernah dianimasikan tertinggal tanpa hover-wipe.
 */
function DocRows({
  docs,
  onHover,
}: {
  docs: LegalDocument[];
  onHover: (on: boolean) => (event: React.MouseEvent<HTMLElement>) => void;
}) {
  const root = useSectionMotion<HTMLDivElement>((scope) => {
    gsap.fromTo(
      gsap.utils.toArray(scope.querySelectorAll("[data-doc-row]")),
      { y: 14, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.5,
        ease: MOTION.ease,
        stagger: 0.05,
        clearProps: "transform,opacity,visibility",
      },
    );
  });

  return (
    <div ref={root}>
      {docs.map((doc) => (
        <div
          key={doc.document}
          data-doc-row=""
          onMouseEnter={onHover(true)}
          onMouseLeave={onHover(false)}
          className="relative overflow-hidden border-b border-accent-soft last:border-b-0"
        >
          <span
            data-wipe=""
            aria-hidden="true"
            className="absolute inset-0 origin-left scale-x-0 bg-accent/5"
          />
          <div className="relative grid grid-cols-[1fr_auto] items-baseline gap-6 px-6.5 py-4.5 max-sm:grid-cols-1 max-sm:gap-2">
            <div>
              <p className="m-0 text-[15px] leading-[1.4] text-ink">{doc.document}</p>
              <p className="mt-1.25 mb-0 max-w-[52ch] text-[13px] leading-[1.5] text-ink-muted">
                {doc.issuer}
              </p>
            </div>
            <p className="m-0 font-mono text-[13px] whitespace-nowrap text-accent">{doc.number}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
