"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";

import styles from "./hero-journey.module.css";
import { LottieMark } from "@/components/ui/lottie-mark";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/motion/gsap";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";

const HERO_MOTION = {
  backgroundScale: [1, 6.5] as const,
  contentScale: [1, 8] as const,
  skyY: ["0vh", "100vh"] as const,
};

function ShipIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M5 11V4h3V2h2v2h4V2h2v2h3v7l1.2.4a1 1 0 0 1 .66 1.22l-1.3 4.55A5 5 0 0 1 15.05 21H8.95a5 5 0 0 1-4.8-3.83l-1.3-4.55a1 1 0 0 1 .66-1.22L5 11Zm2-5v4.28l5-1.67 5 1.67V6H7Zm5 4.7-6.98 2.33.98 3.43A3 3 0 0 0 8.95 19h6.1a3 3 0 0 0 2.95-2.54l.98-3.43L12 10.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Panggung porthole: kamera diam, tiga lapisan (langit video, dinding kayu,
 * bingkai kuningan) di-scale terpisah lewat satu scrub timeline sepanjang
 * tinggi seksi (300vh). Itu sebabnya seksi ini jauh lebih tinggi dari
 * viewport dan stage-nya sticky di dalamnya.
 *
 * reduced motion melompat langsung ke frame akhir timeline (bukan frame
 * awal) supaya tata letak akhir yang dipakai pengguna tanpa animasi sama
 * dengan yang dilihat pengguna lain di akhir scroll, dan video langit
 * dijeda karena tidak ada yang menganimasikan posisinya lagi.
 */
export function HeroJourney() {
  const root = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();

  useLayoutEffect(() => {
    if (!root.current) return;

    if (reduced) {
      gsap.set("[data-hero-background]", {
        scale: HERO_MOTION.backgroundScale[1],
        xPercent: -2,
      });
      gsap.set("[data-hero-content]", { scale: HERO_MOTION.contentScale[1] });
      gsap.set("[data-hero-sky]", { y: HERO_MOTION.skyY[1] });
      root.current.querySelector<HTMLVideoElement>("[data-hero-sky]")?.pause();
      return;
    }

    registerGsap();
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      timeline
        .fromTo(
          "[data-hero-background]",
          { scale: HERO_MOTION.backgroundScale[0], xPercent: 0 },
          { scale: HERO_MOTION.backgroundScale[1], xPercent: -2, ease: "none" },
          0,
        )
        .fromTo(
          "[data-hero-content]",
          { scale: HERO_MOTION.contentScale[0] },
          { scale: HERO_MOTION.contentScale[1], ease: "none" },
          0,
        )
        .fromTo(
          "[data-hero-sky]",
          { y: HERO_MOTION.skyY[0] },
          { y: HERO_MOTION.skyY[1], ease: "none" },
          0,
        )
        .fromTo("[data-hero-left]", { x: "0vw" }, { x: "-50vw", ease: "none" }, 0)
        .fromTo("[data-hero-right]", { x: "0vw" }, { x: "50vw", ease: "none" }, 0)
        .to("[data-hero-support], [data-hero-scroll]", { opacity: 0, ease: "none" }, 0);
    }, root);

    return () => {
      context.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [reduced]);

  return (
    <section
      ref={root}
      id="hero"
      className={styles.hero}
      aria-label="Dutabahari Menara Line: mengangkut bahan bakar dan orang, lintas Indonesia"
    >
      <video
        data-hero-sky
        className={styles.heroSky}
        src="/assets/hero/sky-hero.mp4"
        poster="/assets/hero/sky-hero.webp"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        // `autoPlay` gagal jalan diam-diam untuk sebagian file (moov atom
        // tidak di depan / bukan "faststart"): browser sempat coba autoplay
        // sebelum data siap, lalu tidak mengulang. `play()` manual begitu
        // metadata/data pertama siap jadi jaring pengaman.
        onLoadedData={(event) => {
          event.currentTarget.play().catch(() => {});
        }}
      />
      <div className={styles.heroStage}>
        <div className={styles.heroContent} data-hero-content>
          <h1 data-hero-left className={`${styles.heroTitle} ${styles.heroTitleLeft}`}>
            Mengangkut bahan bakar dan orang,
          </h1>
          <h2 data-hero-right className={`${styles.heroTitle} ${styles.heroTitleRight}`}>
            lintas Indonesia.
          </h2>
          <div data-hero-support className={styles.heroSupport}>
            <p data-testid="hero-subteks">
              Armada 64 kapal, lima lintasan penyeberangan, dan bengkel perawatan sendiri,
              dioperasikan dari Banjarmasin sejak 1988.
            </p>
          </div>
          <a data-hero-scroll className={styles.scrollCue} href="#day-cut">
            <LottieMark src="/assets/lottie/scroll-icon.json" label="Gulir ke bawah" />
            <span>Scroll down</span>
            <span>Jelajahi Dutabahari Menara Line</span>
          </a>
        </div>
        <div className={styles.heroShade} />
        <div className={styles.heroBackground} data-hero-background>
          <img className={styles.heroBack} src="/assets/hero/hero-back.webp" alt="" />
          <img className={styles.heroFront} src="/assets/hero/hero-front.webp" alt="" />
          <img className={styles.heroFrontOver} src="/assets/hero/hero-front-over.svg" alt="" />
        </div>
      </div>
      <Link href="/kontak" className={styles.bookingButton}>
        <span className={styles.bookingButtonLabel}>Hubungi Kami</span>
        <span className={styles.bookingButtonIcon}>
          <ShipIcon />
        </span>
      </Link>
    </section>
  );
}
