/**
 * Teks bawaan tiga sub-halaman Bisnis:
 * /bisnis/transportasi-bbm, /bisnis/penumpang-roro, dan form permintaan
 * informasi. Tabel armada, daftar kapal, lintasan, dan standar tetap dari
 * koleksi CMS; di sini judul bagian dan prosa.
 *
 * Fallback global `business-subpages` yang belum diseed.
 */
export type BisnisSubStep = { title: string; body: string };

export type BisnisSubpagesData = {
  bbm: {
    eyebrow: string;
    title: string;
    kelasArmadaHeading: string;
    kelasArmadaDesc: string;
    sumberNote: string;
    daftarKapalHeading: string;
    daftarKapalDesc: string;
    alurHeading: string;
    alurDesc: string;
    steps: BisnisSubStep[];
    standarHeading: string;
    ctaLabel: string;
  };
  roro: {
    eyebrow: string;
    title: string;
    lintasanHeading: string;
    lintasanDesc: string;
    armadaHeading: string;
    armadaDesc: string;
    lengthLabel: string;
    lengthUnit: string;
    capacityLabel: string;
    tiketHeading: string;
    tiketDesc: string;
    tiketButtonLabel: string;
  };
  inquiry: {
    title: string;
    intro: string;
    directContactLabel: string;
  };
};

export const BISNIS_SUBPAGES_DEFAULTS: BisnisSubpagesData = {
  bbm: {
    eyebrow: "Lini utama",
    title: "Transportasi BBM",
    kelasArmadaHeading: "Kelas armada",
    kelasArmadaDesc:
      "Empat kelas kapal pengangkut BBM. Panjang, lebar, dan DWT di bawah masih estimasi proporsional, bukan angka dari company profile.",
    sumberNote:
      "Sumber jumlah kapal: company profile PT Dutabahari Menara Line halaman 04. Dimensi dan DWT belum terverifikasi.",
    daftarKapalHeading: "Daftar kapal",
    daftarKapalDesc:
      "Lima puluh tujuh kapal pengangkut BBM, dikelompokkan per kelas, disalin dari daftar armada company profile halaman 04.",
    alurHeading: "Alur ship-to-ship",
    alurDesc:
      "Cara kerja di dalam lini transportasi BBM, bukan lini terpisah. Empat langkah dari muat sampai serah.",
    steps: [
      {
        title: "Muat di terminal",
        body: "Motor tanker atau SPOB memuat bahan bakar cair di terminal, dengan dokumen muatan dan pemeriksaan yang mengikuti prosedur ISM Code.",
      },
      {
        title: "Berlayar ke titik serah",
        body: "Kapal menuju titik serah, termasuk titik yang tidak terjangkau jetty konvensional. Di sinilah armada berukuran berbeda punya gunanya masing-masing.",
      },
      {
        title: "Sandar kapal ke kapal",
        body: "Dua kapal disandarkan dengan fender dan tali tambat, lalu diikat dalam posisi yang menahan gerak relatif keduanya sepanjang transfer.",
      },
      {
        title: "Transfer dan serah",
        body: "Selang transfer dipasang, muatan dipindahkan, lalu dokumen serah diselesaikan sebelum kedua kapal dilepas.",
      },
    ],
    standarHeading: "Standar dan klasifikasi",
    ctaLabel: "Ajukan permintaan informasi",
  },
  roro: {
    eyebrow: "Lini utama",
    title: "Penyeberangan Ro-Ro",
    lintasanHeading: "Lintasan",
    lintasanDesc:
      "Lima lintasan dari company profile halaman 03 dan 04. Kolom operator memisahkan lintasan yang dijalankan sendiri dari lintasan afiliasi.",
    armadaHeading: "Armada Jambo",
    armadaDesc:
      "Sembilan kapal ro-ro. Panjang dan kapasitas penumpang di bawah berlaku untuk kelas, bukan diukur per kapal.",
    lengthLabel: "Panjang kelas",
    lengthUnit: "meter",
    capacityLabel: "Kapasitas",
    tiketHeading: "Pesan tiket",
    tiketDesc: "Pemesanan tiket ro-ro dilayani lewat BookJambo, kanal resmi DML.",
    tiketButtonLabel: "Buka BookJambo",
  },
  inquiry: {
    title: "Permintaan Informasi Bisnis",
    intro:
      "Isi form di bawah untuk kebutuhan pengangkutan atau kerja sama. Tim kami akan menghubungi lewat WhatsApp. Tiga field terakhir opsional, kirim saja meski volumenya belum pasti.",
    directContactLabel: "Kontak langsung",
  },
};
