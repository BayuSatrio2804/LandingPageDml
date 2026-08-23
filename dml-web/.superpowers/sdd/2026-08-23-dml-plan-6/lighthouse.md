# Baseline Lighthouse — Plan 6, 2026-08-23

Diukur setelah Fase 1 (hero "dua pintu" dipecah, bug logo sertifikasi
diperbaiki) dan Fase 2 sampai Task 13 (lockfile tunggal, aset mati dihapus).
Tiga run berurutan, mesin sesenggang mungkin (browser/aplikasi berat ditutup),
`bun run lighthouse` (`lhci autorun`, mobile-preset, throttling
mobile-slow-4G simulasi lhci).

## Beban mesin

| Run | `uptime` sebelum run | Load average (1m, 5m, 15m) |
|---|---|---|
| 1 | 16:31:38 | 1,25 / 1,85 / 1,70 |
| 2 | 16:32:13 | 2,43 / 2,07 / 1,78 |
| 3 | 16:32:47 | 2,97 / 2,26 / 1,86 |

Load 1 menit naik terus antar run (1,25 → 2,43 → 2,97) — mesin makin sibuk
tiap run berikutnya, kemungkinan besar dari build/start berulang itu sendiri.

## Angka tiap run

| Run | LCP | CLS | SEO | Performance |
|---|---|---|---|---|
| 1 | 3342 ms | 0,0002 | 1,00 | 0,80 |
| 2 | 3486 ms | 0,0002 | 1,00 | 0,88 |
| 3 | 3898 ms | 0,0001 | 1,00 | 0,86 |

Sebaran LCP antar run: 556 ms (3342–3898). Selisih run terburuk (3898 ms) ke
ambang assertion 5000 ms: 1102 ms. Sebaran (556 ms) **lebih sempit** dari
selisih ke ambang (1102 ms) — jadi di mesin ini, noise pengukuran tidak
menelan sinyalnya; ketiga run lolos assertion dengan margin yang nyata, bukan
kebetulan pas di tepi.

Ketiga run lolos `bun run lighthouse` tanpa assertion failure.

## Elemen LCP

Run representatif (run 3, `localhost--2026_08_23_09_33_05.report.json`):

```
selector: div.sticky > div.absolute > div.flex > h1.font-display
node:     <h1 data-hero-h1="true" class="font-display max-w-[22ch] …">
teks:     "Mitra Andal Distribusi Energi dan Penyeberangan Laut"
```

Elemen LCP adalah **headline `<h1>`**, bukan foto panel hero. Ini bukti
langsung bahwa kontrak LCP di `hero.tsx` (foto dan logo sertifikasi hanya
dipasang setelah `mounted`) bekerja seperti dimaksud: kandidat LCP browser
adalah teks yang sudah dicat dari HTML server, bukan gambar yang menunggu
jaringan.

## Kesimpulan

Elemen LCP **bergeser** dibanding Plan 4, yang mencatat **poster hero**
(gambar) sebagai elemen LCP pada 4228 ms. Sekarang elemen LCP adalah teks
headline, dan angkanya (3342–3898 ms) juga lebih rendah dari catatan Plan 4.
Pergeseran ini konsisten dengan perubahan hero dari kanvas 3D berposter tetap
menjadi panel foto "dua pintu" yang sengaja dipasang setelah hidrasi — bukan
regresi, melainkan hasil yang memang diharapkan dari kontrak LCP yang
didokumentasikan di kepala `hero.tsx`.

Karena sebaran run di mesin ini (556 ms) lebih sempit dari margin ke ambang
5000 ms (1102 ms), angka ini cukup bisa dipercaya untuk baseline lokal —
beda dengan skenario yang dikhawatirkan di awal Task 14, sebaran tidak
menelan sinyalnya di sini. Meski begitu, ini tetap pengukuran build-time di
satu mesin sandbox dengan load yang naik antar run; angka yang dipakai untuk
keputusan produksi (menaikkan kembali ambang assertion, misalnya) tetap harus
datang dari CI, bukan ledger ini.
