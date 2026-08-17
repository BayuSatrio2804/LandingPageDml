/**
 * Satu sumber durasi dan easing supaya gerak antar seksi terasa satu tangan.
 * Nilai di sini dipakai langsung sebagai argumen GSAP, jadi format easing
 * mengikuti penamaan GSAP, bukan cubic-bezier CSS.
 */
export const MOTION = {
  fast: 0.3,
  base: 0.6,
  slow: 1.1,
  ease: "power3.out",
  easeInOut: "power2.inOut",
  scrub: 1,
} as const;
