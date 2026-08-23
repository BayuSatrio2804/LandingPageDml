export function SkipLink() {
  return (
    /*
     * Pil dibalik sejak Plan 7: bidang terang, teks navy. Sebelumnya bg-accent,
     * dan begitu kepala halaman jadi pita navy pil itu jadi navy di atas navy —
     * top-4 dengan z-50 mendaratkannya persis di dalam pita setinggi 64/72px.
     *
     * Cincinnya bukan hiasan. Pil ini fixed dan halaman bergulir di bawahnya,
     * jadi ia harus terbaca di dua latar: di atas navy, bidang terangnya sendiri
     * yang membedakan (12,3:1); di atas bidang halaman terang, bedanya cuma
     * 1,1:1 dan yang menggambar tepinya semata-mata cincin navy itu.
     */
    <a
      href="#konten-utama"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface-2 focus:px-5 focus:py-2 focus:text-accent focus:ring-2 focus:ring-accent"
    >
      Lompat ke konten utama
    </a>
  );
}
