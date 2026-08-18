/**
 * Palet "Navy Selat". Sumber kebenaran tunggal untuk warna.
 * Nilai di sini wajib identik dengan blok @theme di globals.css.
 * Rasio kontrasnya dijaga oleh tokens.test.ts.
 *
 * Sumber warnanya color scheme pthis.id: navy #164194 (primary), biru muda
 * #E1EEFF (tertiary), bidang halaman #F5F9FD, hitam lembut #181C24, merah
 * #C62828. Yang tidak ikut disalin adalah arah state tombol: pthis menaikkan
 * terang saat hover, sementara di sini hover dan press turun ke navy yang
 * lebih gelap supaya teks putih di atasnya justru menguat, bukan melemah.
 */
export const TOKENS = {
  /** Bidang halaman. Biru-putih, bukan putih murni, supaya kartu putih punya tempat berdiri. */
  surface: "#F5F9FD",
  /** Bidang terangkat: kartu, panel scrim, seksi selang-seling. */
  surface2: "#FFFFFF",
  /** Garis rambut dekoratif: pembatas daftar, tepi kartu. Bukan untuk kontrol form. */
  surface3: "#CED9EA",
  /**
   * Garis kontrol: tepi input dan tombol ghost. Dipisah dari surface3 karena
   * WCAG 1.4.11 menuntut 3:1 untuk batas komponen non-teks, dan #CED9EA cuma
   * mencapai 1,4:1 di atas putih. Satu token pembatas untuk dua pekerjaan itu
   * berarti salah satunya pasti gagal.
   */
  line: "#7A8CA8",
  ink: "#181C24",
  inkMuted: "#515661",
  accent: "#164194",
  accentHover: "#0E3A8A",
  accentPress: "#0A2C6B",
  /** Isian navy paling tipis: latar chip aktif, hover tombol ghost, laut di peta. */
  accentSoft: "#E1EEFF",
  onAccent: "#FFFFFF",
  /**
   * Merah galat. Sebelum ini pesan error memakai token aksen, yang di palet
   * lama kebetulan oranye dan setengah terbaca sebagai peringatan. Navy tidak
   * membawa arti itu sama sekali, jadi galat butuh warnanya sendiri.
   */
  danger: "#C62828",
} as const;

export type TokenName = keyof typeof TOKENS;
