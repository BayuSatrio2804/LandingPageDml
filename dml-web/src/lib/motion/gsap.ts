"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registered = false;

/**
 * GSAP 3.13 dan seluruh pluginnya gratis termasuk untuk penggunaan komersial.
 * Registrasi harus terjadi tepat satu kali per sesi browser.
 */
export function registerGsap(): void {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  registered = true;
}

/**
 * Menghitung ulang seluruh start/end ScrollTrigger di halaman.
 *
 * Wajib dipanggil setiap kali ada elemen yang mengubah tinggi dokumen SETELAH
 * trigger lain terlanjur dibuat. Beranda ini punya tiga sumber seperti itu:
 * kanvas hero yang dipasang setelah jeda idle, kanvas armada yang dimuat lewat
 * dynamic import plus IntersectionObserver, dan Lenis yang mengambil alih
 * scroll di efek terpisah. Tanpa penghitungan ulang, seksi yang trigger-nya
 * dibuat lebih dulu memakai koordinat dokumen yang sudah basi, dan pin-nya
 * mulai di tempat yang salah. Itu penyebab paling mungkin dari "seksi
 * berikutnya sudah jalan padahal seksi ini belum selesai".
 *
 * rAF-nya disengaja: refresh di tengah frame layout yang sama dengan
 * pemasangan kanvas akan mengukur tinggi yang belum final.
 */
export function refreshScrollTriggers(): void {
  if (typeof window === "undefined") return;
  window.requestAnimationFrame(() => ScrollTrigger.refresh());
}

export { gsap, ScrollTrigger, SplitText };
