# Audit design system dan aksesibilitas — Plan 6 Task 19

Cakupan: `src/app/(site)/`, `src/features/home/`, `src/features/about/`,
`src/components/`. Metode: skill `web-design-guidelines` (checklist Vercel
Web Interface Guidelines terhadap keempat direktori), sweep axe tiga
viewport (375/768/1440px, 4 rute) via `tests/e2e/a11y-viewport.spec.ts`, dan
lima pemeriksaan manual yang diminta plan.

Enam temuan lolos verifikasi. **Satu di antaranya menyentuh keputusan
desain** (mengganti komponen heading, menambah latar bergradasi) — per
gerbang keputusan scope di plan, itu cukup untuk **berhenti dan membawa
daftar ini ke pemilik repo**, bukan langsung dikerjakan sebagai Task 20+.

---

## Temuan 1 — Tabel spesifikasi armada tidak bisa digulir dengan keyboard di mobile

**File:** `src/features/fleet/spec-table.tsx:12`
**Bukti:** axe (`scrollable-region-focusable`, wcag2a) pada viewport 375px,
rute `/`:
```
"html": "<div class=\"mt-8 overflow-x-auto\">",
"failureSummary": "Element should have focusable content / Element should be focusable"
```
Pembungkus tabel spesifikasi (`FleetSpecTable`) punya `overflow-x-auto` sejak
Plan 5 — komentar di berkas itu sendiri menjelaskan tabel lima kolom tidak
muat di 375px dan sengaja dibungkus scroll horizontal. Tapi pembungkusnya
tidak bisa menerima fokus keyboard, jadi pengguna keyboard-only tidak bisa
menggulirnya di lebar layar yang justru menuntut scroll itu.

**Keyakinan:** Tinggi — axe menangkapnya konsisten di ulangan.
**Usulan:** Tambahkan `tabIndex={0}` dan `role="region"` plus
`aria-label="Tabel spesifikasi armada"` pada div pembungkus. Mekanis, satu
baris, tidak mengubah tata letak.

---

## Temuan 2 — `transition-all` tersisa di indikator perbandingan armada

**File:** `src/features/home/fleet-comparator.tsx:130`
**Bukti:**
```tsx
className={`h-px transition-all duration-300 ${
```
Task 4 di plan ini memperbaiki `transition-all` di `route-map.tsx`, tapi
tidak menyisir seluruh repo — instance ini di `fleet-comparator.tsx` luput
dari cakupan pencarian awal.

**Keyakinan:** Tinggi — pola sama persis dengan yang sudah dibuktikan salah
di Task 4 (mentransisikan setiap properti yang kebetulan berubah, termasuk
yang dianimasikan GSAP terpisah).
**Usulan:** Ganti ke daftar properti eksplisit yang benar-benar berubah di
elemen itu (perlu dibaca dulu properti apa yang ditransisikan sebelum
menuliskan daftarnya — jangan menebak dari nama class).

---

## Temuan 3 — Input form kontak tidak punya `autocomplete`

**File:** `src/components/ui/text-field.tsx`, `src/features/inquiry/contact-form.tsx`
**Bukti:** `TextField` tidak menerima maupun menyetel prop `autoComplete`;
`<input>`/`<textarea>` yang dihasilkannya cuma dapat `id`, `type`, dan
`{...register}` (yang menyuplai `name`, bukan `autocomplete`). Panduan Web
Interface Guidelines: "Inputs need `autocomplete` and meaningful `name`."

**Keyakinan:** Tinggi — dibaca langsung dari kode komponen.
**Usulan:** Tambah prop `autoComplete?: string` ke `TextField`, teruskan ke
elemen input/textarea. Di `ContactForm`, set `"name"` untuk Nama, `"tel"`
untuk Nomor telepon, `"email"` untuk Email. Pesan (textarea) tidak perlu
autocomplete. Mekanis, tidak mengubah tata letak atau perilaku form.

---

## Temuan 4 — CTA hero tidak terjangkau keyboard selama ~1,6 detik animasi intro

**File:** `src/features/home/use-hero-choreography.ts` (blok `[data-hero-door]`)
**Bukti:** Diverifikasi langsung lewat Playwright (spec sementara, sudah
dihapus setelah diverifikasi — lihat metode di bawah), bukan ditebak:

```
gsap.fromTo(
  "[data-hero-door]",
  { y: 20, autoAlpha: 0 },
  { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", delay: 0.7, stagger: 0.1,
    clearProps: "transform,opacity,visibility" },
);
```

`autoAlpha` di GSAP menyetel `opacity` **dan** `visibility: hidden`
sekaligus. Selama animasi intro berjalan (delay 0,7s + durasi 0,9s + stagger
≈ total ~1,6s sebelum elemen terakhir selesai), elemen `[data-hero-door]`
—termasuk dua CTA hero di dalamnya, "Permintaan Informasi BBM" dan "Pesan
Tiket Ro-Ro"— punya `visibility: hidden` walau sudah ada di DOM dengan
`tabIndex=0`. Browser mengecualikan elemen `visibility:hidden` dari urutan
Tab, sehingga pengguna yang menekan Tab dalam ~1,6 detik pertama setelah
halaman dimuat melompat langsung dari navigasi header ke konten jauh di
bawah (diverifikasi: lompat ke link "Lihat silsilah lengkap" milik seksi
Since1988, seksi ke-7 dari 9), melewati kedua CTA hero sepenuhnya tanpa
indikasi apa pun terlewat.

Setelah animasi selesai, `clearProps` membersihkan inline style dengan
benar dan CTA kembali terjangkau Tab pada urutan yang seharusnya (diverifikasi:
tab ke-9 mendarat tepat di "Permintaan Informasi BBM"). Jadi ini **bukan**
bug permanen — jendelanya sempit, tapi nyata dan bisa direproduksi setiap
page load.

**Keyakinan:** Tinggi — diverifikasi lewat eksekusi Playwright langsung
(bukan pembacaan kode saja), termasuk sebelum dan sesudah animasi selesai.
**Usulan:** Ganti `autoAlpha` jadi `opacity` saja pada tween ini, atau pisahkan
tween opacity dari visibility supaya wrapper yang mengandung CTA interaktif
tidak pernah dapat `visibility:hidden`. Cek dulu apakah alasan `autoAlpha`
dipakai (biasanya mencegah elemen transparan tetap menangkap klik/tab) masih
relevan di sini — kalau iya, cukup kecualikan `[data-hero-door]` dari
`autoAlpha` dan pakai `opacity` polos untuknya secara khusus, elemen lain di
timeline yang sama boleh tetap pakai `autoAlpha`.

**Metode verifikasi:** Playwright interaktif — `page.goto("/")`, tab
berulang sambil mencatat `document.activeElement`, lalu memeriksa
`getComputedStyle` di sepanjang rantai leluhur CTA untuk menemukan sumber
`visibility:hidden`, lalu mengulang dengan jeda lebih panjang untuk
membuktikan itu sembuh sendiri setelah animasi selesai. Spec percobaannya
tidak disimpan — throwaway sesuai sifat pemeriksaannya.

---

## Temuan 5 — Sebagian besar heading tidak memakai `text-pretty`/`text-balance`

**File:** Menyebar — `day-cut.tsx:17`, `affiliates.tsx:17`, `cta-section.tsx:7`,
`group-structure.tsx:17`, `business-lines.tsx:47`, `fleet-comparator.tsx:31`,
`(site)/kontak/page.tsx:25,58`, `(site)/karier/page.tsx:22`,
`(site)/tentang-kami/page.tsx:24,35,47,51,56,63`.
**Bukti:** Hero (`hero-copy.tsx:63`) sudah memakai `text-pretty` pada
`<h1>`-nya sejak sebelum Plan 6 — itu preseden yang sudah ada di repo,
bukan usulan baru. Guideline: "Use `text-wrap: balance` atau `text-pretty`
pada heading (mencegah widow)." Seluruh heading lain di atas tidak
memakainya.

**Keyakinan:** Sedang. Dampaknya kosmetik (baris terakhir heading yang
ganjil/sempit di lebar tertentu), bukan cacat fungsional, dan preseden hero
mendukung penerapannya — tapi ini bukan tanpa risiko: `text-balance` punya
batas panjang teks di beberapa browser dan bisa mengubah tinggi baris
heading yang sekarang menabrak spacing di sekitarnya, jadi tidak murni
tempel-dan-lupa di 14 lokasi sekaligus.

**Usulan:** Kalau pemilik repo menyetujui, terapkan `text-pretty` (konsisten
dengan pilihan hero, bukan `text-balance` yang dukungan browsernya lebih
sempit) ke seluruh heading di atas, satu commit, verifikasi visual tiap
halaman setelahnya karena heading yang membungkus dua baris bisa berubah
tinggi.

---

## Temuan 6 — Tentang Kami tidak memakai sistem wash maupun `SectionHeader` ⚠️ menyentuh keputusan desain

**File:** `src/app/(site)/tentang-kami/page.tsx` (seluruh berkas)
**Bukti:**
- `grep` untuk `wash` dan `SectionHeader` di berkas ini: nol hasil.
- `SectionHeader` (`src/components/ui/section-header.tsx`) dipakai
  `since-1988.tsx`, `route-map.tsx`, `fleet-comparator.tsx` — tiga dari
  sembilan seksi beranda — dengan `<h2 className="font-display text-3xl
  font-bold text-ink md:text-5xl">`.
- Tentang Kami menulis heading-nya sendiri di setiap seksi
  (`<h2 className="font-display text-2xl font-bold">`, tanpa varian
  responsif `md:text-5xl`) dan latar section-nya polos (tidak ada satu pun
  `bg-surface-wash`/`bg-surface-2-wash` di berkas ini), sementara delapan
  dari sembilan seksi beranda memakai salah satu varian wash sejak commit
  8994de9 (Task 17 di plan ini menutup satu-satunya seksi beranda yang
  masih tertinggal).

**Kenapa ini bukan temuan mekanis:** Menyamakan Tentang Kami dengan pola
beranda berarti mengganti komponen heading (ukuran teks berubah dari
`text-2xl` ke `text-3xl md:text-5xl`, perubahan visual yang terlihat) dan
menambah latar bergradasi ke halaman yang sebelumnya polos — dua perubahan
yang mengubah tampilan halaman, bukan cuma memperbaiki cacat. Task 18 di
plan ini sengaja menambahkan seksi baru (`GroupStructure`) memakai heading
manual yang sama dengan seksi lain di halaman ini, konsisten dengan pola
yang sudah ada di sana — jadi ini bukan inkonsistensi yang baru diperkenalkan
Plan 6, tapi kesenjangan lama antara beranda dan Tentang Kami yang belum
pernah diputuskan siapa pun.

**Keyakinan:** Tinggi bahwa kesenjangannya nyata; tidak ada keyakinan soal
arah yang benar — itu keputusan pemilik repo, bukan sesuatu yang bisa
disimpulkan dari kode.
**Pertanyaan untuk pemilik repo:** Apakah Tentang Kami memang sengaja dibuat
lebih sederhana/statis dibanding beranda (halaman informasi vs halaman
penjualan), atau ini kelalaian yang sebaiknya disamakan? Kalau disamakan,
apakah keduanya (`SectionHeader` dan wash) atau cuma salah satu?

---

## Item yang diperiksa dan TIDAK menghasilkan temuan

1. **Ritme seksi beranda** (klaim di komentar `page.tsx`): diverifikasi
   sembilan seksi memakai enam keluarga tata letak berbeda dan tidak ada
   dua seksi berurutan yang sama — klaimnya masih benar meski hero sudah
   berubah total sejak ditulis. Komentar cuma menyebut enam seksi pertama,
   tidak update untuk tiga seksi terakhir (Since1988, Certifications,
   CtaSection), tapi itu kelalaian dokumentasi kecil, bukan pelanggaran
   ritme.
2. **Nilai spacing pecahan di hero** (`h-14.5`, `gap-5.5`, `pt-21`, `pt-22`,
   dll.): Tailwind v4 membangkitkan utility spacing untuk nilai numerik
   apa pun (`calc(var(--spacing) * N)`), jadi ini bukan "di luar skala"
   secara teknis. Nilainya memang tidak bulat dibanding seksi lain
   (`py-20`, `py-24`, dst.), tapi `h-14.5` = 58px persis sesuai kebutuhan
   logo sertifikasi yang didokumentasikan di komentar kode — sengaja, bukan
   hasil coba-coba di mata. Tidak dijadikan temuan.
3. **Hero pada viewport pendek (1440×720):** diverifikasi lewat Playwright.
   Baris sertifikasi benar tersembunyi di bawah 759px tinggi sesuai
   media query yang sudah ada, dan sisa konten (dua kartu pintu, indikator
   gulir) semuanya muat di dalam 720px tanpa terpotong.

---

## Sweep aksesibilitas tiga viewport

`tests/e2e/a11y-viewport.spec.ts` (dua belas tes: 4 rute × 3 lebar viewport)
memakai guard `test.use({ contextOptions: { reducedMotion: "reduce" } })`
yang sama dengan `tentang-kami.spec.ts` — tanpa itu, axe menangkap section
yang dibungkus `Reveal` di tengah fade-in GSAP (`gsap.from()`, bukan
`fromTo()` + `clearProps` — pola yang sama yang sudah didokumentasikan
sebagai anti-pola di header komentar `hero.tsx`), yang membuat warna teks
efektif jadi campuran dengan latar dan gagal cek kontras axe secara keliru
meski token warna asli lolos WCAG AA di opacity penuh. Dengan guard itu,
11 dari 12 lolos; satu-satunya kegagalan adalah Temuan 1 di atas.

**Keputusan berkas ini:** dua belas tes tambahan memperlambat setiap run
`test:e2e` bagi semua orang. Berkas ini dibiarkan sementara di repo,
belum dijalankan sebagai bagian gerbang mana pun — keputusan menjadikannya
permanen (dan apakah `Reveal` perlu diperbaiki dari `gsap.from()` ke
`fromTo()` + `clearProps` seperti hero, supaya guard reducedMotion ini
tidak perlu dipertahankan selamanya) dibawa bersama daftar temuan ini ke
pemilik repo.

---

## Gerbang keputusan scope

Enam temuan total. Temuan 1–4 mekanis (satu baris, tidak mengubah tata
letak/komponen/copy). Temuan 5 berisiko sedang (banyak lokasi, dampak
kosmetik, tidak mengubah komponen tapi menyentuh banyak berkas sekaligus).
**Temuan 6 secara eksplisit menyentuh keputusan desain** (mengganti
komponen heading, menambah latar bergradasi ke halaman yang sebelumnya
sengaja polos).

Per gerbang di plan ini: satu temuan yang menyentuh keputusan desain sudah
cukup untuk **berhenti**. Daftar ini dibawa ke pemilik repo sebagai
keputusan scope, bukan dikerjakan diam-diam sebagai Task 20 dst.
