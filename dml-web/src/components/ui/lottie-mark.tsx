"use client";

import { useEffect, useRef } from "react";

interface LottieMarkProps {
  src: string;
  label: string;
  className?: string;
}

/**
 * lottie-web dimuat lewat dynamic import supaya tidak masuk bundle awal.
 * autoplay dimatikan saat prefers-reduced-motion aktif, tapi elemennya tetap
 * dirender sebagai ikon statis (frame pertama).
 */
export function LottieMark({ src, label, className }: LottieMarkProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    let disposed = false;
    let destroy: (() => void) | undefined;

    void import("lottie-web")
      .then(({ default: lottie }) => {
        if (disposed || !container.current) return;
        const animation = lottie.loadAnimation({
          container: container.current,
          renderer: "svg",
          loop: true,
          autoplay: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          path: src,
          rendererSettings: { progressiveLoad: true },
        });
        destroy = () => animation.destroy();
      })
      .catch(() => undefined);

    return () => {
      disposed = true;
      destroy?.();
    };
  }, [src]);

  return (
    <div
      ref={container}
      className={className}
      role="img"
      aria-label={label}
      data-lottie-src={src}
    />
  );
}
