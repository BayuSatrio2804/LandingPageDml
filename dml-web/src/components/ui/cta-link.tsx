import Link from "next/link";

/*
 * Dua varian, satu aksen. Varian ghost memakai token line, bukan ink dengan
 * alpha: WCAG 1.4.11 menuntut 3:1 untuk batas kontrol, dan border-ink/30 di
 * atas bidang terang cuma sampai sekitar 2:1. Di palet gelap yang lama angka
 * itu lolos, jadi ini bukan sekadar ganti rona.
 */
const BASE = "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap";

const VARIANTS = {
  filled: `${BASE} bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-press`,
  ghost: `${BASE} border border-line text-accent hover:border-accent hover:bg-accent-soft active:bg-accent-soft`,
} as const;

export function CtaLink({
  href,
  variant = "filled",
  children,
}: {
  href: string;
  variant?: keyof typeof VARIANTS;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={VARIANTS[variant]}>
      {children}
    </Link>
  );
}
