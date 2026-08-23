"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, registerGsap } from "@/lib/motion/gsap";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { useMounted } from "@/lib/motion/use-mounted";
import { CtaLink } from "@/components/ui/cta-link";
import { CERT_BADGES } from "@/content/certifications";

/*
 * Hero "dua pintu". Menggantikan hero.tsx lama sepenuhnya; hero-canvas.tsx dan
 * hero-headline.tsx tidak lagi dipakai dan boleh dihapus.
 *
 * Gagasannya: dua lini bisnis DML adalah ceritanya. Hero dibelah diagonal —
 * kiri BBM, kanan Ro-Ro — dan belahannya bergeser saat scroll sehingga tiap
 * pintu mendapat momennya sendiri. Belahan itu satu angka (--hero-split) yang
 * dibaca tiga elemen sekaligus lewat clip-path, jadi panel dan garis jahitannya
 * selalu sinkron pada frame yang sama.
 *
 * ── KONTRAK LCP ───────────────────────────────────────────────────────────
 * Foto panel dan logo sertifikasi HANYA dipasang setelah hidrasi (mounted).
 * hero.test.tsx mengunci "tidak ada <img> di HTML server" karena kandidat LCP
 * hero harus teks yang dicat dari HTML server, bukan gambar yang menunggu
 * jaringan — kontrak itu terkait ambang Lighthouse 5000ms. Merender <Image>
 * langsung di markup server akan merebut kembali peran LCP dan menghidupkan
 * lagi risiko itu. Kalau nanti ada yang memindahkan panelnya keluar dari
 * cabang `mounted`, testnya akan gagal, dan itu memang gunanya.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * Lima hal yang sengaja TIDAK ada di sini, semuanya hasil iterasi:
 *
 * 1. SplitText untuk headline. Membungkus tiap baris dengan overflow:hidden
 *    bergantung pada pengukuran tinggi baris, dan pengukuran itu berubah saat
 *    GT America Extended selesai dimuat — hasilnya headline tidak terlihat.
 *    Reveal-nya memakai clip-path pada satu elemen.
 *
 * 2. Skew mengikuti kecepatan gulir. Terbaca sebagai goyangan dan membuat
 *    pusing. Gerak yang tersisa: parallax kursor dan Ken Burns.
 *
 * 3. Opacity kontainer untuk menandai bab aktif. Ia mengalikan turun ke tombol
 *    dan teks isi, sehingga justru dua elemen konversi yang paling sulit
 *    dibaca. Penandanya sekarang garis aksen dan posisi belahan.
 *
 * 4. gsap.from(). Ia menulis keadaan awal sebagai inline style; kalau efeknya
 *    sempat terputus, sisa opacity:0 membuat elemen hilang permanen. Semua
 *    intro memakai fromTo + clearProps.
 *
 * 5. Peta rute. route-map.tsx sudah punya seksi peta yang di-pin dengan garis
 *    pantai asli; peta kedua di hero mengulang aset yang sama.
 *
 * Pin-nya 250vh, bukan 400vh, supaya tidak menumpuk dengan pin route-map
 * (+=260%) yang datang setelahnya di page.tsx.
 */

const DOORS = [
  {
    key: "bbm",
    label: "Transportasi BBM",
    value: 55,
    unit: "Tanker",
    desc: "Pengangkutan bahan bakar dan transfer ship-to-ship untuk klien korporat.",
    photo: "/media/lini-bisnis/operasi-sts-2400.webp",
    alt: "Transfer ship-to-ship antar tanker BBM",
  },
  {
    key: "roro",
    label: "Penyeberangan Ro-Ro",
    value: 9,
    unit: "Kapal",
    desc: "Penyeberangan untuk penumpang dan kendaraan, dengan tiket daring.",
    photo: "/media/lini-bisnis/penumpang-roro-2400.webp",
    alt: "Kapal penyeberangan ro-ro",
  },
] as const;

// TODO(dml): ganti kalau ada halaman permintaan informasi BBM tersendiri.
const CTA_BBM_HREF = "/kontak";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const kbRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ruleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const countRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const mounted = useMounted();

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
      gsap.fromTo(
        "[data-hero-door]",
        { y: 20, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: "power3.out",
          delay: 0.7,
          stagger: 0.1,
          clearProps: "transform,opacity,visibility",
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
        .to(ruleA, { width: 52, backgroundColor: "#ffffff", duration: 0.5, ease: "power2.out" }, 0.25);

      timeline
        .to(split, { x: 26, duration: 1.2, ease: "power2.inOut", onUpdate: applySplit }, 1.5)
        .to(ruleA, { width: 22, backgroundColor: "#4C7FD6", duration: 0.5, ease: "power2.out" }, 1.5)
        .to(ruleB, { width: 52, backgroundColor: "#ffffff", duration: 0.5, ease: "power2.out" }, 1.6);

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

  return (
    <section ref={sectionRef} className="relative -mt-18 h-[250vh] bg-[#0A1428]">
      <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden">
        <div ref={mediaRef} className="absolute inset-0">
          {/* Lihat KONTRAK LCP di atas: panel foto tidak boleh ikut HTML server. */}
          {mounted
            ? DOORS.map((door, index) => (
                <div
                  key={door.key}
                  data-hero-panel
                  className={`absolute inset-0 ${index === 0 ? "hero-panel-a" : "hero-panel-b"}`}
                >
                  <div
                    ref={(el) => {
                      kbRefs.current[index] = el;
                    }}
                    className="absolute -inset-y-[7%] -inset-x-[5%]"
                  >
                    <Image
                      src={door.photo}
                      alt={door.alt}
                      fill
                      sizes="100vw"
                      className={
                        index === 0
                          ? "object-cover brightness-60 contrast-125 saturate-60"
                          : "object-cover brightness-95 contrast-105 saturate-105"
                      }
                    />
                  </div>
                  {/* Gradasi per sisi: BBM lebih dingin dan industrial, Ro-Ro
                      lebih terang. Tanpa ini belahannya cuma terbaca sebagai
                      garis, bukan sebagai dua lini bisnis. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        index === 0
                          ? "linear-gradient(160deg,rgba(12,32,72,0.52) 0%,rgba(6,16,38,0.68) 100%)"
                          : "linear-gradient(200deg,rgba(96,138,190,0.16) 0%,rgba(10,22,48,0.42) 100%)",
                    }}
                  />
                </div>
              ))
            : null}
          <div aria-hidden="true" className="hero-seam absolute inset-0 bg-white/42" />
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top,rgba(6,14,32,0.86) 0%,rgba(8,18,40,0.42) 44%,rgba(10,22,46,0.08) 74%,rgba(8,18,40,0.4) 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(118% 88% at 50% 44%, transparent 28%, rgba(6,14,32,0.46) 70%, rgba(4,10,24,0.78) 100%)",
          }}
        />

        <div
          ref={contentRef}
          className="absolute inset-0 mx-auto grid max-w-[1400px] grid-rows-[auto_auto_auto] content-between gap-5 px-5 pt-21 pb-13 min-[900px]:gap-6 min-[900px]:px-8 min-[900px]:pt-22 min-[900px]:pb-15"
        >
          <div className="flex items-start justify-between gap-8">
            <p
              data-hero-eyebrow
              className="font-mono text-[11px] tracking-[0.18em] text-white/62 uppercase"
            >
              PT Dutabahari Menara Line · 64 kapal · Banjarmasin · Sejak 1988
            </p>
            {/* Logo sertifikasi butuh ~58px agar segel ISO dan gerigi HSSE
                terbaca. Di layar sempit atau pendek barisnya disembunyikan,
                bukan dikecilkan sampai jadi bercak. */}
            <div
              data-hero-certs
              className="hidden items-center gap-4 min-[900px]:flex [@media(max-height:759px)]:hidden"
            >
              <span className="font-mono text-[11px] tracking-[0.16em] whitespace-nowrap text-white/70 uppercase">
                Tersertifikasi
              </span>
              {mounted
                ? CERT_BADGES.map((badge) => (
                    <Image
                      key={badge.assetPath}
                      src={badge.assetPath}
                      alt={badge.alt}
                      width={87}
                      height={58}
                      className="block h-14.5 w-auto"
                    />
                  ))
                : null}
            </div>
          </div>

          <div className="flex flex-col items-start gap-5 text-left min-[900px]:items-center min-[900px]:text-center">
            <h1
              data-hero-h1
              className="font-display max-w-[22ch] text-[clamp(2.25rem,4.8vw,4.5rem)] leading-none tracking-[-0.02em] text-pretty text-white"
            >
              Mitra Andal Distribusi Energi dan Penyeberangan Laut
            </h1>
            <p
              data-hero-sub
              data-testid="hero-subteks"
              className="max-w-[52ch] text-lg leading-relaxed text-white/78"
            >
              Satu operator, dua lintasan. Dioperasikan dari Banjarmasin sejak 1988.
            </p>
          </div>

          <div className="grid grid-cols-1 items-end gap-5.5 min-[900px]:grid-cols-2 min-[900px]:gap-12">
            {DOORS.map((door, index) => {
              const isRoro = index === 1;
              const rule = (
                <span
                  ref={(el) => {
                    ruleRefs.current[index] = el;
                  }}
                  aria-hidden="true"
                  className="h-0.5 w-5.5 bg-[#4C7FD6]"
                />
              );
              return (
                <div
                  key={door.key}
                  data-hero-door
                  className={`flex flex-col gap-4 ${
                    isRoro ? "min-[900px]:items-end min-[900px]:text-right" : ""
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isRoro ? null : rule}
                    <span className="font-mono text-[11px] tracking-[0.2em] whitespace-nowrap text-white uppercase">
                      {door.label}
                    </span>
                    {isRoro ? rule : null}
                  </div>

                  <div className="flex items-baseline gap-2.5">
                    <span
                      ref={(el) => {
                        countRefs.current[index] = el;
                      }}
                      className="font-display text-[clamp(2.125rem,3.4vw,3.125rem)] leading-none text-white"
                    >
                      {door.value}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.16em] text-white/62 uppercase">
                      {door.unit}
                    </span>
                  </div>

                  <p className="hidden max-w-[34ch] text-base leading-relaxed text-white/80 min-[900px]:block">
                    {door.desc}
                  </p>

                  <div>
                    <span data-hero-cta className="inline-flex">
                      {isRoro ? (
                        <CtaLink href="https://dutabahari.id" variant="ghost">
                          Pesan Tiket Ro-Ro
                        </CtaLink>
                      ) : (
                        <CtaLink href={CTA_BBM_HREF}>Permintaan Informasi BBM</CtaLink>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          data-hero-scroll
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2.5"
        >
          <span className="block h-px w-7 overflow-hidden bg-white/16">
            <span className="animate-hero-scroll block h-px w-7 bg-white" />
          </span>
          <span className="font-mono text-[10px] tracking-[0.24em] text-white/56 uppercase">
            Gulir
          </span>
        </div>
      </div>
    </section>
  );
}
