"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { List, X } from "@phosphor-icons/react";
import type { NavItem } from "@/content/types";

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        // Fokus kembali ke tombol pemicu. Tanpa ini, pengguna keyboard yang
        // sedang berada di dalam menu kehilangan fokus sepenuhnya begitu
        // Escape membuat nav-nya hidden.
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="menu-mobile"
        className="flex size-10 items-center justify-center rounded-full transition-transform active:scale-[0.98]"
      >
        {open ? <X size={22} weight="regular" /> : <List size={22} weight="regular" />}
        <span className="sr-only">{open ? "Tutup menu" : "Buka menu"}</span>
      </button>

      <nav
        id="menu-mobile"
        aria-label="Navigasi utama mobile"
        hidden={!open}
        // Panel putih di atas bidang biru-putih, bukan bidang yang sama dengan
        // halaman. Di palet gelap panel bg-surface masih terpisah karena berada
        // di atas foto; di sini ia akan menyatu dengan latar dan menu terbaca
        // seperti halaman yang tiba-tiba menumpuk teks. Bayangan mengikuti
        // --shadow-bg pthis.id.
        className="fixed inset-x-0 top-16 border-b border-surface-3 bg-surface-2 px-4 pb-8 pt-4 shadow-[0_6px_18px_rgba(22,65,148,0.08)]"
      >
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.href}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-3 text-lg"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  href={item.href}
                  className="block py-3 text-lg"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
