/**
 * Palet "Navy Selat". Sumber kebenaran tunggal untuk warna.
 * Nilai di sini wajib identik dengan blok @theme di globals.css; kesamaannya
 * dijaga tokens-parity.test.ts, rasio kontrasnya dijaga tokens.test.ts.
 *
 * Sumber warnanya color scheme ptdml.com: navy #183163 (24 kemunculan di
 * custom.css tema mereka — tautan, header, tombol, judul seksi), putih kartu,
 * dan abu sekunder. Yang TIDAK ikut disalin ada tiga. Pertama, bidang halaman
 * ptdml netral (#F9F9F9) sementara di sini bidangnya tetap biru-abu, karena
 * identitas "biru maritim" sudah dibangun sejak Plan 4. Kedua, maroon
 * #b20102 di CSS mereka — markup sub-menu dan abs-link nol kemunculan di
 * halaman live dan histogram logo tidak memuat merah, jadi itu selektor tema
 * WordPress yang mati. Ketiga, arah state tombol: halaman ini terang, jadi
 * hover dan press turun ke navy yang lebih gelap supaya teks putih di atasnya
 * justru menguat, bukan melemah.
 */
export const TOKENS = {
  /** Bidang halaman. Biru-abu, cukup dalam supaya kartu surface2 punya tempat berdiri tanpa harus jadi putih murni. */
  surface: "#E9EEF5",
  /** Bidang terangkat: kartu, panel scrim, seksi selang-seling. Bukan putih murni; putih murni membunuh kedalaman dan tidak menyisakan ruang naik. */
  surface2: "#FBFCFE",
  /** Garis rambut dekoratif: pembatas daftar, tepi kartu. Bukan untuk kontrol form. */
  surface3: "#C3CEDE",
  /**
   * Garis kontrol: tepi input dan tombol ghost. Dipisah dari surface3 karena
   * WCAG 1.4.11 menuntut 3:1 untuk batas komponen non-teks, dan surface3 cuma
   * mencapai 1,5:1 di atas bidang terangkat. Satu token pembatas untuk dua
   * pekerjaan itu berarti salah satunya pasti gagal.
   */
  line: "#6E7C93",
  ink: "#151A22",
  inkMuted: "#4C525C",
  accent: "#183163",
  accentHover: "#12274F",
  accentPress: "#0C1B39",
  /** Isian navy paling tipis: latar chip aktif, hover tombol ghost, laut di peta. */
  accentSoft: "#D6E0EE",
  onAccent: "#FFFFFF",
  /**
   * Merah galat. Sebelum ini pesan error memakai token aksen, yang di palet
   * lama kebetulan oranye dan setengah terbaca sebagai peringatan. Navy tidak
   * membawa arti itu sama sekali, jadi galat butuh warnanya sendiri.
   */
  danger: "#B32222",
  /**
   * Bidang gelap hero. Satu-satunya bidang gelap di situs terang ini, dan
   * karena itu tidak diturunkan dari surface mana pun. Sebelum Plan 6 nilainya
   * ditulis sebagai hex mentah di className hero.
   */
  heroGround: "#0B1424",
  /**
   * Aksen di ATAS bidang gelap. Navy #183163 nyaris tak terlihat di atas
   * heroGround, jadi penanda pintu hero memakai rona yang diangkat. Ini bukan
   * pengganti accent di bidang terang, dan tidak boleh dipakai di sana.
   */
  accentLift: "#5B84C8",
} as const;

export type TokenName = keyof typeof TOKENS;
