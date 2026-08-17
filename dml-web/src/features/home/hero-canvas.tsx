"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Stage } from "./three/stage";
import { fitCameraDistance } from "./three/fit-camera";
import { HULL_MATERIAL } from "./three/materials";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { useScrollProgress } from "@/lib/motion/use-scroll-progress";

const MODEL_URL = "/models/tanker.glb";
const DRACO_PATH = "/draco/";
const FOV = 38;

function Vessel() {
  const { scene } = useGLTF(MODEL_URL, DRACO_PATH);
  const prepared = useMemo(() => {
    const copy = scene.clone(true);
    const box = new THREE.Box3().setFromObject(copy);
    const size = new THREE.Vector3();
    box.getSize(size);
    // Sumbu memanjang lambung tidak konsisten antar model Sketchfab
    // (diverifikasi di Task 11: model tanker ini sendiri panjang di sumbu Z,
    // bukan X). Dimensi terpanjang dipakai sebagai acuan skala. Kamera awal
    // duduk di sumbu +Z memandang ke origin (lihat posisi Canvas di bawah),
    // jadi lambung diputar ke sumbu X (menyamping terhadap kamera) supaya
    // dolly-in dan orbit CameraRig menyingkap profil sisi kapal, bukan
    // memandang haluan/buritan lurus dari depan.
    const modelLength = Math.max(size.x, size.y, size.z);
    const scale = modelLength > 0 ? 9.5 / modelLength : 1;
    copy.scale.setScalar(scale);
    if (size.z === modelLength) copy.rotation.y = Math.PI / 2;
    copy.position.y = -new THREE.Box3().setFromObject(copy).min.y;
    copy.traverse((node) => {
      if (node instanceof THREE.Mesh) {
        node.material = new THREE.MeshStandardMaterial({
          color: HULL_MATERIAL.color,
          metalness: HULL_MATERIAL.metalness,
          roughness: HULL_MATERIAL.roughness,
        });
      }
    });
    return copy;
  }, [scene]);

  return <primitive object={prepared} />;
}

/**
 * Tiga beat kamera yang dijahit jadi satu gerakan: masuk, memutar melewati
 * lambung, lalu terangkat dan menunduk ke geladak. Alasannya satu kalimat:
 * skala kapal hanya terbaca kalau kamera bergerak melewatinya.
 */
function CameraRig({ progressRef }: { progressRef: React.RefObject<number> }) {
  const target = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }, delta) => {
    const progress = progressRef.current ?? 0;
    const near = fitCameraDistance(5.4, FOV);
    const far = near * 2.1;

    const distance = THREE.MathUtils.lerp(far, near, Math.min(1, progress * 1.6));
    const yaw = THREE.MathUtils.degToRad(-20 + progress * 35);
    const height = THREE.MathUtils.lerp(distance * 0.16, distance * 0.44, progress);

    target.set(Math.sin(yaw) * distance, height, Math.cos(yaw) * distance);
    camera.position.lerp(target, Math.min(1, delta * 2.5));
    camera.lookAt(0, THREE.MathUtils.lerp(1.4, 0.4, progress), 0);
  });

  return null;
}

export function HeroCanvas() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const reduced = usePrefersReducedMotion();

  const progressRef = useScrollProgress(sectionRef, {
    end: "+=120%",
    pin: true,
    disabled: reduced || !mounted,
  });

  /**
   * Satu efek, bukan dua. Versi dua efek (satu mengisi sectionRef, satu
   * memasang canvas) bergantung pada urutan pemanggilan efek: efek di dalam
   * useScrollProgress terdaftar lebih dulu karena hook-nya dipanggil di atas,
   * jadi ia bisa berjalan saat sectionRef masih null dan pin tidak pernah
   * terpasang. Mengisi sectionRef di sini, sebelum setMounted, membuat urutan
   * itu tidak lagi jadi soal.
   *
   * Penundaannya sendiri yang menjaga LCP: poster next/image yang mengecat
   * pertama dan tetap jadi elemen LCP. Kalau canvas dipasang di render
   * pertama, WebGL ikut bersaing di jendela pengukuran LCP tanpa mengubah apa
   * yang sebenarnya dilihat pengguna lebih dulu.
   */
  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;

    const section = document.getElementById("hero");
    if (!(section instanceof HTMLElement)) return;
    sectionRef.current = section;

    const timer = window.setTimeout(() => setMounted(true), 600);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  if (reduced || !mounted) return null;

  return (
    <div
      className="absolute inset-0 transition-opacity duration-700"
      style={{ opacity: ready ? 1 : 0 }}
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 3, 26], fov: FOV }}
        dpr={[1, 1.5]}
        onCreated={() => setReady(true)}
      >
        <Stage />
        <Vessel />
        <CameraRig progressRef={progressRef} />
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_URL, DRACO_PATH);
