import Link from "next/link";

const BASE = "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap";

const VARIANTS = {
  filled: `${BASE} bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-press`,
  ghost: `${BASE} border border-ink/30 text-ink hover:border-ink hover:bg-surface-2`,
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
