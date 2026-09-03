"use client";

import { useRef } from "react";
import type { CertBadge } from "@/content/types";
import { HeroDoors } from "./hero-doors";
import { HeroCopy } from "./hero-copy";
import { HOME_HERO_DEFAULTS, type HomeHeroData } from "./hero-defaults";
import { useHeroChoreography } from "./use-hero-choreography";

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

export function Hero({
  certifications,
  hero = HOME_HERO_DEFAULTS,
}: {
  certifications: CertBadge[];
  hero?: HomeHeroData;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const kbRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ruleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const countRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const { mounted } = useHeroChoreography({
    sectionRef,
    stageRef,
    mediaRef,
    contentRef,
    kbRefs,
    ruleRefs,
    countRefs,
    doorCounts: [hero.bbm.value, hero.roro.value],
  });

  return (
    <section ref={sectionRef} className="relative -mt-18 h-[250vh] bg-hero-ground">
      <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden">
        <div ref={mediaRef} className="absolute inset-0">
          {/* Lihat KONTRAK LCP di atas: panel foto tidak boleh ikut HTML server. */}
          <HeroDoors mounted={mounted} kbRefs={kbRefs} />
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

        <HeroCopy
          mounted={mounted}
          contentRef={contentRef}
          ruleRefs={ruleRefs}
          countRefs={countRefs}
          certifications={certifications}
          hero={hero}
        />
      </div>
    </section>
  );
}
