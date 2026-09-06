/**
 * Teks bawaan halaman Tentang Kami. Angka (tahun, kapal, orang, sektor),
 * daftar dokumen legal, nilai inti, dan struktur grup tetap dari
 * CompanyProfile / LegalDocuments; di sini cuma judul, prosa, dan label.
 *
 * Dipakai sebagai fallback global `about-page` yang belum diseed dan
 * sebagai default prop komponen supaya test tetap jalan tanpa CMS.
 */
export type AboutIdentityBlock = {
  title: string;
  lead: string;
  items: string[];
  note: string;
};

export type AboutPageData = {
  hero: { title: string; intro1: string; intro2: string };
  statLabels: { years: string; ships: string; people: string; sectors: string };
  identity: AboutIdentityBlock[];
  coreValues: { heading: string; intro: string; medallionCaption: string };
  groupChart: { heading: string; intro: string; parentName: string; parentCaption: string };
  legal: {
    heading: string;
    standardsLabel: string;
    membershipsLabel: string;
    footnote: string;
  };
  offices: { heading: string; intro: string; dmlOwnerLabel: string; groupOwnerLabel: string };
  cta: { heading: string; primaryButtonLabel: string; secondaryButtonLabel: string };
};

export const ABOUT_PAGE_DEFAULTS: AboutPageData = {
  hero: {
    title: "Keandalan Maritim Sejak 1988",
    intro1:
      "Dirintis oleh Herman Chandra, PT Dutabahari Menara Line (DML) terus melangkah maju sebagai bagian dari Sinar Alam Corporation. Dengan dukungan ratusan tenaga profesional dan armada yang memadai, kami berkomitmen memberikan layanan angkutan kargo dan penyeberangan (Ro-Ro) terbaik untuk pelanggan.",
    intro2: "",
  },
  statLabels: {
    years: "Beroperasi tanpa putus sejak 1988",
    ships: "Armada bahan bakar dan penyeberangan",
    people: "Awak kapal dan staf kantor",
    sectors: "Sektor usaha di dalam grup",
  },
  identity: [
    {
      title: "Lini Kerja",
      lead: "",
      items: [
        "Mengangkut bahan bakar cair ke pelabuhan dan pulau-pulau utama Indonesia, dari muat di terminal sampai serah di titik yang tidak terjangkau jetty konvensional.",
        "Mengoperasikan penyeberangan penumpang dan kendaraan dengan jadwal tetap di lintasan yang menghubungkan Jawa, Bali, Lombok, dan Kalimantan Tengah.",
        "Melakukan transfer bahan bakar antar kapal di tengah perairan, tanpa menunggu antrean sandar pelabuhan.",
      ],
      note: "",
    },
    {
      title: "Tonggak",
      lead: "Didirikan Herman Chandra di Banjarmasin pada 30 November 1988, dan kini menjadi bagian dari Sinar Alam Corporation bersama sebelas perusahaan lain di enam sektor usaha.",
      items: [],
      note: "Company profile resmi hanya mencatat satu tanggal. Tahun akuisisi, penambahan armada, dan pembukaan cabang belum terdokumentasi, jadi belum dicantumkan.",
    },
  ],
  coreValues: {
    heading: "Core Values",
    intro:
      "Tiga prinsip landasan yang membentuk budaya kerja dan standar kualitas seluruh tenaga profesional DML, baik di darat maupun di perairan.",
    medallionCaption: "Core values",
  },
  groupChart: {
    heading: "Struktur Grup",
    intro:
      "DML duduk di sektor transportir. Lima sektor lain dijalankan perusahaan grup yang berbeda dan tidak dioperasikan DML.",
    parentName: "Sinar Alam Corporation",
    parentCaption: "Perusahaan induk",
  },
  legal: {
    heading: "Legalitas dan Sertifikasi",
    standardsLabel: "Standar yang diterapkan",
    membershipsLabel: "Keanggotaan",
    footnote:
      "Titik abu menandai standar yang belum tercantum di company profile resmi dan masih menunggu konfirmasi.",
  },
  offices: {
    heading: "Kantor",
    intro:
      "Dipisah dengan sengaja: kartu bergaris navy adalah kantor DML sendiri, kartu bergaris abu adalah kantor Sinar Alam Corporation.",
    dmlOwnerLabel: "Kantor DML",
    groupOwnerLabel: "Kantor grup",
  },
  cta: {
    heading: "Ingin tahu lini kerja kami lebih jauh?",
    primaryButtonLabel: "Transportasi Minyak",
    secondaryButtonLabel: "Hubungi kami",
  },
};
