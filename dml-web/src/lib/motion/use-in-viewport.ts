"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ViewportState = {
  /** Sedang berada di dekat viewport saat ini. */
  inViewport: boolean;
  /** Pernah berada di dekat viewport, sekali true tidak pernah kembali false. */
  hasEntered: boolean;
};

/**
 * Tuple, bukan objek. Objek dengan properti bernama `ref` atau `node` dibaca
 * eslint-plugin-react-hooks sebagai wadah ref, dan setiap pembacaannya di badan
 * komponen dilaporkan sebagai "cannot access refs during render". Destrukturisasi
 * array menghasilkan variabel lokal biasa, jadi aturan itu tidak salah tembak,
 * dan maksudnya tetap terjaga: `node` memang nilai state yang boleh dibaca saat
 * render, bukan ref.
 *
 * Urutan: node saat ini, pemasang ref untuk JSX, lalu RefObject untuk hook lain
 * yang memang menerima RefObject (useScrollProgress).
 */
export type ElementHandle<T extends Element> = readonly [
  T | null,
  (element: T | null) => void,
  React.RefObject<T | null>,
];

/**
 * Ref object dan node dalam satu genggaman.
 *
 * Alasannya spesifik dan sudah pernah menggigit: komponen seperti
 * FleetComparator merender jalur statis lebih dulu (snapshot server memilih
 * reduced motion), jadi di render pertama elemen panggungnya belum ada dan
 * `ref.current` masih null. Efek yang cuma bergantung pada `[ref]` berjalan
 * sekali di render itu, tidak menemukan apa pun, dan tidak pernah dijalankan
 * lagi ketika panggungnya akhirnya muncul setelah hidrasi. Akibatnya observer
 * tidak pernah terpasang, `inViewport` selamanya false, dan kanvas WebGL yang
 * frameloop-nya bergantung padanya tidak pernah menggambar satu frame pun.
 *
 * Callback ref memicu render ulang saat node berganti, jadi efek yang
 * bergantung pada `node` selalu berjalan ulang di saat yang tepat.
 */
export function useElementHandle<T extends Element>(): ElementHandle<T> {
  const elementRef = useRef<T | null>(null);
  const [node, setState] = useState<T | null>(null);

  const attach = useCallback((element: T | null) => {
    elementRef.current = element;
    setState(element);
  }, []);

  return [node, attach, elementRef];
}

/**
 * Dua jawaban dari satu IntersectionObserver, karena kanvas WebGL butuh
 * keduanya dan keduanya berbeda:
 *
 * - `hasEntered` memutuskan kapan kanvas DIPASANG. Sekali dipasang ia tidak
 *   dilepas lagi; membongkar konteks WebGL berarti seluruh model harus
 *   diunggah ulang ke GPU setiap kali pengguna menggulir balik.
 * - `inViewport` memutuskan kapan kanvas MENGGAMBAR. Tanpa ini,
 *   react-three-fiber terus berjalan dengan frameloop "always" sepanjang umur
 *   halaman, jadi dua kanvas beranda membakar CPU di seluruh seksi lain yang
 *   tidak memuat 3D sama sekali. Di mesin tanpa akselerasi GPU, dua kanvas
 *   menganggur saja cukup untuk menahan main thread.
 *
 * Keduanya diset dari callback observer, bukan dari badan efek, supaya tidak
 * memicu render bertingkat yang ditolak react-hooks/set-state-in-effect.
 *
 * rootMargin dilebihkan supaya kanvas sudah menggambar satu frame sebelum
 * benar-benar masuk layar, bukan menyala setelah terlihat.
 */
export function useInViewport(node: Element | null, rootMargin = "300px"): ViewportState {
  const [state, setState] = useState<ViewportState>({ inViewport: false, hasEntered: false });

  useEffect(() => {
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setState((previous) => ({
            inViewport: entry.isIntersecting,
            hasEntered: previous.hasEntered || entry.isIntersecting,
          }));
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, rootMargin]);

  return state;
}
