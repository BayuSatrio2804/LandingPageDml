export function SectionHeader({
  title,
  description,
  id,
  className,
}: {
  title: string;
  description?: string;
  id?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 id={id} className="font-display text-3xl font-bold text-ink md:text-5xl">
        {title}
      </h2>
      {description ? <p className="mt-4 max-w-[55ch] text-ink-muted">{description}</p> : null}
    </div>
  );
}
