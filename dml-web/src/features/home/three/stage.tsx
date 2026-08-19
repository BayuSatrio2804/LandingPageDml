"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

/**
 * Lingkungan prosedural, nol byte. Berkas HDRI 1k dari Poly Haven berukuran
 * 1,5 MB, yaitu dua kali seluruh anggaran model halaman ini, dan menambah satu
 * kewajiban atribusi lagi. Susunan lightformer di bawah memberi highlight
 * memanjang yang dibutuhkan lambung logam supaya terbaca sebagai permukaan,
 * bukan siluet, tanpa mengunduh apa pun.
 */
export function Stage() {
  return (
    <>
      <Environment resolution={256}>
        <Lightformer intensity={3.2} position={[0, 6, -8]} scale={[12, 3, 1]} color="#FFE3CC" />
        <Lightformer intensity={2.2} position={[-8, 3, 6]} scale={[10, 3, 1]} color="#9FC4D8" />
        <Lightformer intensity={1.6} position={[8, 2, 5]} scale={[8, 3, 1]} color="#6F94A3" />
        <Lightformer intensity={0.5} position={[0, -4, 0]} scale={[14, 6, 1]} rotation={[Math.PI / 2, 0, 0]} color="#F5F7FA" />
      </Environment>
      {/*
        Kunci plus isian, bukan kunci saja. Lambung memakai metalness 0,65 di
        atas latar nyaris hitam, dan logam tanpa cahaya isian memantulkan
        kegelapan itu: hasilnya siluet hitam, bukan permukaan. Checkpoint
        browser Plan 5 menemukan kelima kelas kapal terbaca sebagai gumpalan
        gelap dengan susunan lampu sebelumnya.
      */}
      <ambientLight intensity={0.45} color="#BFD4DD" />
      <directionalLight position={[6, 8, 4]} intensity={1.8} color="#FFD9BC" />
      <directionalLight position={[-7, 4, -5]} intensity={0.6} color="#9FC4D8" />
      <ContactShadows position={[0, -0.01, 0]} opacity={0.55} scale={40} blur={2.4} far={12} />
    </>
  );
}
