/**
 * Teks bawaan halaman /karier dan /kontak. Alamat kantor, telepon, dan
 * daftar lini bisnis tetap dari CompanyProfile / SiteNavigation.
 *
 * Fallback global `contact-career` yang belum diseed.
 */
export type ContactCareerData = {
  career: {
    title: string;
    noOpeningsText: string;
    spontaneousText: string;
    whatsappButtonLabel: string;
    whatsappMessage: string;
  };
  contact: {
    title: string;
    intro: string;
    phoneLabel: string;
    mapsLinkLabel: string;
    perLineHeading: string;
    perLineIntro: string;
    perLineLinkLabel: string;
  };
};

export const CONTACT_CAREER_DEFAULTS: ContactCareerData = {
  career: {
    title: "Karier",
    noOpeningsText: "Belum ada lowongan terbuka saat ini.",
    spontaneousText:
      "Kami tetap menerima lamaran spontan. Kirim CV dan posisi yang kamu minati lewat WhatsApp, tim kami akan menyimpannya untuk kebutuhan rekrutmen berikutnya.",
    whatsappButtonLabel: "Kirim lamaran lewat WhatsApp",
    whatsappMessage:
      "Halo, saya ingin mengirimkan lamaran kerja spontan ke PT Dutabahari Menara Line.",
  },
  contact: {
    title: "Kontak",
    intro: "Isi form di bawah untuk pertanyaan umum. Tim kami akan menghubungi lewat WhatsApp.",
    phoneLabel: "Telepon",
    mapsLinkLabel: "Buka di Google Maps",
    perLineHeading: "Kontak per Lini Bisnis",
    perLineIntro:
      "Kedua lini bisnis kami saat ini melayani lewat satu nomor kontak yang sama. Detail armada, lintasan, dan standar operasi ada di halaman masing-masing lini.",
    perLineLinkLabel: "Lihat detail lini",
  },
};
