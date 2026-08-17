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
        <Lightformer intensity={2.4} position={[0, 6, -8]} scale={[12, 3, 1]} color="#FFE3CC" />
        <Lightformer intensity={1.1} position={[-8, 3, 4]} scale={[8, 2, 1]} color="#9FC4D8" />
        <Lightformer intensity={0.7} position={[8, 2, 4]} scale={[6, 2, 1]} color="#4C6773" />
        <Lightformer intensity={0.5} position={[0, -4, 0]} scale={[14, 6, 1]} rotation={[Math.PI / 2, 0, 0]} color="#0A1418" />
      </Environment>
      <directionalLight position={[6, 8, 4]} intensity={1.2} color="#FFD9BC" />
      <ContactShadows position={[0, -0.01, 0]} opacity={0.55} scale={40} blur={2.4} far={12} />
    </>
  );
}
