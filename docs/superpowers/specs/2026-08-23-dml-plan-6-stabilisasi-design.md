# Plan 6: Stabilisasi current state dml-web

Design spec, 23 Agustus 2026. Plan pemeliharaan, bukan plan fitur. Tidak ada halaman
baru, tidak ada perubahan struktur URL, tidak ada keputusan tech stack yang dibuka lagi.

## 1. Kenapa plan ini ada

Sejak Plan 5 ditutup pada 18 Agustus, cabang `denis` menerima enam commit dari dua
kolaborator di luar alur spec-plan-ledger: palet warna diganti ke navy pthis.id, font
display ditukar dari Cabinet Grotesk ke GT America Extended, latar seksi beranda diberi
gradasi, kartu rute didesain ulang jadi timeline bernomor, dan hero ditulis ulang
sepenuhnya jadi "dua pintu" berbelahan diagonal. Dua file hero lama, `hero-canvas.tsx`
dan `hero-headline.tsx`, dihapus dalam prosesnya.

Perubahan itu sendiri diterima. Yang tidak ikut adalah pekerjaan rapi-rapi di
belakangnya: aset yang ditinggalkan hero lama masih ada, aset yang dirujuk hero baru
belum pernah dibuat, dan gerbang mutu yang dulu hijau sekarang merah. Plan ini menutup
jarak itu supaya plan penyelesaian project berikutnya berangkat dari dasar yang bersih.

## 2. Keadaan terukur per 23 Agustus 2026

Seluruh angka di bawah berasal dari menjalankan perintahnya, bukan dari pembacaan kode.

| Gerbang | Hasil |
|---|---|
| `bun run lint` | 0 error, 3 warning |
| `bun run typecheck` | bersih |
| `bun run test` | 187 lolos dari 187, 36 file |
| `bun run build` | lolos, 9 rute |
| `bun run doctor` | **exit 1** — 10 temuan, 1 di antaranya error |
| `bun run test:e2e` | **exit 1** — 23 lolos dari 24 |
| `bun run lighthouse` | belum diukur ulang sejak hero berubah |

`bun run check` karena itu merah. Definisi selesai plan ini adalah `check` hijau untuk
setiap gerbang kecuali lighthouse, yang perlakuannya dijelaskan di bagian 6.

### 2.1 Daftar temuan

Sebelas butir, semuanya sudah diverifikasi langsung di kode atau di filesystem.

1. **Logo sertifikasi hero merujuk file yang tidak pernah ada.** `hero.tsx`
   memuat `/assets/cert/iso-9001.png`, `/assets/cert/ism-code.png`, dan
   `/assets/cert/hsse.png`. Direktori `public/assets/` tidak ada. Pencarian ke seluruh
   repo dan ke `assets/` di luar repo tidak menemukan satu pun dari ketiganya. Akibatnya
   tiga gambar rusak di viewport ≥900 px dengan tinggi ≥760 px. Tidak ada tes yang
   menangkapnya karena elemen itu hanya dipasang setelah hidrasi.
2. **Hero mengklaim sertifikasi yang tidak ada di lapisan data.** Array `CERTS` di
   `hero.tsx` menyebut HSSE. `COMPANY.standards`, yang bersumber dari CP DML.pdf,
   memuat ISO 9001:2015, ISM Code, ISPS Code, SIRE, BKI, dan SAP — tanpa HSSE. Hero juga
   menduplikasi daftar sertifikasi yang sumber tunggalnya sudah ada di `src/content/`.
3. **`GROUP_UNITS` tidak pernah dirender.** Komentarnya menyatakan data itu dipakai
   halaman Tentang Kami, tetapi tidak ada satu pun import di seluruh `src/`. Struktur
   grup Sinar Alam hasil ekstraksi PDF halaman 01 tersimpan tanpa pernah tampil.
4. **`hero.tsx` 500+ baris dalam satu komponen**, ditandai react-doctor sebagai
   `no-giant-component`.
5. **Tween `gsap.quickTo` tidak di-`kill()`** pada efek magnetic CTA, `hero.tsx:245`.
   React-doctor melaporkannya sebagai `effect-needs-cleanup` bertingkat error; pembacaan
   kode menunjukkan event listener-nya sudah dibersihkan dengan benar dan yang tertinggal
   hanya tween-nya. Severity sebenarnya lebih rendah dari label alatnya.
6. **`will-change` permanen di dua tempat**, `hero.tsx:279` dan `hero.tsx:344`.
7. **`<img>` mentah** untuk logo sertifikasi, `hero.tsx:365`.
8. **`transition: all`** di `route-map.tsx:166`.
9. **4,6 MB aset mati.** `public/media/hero-malam/` berisi sepuluh frame dalam empat
   lebar dan dua format, delapan puluh file, dan tidak dikonsumsi komponen mana pun sejak
   hero ditulis ulang. `manifest.test.ts` masih menegaskan "hero-malam punya 10 frame",
   jadi tes itu menjaga data mati.
10. **Dua lockfile ter-commit.** `bun.lock` dan `package-lock.json` sama-sama dilacak git
    padahal `package.json` menyatakan `packageManager: bun@1.3.14`. `bun.lock` juga masih
    dirty di working tree.
11. **`lottie-web` terpasang tanpa satu pun rujukan** di `src/`, `scripts/`, atau `tests/`.
12. **Inisialisasi ref berjalan tiap render** di `fleet-canvas.tsx:265`. Argumen
    `useRef` dievaluasi setiap render meski hasilnya dibuang setelah render pertama.
13. **Objek three.js dikonstruksi saat render** di `fleet-canvas.tsx:267`, di dalam
    inisialisasi ref yang sama: sebuah `THREE.Vector3` per kelas armada, tiap render.
    Butir 12 dan 13 adalah satu cacat yang dilaporkan dua aturan, dan diperbaiki sekaligus.

Di luar tiga belas butir itu, ada tiga inkonsistensi sistem yang tidak dilaporkan alat mana
pun karena tidak ada yang memeriksanya:

- `tokens.ts` menyatakan nilainya wajib identik dengan blok `@theme` di `globals.css`.
  Tidak ada tes yang memeriksa identitas itu; `tokens.test.ts` hanya menguji rasio
  kontras. Palet baru saja diganti tangan di kedua file.
- `hero.tsx` menulis path media secara harfiah, `/media/lini-bisnis/operasi-sts-2400.webp`
  dan `/media/lini-bisnis/penumpang-roro-2400.webp`, melewati `MEDIA` manifest yang
  seharusnya jadi sumber tunggal path dan alt-text.
- `day-cut.tsx` masih memakai `bg-surface-2` polos sementara delapan seksi beranda lain
  sudah pindah ke `.bg-surface-wash` atau `.bg-surface-2-wash`.

### 2.2 Kegagalan e2e

Satu tes gagal, `kontak.spec.ts:14`, "form kontak sukses submit mengalihkan ke WhatsApp".
Penyebab langsungnya Postgres tidak berjalan sehingga Payload melempar
`cannot connect to Postgres` dan server action gagal. Dua hal yang ikut terungkap dari
situ dan keduanya nyata:

- README tidak menyebut bahwa `docker compose up -d` wajib berjalan sebelum
  `bun run test:e2e`, padahal `playwright.config.ts` hanya menjalankan build dan start.
- Saat server action gagal, form tidak menampilkan apa pun kepada pengguna. Tombol
  ditekan, tidak ada yang terjadi, tidak ada pesan. Itu cacat pengalaman pengguna yang
  berlaku di produksi juga, bukan hanya di lingkungan tes.

## 3. Keputusan yang sudah diambil

Enam keputusan diambil pengguna sebelum spec ini ditulis dan mengikat seluruh isinya.

| Pertanyaan | Keputusan |
|---|---|
| Hero "dua pintu" | Diterima. Dikeraskan, tidak di-rollback. Aset hero lama boleh dihapus permanen. |
| `origin/master` (prototipe Vite tanpa nenek moyang bersama) | Dibiarkan apa adanya. Plan ini tidak menyentuh branch, tidak melakukan push. |
| Kedalaman scope | Gerbang hijau, bug nyata, hygiene, ditambah konsistensi design system. |
| Lighthouse | Diukur ulang dan dicatat, tidak jadi gerbang yang memblokir. |
| Logo sertifikasi | Placeholder dulu, ditukar aset asli setelah klien mengirimnya. |
| `GROUP_UNITS` | Dirender sekarang juga di halaman Tentang Kami. |

## 4. Bentuk plan

Tiga fase berpagar. Fase berikutnya tidak dimulai sebelum fase sebelumnya hijau dan
ter-commit. Alasannya spesifik ke repo ini: ledger Plan 4 mencatat dua cacat visual yang
lolos justru karena unit test proxy-nya hijau, dan post-mortem-nya menyimpulkan gerbang
yang menyertakan verifikasi nyata adalah satu-satunya yang menutup celah itu. Satu fase
panjang dengan gerbang di ujung akan mengulang pola yang sudah pernah gagal di sini.

Gerbang tiap fase: `lint`, `typecheck`, `test`, `build`, `test:e2e` seluruhnya hijau, lalu
satu commit yang menutup fase.

`doctor` diperlakukan berbeda dan ini penting. Ia tidak bisa dituntut exit-0 di ujung Fase 1
maupun Fase 2, karena dua temuannya baru bisa hilang di fase belakangan: `unused-dependency`
baru bersih setelah 2.2, dan `unused-export` baru bersih setelah 3.4 merender `GROUP_UNITS`.
Menuntut doctor hijau di gerbang Fase 1 berarti fase itu gagal karena pekerjaan yang bukan
miliknya. Jadi aturannya: **tiap fase wajib menutup temuan doctor yang jadi tanggung
jawabnya dan tidak boleh menambah temuan baru; doctor exit-0 penuh adalah kriteria keluar
Fase 3, bukan Fase 1 atau 2.** Pembagiannya:

| Fase | Temuan doctor yang harus bersih di ujung fase |
|---|---|
| 1 | `effect-needs-cleanup`, `no-giant-component`, `no-permanent-will-change` ×2, `nextjs-no-img-element`, `no-transition-all`, `rerender-lazy-ref-init`, `three-no-object-construction-in-render` |
| 2 | ditambah `unused-dependency` |
| 3 | ditambah `unused-export` — dan pada titik ini `bun run doctor` harus exit 0 |

Setiap temuan react-doctor dibaca dulu di kode sebelum diperbaiki. Alat itu sendiri
menginstruksikan begitu, dan butir 5 di bagian 2.1 sudah membuktikan labelnya bisa lebih
berat dari keadaan sebenarnya.

### Fase 1 — Merah jadi hijau

Penomoran di bawah adalah penomoran design, bukan penomoran task. Plan
implementasinya menggabungkan 1.1 dan 1.5 jadi satu task karena keduanya tidak
bisa dipisah — memisahkannya menghasilkan task yang berakhir dengan tes merah dan
tanpa deliverable yang bisa diverifikasi sendiri. Fase 1 karena itu berisi
delapan task, bukan sembilan.

**1.1 Strip sertifikasi hero.** Buat `public/assets/cert/` berisi tiga placeholder **PNG**
di path yang persis dirujuk hero sekarang. Placeholder memakai token palet, rasio tetap,
dan mencantumkan nama standarnya sebagai teks di dalam gambar supaya tidak terbaca sebagai
kotak kosong. Dibangkitkan lewat `sharp`, yang sudah jadi dependency, bukan dicari dari luar.

Formatnya PNG dan bukan SVG karena dua alasan yang saling menguatkan. Pertama,
`next.config.ts` tidak menyetel `images.dangerouslyAllowSVG`, jadi `next/image` akan menolak
mengoptimalkan `src` SVG dan tugas 1.5 langsung bertabrakan dengan pilihan format ini.
Kedua, aset asli dari klien hampir pasti raster, dan menyamakan format placeholder dengan
format penggantinya membuat penukaran nanti jadi menimpa file, bukan mengubah kode.
Menaruh byte SVG di path berakhiran `.png` bukan jalan tengah: content-type-nya jadi
`image/png` dan gambarnya rusak — persis bug yang sedang diperbaiki.

Daftar sertifikasi pindah dari array lokal di `hero.tsx` ke `src/content/` dan diturunkan
dari `COMPANY.standards`. Path aset ikut tinggal di lapisan data itu, sehingga menukar
placeholder dengan logo asli cukup satu suntingan data kalau nama filenya berubah, dan nol
suntingan kalau tidak.

HSSE dipertahankan tapi ditandai sumbernya sebagai belum terverifikasi, bukan dihapus.
Menghapusnya diam-diam membuang informasi yang mungkin benar untuk operator tanker;
menandainya membuat klien bisa mencoretnya tanpa menebak, sesuai konvensi `source` yang
sudah dipakai `COMPANY.standards`.

Tes baru mengunci dua hal: setiap path aset sertifikasi yang dirujuk kode harus benar-benar
ada di `public/`, dan daftar di hero harus berasal dari lapisan data, bukan dari literal.
Tes pertama itu yang menahan bug ini kambuh saat aset asli nanti masuk.

**1.2 Pecah `hero.tsx`.** Menjadi `hero.tsx` untuk komposisi dan state,
`hero-doors.tsx` untuk panel dan foto, `hero-copy.tsx` untuk headline, subteks, dan CTA,
serta `use-hero-choreography.ts` untuk seluruh GSAP. Kontrak LCP yang didokumentasikan di
kepala file dipertahankan utuh: panel foto dan logo sertifikasi tetap hanya dipasang
setelah hidrasi, dan `hero.test.tsx` yang mengunci "tidak ada `<img>` di HTML server"
harus tetap lolos setelah pemecahan.

**1.3 Cleanup tween magnetic CTA.** Kumpulkan tween `gsap.quickTo` dan `kill()` di
fungsi cleanup, bukan hanya melepas listener.

**1.4 `will-change`.** Dipasang saat animasi mulai, dilepas saat selesai, di kedua tempat.

**1.5 `<img>` jadi `next/image`** untuk logo sertifikasi, dengan `width` dan `height`
eksplisit karena aset placeholder maupun aset asli nanti punya dimensi yang diketahui.

**1.6 `transition: all` di `route-map.tsx:166`** diganti daftar properti eksplisit.

**1.7 Tiga warning lint.** `_website` di `schema.test.ts`, `accent` di
`contrast-tokens.spec.ts`, dan warning `<img>` yang hilang sendiri setelah 1.5.

**1.8 Inisialisasi ref fleet-canvas.** Pindahkan konstruksi `THREE.Vector3` keluar dari
jalur render, entah lewat inisialisasi malas pada ref atau `useMemo`, mengikuti pola
`offset` dan `framed` yang sudah ada beberapa baris di bawahnya di file yang sama.
Menutup butir 12 dan 13 sekaligus.

**1.9 Jalur galat form kontak dan prasyarat e2e.** `contact-form.tsx` menampilkan pesan
galat yang terlihat pengguna saat server action gagal, dengan peran ARIA yang benar supaya
pembaca layar mengumumkannya. README mendapat bagian eksplisit bahwa Postgres harus
berjalan sebelum `test:e2e`, beserta perintahnya. Setelah ini `test:e2e` harus 24 dari 24.

### Fase 2 — Hygiene

**2.1 Satu lockfile.** Hapus `package-lock.json` dari repo, tambahkan ke `.gitignore`,
commit `bun.lock` yang dirty. README menyatakan repo ini bun-only supaya kolaborator
berikutnya tidak mengulang `npm install`.

**2.2 Hapus `lottie-web`.**

**2.3 Hapus `public/media/hero-malam/`** beserta entri `hero-malam` di `MEDIA` manifest,
varian `hero-malam` di tipe `MediaSetId`, sepuluh entri `RAW_SOURCE` yang bersangkutan di
`scripts/prepare-assets.ts`, dan tes yang menguncinya. Keempatnya jatuh bersamaan; menghapus
salah satu tanpa yang lain meninggalkan pipeline yang merujuk manifest yang sudah tidak ada.
Ini menghapus delapan puluh file dan menyusutkan `public/media` dari 7,6 MB ke sekitar 3 MB.

**2.4 Hapus lima SVG boilerplate Next.js** dari `public/`: `next.svg`, `vercel.svg`,
`file.svg`, `globe.svg`, `window.svg`.

**2.5 README.** Setup fresh clone yang akurat, daftar perintah, prasyarat Postgres untuk
e2e, dan prosedur menukar placeholder sertifikasi dengan aset asli klien.

**2.6 Ukur lighthouse.** Tiga run berturut pada mesin sesenggang mungkin. Catat setiap
angka, elemen LCP yang terpilih, dan beban mesin saat pengukuran, ke dalam ledger.
Perlakuannya dijelaskan di bagian 6.

### Fase 3 — Konsistensi design system

**3.1 Tes penjaga token.** Baca blok `@theme` di `globals.css`, bandingkan nilai per
nilai dengan `TOKENS`, gagalkan kalau ada yang berbeda atau ada token yang cuma hadir di
salah satu file. Ini celah paling berbahaya yang tersisa: palet baru saja diganti tangan
di dua tempat dan tidak ada apa pun yang menahannya berpisah lagi.

**3.2 Hero lewat manifest media.** Path harfiah diganti lookup ke `MEDIA`, alt-text ikut
dari sana. Menghapus sumber kebenaran kedua untuk alt-text foto lini bisnis.

**3.3 `day-cut.tsx` masuk sistem wash**, mengikuti pola selang-seling delapan seksi lain.

**3.4 Seksi struktur grup di Tentang Kami.** Render `GROUP_UNITS` sebagai seksi ketiga
halaman, dengan butir `AnchorNav` sendiri, mengikuti bahasa visual dua seksi yang sudah
ada di halaman itu. Data ditampilkan per sektor, bukan sebagai daftar datar, karena
`GroupUnit` memang menyimpannya berkelompok. DML sendiri ditandai di dalam daftar supaya
pembaca melihat posisinya dalam grup, yang memang gunanya seksi ini.

**3.5 Audit.** Jalankan `web-design-guidelines` dan sweep aksesibilitas pada empat
halaman, `/`, `/kontak`, `/tentang-kami`, `/karier`, di tiga viewport: 375, 768, dan 1440.
Audit diletakkan di sini, bukan di awal plan, supaya temuannya tidak tercampur dengan
sampah yang memang sudah dijadwalkan hilang di Fase 1 dan 2.

**3.6 dan seterusnya.** Temuan audit 3.5 jadi tugas turunan di fase yang sama. Jumlahnya
belum bisa ditentukan sebelum auditnya jalan; plan implementasi harus menyediakan tempat
untuk itu, bukan mengasumsikan nol.

## 5. Kontrak yang dijaga tes setelah plan ini

Tes berikut adalah hasil plan ini dan harus ada saat plan ditutup.

| Kontrak | Dijaga oleh |
|---|---|
| Setiap path aset sertifikasi yang dirujuk kode benar-benar ada di `public/` | tes unit baru, Fase 1.1 |
| Daftar sertifikasi hero berasal dari `COMPANY.standards`, bukan literal | tes unit baru, Fase 1.1 |
| Tidak ada `<img>` di HTML server hero, kontrak LCP | `hero.test.tsx`, sudah ada, harus tetap lolos setelah 1.2 |
| Nilai `TOKENS` identik dengan blok `@theme` di `globals.css` | tes unit baru, Fase 3.1 |
| Form kontak menampilkan galat yang terlihat saat server action gagal | tes unit baru, Fase 1.9 |
| Rasio kontras seluruh token | `tokens.test.ts`, sudah ada |
| Tidak ada pelanggaran axe di empat halaman | spec e2e, sudah ada |

## 6. Perlakuan lighthouse

Lighthouse tidak memblokir penutupan plan ini. Alasannya tercatat sejak Plan 4: pada
mesin desktop yang dipakai, `bun run lighthouse` lolos sekali dan gagal tiga kali di
rentang 5800–5930 ms terhadap ambang 5000 ms, dengan load average 5,23 dan browser di
sekitar 48 persen CPU. Kebisingan mesinnya sebesar selisih yang diukur, jadi angka lokal
tidak bisa membedakan regresi dari kontensi.

Yang dilakukan Fase 2.6 adalah mengukur dan mencatat, bukan meluluskan. Hasilnya juga
menjawab satu pertanyaan terbuka yang belum pernah dijawab siapa pun: hero berubah dari
kanvas 3D dengan poster tetap menjadi panel foto yang baru dipasang setelah hidrasi, jadi
elemen LCP halaman kemungkinan besar bergeser. Catatan elemen LCP dari pengukuran ini yang
akan jadi dasar keputusan performa di plan penyelesaian nanti.

Kalau angkanya merah, itu dicatat sebagai temuan dengan bukti beban mesinnya, bukan sebagai
penghambat.

## 7. Yang sengaja tidak dikerjakan

Butir-butir berikut nyata dan tercatat, tetapi bukan milik plan stabilisasi.

- **Verifikasi `/admin` Payload lewat browser.** Belum pernah dilakukan oleh sesi mana pun
  di project ini. Butuh alat browser interaktif dan kredensial, dan lebih tepat digabung
  dengan pekerjaan CMS di plan penyelesaian.
- **Rate limiter yang berkunci pada `x-forwarded-for`.** Header itu bisa dipalsukan.
  Sudah diterima sebagai tradeoff sejak Plan 2 dan tidak berubah statusnya karena plan ini.
- **Keputusan branch dan remote.** `origin/master` adalah prototipe Vite tanpa nenek moyang
  bersama dengan kode sekarang, dan masih jadi default branch di GitHub. Pengguna memilih
  membiarkannya. Dicatat di sini supaya tidak hilang.
- **Setup CI.** Termasuk memindahkan pengukuran lighthouse ke mesin bersih.
- **Seed migration dan data awal Payload.**
- **Tujuh butir yang menunggu konfirmasi klien** dari Plan 5 bagian 5, termasuk selisih dua
  kapal antara ringkasan PDF dan hitungan daftar armadanya. Plan ini tidak menyentuh angka
  perusahaan.

## 8. Risiko

**Pemecahan `hero.tsx` bisa memutus koreografi.** Seluruh GSAP di hero bergantung pada
selector atribut data di dalam satu `gsap.context` yang di-scope ke `sectionRef`. Memindahkan
markup ke komponen anak tidak mengubah DOM, jadi selector-nya tetap cocok, tetapi urutan
mount bisa berubah. Mitigasinya: pindahkan markup lebih dulu tanpa menyentuh efek,
jalankan e2e, baru pindahkan efeknya ke hook.

**Menghapus `hero-malam` tidak bisa dibatalkan dari repo.** Delapan puluh file, 4,6 MB.
Penghapusannya aman karena sumber mentahnya masih ada dan pipeline-nya masih bisa
membangun ulang: `scripts/prepare-assets.ts` memetakan kesepuluh frame ke
`assets/_raw/sts-sri-yuliani/DJI_0811.JPG` sampai `DJI_0820.JPG`, dan berkas itu sudah
diverifikasi ada per 23 Agustus 2026. Kalau nanti hero-malam dibutuhkan lagi, kembalikan
entri manifest dan `RAW_SOURCE`-nya lalu jalankan `bun run prepare-assets`. Verifikasi
ulang keberadaan arsip mentahnya sebelum menghapus, bukan sesudah.

**Audit Fase 3.5 bisa membuka lebih banyak dari yang muat di plan ini.** Kalau temuannya
melebihi sekitar enam tugas atau menyentuh keputusan desain, hentikan dan bawa ke pengguna
sebagai keputusan scope, jangan diam-diam melebarkan plan.
