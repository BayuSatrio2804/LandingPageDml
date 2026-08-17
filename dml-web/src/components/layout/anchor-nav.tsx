"use client";

import { useEffect, useRef, useState } from "react";

export function AnchorNav({ items }: { items: { id: string; label: string }[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );
    observerRef.current = observer;
    for (const section of sections) observer.observe(section);

    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="Navigasi halaman" className="sticky top-20 flex gap-6 border-b border-surface-3 pb-3">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={activeId === item.id ? "true" : undefined}
          className={
            activeId === item.id
              ? "text-sm font-medium text-accent"
              : "text-sm font-medium text-ink-muted hover:text-ink"
          }
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
