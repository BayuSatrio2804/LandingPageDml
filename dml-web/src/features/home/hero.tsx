import { HeroJourney } from "./hero-journey";

/**
 * Hero porthole sinematik. Ini satu-satunya seksi beranda yang sengaja tetap
 * gelap setelah situs pindah ke tema terang (lihat globals.css): efek kaca
 * kuningan dan video langit di baliknya butuh latar gelap untuk terbaca,
 * dan bidang gelap tunggal ini juga yang memberi seksi kedua (foto penuh
 * layar terang) sesuatu untuk dibuka.
 */
export function Hero() {
  return <HeroJourney />;
}
