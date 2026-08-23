"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

/**
 * Lingkungan prosedural, nol byte. Berkas HDRI 1k dari Poly Haven berukuran
 * 1,5 MB, yaitu dua kali seluruh anggaran model halaman ini, dan menambah satu
 * kewajiban atribusi lagi. Susunan lightformer di bawah memberi highlight
 * memanjang yang dibutuhkan lambung logam supaya terbaca sebagai permukaan,
 * bukan siluet, tanpa mengunduh apa pun.
 *
 * Susunannya tetap, warnanya yang pindah keluarga dua kali. Lampu hangat
 * #FFD9BC masuk akal di atas bidang hitam kehijauan yang lama; di atas bidang
 * biru-putih ia membuat lambung menguning. Sejak Plan 7 bidang halamannya
 * turun lagi satu tingkat (#F5F9FD jadi #E9EEF5), jadi ujung terang tiap lampu
 * ikut turun dan tidak ada lagi putih murni di sini: lampu yang lebih terang
 * dari lantainya sendiri membuat lambung terbaca seperti tempelan dari
 * halaman lain. Bayangan kontak ikut pindah ke keluarga navy yang baru.
 */
export function Stage() {
  return (
    <>
      <Environment resolution={256}>
        <Lightformer intensity={2.6} position={[0, 6, -8]} scale={[12, 3, 1]} color="#F7FAFD" />
        <Lightformer intensity={2} position={[-8, 3, 6]} scale={[10, 3, 1]} color="#C9D8EC" />
        <Lightformer intensity={1.4} position={[8, 2, 5]} scale={[8, 3, 1]} color="#9FB2CB" />
        {/*
          Pantulan lantai. Di palet gelap isinya nyaris hitam supaya bagian
          bawah lambung tidak melayang; sekarang lantainya memang terang, jadi
          pantulan terang adalah yang benar secara fisik dan yang menahan sisi
          bawah lambung tidak jatuh jadi blok hitam pekat.
        */}
        <Lightformer intensity={0.6} position={[0, -4, 0]} scale={[14, 6, 1]} rotation={[Math.PI / 2, 0, 0]} color="#DAE3EF" />
      </Environment>
      {/*
        Kunci plus isian, bukan kunci saja. Lambung memakai metalness 0,5 dan
        logam tanpa cahaya isian memantulkan apa pun yang ada di sekelilingnya
        secara mentah: di bidang gelap hasilnya siluet hitam, di bidang terang
        hasilnya tambalan putih. Dua-duanya butuh isian untuk jadi permukaan.
      */}
      <ambientLight intensity={0.5} color="#CFDAE9" />
      <directionalLight position={[6, 8, 4]} intensity={1.6} color="#F7FAFD" />
      <directionalLight position={[-7, 4, -5]} intensity={0.6} color="#AEC2DA" />
      {/*
        Bayangan kontak diwarnai navy, bukan hitam murni, dan opasitasnya turun
        dari 0,55 ke 0,32. Bayangan hitam pekat di atas bidang biru-putih
        terbaca sebagai lubang, bukan sebagai lantai.
      */}
      <ContactShadows position={[0, -0.01, 0]} opacity={0.32} scale={40} blur={2.4} far={12} color="#16294B" />
    </>
  );
}
