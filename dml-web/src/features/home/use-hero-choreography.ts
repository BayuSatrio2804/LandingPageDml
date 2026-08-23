"use client";

import { useEffect } from "react";
import { gsap, registerGsap } from "@/lib/motion/gsap";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { useMounted } from "@/lib/motion/use-mounted";
import { TOKENS } from "@/lib/tokens";
import { DOORS } from "./hero-doors";

export type HeroRefs = {
  sectionRef: React.RefObject<HTMLElement | null>;
  stageRef: React.RefObject<HTMLDivElement | null>;
  mediaRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  kbRefs: React.RefObject<(HTMLDivElement | null)[]>;
  ruleRefs: React.RefObject<(HTMLSpanElement | null)[]>;
  countRefs: React.RefObject<(HTMLSpanElement | null)[]>;
};

/**
 * Seluruh gerak hero. Dipisah dari markup karena keduanya berubah karena alasan
 * berbeda: markup berubah saat copy atau tata letak berubah, hook ini berubah
 * saat ritme scroll berubah.
 *
 * Mengembalikan `mounted` karena markup juga membutuhkannya untuk kontrak LCP,
 * dan menghitungnya dua kali di dua tempat membuka peluang keduanya berbeda.
 */
export function useHeroChoreography(refs: HeroRefs): { mounted: boolean; reduced: boolean } {
  const reduced = usePrefersReducedMotion();
  const mounted = useMounted();
  const { sectionRef, stageRef, mediaRef, contentRef, kbRefs, ruleRefs, countRefs } = refs;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // Satu sumber untuk posisi belahan. Diset lewat setProperty, bukan tween
    // langsung ke custom property, supaya ketiga elemen yang membacanya selalu
    // memakai nilai yang sama pada frame yang sama.
    const split = { x: 50 };
    const applySplit = () => stage.style.setProperty("--hero-split", `${split.x}%`);
    applySplit();

    if (reduced || !mounted) return;
    registerGsap();

    const ctx = gsap.context(() => {
      // ── Intro
      gsap.fromTo(
        "[data-hero-h1]",
        { clipPath: "inset(0% 0% 100% 0%)", y: 22 },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          y: 0,
          duration: 1.15,
          ease: "expo.out",
          clearProps: "clipPath,transform",
        },
      );
      gsap.fromTo(
        ["[data-hero-eyebrow]", "[data-hero-sub]"],
        { y: 18, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: "power3.out",
          delay: 0.4,
          stagger: 0.09,
          clearProps: "transform,opacity,visibility",
        },
      );
      // opacity, bukan autoAlpha: autoAlpha juga menyetel visibility:hidden,
      // dan browser mengecualikan elemen visibility:hidden dari urutan Tab.
      // [data-hero-door] membungkus dua CTA hero (Permintaan Informasi BBM,
      // Pesan Tiket Ro-Ro) — dengan autoAlpha, keduanya tidak terjangkau
      // keyboard selama ~1,6 detik animasi intro berjalan meski sudah ada di
      // DOM dengan tabIndex=0. Temuan 4, audit Plan 6.
      gsap.fromTo(
        "[data-hero-door]",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          delay: 0.7,
          stagger: 0.1,
          clearProps: "transform,opacity",
        },
      );
      gsap.fromTo("[data-hero-certs]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, delay: 0.8 });

      // Panel foto masuk setelah hidrasi, jadi reveal-nya ikut di sini.
      gsap.fromTo(
        "[data-hero-panel]",
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.8, ease: "power2.out", stagger: 0.08 },
      );

      // Belahan terbuka dari kanan saat halaman dimuat
      gsap.fromTo(split, { x: 100 }, { x: 50, duration: 1.4, ease: "expo.inOut", onUpdate: applySplit });

      // Angka berhitung sekali dari dasar bukan-nol. Markup sudah memuat nilai
      // akhirnya, jadi tidak pernah ada "0" yang terbaca sebagai data rusak.
      countRefs.current.forEach((el, i) => {
        if (!el) return;
        const to = DOORS[i]?.value ?? 0;
        const proxy = { v: Math.round(to * 0.45) };
        gsap.to(proxy, {
          v: to,
          duration: 1,
          ease: "power2.out",
          delay: 0.9 + i * 0.12,
          onUpdate: () => {
            el.textContent = String(Math.round(proxy.v));
          },
        });
      });

      // ── Ken Burns ambient. Menganimasi wrapper di dalam panel, sementara
      // parallax kursor menganimasi media di luarnya: elemen berbeda, jadi
      // transform-nya tidak saling menimpa.
      kbRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { scale: 1.06, transformOrigin: i ? "70% 40%" : "30% 60%" });
        gsap.to(el, {
          scale: 1.13,
          x: i ? -16 : 16,
          y: i ? 10 : -10,
          duration: 20 + i * 3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });

      // ── Timeline scrub: tiap pintu mendapat momennya sendiri.
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      const [ruleA = null, ruleB = null] = ruleRefs.current;

      timeline
        .to(split, { x: 74, duration: 1, ease: "power2.inOut", onUpdate: applySplit }, 0.25)
        .to(ruleA, { width: 52, backgroundColor: TOKENS.onAccent, duration: 0.5, ease: "power2.out" }, 0.25);

      timeline
        .to(split, { x: 26, duration: 1.2, ease: "power2.inOut", onUpdate: applySplit }, 1.5)
        .to(ruleA, { width: 22, backgroundColor: TOKENS.accentLift, duration: 0.5, ease: "power2.out" }, 1.5)
        .to(ruleB, { width: 52, backgroundColor: TOKENS.onAccent, duration: 0.5, ease: "power2.out" }, 1.6);

      timeline.to("[data-hero-scroll]", { autoAlpha: 0, duration: 0.3 }, 0.25);

      // will-change dipasang hanya selama parallax kursor hidup. Sebagai
      // utility permanen di className, ia memaksa browser menahan layer
      // komposit untuk kedua elemen sepanjang umur halaman, termasuk jauh
      // setelah hero tergulir keluar layar.
      const media = mediaRef.current;
      const content = contentRef.current;
      if (media && content) {
        gsap.set([media, content], { willChange: "transform" });
      }

      // ── Parallax kursor berlapis
      if (media && content) {
        const mx = gsap.quickTo(media, "x", { duration: 1.1, ease: "power3.out" });
        const my = gsap.quickTo(media, "y", { duration: 1.1, ease: "power3.out" });
        const cx = gsap.quickTo(content, "x", { duration: 1.3, ease: "power3.out" });
        const cy = gsap.quickTo(content, "y", { duration: 1.3, ease: "power3.out" });
        const onMove = (event: MouseEvent) => {
          const nx = event.clientX / window.innerWidth - 0.5;
          const ny = event.clientY / window.innerHeight - 0.5;
          mx(nx * -28);
          my(ny * -18);
          cx(nx * 12);
          cy(ny * 8);
        };
        stage.addEventListener("mousemove", onMove);
        return () => {
          stage.removeEventListener("mousemove", onMove);
          gsap.set([media, content], { willChange: "auto" });
        };
      }
    }, sectionRef);

    return () => ctx.revert();
    // refs.* adalah objek useRef() dari Hero(), stabil sepanjang umur komponen
    // itu — cuma .current-nya yang berubah. Sebelum efek ini dipindah ke hook
    // terpisah, eslint bisa membuktikan itu langsung dari deklarasi useRef()
    // di scope yang sama; lewat parameter refs, buktinya tidak lagi terlihat
    // secara statis meski jaminannya tidak berubah. Memasukkan refs ke deps
    // akan salah: `refs` sendiri (objek pembungkusnya) dibuat ulang tiap
    // render di Hero(), jadi itu justru membuat efek ini jalan ulang tiap
    // render — mengubah perilaku, bukan cuma membungkam linter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, mounted]);

  // Magnetic CTA. Dipisah karena mendaftar listener per tombol dan tidak ikut
  // timeline mana pun.
  useEffect(() => {
    if (reduced || !mounted) return;
    if (!window.matchMedia("(pointer:fine)").matches) return;
    registerGsap();
    const cleanups: (() => void)[] = [];

    for (const btn of Array.from(document.querySelectorAll<HTMLElement>("[data-hero-cta]"))) {
      const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
      const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });
      const move = (event: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        xTo((event.clientX - rect.left - rect.width / 2) * 0.28);
        yTo((event.clientY - rect.top - rect.height / 2) * 0.42);
      };
      const out = () => {
        xTo(0);
        yTo(0);
      };
      btn.addEventListener("mousemove", move);
      btn.addEventListener("mouseleave", out);
      cleanups.push(() => {
        btn.removeEventListener("mousemove", move);
        btn.removeEventListener("mouseleave", out);
        // quickTo mengembalikan fungsi setter, tween-nya menempel di tombol.
        // Melepas listener saja menyisakan tween hidup yang masih memegang
        // referensi ke elemen setelah hero unmount.
        gsap.killTweensOf(btn);
      });
    }

    return () => {
      for (const fn of cleanups) fn();
    };
  }, [reduced, mounted]);

  return { mounted, reduced };
}
