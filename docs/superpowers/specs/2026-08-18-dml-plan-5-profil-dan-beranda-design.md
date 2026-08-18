# Plan 5: Data company profile resmi dan overhaul beranda

Design spec, 18 Agustus 2026. Menggantikan bagian data dari spec Plan 1 sampai Plan 4
di setiap titik yang bertentangan.

## 1. Ringkasan

Dua pekerjaan yang saling terkait dalam satu plan:

1. **Sumber data pindah.** Company profile resmi klien, `assets/CP DML.pdf` (6 halaman,
   dibuat di Canva, 5 Agustus 2026), jadi sumber utama data perusahaan. Sampai Plan 4
   seluruh angka berasal dari riset publik (halaman profil Sinar Alam, ptdml.com,
   MagicPort, arsip Banjarmasin Post) dan ditandai `unverified`. PDF menang di setiap
   perbedaan.
2. **Beranda dioverhaul.** Enam cacat yang dilaporkan setelah Plan 4 diperbaiki, dan
   dua seksi berganti format sepenuhnya.

Yang tidak berubah: struktur URL, label navigasi, id anchor, nama field form, dan
seluruh keputusan tech stack Plan 1.

## 2. Sumber otoritatif

`assets/CP DML.pdf`. Halaman dirujuk sebagai `cp-pdf hal. NN` di komentar kode,
mengikuti nomor yang tercetak di kaki halaman PDF (01 sampai 04), bukan nomor halaman
fisik.

| Halaman | Isi |
|---|---|
| Sampul | Nama, tagline, tiga nilai |
| 01 | Profil, struktur Sinar Alam Corporation, nilai, lambang standar dan keanggotaan |
| 02 | Angka utama: 1988, Herman Chandra, 64 kapal, >300 orang |
| 03 | Lini bisnis, tiga afiliasi, peta wilayah kerja |
| 04 | Daftar armada per kelas, lintasan per kapal ro-ro |
| (belakang) | Klien, dokumen legal, alamat kantor |

Penanda asal ditulis di tipe: `SourceTag = "cp-pdf" | "riset-publik"`. Setiap butir
standar membawa penandanya sendiri, jadi klien bisa memisahkan mana yang punya dasar
dokumen resmi tanpa menebak.

## 3. Koreksi data

| Field | Plan 1 sampai 4 | Plan 5 | Sumber |
|---|---|---|---|
| Tahun berdiri | 30 November 1985 | **30 November 1988** | cp-pdf hal. 01, 02 |
| Pendiri | Herman Chandra | Herman Chandra (tetap) | cp-pdf hal. 02 |
| Induk | "SinarAlam Corporation" | **"Sinar Alam Corporation"**, dua kata | cp-pdf hal. 01 |
| Armada | 15 kapal, 40.546 DWT | **64 kapal**: 9 ro-ro, 55 pengangkut BBM. Angka DWT total dihapus | cp-pdf hal. 02, 04 |
| Orang | tidak ada | **lebih dari 300** | cp-pdf hal. 02 |
| Kantor pusat DML | Jl. Kapten Piere Tendean 174 | **Jl. AES Nasution 43, Banjarmasin 70123** | cp-pdf halaman belakang |
| Jl. Piere Tendean 174 | dilabeli kantor pusat DML | kantor pusat **grup**, pindah ke `GROUP_OFFICES` | cp-pdf halaman belakang |
| Kantor kedua DML | "Kantor Gadang", Banjarmasin | **Cabang Banyuwangi**, Jl. Kalipuro, Ketapang | cp-pdf halaman belakang |
| Telepon | +62 511 3268280 (nomor grup) | **+62 511 6773845** (kantor pusat DML) | cp-pdf halaman belakang |
| Rute ro-ro | Ketapang-Lembar, Tanjung Perak-Lembar, Kumai-Surabaya | **lima lintasan**, lihat bagian 4 | cp-pdf hal. 03, 04 |
| Sertifikasi | daftar datar: ISM, ISPS, SIRE, ISO 9001 | **tiga klaster** plus daftar keanggotaan | cp-pdf hal. 01 |
| Lini bisnis | BBM, Ro-Ro, Ship-to-Ship | **dua lini utama plus tiga afiliasi**. STS bukan lini | cp-pdf hal. 03 |

### 3.1 Tagline dan nilai

Tagline: "From Zero to Hero with Continuous Improvement", dikutip apa adanya dalam
bahasa Inggris karena begitu ia dicetak di sampul dan halaman 04.

Tiga nilai, huruf awalnya mengeja DML:

- **D**ynamic, gesit dan mudah menyesuaikan diri terhadap perubahan dan tantangan.
- **M**easurable, menetapkan target pertumbuhan dan kinerja yang jelas dan terukur.
- **L**oyalty, membangun hubungan jangka panjang dengan pelanggan, karyawan, dan mitra.

### 3.2 Standar dan keanggotaan

Halaman 01 menaruh empat lambang berdampingan yang bukan kategori yang sama, jadi
keempatnya dipisah:

| Klaster | Butir | Asal |
|---|---|---|
| Sistem manajemen | ISO 9001:2015 (sertifikat DQS), ISM Code | cp-pdf |
| Sistem manajemen | ISPS Code, SIRE | riset-publik |
| Biro klasifikasi | Biro Klasifikasi Indonesia (BKI) | cp-pdf |
| Sistem informasi | SAP | cp-pdf |

SAP adalah ERP, bukan sertifikat. Menaruhnya sederet dengan ISM Code akan membuatnya
terbaca sebagai lembaga sertifikasi keselamatan.

Keanggotaan (cp-pdf hal. 01): Sinar Alam Corporation, OCIMF, GAPASDAP, IMO.

ISPS Code dan SIRE tidak muncul di PDF. Keduanya tidak dihapus diam-diam karena
berasal dari riset Plan 1 yang tercatat di master spec, tapi ditandai `riset-publik`.

## 4. Lintasan ro-ro

| Lintasan | Operator | Kapal (cp-pdf hal. 04) |
|---|---|---|
| Ketapang - Gilimanuk | DML | KMP Jambo VI, VIII, IX, X |
| Merak - Bakauheni | PT Tri Sumaja Lines | KMP BSP 1, KMP Salvatore |
| Jangkar - Lembar | DML | KMP Jambo XII |
| Surabaya - Kumai | DML | KMP Jambo XIV |
| Surabaya - Lembar | DML | KMP Jambo XI |

Halaman 03 menaruh Merak-Bakauheni di bawah PT Tri Sumaja Lines, sedangkan halaman 04
mendaftar kapalnya di dalam armada DML. Keduanya dicatat apa adanya: leg itu tampil di
peta dengan warna berbeda dan keterangan operatornya, dan tidak dihitung sebagai
pelabuhan yang dilayani DML.

Konsekuensi teknis: bbox peta melebar ke barat sampai Selat Sunda. `MAP_BOUNDS` jadi
104,5 sampai 119 bujur timur dan -10 sampai -1,5 lintang, dan `coastline.json`
diregenerasi lewat `bun run prepare-map`.

Labuan Bajo sengaja di luar peta. Wisata bahari di sana dijalankan PT Duta Wisata
Bahari, bukan lintasan penyeberangan, dan memasukkannya akan menggandakan lebar peta
demi satu titik yang bukan rute ro-ro.

## 5. Yang wajib dikonfirmasi klien sebelum situs live

1. **Selisih jumlah kapal.** PDF menulis ringkasan 64 kapal (09 ro-ro + 55 pengangkut
   BBM), tapi daftar nama kapal di halaman 04 memuat 9 + 7 MT + 9 OB + 30 SPOB + 11 TB
   = **66**. Selisih dua kapal. Situs memakai angka ringkasan untuk metrik dan hasil
   hitung daftar untuk jumlah per kelas; tidak ada tempat yang menjumlahkan keduanya,
   jadi kedua angka tidak pernah tampil saling membantah.
2. **Dimensi kapal.** Panjang, lebar, dan DWT per kelas tidak ada di PDF. Seluruh angka
   dimensi di `src/content/fleet.ts` masih estimasi proporsional bertanda `unverified`.
3. **ISPS Code dan SIRE.** Tidak ada di PDF, bertanda `riset-publik`.
4. **Koordinat pelabuhan.** Koordinat geografis diambil dari sumber publik, bukan dari
   PDF. Peta wilayah kerja di halaman 03 adalah ilustrasi, bukan data berkoordinat.
5. **Nomor telepon sebagai WhatsApp.** `COMPANY.whatsapp` diturunkan dari nomor kantor
   pusat, yang kemungkinan besar nomor tetap. Perlu nomor WhatsApp yang sebenarnya.
6. **Logo klien.** Halaman belakang memuat lambang Pertamina, PetroMine, AKR, Adaro,
   PAMA, dan Lintas Borneo. Semuanya merek pihak ketiga; dinding logo tidak dibangun
   sampai klien memastikan izin pemakaiannya.
7. **Dokumen legal.** Tabel akta, NIB, SIUPAL, TDP, NPWP, dan sertifikat izin usaha
   ada di PDF tapi belum dipakai di situs. Perlu keputusan klien apakah nomor-nomor itu
   boleh tampil publik.

## 6. Overhaul beranda

### 6.1 Diagnosis dan perbaikan

**Hero satu foto penuh layar.** Sampai Plan 4, tiga seksi pertama beranda semuanya
"foto penuh layar plus panel scrim", jadi halaman kehilangan pergantian ritme tepat di
tempat yang paling menentukan. Hero jadi bidang gelap dua kolom: tipografi di kiri,
satu artefak 3D dibingkai di kanan. Pin scroll hero dihapus seluruhnya, dan kamera
tidak lagi digerakkan scroll: sekarang OrbitControls yang pegang sudut, dengan rotasi
idle pelan, sama seperti perbandingan armada. Poster tetap tinggal di dalam bingkai
dan tidak pernah dilepas dari DOM.

**Kartu lini bisnis kedua hampir transparan.** Penyebabnya bisa ditunjuk persis:
kartu keluar diredupkan sampai opacity 0,55 oleh trigger milik kartu berikutnya,
dengan jendela `top bottom` sampai `top top`. Jendela itu berimpit tepat dengan umur
sticky kartu kedua, jadi kartu "Penumpang Ro-Ro" lahir sudah setengah transparan dan
tidak pernah sekali pun tampil penuh selama ia jadi kartu yang dibaca. Kartu pertama
punya jendela bersih di awal, kartu ketiga dikecualikan `slice(0, -1)`; hanya kartu
tengah yang rusak.

Perbaikannya bukan mengganti angka 0,55. Format seksi diganti total jadi satu panggung
dipaku dengan dua bab, dan pergantiannya berupa sapuan `clip-path`. Lapisan foto tidak
pernah punya opasitas di bawah satu, jadi kondisi "hampir transparan" tidak bisa
terjadi lagi secara konstruksi, bukan karena angka yang lebih beruntung.

**Armada sudah berganti kelas sebelum seksi sebelumnya selesai.** Dua sebab yang
menumpuk. Pertama, kartu ketiga lini bisnis menempel di puncak viewport dan alas
kontainernya tercapai di instan yang sama, jadi ia tidak punya jeda sama sekali dan
pin armada mulai persis saat itu. Kedua, `activeClassIndex` tidak punya jeda diam:
blend bergerak begitu progress lebih besar dari nol, jadi motor tanker mulai meleleh
jadi oil barge di piksel pertama scroll.

Fungsi pemetaannya diganti `segmentAt` di `src/lib/motion/segments.ts`: tiap kelas
memiliki iris progress yang sama besar dan DIAM selama 65 persen irisnya sebelum
menyeberang. Panjang pin dinaikkan ke 340 persen.

**Ro-Ro Ferry lewat sekejap lalu halaman kosong.** Dua sebab lagi. Kelas terakhir baru
mencapai opasitas penuh di progress 1,0, yaitu frame terakhir pin. Dan yang dipaku
adalah seluruh `<section>`, yang memuat tabel spesifikasi di bawah kanvas, sehingga
tinggi elemen yang dipaku melebihi viewport: bagian bawahnya belum pernah terlihat
selama pin dan barulah menggulir masuk setelah pin dilepas. Itu yang terbaca sebagai
halaman kosong yang harus di-scroll lagi.

Sekarang kelas terakhir berdiri penuh sepanjang 20 persen scroll terakhir, dan yang
dipaku adalah panggung setinggi tepat satu viewport. Tabel spesifikasi pindah ke blok
sendiri di bawahnya.

**Kamera tidak menyesuaikan ukuran kapal.** Radius diturunkan dari separuh panjang
kelas, yang tidak tahu apa-apa soal tinggi tiang dan deckhouse, lalu ditambal margin
1,5. Akibatnya tugboat bertiang tinggi tetap terpotong dan kelas panjang tampil terlalu
kecil. Sekarang tiap grup kelas mengukur bola pembatasnya sendiri dari geometri yang
benar-benar ada di scene, dan radius di-lerp lintas pasangan kelas sehingga jaraknya
tidak meloncat di batas indeks. Margin turun ke 1,25. Yang dikendalikan hanya jarak
dan tinggi titik bidik; sudut orbit tetap milik pengguna.

**Rute cepat selesai lalu transisi patah.** Tiga leg ditaruh di posisi 0, 0,8, dan 1,6
dengan durasi default 0,5, jadi leg terakhir selesai persis di frame terakhir pin.
Timeline sekarang punya waktu eksplisit dengan jeda akhir 2,6 satuan dari total 10,
dan panggungnya setinggi satu viewport seperti seksi armada. Tiap leg juga menyalakan
labelnya sendiri dan dua pelabuhan ujungnya.

**Transisi antar seksi secara umum.** Tiga sumber tinggi dokumen berubah setelah
trigger lain terlanjur dibuat: kanvas hero yang dipasang setelah jeda idle, kanvas
armada lewat dynamic import plus IntersectionObserver, dan Lenis yang mengambil alih
scroll di efek terpisah. `refreshScrollTriggers()` dipanggil setelah tiap kanvas siap.
Aturan yang berlaku sekarang: **tidak ada elemen yang dipaku boleh lebih tinggi dari
viewport.**

### 6.2 Urutan dan ritme seksi

| # | Seksi | Keluarga tata letak |
|---|---|---|
| 1 | Hero | Dua kolom berbingkai, bidang gelap |
| 2 | Ship-to-ship | Foto penuh layar, panel scrim |
| 3 | Lini bisnis | Panggung dipaku, dua bab, sapuan clip-path |
| 4 | Perusahaan afiliasi | Daftar berpembatas tipis |
| 5 | Perbandingan armada | Studio teknis dipaku, kiri data kanan 3D |
| 6 | Rute penyeberangan | Peta penuh layar dipaku |
| 7 | Sejak 1988 | Editorial dua kolom plus daftar nilai huruf gantung |
| 8 | Sertifikasi | Band metrik plus klaster |
| 9 | CTA | Terpusat |

Tidak ada dua seksi berurutan yang memakai keluarga tata letak yang sama. Di Plan 4
hal itu terjadi tiga kali beruntun di awal halaman.

CTA "Hubungi Kami" tinggal dua di beranda, di hero dan di seksi penutup. Satu label
untuk satu maksud, dipakai identik di mana pun.

### 6.3 Jalur tanpa animasi

Setiap seksi yang membajak scroll punya jalur statis yang dipilih ketika viewport di
bawah 768 px atau `prefers-reduced-motion` menyala. Seksi dipaku bekerja baik dengan
roda scroll, tapi di layar sentuh ia menahan gestur pengguna dan memampatkan peta ke
pita tipis di tengah viewport tinggi.

Snapshot server `usePrefersReducedMotion` dan `useIsDesktop` sama-sama memilih jalur
paling aman, jadi HTML tanpa JavaScript selalu berisi versi statis yang lengkap: lima
kelas kapal, lima lintasan rute, dan dua lini bisnis, semuanya tergambar penuh.

## 7. Kontrak yang dijaga tes

- `segmentAt`: item pertama diam penuh sampai 13 persen, item terakhir berdiri penuh
  sepanjang 20 persen terakhir, jumlah opasitas selalu tepat satu.
- `activeLegIndex`: leg terakhir aktif sejak 75 persen dan bertahan sampai akhir.
- Lapisan media lini bisnis tidak boleh memakai `opacity` sebagai alat transisi.
- `COMPANY.fleetSummary`: 9 + 55 = 64, dan setiap butir standar menandai sumbernya.
- `COMPANY.values` mengeja DML.
- `DML_SERVED_PORT_IDS` tidak memuat Merak, Bakauheni, maupun kantor Banjarmasin.
- `VIEWBOX` menjaga skala derajat per piksel sama di kedua sumbu. Versi Plan 4 memaku
  tinggi ke 620 untuk bbox yang butuh sekitar 1006, jadi peta dipipihkan hampir 40
  persen dan sudut tiap leg salah.
- Seksi "Sejak 1988" tidak boleh menyebut 1985 di mana pun.

## 8. Yang sengaja tidak dikerjakan

- **Dinding logo klien.** Merek pihak ketiga, butuh izin. Lihat bagian 5 nomor 6.
- **Tabel dokumen legal.** Butuh keputusan klien soal publikasi nomor. Lihat bagian 5
  nomor 7.
- **Halaman Tentang Kami tidak dirombak.** Ia hanya ikut koreksi data: struktur grup
  Sinar Alam tersedia di `GROUP_UNITS` tapi belum dirender. Itu pekerjaan plan
  berikutnya.
- **Empat plan doc lama tidak ditulis ulang.** Keempatnya catatan tentang apa yang
  dibangun kapan; menulis ulangnya berarti memalsukan riwayat. Master spec bagian 2
  diedit di tempat, dan spec inilah yang berlaku di setiap perbedaan.
