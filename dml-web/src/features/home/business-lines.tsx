"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/motion/gsap";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { MEDIA, avifSrc } from "@/lib/media/manifest";
import { CtaLink } from "@/components/ui/cta-link";

const CARDS = [
  {
    title: "Transportasi BBM",
    description: "Motor tanker, oil barge, dan SPOB melayani kontrak jangka panjang di hampir seluruh wilayah Kalimantan, standar ISM Code dan ISPS Code.",
    mediaId: "transportasi-bbm",
  },
  {
    title: "Penumpang Ro-Ro",
    description: "Armada KMP Jambo menghubungkan Ketapang, Lembar, Tanjung Perak Surabaya, dan Kumai dengan kabin ber-AC, kafe, dan fasilitas medis.",
    mediaId: "penumpang-roro",
  },
  {
    title: "Layanan Ship-to-Ship (STS)",
    description: "Selain mengoperasikan armada sendiri, kami menjalankan operasi ship-to-ship transfer: memindahkan BBM langsung antar kapal di tengah perairan, tanpa antre sandar pelabuhan.",
    mediaId: "operasi-sts",
  },
] as const;

export function BusinessLines() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (reduced || !section) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const cards = cardRefs.current.filter((el): el is HTMLDivElement => el !== null);
      cards.slice(0, -1).forEach((card, index) => {
        const next = cards[index + 1];
        if (!next) return;
        ScrollTrigger.create({
          trigger: next,
          start: "top top",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            gsap.set(card, {
              scale: 1 - self.progress * 0.06,
              opacity: 1 - self.progress * 0.4,
            });
          },
        });
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
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className="sticky top-0 flex min-h-screen items-center bg-surface"
            style={{ zIndex: index + 1 }}
          >
            <div className="relative h-full w-full overflow-hidden">
              <Image src={avifSrc(media, 2400)} alt={media.alt} fill sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
              <div className="relative z-10 flex h-full max-w-[1400px] flex-col justify-end px-4 py-16 md:mx-auto md:px-8">
                <h2 className="font-display text-3xl font-bold text-ink md:text-5xl">{card.title}</h2>
                <p className="mt-4 max-w-[55ch] text-ink-muted">{card.description}</p>
                {index === CARDS.length - 1 && (
                  <div className="mt-8">
                    {/* TODO(plan-bisnis): arahkan ke /bisnis/transportasi-bbm/permintaan-informasi setelah halaman itu dibangun */}
                    <CtaLink href="/kontak">Hubungi Kami</CtaLink>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
