"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Default-nya true. Sebelum hidrasi kita belum tahu preferensi pengguna,
 * dan pilihan yang aman adalah tidak menganimasikan apa pun.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    setReduced(mql.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
