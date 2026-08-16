import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

export function ExternalLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {label}
      <ArrowUpRight size={14} weight="regular" aria-hidden />
      <span className="sr-only">(membuka situs lain)</span>
    </a>
  );
}
