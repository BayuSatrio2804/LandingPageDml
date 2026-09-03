/**
 * Teks bawaan section-section Beranda selain hero (hero punya
 * hero-defaults.ts sendiri) dan selain yang sudah datang dari koleksi CMS
 * lain (lini bisnis, armada, sertifikasi diambil dari CompanyProfile /
 * BusinessLines / FleetClasses).
 *
 * Dipakai sebagai fallback global `home-sections` yang belum diseed dan
 * sebagai default prop komponen supaya test tetap bisa merender tanpa CMS.
 */
export type HomeSectionsData = {
  dayCut: { heading: string; body: string };
  affiliates: { heading: string; subtext: string };
  fleetComparator: {
    heading: string;
    description: string;
    descriptionStatic: string;
    dragHint: string;
    gridHint: string;
  };
  routeMap: { heading: string; description: string };
  since1988: {
    heading: string;
    counterCaption: string;
    foundingSentence: string;
    genealogyLinkLabel: string;
  };
  stats: {
    shipsLabel: string;
    peopleLabel: string;
    yearsLabel: string;
    portsLabel: string;
    membershipsHeading: string;
  };
  cta: { heading: string; buttonLabel: string };
};

export const HOME_SECTIONS_DEFAULTS: HomeSectionsData = {
  dayCut: {
    heading: "Ship-to-ship transfer",
    body: "Memindahkan bahan bakar langsung antar kapal di tengah perairan, tanpa menunggu antrean sandar pelabuhan. Itu yang membuat pasokan sampai tepat waktu ke titik yang sulit dijangkau jetty konvensional.",
  },
  affiliates: {
    heading: "Perusahaan afiliasi",
    subtext: "Tiga perusahaan yang bekerja berdampingan dengan armada DML.",
  },
  fleetComparator: {
    heading: "Perbandingan Armada",
    description:
      "Lima kelas kapal dalam satu skala tetap. Grid di bawah lambung tidak pernah berubah ukuran.",
    descriptionStatic:
      "Lima kelas kapal, dari SPOB terkecil sampai motor tanker terbesar, dalam satu skala.",
    dragHint: "Seret untuk memutar",
    gridHint: "1 kotak grid = 10 m",
  },
  routeMap: {
    heading: "Rute Penyeberangan Ro-Ro",
    description:
      "Lima lintasan yang menghubungkan Sumatera, Jawa, Bali, Lombok, dan Kalimantan Tengah.",
  },
  since1988: {
    heading: "Sejak 1988",
    counterCaption: "tahun mengangkut bahan bakar dan orang di perairan Indonesia.",
    foundingSentence:
      "PT Dutabahari Menara Line didirikan Herman Chandra di Banjarmasin pada 30 November 1988, dan kini bagian dari Sinar Alam Corporation.",
    genealogyLinkLabel: "Lihat silsilah lengkap",
  },
  stats: {
    shipsLabel: "Kapal",
    peopleLabel: "Orang",
    yearsLabel: "Tahun beroperasi",
    portsLabel: "Pelabuhan dilayani",
    membershipsHeading: "Keanggotaan",
  },
  cta: {
    heading: "Siap membahas kebutuhan pengangkutan atau penyeberangan Anda?",
    buttonLabel: "Hubungi Kami",
  },
};
