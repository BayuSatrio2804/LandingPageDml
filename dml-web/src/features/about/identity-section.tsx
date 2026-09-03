"use client";

import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { IDENTITY_BLOCKS } from "@/content/about";
import { MEDIA, avifSrc } from "@/lib/media/manifest";
import { useSectionMotion } from "@/lib/motion/use-section-motion";
import { revealBatch } from "@/lib/motion/reveal-batch";

const PORTRAIT = MEDIA["lini-bisnis"].find((asset) => asset.id === "operasi-sts")!;

export function IdentitySection() {
  const root = useSectionMotion<HTMLElement>((scope) => {
    const q = gsap.utils.selector(scope);
    revealBatch(scope);

    // Cincin berputar, bukan berdenyut: menskalakan elemen berbatas tebal ikut
    // menebalkan garisnya, dan itu terbaca sebagai denyut yang mengganggu.
    q("[data-ring]").forEach((ring, i) => {
      gsap.to(ring, {
        rotate: i % 2 === 0 ? 360 : -360,
        duration: 90 + i * 24,
        ease: "none",
        repeat: -1,
      });
    });

    const frame = q("[data-frame]")[0];
    const image = q("[data-portrait]")[0];
    if (frame) {
      gsap.fromTo(
        frame,
        { scale: 0.86, autoAlpha: 0 },
        {
          scale: 1,
          autoAlpha: 1,
          duration: 1.1,
          ease: "expo.out",
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: frame, start: "top 88%", once: true },
        },
      );
    }
    if (image) {
      gsap.set(image, { scale: 1.14 });
      ScrollTrigger.create({
        trigger: frame ?? image,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) =>
          gsap.set(image, { y: (self.progress - 0.5) * 40, rotate: (self.progress - 0.5) * 3 }),
      });
    }
  });

  return (
    <section
      ref={root}
      id="jati-diri"
      data-index-section="jati-diri"
      aria-labelledby="identity-title"
      className="relative overflow-hidden bg-surface-2 py-28"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(62%_74%_at_88%_18%,var(--color-surface)_0%,transparent_62%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-50 [background-image:linear-gradient(var(--color-accent-soft)_1px,transparent_1px)] [background-size:100%_96px] [mask-image:linear-gradient(to_bottom,transparent,#000_22%,#000_78%,transparent)]"
      />

      <div className="relative mx-auto grid max-w-350 grid-cols-[1.32fr_0.88fr] items-center gap-18 px-8 max-lg:grid-cols-1 max-lg:gap-10">
        <div>
          <h2 id="identity-title" className="sr-only">
            Jati diri perusahaan
          </h2>
          <div className="flex flex-col gap-13">
            {IDENTITY_BLOCKS.map((block) => (
              <div
                key={block.id}
                data-reveal=""
                data-reveal-group="identity"
                className="grid grid-cols-[150px_1fr] items-start gap-7 max-md:grid-cols-1 max-md:gap-3.5"
              >
                <h3 className="m-0 font-display text-[clamp(1.5rem,2.4vw,2.1rem)] leading-none font-bold tracking-[-0.02em] text-ink">
                  {block.title}
                </h3>
                <div>
                  {block.lead ? (
                    <p className="m-0 max-w-[52ch] text-base leading-[1.8] text-ink text-pretty">
                      {block.lead}
                    </p>
                  ) : null}
                  {block.items ? (
                    <ol className="m-0 flex flex-col gap-3.5 pl-5.5">
                      {block.items.map((item) => (
                        <li key={item} className="max-w-[50ch] text-base leading-[1.8] text-ink text-pretty">
                          {item}
                        </li>
                      ))}
                    </ol>
                  ) : null}
                  {block.note ? (
                    <p className="mt-4.5 mb-0 max-w-[48ch] text-[13px] leading-[1.65] text-line">
                      {block.note}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div data-reveal="" className="relative grid aspect-square place-items-center">
          <span
            data-ring=""
            aria-hidden="true"
            className="absolute inset-[2%] rounded-full border-[34px] border-accent-soft"
          />
          <span
            data-ring=""
            aria-hidden="true"
            className="absolute inset-[19%] rounded-full border-[24px] border-accent"
          />
          <div data-frame="" className="relative size-[56%] overflow-hidden rounded-full bg-hero-ground">
            <Image
              data-portrait=""
              src={avifSrc(PORTRAIT, 1600)}
              alt={PORTRAIT.alt}
              fill
              sizes="(max-width: 1024px) 80vw, 420px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
