"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/motion/gsap";
import { MOTION } from "@/lib/motion/tokens";
import { segmentAt } from "@/lib/motion/segments";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { useIsDesktop } from "@/lib/motion/use-is-desktop";
import { MEDIA, avifSrc } from "@/lib/media/manifest";
import { MAIN_LINES } from "@/content/business-lines";
import type { BusinessLine } from "@/content/types";

/**
 * Format seksi ini diganti total di Plan 5.
 *
 * Versi Plan 4 adalah tiga kartu foto penuh layar yang saling menumpuk secara
 * sticky, dan kartu keluar diredupkan sampai opacity 0,55 lewat trigger milik
 * kartu berikutnya. Jendela redup itu persis sepanjang umur sticky kartu
 * kedua, jadi kartu "Penumpang Ro-Ro" tidak pernah sekali pun tampil penuh
 * selama ia jadi kartu yang dibaca: ia lahir sudah setengah transparan. Kartu
 * pertama tidak kena karena punya jendela bersih di awal, kartu ketiga tidak
 * kena karena dikecualikan slice(0, -1). Hanya kartu tengah yang rusak, dan
 * itu memang yang dilaporkan.
 *
 * Gantinya bukan versi yang sama dengan angka opacity berbeda. Ini satu
 * panggung yang dipaku, dua bab, dan pergantiannya berupa sapuan clip-path:
 * lapisan foto tidak pernah punya opasitas di bawah satu, jadi kondisi
 * "hampir transparan" tidak bisa terjadi lagi secara konstruksi.
 *
 * Isi babnya juga berubah mengikuti company profile resmi: STS bukan lini
 * bisnis dan sudah punya seksi sendiri, sedangkan tiga perusahaan afiliasi
 * pindah ke bloknya sendiri di bawah panggung ini.
 */
const TRANSITION = 0.34;
const PIN_LENGTH = "+=180%";

function mediaFor(line: BusinessLine) {
  if (!line.mediaId) return null;
  return MEDIA["lini-bisnis"].find((asset) => asset.id === line.mediaId) ?? null;
}

function LineCopy({ line }: { line: BusinessLine }) {
  return (
    <>
      <p className="font-mono text-sm text-accent">{line.number}</p>
      <h2 className="mt-4 font-display text-3xl font-bold text-ink md:text-5xl">{line.title}</h2>
      <p className="mt-3 font-mono text-xs text-ink-muted">{line.operator}</p>
      <p className="mt-6 max-w-[46ch] text-ink">{line.summary}</p>
      <ul className="mt-8 flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs text-ink-muted">
        {line.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
      {line.metric ? (
        <p className="mt-10 flex items-baseline gap-3">
          <span className="font-mono text-5xl leading-none text-accent md:text-6xl">
            {line.metric.value}
          </span>
          <span className="max-w-[14ch] text-sm text-ink-muted">{line.metric.label}</span>
        </p>
      ) : null}
    </>
  );
}

function LineMedia({ line, priority }: { line: BusinessLine; priority: boolean }) {
  const media = mediaFor(line);
  if (!media) return null;
  return (
    <Image
      data-testid="media-lini-bisnis"
      src={avifSrc(media, 2400)}
      alt={media.alt}
      fill
      priority={priority}
      sizes="(min-width: 768px) 60vw, 100vw"
      className="absolute inset-0 object-cover"
    />
  );
}

/** Jalur tanpa animasi: dua blok biasa, berurutan, tidak ada yang ditumpuk. */
function StaticBusinessLines() {
  return (
    <section className="bg-surface-wash">
      {MAIN_LINES.map((line) => (
        <div
          key={line.id}
          data-testid="bab-lini-bisnis"
          className="mx-auto grid max-w-[1400px] grid-cols-12 items-center gap-8 px-4 py-16 md:px-8 md:py-24"
        >
          <div className="col-span-12 md:col-span-5">
            <LineCopy line={line} />
          </div>
          <div className="relative col-span-12 aspect-4/3 overflow-hidden rounded-card md:col-span-7">
            <LineMedia line={line} priority={false} />
          </div>
        </div>
      ))}
    </section>
  );
}

export function BusinessLines() {
  const stageRef = useRef<HTMLDivElement>(null);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const copyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();
  const isDesktop = useIsDesktop();
  const animated = isDesktop && !reduced;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!animated || !stage) return;
    registerGsap();

    const ctx = gsap.context(() => {
      const media = mediaRefs.current;
      const copy = copyRefs.current;
      let lastIndex = -1;

      const apply = (progress: number) => {
        const { index, blend } = segmentAt(progress, MAIN_LINES.length, TRANSITION);

        media.forEach((layer, i) => {
          if (!layer) return;
          // Lapisan di bawah indeks aktif dibiarkan terbuka penuh: ia tertutup
          // total oleh lapisan di atasnya, dan menutupnya kembali cuma
          // menambah kerja komposit tanpa efek visual.
          const inset = i <= index ? 0 : i === index + 1 ? (1 - blend) * 100 : 100;
          gsap.set(layer, { clipPath: `inset(0 0 0 ${inset}%)` });
        });

        /**
         * Teks keluar lebih cepat daripada teks masuk, dengan tumpang tindih
         * tipis di tengah. Dua paragraf yang saling tembus penuh tidak terbaca
         * oleh siapa pun, tapi jeda kosong sepenuhnya lebih buruk lagi: kalau
         * pengguna kebetulan berhenti menggulir di sana, kolom kiri tampak
         * seperti gagal render. Tumpang tindih redup selama sesaat adalah
         * kompromi yang benar.
         */
        copy.forEach((pane, i) => {
          if (!pane) return;
          const out = i === index ? 1 - Math.min(1, blend / 0.5) : 0;
          const incoming = i === index + 1 ? Math.min(1, Math.max(0, (blend - 0.4) / 0.5)) : 0;
          const opacity = Math.max(out, incoming);
          gsap.set(pane, { opacity, yPercent: (1 - opacity) * 3 });
        });

        if (index !== lastIndex) {
          lastIndex = index;
          setActiveIndex(index);
        }
      };

      apply(0);

      ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: PIN_LENGTH,
        pin: true,
        scrub: MOTION.scrub,
        invalidateOnRefresh: true,
        onUpdate: (self) => apply(self.progress),
        onRefresh: (self) => apply(self.progress),
      });
    }, stageRef);

    return () => ctx.revert();
  }, [animated]);

  /**
   * Di bawah 768 px jalur statis yang dipakai, sama seperti dua seksi dipaku
   * lainnya. Dua alasan yang menumpuk. Pertama, seksi dipaku menahan gestur
   * scroll di layar sentuh. Kedua, di panggung satu kolom teks bab akan duduk
   * langsung di atas foto dengan gradien sebagai satu-satunya pelindung, dan
   * gradien itu transparan tepat di sisi kanan tempat ringkasan dan deretan
   * butir membungkus. Itu persis kombinasi kontras yang gagal di audit Plan 3
   * dan yang sejak itu diwajibkan memakai panel scrim, bukan gradien.
   */
  if (!animated) return <StaticBusinessLines />;

  return (
    <section className="bg-surface-wash relative">
      {/*
        Yang dipaku adalah panggung setinggi tepat satu viewport, bukan
        <section> pembungkusnya. Memaku elemen yang lebih tinggi dari viewport
        berarti sisa tingginya baru muncul setelah pin dilepas, dan itu yang
        terbaca sebagai "halaman kosong, harus scroll lagi" di seksi-seksi
        Plan 4.
      */}
      <div ref={stageRef} data-testid="panggung-lini-bisnis" className="relative h-[100dvh] overflow-hidden">
        <div className="absolute inset-0 md:left-[38%]">
          {MAIN_LINES.map((line, index) => (
            <div
              key={line.id}
              data-testid="lapisan-lini-bisnis"
              ref={(el) => {
                mediaRefs.current[index] = el;
              }}
              className="absolute inset-0"
              style={{ zIndex: index, clipPath: index === 0 ? "inset(0 0 0 0%)" : "inset(0 0 0 100%)" }}
            >
              <LineMedia line={line} priority={false} />
            </div>
          ))}
          {/* Scrim penghubung ke kolom teks. Gradien, bukan panel, karena di
              sini teks duduk di bidang gelapnya sendiri dan tidak pernah
              menumpang di atas foto. */}
          <div
            aria-hidden
            className="absolute inset-0 z-10 bg-gradient-to-r from-surface via-surface/40 to-transparent"
            style={{ zIndex: MAIN_LINES.length }}
          />
        </div>

        <div className="relative z-20 mx-auto grid h-full max-w-[1400px] grid-cols-12 content-center px-4 md:px-8">
          <div className="col-span-12 grid md:col-span-5">
            {MAIN_LINES.map((line, index) => (
              <div
                key={line.id}
                data-testid="bab-lini-bisnis"
                aria-hidden={index !== activeIndex}
                ref={(el) => {
                  copyRefs.current[index] = el;
                }}
                className="col-start-1 row-start-1"
                style={{ opacity: index === 0 ? 1 : 0 }}
              >
                <LineCopy line={line} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
