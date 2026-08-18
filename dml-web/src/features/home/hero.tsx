import { CtaLink } from "@/components/ui/cta-link";
import { HeroCanvas } from "./hero-canvas";
import { HeroHeadline } from "./hero-headline";

/**
 * Hero terbagi dua, bukan foto satu layar penuh dengan teks di atasnya.
 *
 * Alasannya bukan selera: sampai Plan 4, tiga seksi pertama beranda semuanya
 * "foto penuh layar plus panel scrim", jadi halaman kehilangan pergantian
 * ritme tepat di tempat yang paling menentukan. Sekarang hero adalah bidang
 * gelap dengan tipografi di kiri dan satu artefak 3D di kanan, lalu seksi
 * kedua yang membuka ke foto penuh layar. Pergantian itu yang membuat seksi
 * kedua terasa membuka, bukan mengulang.
 *
 * Foto poster di belakang lambung sudah dilepas. Satu foto udara STS malam
 * hari dan satu render studio adalah dua bahasa gambar yang berbeda, dan
 * menumpuknya membuat lambung 3D terbaca sebagai tempelan di atas foto, bukan
 * sebagai objek yang berdiri sendiri. Bingkai kartunya ikut dilepas karena
 * alasan yang sama dengan panggung Perbandingan Armada: lambung duduk
 * langsung di atas bidang gelap halaman, dengan grid dan bayangan kontak
 * sebagai satu-satunya lantai.
 *
 * Konsekuensinya dicatat di sini supaya tidak ditemukan ulang: di bawah 768 px
 * dan pada reduced motion, kanvas memang tidak pernah dipasang, jadi hero di
 * mobile kini murni tipografi. Gambar pertama halaman pindah ke seksi
 * DayCut tepat di bawahnya, yang memang foto penuh layar. Elemen LCP ikut
 * pindah dari poster ke h1, yang dicat server dan tidak menunggu jaringan.
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-[82svh] items-center overflow-hidden bg-surface pt-24 pb-16 md:min-h-[100dvh] md:pb-20"
    >
      {/* Cahaya tunggal di belakang artefak. Satu gradien radial, bukan mesh
          berwarna: yang dibutuhkan cuma alasan kenapa sisi kanan lebih terang
          dari sisi kiri. Tanpa bingkai kartu, gradien ini juga yang memisahkan
          lambung dari latar tanpa perlu menggambar tepi. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_72%_46%,rgba(22,65,148,0.10),transparent_64%)]"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1400px] grid-cols-12 items-center gap-y-12 px-4 md:gap-x-8 md:px-8">
        <div className="col-span-12 md:col-span-6">
          <HeroHeadline>Mengangkut bahan bakar dan orang, lintas Indonesia.</HeroHeadline>
          <p data-testid="hero-subteks" className="mt-6 max-w-[46ch] text-lg text-ink-muted md:text-xl">
            Armada 64 kapal, lima lintasan penyeberangan, dan bengkel perawatan sendiri,
            dioperasikan dari Banjarmasin sejak 1988.
          </p>
          <div className="mt-10">
            {/* TODO(plan-bisnis): arahkan ke /bisnis/transportasi-bbm/permintaan-informasi setelah halaman itu dibangun */}
            <CtaLink href="/kontak">Hubungi Kami</CtaLink>
          </div>
        </div>

        {/*
          Panggung, bukan kartu: tanpa border, tanpa radius, tanpa latar sendiri.
          Rasio 3:2 yang menahan tingginya, dan itu bukan dekorasi. Jarak kamera
          dihitung dari bukaan horizontal untuk lambung sepanjang ini, jadi
          panggung yang lebar dan pendek memuat kapal lebih besar di layar
          daripada bingkai persegi dengan lebar yang sama.

          hidden di bawah md karena kanvas memang tidak pernah dipasang di sana:
          menyisakan kotak kosong setinggi rasio hanya akan menambah ruang mati
          di bawah CTA.
        */}
        <div className="relative col-span-12 hidden aspect-3/2 md:col-span-6 md:block">
          <HeroCanvas />
        </div>
      </div>
    </section>
  );
}
