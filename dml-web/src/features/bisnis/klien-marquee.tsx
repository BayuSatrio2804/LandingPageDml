"use client";

import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import type { Client } from "@/content/types";
import { MOTION } from "@/lib/motion/tokens";
import { useSectionMotion } from "@/lib/motion/use-section-motion";

const PX_PER_SECOND = 38;

export function KlienMarquee({ clients }: { clients: Client[] }) {
  const root = useSectionMotion<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope);

    q("[data-reveal-clip]").forEach((el) => {
      gsap.fromTo(
        el,
        { clipPath: "inset(0% 0% 100% 0%)", y: 26 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          y: 0,
          duration: MOTION.slow,
          ease: "expo.out",
          clearProps: "clipPath,transform",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        },
      );
    });

    q("[data-count]").forEach((el) => {
      const target = Number(el.getAttribute("data-count"));
      if (!target) return;
      const proxy = { v: Math.round(target * 0.4) };
      ScrollTrigger.create({
        trigger: el,
        start: "top 95%",
        once: true,
        onEnter: () =>
          gsap.to(proxy, {
            v: target,
            duration: MOTION.slow,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = String(Math.round(proxy.v));
            },
          }),
      });
    });

    /*
     * Rel logo digandakan di markup (clients dirender dua kali), lalu digeser
     * tepat separuh lebarnya dan diulang — itu yang membuat loop-nya tidak
     * berjahit. Lebarnya diukur di rAF karena scrollWidth sebelum layout
     * selesai mengembalikan nilai yang belum final, dan tween dengan jarak
     * salah akan terlihat sebagai lompatan tiap putaran.
     */
    const rail = q("[data-logo-rail]")[0];
    if (!rail) return;

    requestAnimationFrame(() => {
      const half = rail.scrollWidth / 2;
      if (!half) return;
      const tween = gsap.to(rail, {
        x: -half,
        duration: half / PX_PER_SECOND,
        ease: "none",
        repeat: -1,
      });

      const track = rail.parentElement;
      if (!track) return;
      // Melambat, bukan berhenti: pita yang diam total terbaca sebagai rusak.
      track.addEventListener("mouseenter", () => tween.timeScale(0.15));
      track.addEventListener("mouseleave", () => tween.timeScale(1));
    });
  });

  return (
    <section
      ref={root}
      id="klien"
      data-index-section="klien"
      aria-labelledby="klien-title"
      className="relative overflow-hidden bg-linear-160 from-dark-field-lift via-dark-field to-dark-field-deep py-30"
    >
      <div className="mx-auto grid max-w-350 grid-cols-2 items-end gap-14 px-8 max-lg:grid-cols-1 max-lg:gap-8">
        <div>
          <p className="m-0 font-mono text-[11px] tracking-[0.2em] text-surface-3 uppercase">
            04 · Klien korporat
          </p>
          <h2
            id="klien-title"
            data-reveal-clip=""
            className="mt-3.5 mb-0 max-w-[22ch] font-display text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.03] font-bold tracking-[-0.02em] text-on-accent text-pretty"
          >
            Dipercaya oleh perusahaan terkemuka
          </h2>
        </div>

        <dl className="m-0 flex flex-wrap gap-12">
          <div>
            <dt className="sr-only">Jumlah klien korporat</dt>
            <dd className="m-0 flex items-baseline gap-2">
              <span
                data-count={clients.length}
                className="font-display text-[clamp(2rem,3vw,2.75rem)] leading-none font-bold text-on-accent"
              >
                {clients.length}
              </span>
              <span className="font-mono text-[11px] tracking-[0.16em] text-surface-3 uppercase">
                klien
              </span>
            </dd>
            <p className="mt-2 mb-0 max-w-[22ch] text-[13px] text-on-accent/72">
              Energi, tambang, dan pelayaran
            </p>
          </div>
          <div>
            <dt className="sr-only">Lama beroperasi</dt>
            <dd className="m-0 flex items-baseline gap-2">
              <span
                data-count="37"
                className="font-display text-[clamp(2rem,3vw,2.75rem)] leading-none font-bold text-on-accent"
              >
                37
              </span>
              <span className="font-mono text-[11px] tracking-[0.16em] text-surface-3 uppercase">
                tahun
              </span>
            </dd>
            <p className="mt-2 mb-0 max-w-[22ch] text-[13px] text-on-accent/72">
              Mengangkut sejak 1988
            </p>
          </div>
        </dl>
      </div>

      <div className="relative mt-14 overflow-hidden border-y border-on-accent/16">
        <ul data-logo-rail="" className="m-0 flex w-max list-none p-0">
          {[...clients, ...clients].map((client, index) => (
            <li
              key={`${client.id}-${index}`}
              // Salinan kedua rel murni visual: pembaca layar cukup mendengar
              // daftarnya sekali.
              aria-hidden={index >= clients.length}
              className="flex w-62.5 shrink-0 flex-col items-center justify-center gap-4 border-r border-on-accent/16 px-6 py-8"
            >
              <span className="flex h-19.5 w-full items-center justify-center rounded-sm bg-on-accent p-3.5">
                {client.logo ? (
                  <Image
                    src={client.logo}
                    alt={`Logo ${client.name}`}
                    width={200}
                    height={100}
                    className="max-h-12.5 w-auto object-contain"
                  />
                ) : (
                  <span className="text-center font-display text-[13px] font-bold text-ink">
                    {client.name}
                  </span>
                )}
              </span>
              <span className="font-mono text-[10px] tracking-[0.18em] text-on-accent/62 uppercase">
                {client.sector}
              </span>
            </li>
          ))}
        </ul>
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-25 bg-linear-to-r from-dark-field to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute inset-y-0 right-0 w-25 bg-linear-to-l from-dark-field-deep to-transparent"
        />
      </div>

      <div className="mx-auto max-w-350 px-8 pt-5">
        <p className="m-0 text-[11px] text-on-accent/50">
          AKR Corporindo masih placeholder tipografi — belum ada berkas logo resminya.
        </p>
      </div>
    </section>
  );
}
