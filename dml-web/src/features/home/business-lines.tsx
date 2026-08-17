"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/motion/gsap";
import { MOTION } from "@/lib/motion/tokens";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { MEDIA, avifSrc } from "@/lib/media/manifest";
import { OverlayPanel } from "@/components/ui/overlay-panel";
import { CtaLink } from "@/components/ui/cta-link";

/**
 * Deskripsi STS sengaja dipendekkan. Penjelasan panjang soal ship-to-ship
 * sudah jadi isi seksi 2 (day-cut.tsx); mengulangnya di sini membuat kartu
 * ketiga jadi blok teks terpanjang di atas foto paling terang, yang persis
 * kombinasi yang gagal di audit.
 */
const CARDS = [
  {
    title: "Transportasi BBM",
    description:
      "Motor tanker, oil barge, dan SPOB melayani kontrak jangka panjang di hampir seluruh Kalimantan.",
    classes: ["Motor Tanker", "Oil Barge", "SPOB", "Tugboat"],
    mediaId: "transportasi-bbm",
  },
  {
    title: "Penumpang Ro-Ro",
    description:
      "Armada KMP Jambo menghubungkan Ketapang, Lembar, Tanjung Perak, dan Kumai dengan kabin ber-AC dan fasilitas medis.",
    classes: ["Ro-Ro Ferry"],
    mediaId: "penumpang-roro",
  },
  {
    title: "Layanan Ship-to-Ship (STS)",
    description:
      "Ship-to-ship transfer memindahkan BBM langsung antar kapal di tengah perairan, tanpa antre sandar pelabuhan.",
    classes: ["Motor Tanker", "Oil Barge"],
    mediaId: "operasi-sts",
  },
] as const;

export function BusinessLines() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLImageElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (reduced || !section) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const cards = cardRefs.current.filter((el): el is HTMLDivElement => el !== null);
      const media = mediaRefs.current.filter((el): el is HTMLImageElement => el !== null);

      cards.slice(0, -1).forEach((card, index) => {
        const next = cards[index + 1];
        if (!next) return;
        ScrollTrigger.create({
          trigger: next,
          start: "top bottom",
          end: "top top",
          scrub: true,
          onUpdate: (self) => {
            gsap.set(card, { scale: 1 - self.progress * 0.08, opacity: 1 - self.progress * 0.45 });
          },
        });
      });

      // Zoom keluar per kartu. Alasannya satu kalimat: foto yang mengecil saat
      // kartunya mengunci membuat mata membaca kartu sebagai bidang yang
      // mendarat, bukan gambar diam yang kebetulan lewat.
      media.forEach((layer) => {
        gsap.fromTo(
          layer,
          { scale: 1.08 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: layer,
              start: "top bottom",
              end: "top top",
              scrub: MOTION.scrub,
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={sectionRef} className="relative">
      {CARDS.map((card, index) => {
        const media = MEDIA["lini-bisnis"].find((asset) => asset.id === card.mediaId);
        if (!media) return null;
        return (
          <div
            key={card.title}
            data-testid="kartu-lini-bisnis"
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className="sticky top-0 flex min-h-[100dvh] items-end overflow-hidden bg-surface"
            style={{ zIndex: index + 1 }}
          >
            <Image
              data-testid="media-lini-bisnis"
              ref={(el) => {
                mediaRefs.current[index] = el;
              }}
              src={avifSrc(media, 2400)}
              alt={media.alt}
              fill
              sizes="100vw"
              className="absolute inset-0 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
            <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-12 px-4 pb-16 md:px-8 md:pb-24">
              <OverlayPanel
                className="col-span-12 md:col-span-6 lg:col-span-5"
                data-testid="panel-lini-bisnis"
              >
                <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">{card.title}</h2>
                <p className="mt-4 max-w-[46ch] text-ink">{card.description}</p>
                <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-ink-muted">
                  {card.classes.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
                {index === CARDS.length - 1 && (
                  <div className="mt-8">
                    {/* TODO(plan-bisnis): arahkan ke /bisnis/transportasi-bbm/permintaan-informasi setelah halaman itu dibangun */}
                    <CtaLink href="/kontak">Hubungi Kami</CtaLink>
                  </div>
                )}
              </OverlayPanel>
            </div>
          </div>
        );
      })}
    </section>
  );
}
