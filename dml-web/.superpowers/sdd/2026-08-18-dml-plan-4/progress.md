# Ledger Plan 4 — Overhaul Beranda

Ditulis progresif selama eksekusi, bukan direkonstruksi di akhir. Format per
task: status, deviasi dari plan (kalau ada) beserta alasan dan bukti ukur.

## Status task

- [x] Task 1: Fondasi bersama, komponen dan token motion
- [x] Task 2: Perbaiki sticky-stack lini bisnis
- [x] Task 3: Seksi potong ke siang dengan zoom parallax
- [x] Task 4: Ganti seksi Silsilah dengan Sejak 1985
- [x] Task 5: Pipeline peta, garis pantai asli dan koordinat geografis
- [x] Task 6: Seksi sertifikasi jadi band data
- [x] Task 7: Seksi rute ro-ro dengan peta asli
- [x] Task 8: Pipeline model 3D
- [x] Task 9: Baris kredit model di footer dan ritme seksi CTA
- [x] Task 10: Panggung 3D bersama
- [x] Task 11: Fleet comparator 3D realistis
- [x] Task 12: Hero 3D
- [x] Task 13: Gerbang akhir dan keputusan ambang LCP

## Hasil ukur Lighthouse (Task 13)

Diukur 18 Agustus 2026 lewat `bun run lighthouse` (build produksi,
`lighthouserc.json` tidak disentuh sama sekali di seluruh Plan 4):

| Metrik | Ambang | Terukur | Status |
|---|---|---|---|
| `largest-contentful-paint` | 5000 ms | **4228 ms** | Lulus, margin 772 ms |
| `cumulative-layout-shift` | 0,1 | **0** | Lulus |
| `categories:seo` | 0,95 | **1,0** | Lulus |

Skor performa keseluruhan Lighthouse (tidak digerbang, hanya dicatat): 0,70.
FCP 1079 ms, TBT 617 ms.

**Keputusan: pelonggaran ambang LCP yang disetujui di spec §7.1 Delta 4
(batas atas 6000 ms) tidak dipakai.** Poster `<Image priority>` tetap
elemen LCP dan canvas hero baru mount 600 ms setelah idle, persis seperti
desain §5.1 yang dirancang supaya LCP nyaris tidak bergeser dari baseline
sebelum Plan 4.

## Deviasi dari plan

### Task 5 — bridge sementara di route-map.tsx
`ports.ts` Task 5 mengganti `Port.x/y` jadi `lat/lon` geografis, tapi
`route-map.tsx` (konsumennya) baru ditulis ulang penuh di Task 7. Tanpa
perbaikan, `bun run typecheck` gagal di antara dua task itu, melanggar
gerbang per-task. Ditambahkan jembatan minimal: `project(port)` menggantikan
`port.x/port.y` di tiga titik pakai, `viewBox` dinaikkan ke `1000x620`.
Empat baris, dibuang penuh saat Task 7 menulis ulang seksi itu. Disertakan
dalam commit Task 5.

### Task 5 — perbaikan noUncheckedIndexedAccess dan cast MultiPolygon di prepare-map.ts
Kode plan untuk `scripts/prepare-map.ts` tidak lolos `tsc --noEmit` di bawah
`noUncheckedIndexedAccess: true` (tsconfig proyek). Diperbaiki:
`perpendicularDistance`/`insideBounds` pakai `point[0] ?? 0` bukan
destructuring array langsung. Juga ditemukan bug nyata: cast
`coordinates as Ring[][][]` untuk cabang MultiPolygon kelebihan satu level
array (harusnya `Ring[][]`, karena `Ring` sudah berarti satu ring/array
posisi) — itu yang memicu error overload `.some()`. Hasil skrip
(`coastline.json`, 49 poligon, 27.665 byte) identik sebelum dan sesudah
perbaikan tipe.

### Task 6 — destructure useCounter di certifications.tsx
Kode plan menulis `const counter = useCounter(value)` lalu mengakses
`counter.value`/`counter.ref` di render. ESLint `react-hooks/refs` menolak
ini (empat error: "Cannot access ref value during render") karena tidak bisa
memastikan `counter.value` bukan `counter.ref.current`. Diperbaiki dengan
destructuring langsung `const { ref, value: current } = useCounter(value)`,
pola yang sudah dipakai `since-1985.tsx`. Tidak ada perubahan perilaku.

### Task 8 — Draco menggantikan quantize (jalan mundur terdokumentasi, spec §4.2 poin 5)
Rencana awal (`--compress quantize`) gagal memenuhi anggaran 700 kB per
model. Diverifikasi lewat pengujian langsung: ketiga model Sketchfab
(tanker, ferry, tugboat) tidak bisa disederhanakan meshoptimizer di bawah
~55% jumlah segitiga asli berapa pun `--simplify-ratio`/`--simplify-error`
dilonggarkan (diuji sampai `ratio=0`, `error=0.08`, `lockBorder=false`, dan
`weld` dengan toleransi 0.001 lewat scripting API langsung) — mentok di
±107.000 tris dari 193.100 tris. Kandidat cadangan (Oil Tanker,
UID `0b857798...`) diuji juga dan menunjukkan pola resistensi yang sama
(7,08 MB → 6,06 MB dengan quantize). Kesimpulan: lambung ketiga model
mengandung puluhan bagian kecil terpisah (railing, pipa, tangga) yang sudah
dekat jumlah segitiga minimalnya masing-masing, bukan satu mesh homogen yang
bisa didesimasi merata.

Draco diuji pada mesh yang sama (`--compress draco`, ratio/error sama):
tanker 10,2 MB → 214 kB. Hasil akhir pipeline penuh: tanker 214 kB, ferry
290 kB, tugboat 342 kB, total 846 kB — jauh di bawah anggaran 2,2 MB.

**Konsekuensi runtime:** GLB berisi `KHR_draco_mesh_compression` di
`extensionsRequired`. Decoder di-self-host dari
`node_modules/three/examples/jsm/libs/draco/gltf/` ke `public/draco/`
(tiga berkas dikomit: `draco_decoder.wasm` 187,9 kB + `draco_wasm_wrapper.js`
57,1 kB + `draco_decoder.js` 500,5 kB, total 745,5 kB berkas repo). Runtime
browser modern hanya mengunduh pasangan WASM (~245 kB: wasm + wrapper);
`draco_decoder.js` adalah fallback non-WASM yang jarang diminta browser
modern — dua angka ini dicatat terpisah supaya tidak disalahartikan sebagai
biaya jaringan tunggal.

Setiap `useGLTF(url)` di Task 11 dan Task 12 **wajib** memakai
`useGLTF(url, "/draco/")` (path lokal, bukan default drei yang mengambil
decoder dari CDN gstatic Google) — kalau tidak, prinsip nol dependency
runtime pihak ketiga yang jadi alasan pipeline ini self-host akan dilanggar
diam-diam. `useGLTF.preload(url)` juga wajib memakai argumen kedua yang sama
supaya tidak membuat dua konfigurasi loader (cache miss).

### Task 8 — devDependency @types/bun ditambahkan
`prepare-models.ts` memakai `Bun.spawn`, yang butuh definisi tipe `Bun`
global. `tsconfig.json` tidak eksplisit mendaftarkan `types`, jadi TS hanya
resolve `@types/*` yang terpasang. Ditambahkan `@types/bun` sebagai
devDependency supaya `tsc --noEmit` lolos.

### Task 8 — eslint.config.mjs mengabaikan public/draco/**
`public/draco/draco_decoder.js` adalah berkas vendor terminifikasi (disalin
apa adanya dari `three`). ESLint menganggapnya kode tulisan tangan dan
melaporkan 230 masalah (9 error: `no-require-imports`,
`no-assign-module-variable`, `no-this-alias`). Ditambahkan
`public/draco/**` ke `globalIgnores`.

### Task 8 — assets/_raw/models/ tidak ditambahkan ke .gitignore
Plan meminta baris `assets/_raw/models/` ditambahkan ke `.gitignore` root.
Dilewati: `.gitignore` root sudah punya `assets/_raw/` (dengan trailing
slash), yang sudah meng-ignore seluruh isi direktori itu secara rekursif,
termasuk `models/`. Diverifikasi: `git status` tidak pernah menampilkan
berkas GLB mentah di `assets/_raw/models/`.

### Task 10 — doctor unused-file pada stage.tsx (transient, self-resolving)
`bun run doctor` menandai `src/features/home/three/stage.tsx` sebagai
`deslop/unused-file` karena belum ada importer sampai Task 11 dan 12
mengonsumsinya (pola sama dengan `useScrollProgress` di Task 1). Berbeda
dari kasus itu, tidak ditambahkan test: `fleet-canvas.tsx` yang sudah ada di
codebase (dikonsumsi via dynamic import di `fleet-comparator.tsx`) juga
tidak punya test sendiri — konvensi proyek adalah komponen kanvas R3F/drei
diverifikasi lewat checkpoint browser, bukan test jsdom (drei/@react-three
butuh WebGL context yang tidak ada `@react-three/test-renderer` terpasang).
Warning ini otomatis hilang begitu Task 11 mengimpor `Stage`, diverifikasi
saat gerbang Task 11 dijalankan.

### Task 11 — bug skala dan hadap ModelHull di fleet-canvas.tsx
Kode plan menghitung skala model GLB dengan `lengthMeters / 10 / size.x`,
mengasumsikan sumbu X selalu sumbu memanjang lambung. Diverifikasi lewat
debug log browser: tidak benar. Ukuran bounding box dunia nyata (sesudah
`Box3.setFromObject`, jadi sudah menghitung transform node scene):
tanker (20.06, 27.06, **160.87**), tugboat (13.51, 23.05, **32.88**) —
keduanya panjang di sumbu Z — sementara ferry (**53.50**, 23.55, 12.30)
panjang di sumbu X. Root transform scene beda-beda tiap penulis Sketchfab.
Akibat kode asli: tanker terpasang dengan sumbu X (lebar, 20.06) sebagai
acuan skala, membuatnya tampil sekitar delapan kali lebih besar dari
seharusnya, dan kamera fit-to-object yang dihitung dari `lengthMeters`
asumsi lama jadi salah total (lambung nyaris memenuhi frame dari jarak
dekat).

Diperbaiki: pakai `Math.max(size.x, size.y, size.z)` sebagai acuan skala,
plus rotasi Y 90 derajat kalau sumbu terpanjang adalah Z, supaya tanker dan
tugboat menghadap sumbu X yang sama dengan ferry dan dua lambung buatan
(`hull-geometry.ts` membangun bentuknya memanjang di X). Perbaikan yang
sama **wajib** diterapkan di Task 12 (`hero-canvas.tsx`), karena modelnya
juga tanker (panjang di Z) dan memakai pola `size.x` yang sama persis.

### Task 11 — checkpoint browser Delta 2: PBR dipertahankan, bukan mundur ke wireframe
Percobaan pertama (hull-geometry.ts tidak disentuh, cuma material diganti)
gagal di checkpoint: `BuiltHull` (SPOB, Oil Barge) berupa lambung datar plus
satu kotak polos, terbaca sebagai placeholder di sebelah tiga model GLB
berdetail (railing, deckhouse bertingkat, propeller terlihat). Warna
material yang sama tidak cukup membuatnya terbaca sebagai satu keluarga.

Diperbaiki dengan artikulasi tambahan di level komponen
(`fleet-canvas.tsx`, bukan `hull-geometry.ts`, supaya berkas dan testnya
yang sudah lulus tidak disentuh): `buildBulwarkGeometry` (pagar geladak,
ring hasil `ExtrudeGeometry` dengan lubang, dari `buildHullShape` yang
sudah diekspor) dan `buildUpperDeckGeometry` (tingkat kedua deckhouse).
Diverifikasi ulang lewat screenshot browser: kedua lambung buatan sekarang
punya siluet berlapis (pagar geladak + deckhouse dua tingkat) yang terbaca
sebagai versi lebih sederhana dari model GLB, bukan lagi placeholder
kosong. Satu putaran perbaikan, sesuai kerangka keputusan dua-putaran:
kalau masih tidak menyatu, mundur ke wireframe untuk seluruh seksi.
**Keputusan: PBR dipertahankan.**

### Task 11 — margin kamera fit dinaikkan (tugboat terpotong di frame)
Checkpoint yang sama menemukan tiang tugboat terpotong di tepi atas frame,
melanggar syarat plan "setiap lambung muat penuh dalam frame tanpa
terpotong". Penyebab: `radius = lengthMeters / 20` di `Rig` (fleet-canvas.tsx)
cuma separuh panjang kapal, tidak memperhitungkan tinggi tiang/deckhouse.
Kelas terpendek (tugboat, 32 m) proporsi tiangnya terhadap panjang lebih
besar dari kelas lain, jadi margin default `fitCameraDistance` (1.15) tidak
cukup. Dinaikkan ke 1.5 di titik panggil itu saja (bukan mengubah default
fungsi, supaya perilaku Task 10 `fitCameraDistance` tidak berubah untuk
pemanggil lain). Diverifikasi: tiang tugboat penuh dalam frame, bayangan
kontak duduk di lunas, tanker di kelas terbesar masih memenuhi frame secara
wajar dengan margin baru.

### Task 12 — perbaikan skala dan hadap diterapkan sejak awal
Bug yang ditemukan di Task 11 (skala pakai `size.x` tetap, seharusnya
dimensi terpanjang bounding box) langsung diterapkan di `hero-canvas.tsx`
sejak ditulis, tidak menunggu ditemukan ulang: model hero adalah tanker
yang sama, panjang aslinya juga di sumbu Z. Arah rotasi di hero **kebalikan**
dari fleet-canvas.tsx: fleet-comparator menghadapkan semua lambung ke sumbu
X (konvensi `hull-geometry.ts`), sedangkan hero merotasi ke X supaya
menyamping terhadap kamera awal yang duduk di sumbu +Z (`position: [0, 3,
26]`) — tujuannya supaya dolly-in dan orbit CameraRig menyingkap profil sisi
kapal, bukan memandang haluan lurus dari depan. Diverifikasi lewat
screenshot browser: siluet kapal tampak memanjang horizontal (menyamping),
bukan mengecil ke satu titik.

### Task 13 — tabrakan e2e "Sejak 1985" antara headline hero dan heading Since1985
`bun run test:e2e` gagal di dua spec (`beranda.spec.ts`, `no-js.spec.ts`)
dengan strict-mode violation: `getByRole("heading", { name: "Sejak 1985" })`
tanpa `exact` cocok dengan DUA elemen setelah Task 12 — H1 hero
("Menggerakkan energi Kalimantan **sejak 1985**.") mengandung substring yang
sama dengan H2 Since1985 ("Sejak 1985"). Assertion ditulis di Task 4,
sebelum headline final Task 12 ada, jadi tabrakannya baru muncul di gerbang
akhir. Diperbaiki dengan menambah `level: 2` di kedua assertion (Since1985
memang satu-satunya H2 dengan teks itu). Tidak mengubah teks headline hero
maupun heading Since1985.

### Task 13 — hasil e2e, verifikasi visual, dan ukuran akhir aset
`bun run test:e2e`: 23/23 lulus (build produksi), termasuk `no-js`,
`reduced-motion`, `beranda` (axe-core nol violation, contrast-tokens,
canvas count nol saat reduced motion dan di mobile 375px), `hero`, dan
`kredit-model`.

Verifikasi visual (screenshot Playwright, bukan mata telanjang) di 1440x900
dan 375x812, dev server maupun build produksi: kartu lini bisnis mengisi
penuh 100dvh tanpa pita (cacat 1 hilang), peta rute full-bleed dengan garis
pantai asli dan tiga leg terpisah (cacat 2 dan 3 hilang), Since1985
menggantikan silsilah tanpa kartu tunggal menempel kiri (cacat 5 hilang),
comparator armada menampilkan lima lambung berskala benar tanpa
terpotong (cacat 6 hilang, lihat detail Task 11), band data sertifikasi
menampilkan 4 pelabuhan yang benar. Catatan tooling: screenshot lewat
`window.scrollTo` terhalang oleh Lenis (smooth-scroll) berinteraksi dengan
banyak pin ScrollTrigger di halaman yang sudah sepanjang ini; verifikasi
seksi bawah (Since1985, Certifications, footer) akhirnya memakai
`reducedMotion: "reduce"` di context Playwright, yang menonaktifkan Lenis
dan seluruh pin sehingga scroll native langsung bekerja — bukan indikasi
bug di situs, sudah dikonfirmasi lulus juga oleh e2e
`beranda.spec.ts` "seluruh 8 seksi tampil penuh tanpa motion".

Ukuran akhir aset yang di-commit:
- `public/models/tanker.glb`: 214 kB
- `public/models/ferry.glb`: 290 kB
- `public/models/tugboat.glb`: 342 kB (total tiga model: 846 kB, anggaran 2,2 MB)
- `public/draco/` (decoder self-host): 745,5 kB berkas repo, ~245 kB benar-benar diunduh browser (wasm+wrapper; `draco_decoder.js` fallback non-WASM jarang diminta)
- `src/features/route-map/coastline.json`: 27.665 byte (27 kB), anggaran 60 kB

Temuan pra-eksisting, bukan regresi Plan 4: nav `Bisnis Kami` dan `Artikel`
mengarah ke rute yang belum dibangun (`/bisnis`, `/artikel`), memicu 404
saat Next.js RSC prefetch di console browser. Di luar scope Plan 4 (spec
§10 mengonfirmasi `/bisnis/*` dan sistem artikel belum dibangun).

## Catatan untuk Task 13

`.superpowers/` masuk `.gitignore` root repo (baris 26), jadi `git add
.superpowers/sdd/2026-08-18-dml-plan-4/progress.md` di Step 7 Task 13 butuh
`git add -f` supaya benar-benar ter-commit sesuai instruksi plan.

## Item `// unverified` yang perlu konfirmasi klien

- Koordinat Ketapang (`src/features/route-map/ports.ts`): diasumsikan
  Ketapang, Banyuwangi, Jawa Timur (lat -8.145, lon 114.383), disimpulkan
  dari pasangan rutenya ke Lembar dan Tanjung Perak di master spec, bukan
  dari nama saja. Bukan Ketapang, Kalimantan Barat.
- Koordinat pelabuhan lain (Lembar, Tanjung Perak, Kumai): dari sumber
  publik, belum diverifikasi klien.
