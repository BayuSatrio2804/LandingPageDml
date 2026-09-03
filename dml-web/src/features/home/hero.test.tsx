import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { Hero } from "./hero";
import type { CertBadge } from "@/content/types";

const CERTIFICATIONS: CertBadge[] = [
  { name: "ISO 9001:2015", assetPath: "/assets/cert/iso-9001.png", alt: "Tersertifikasi ISO 9001:2015", source: "cp-pdf" },
  { name: "ISM Code", assetPath: "/assets/cert/ism-code.png", alt: "Menerapkan ISM Code", source: "cp-pdf" },
  { name: "HSSE", assetPath: "/assets/cert/hsse.png", alt: "Utamakan keselamatan dan kesehatan kerja", source: "belum-terverifikasi" },
];

/**
 * matches: true memilih jalur reduced motion, jadi tidak ada GSAP yang jalan di
 * jsdom. Pola stub ini sama dengan business-lines.test.tsx dan
 * certifications.test.tsx.
 *
 * Menyandarkan assertion "tidak ada canvas" pada default global di
 * vitest.setup.ts akan membuat test ini diam-diam terbalik kalau default itu
 * berubah, jadi stubnya ditulis eksplisit di sini.
 */
beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

describe("Hero", () => {
  it("render headline sebagai h1", () => {
    render(<Hero certifications={CERTIFICATIONS} />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  // Disiplin hero master spec: headline maksimal dua baris di desktop.
  // Batas kata adalah proksi yang bisa diuji. Headline sekarang tepat tujuh
  // kata, jadi menambah satu kata saja akan menggagalkan test ini — memang itu
  // gunanya.
  it("headline maksimal tujuh kata", () => {
    render(<Hero certifications={CERTIFICATIONS} />);
    const words = screen.getByRole("heading", { level: 1 }).textContent?.trim().split(/\s+/) ?? [];
    expect(words.length).toBeLessThanOrEqual(7);
  });

  it("subteks maksimal dua puluh kata", () => {
    render(<Hero certifications={CERTIFICATIONS} />);
    const subtext = screen.getByTestId("hero-subteks").textContent?.trim().split(/\s+/) ?? [];
    expect(subtext.length).toBeLessThanOrEqual(20);
  });

  it("CTA BBM menunjuk halaman permintaan informasi, bukan kontak umum", () => {
    // Ditutup di Plan 9 setelah Plan 8 membangun halamannya. Label CTA-nya
    // memang sudah "Permintaan Informasi BBM" sejak Plan 4.
    render(<Hero certifications={CERTIFICATIONS} />);
    expect(
      screen.getByRole("link", { name: /Permintaan Informasi BBM/i }),
    ).toHaveAttribute("href", "/bisnis/transportasi-bbm/permintaan-informasi");
  });

  it("CTA ro-ro mengarah ke pemesanan tiket", () => {
    render(<Hero certifications={CERTIFICATIONS} />);
    expect(screen.getByRole("link", { name: /pesan tiket ro-ro/i })).toHaveAttribute(
      "href",
      "https://dutabahari.id",
    );
  });

  // Kontrak LCP: kandidat LCP hero adalah teks yang dicat dari HTML server,
  // bukan gambar yang menunggu jaringan. Hero dua pintu MEMANG memakai foto,
  // tapi foto itu dipasang setelah hidrasi — lihat cabang `mounted` di
  // hero.tsx. Assertion ini yang menjaga batas itu: memindahkan panel keluar
  // dari cabang `mounted` akan merebut kembali peran LCP dan menghidupkan lagi
  // risiko ambang Lighthouse 5000.
  //
  // `render()` dari Testing Library bukan HTML server: act() di dalamnya
  // memflush useEffect secara sinkron sebelum return, jadi `mounted` sudah
  // `true` dan gambarnya sudah kepasang begitu render() selesai — assertion
  // "tidak ada <img>" lewat container itu jadi selalu gagal apa pun isi
  // komponennya, bukan cuma saat kontraknya benar-benar dilanggar.
  // renderToStaticMarkup meniru render server sungguhan (tidak pernah
  // menjalankan efek sama sekali), jadi itu yang dipakai di sini.
  it("hero tidak merender gambar apa pun di HTML server", () => {
    const html = renderToStaticMarkup(<Hero certifications={CERTIFICATIONS} />);
    expect(html).not.toMatch(/<img[\s>]/);
    expect(html).toMatch(/<h1[^>]*>.+?<\/h1>/);
  });

  it("tidak ada canvas di HTML server", () => {
    const { container } = render(<Hero certifications={CERTIFICATIONS} />);
    expect(container.querySelector("canvas")).toBeNull();
  });

  // Kedua pintu harus setara sejak mendarat: tidak ada opacity kontainer yang
  // meredupkan salah satunya, karena itu mengalikan turun ke tombol.
  it("kedua label lini bisnis ada", () => {
    render(<Hero certifications={CERTIFICATIONS} />);
    expect(screen.getByText(/transportasi bbm/i)).toBeInTheDocument();
    expect(screen.getByText(/penyeberangan ro-ro/i)).toBeInTheDocument();
  });
});
