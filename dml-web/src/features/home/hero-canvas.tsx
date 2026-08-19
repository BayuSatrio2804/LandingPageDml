"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { Stage } from "./three/stage";
import { fitCameraDistanceForBox } from "./three/fit-camera";
import { HULL_MATERIAL, GRID_COLORS } from "./three/materials";
import { usePrefersReducedMotion } from "@/lib/motion/use-prefers-reduced-motion";
import { refreshScrollTriggers } from "@/lib/motion/gsap";
import { useElementHandle, useInViewport } from "@/lib/motion/use-in-viewport";

const MODEL_URL = "/models/tanker.glb";
const DRACO_PATH = "/draco/";
const FOV = 34;
const WORLD_LENGTH = 10;

type Prepared = { object: THREE.Object3D; size: THREE.Vector3 };

function prepare(scene: THREE.Object3D): Prepared {
  const copy = scene.clone(true);
  const raw = new THREE.Box3().setFromObject(copy).getSize(new THREE.Vector3());
  // Sumbu memanjang lambung tidak konsisten antar model Sketchfab: model
  // tanker ini panjang di sumbu Z, bukan X. Dimensi terpanjang dipakai sebagai
  // acuan skala, lalu lambung diputar ke sumbu X supaya kamera yang duduk di
  // kuadran +X +Z menyingkap profil sisi kapal, bukan haluan lurus dari depan.
  const modelLength = Math.max(raw.x, raw.y, raw.z);
  copy.scale.setScalar(modelLength > 0 ? WORLD_LENGTH / modelLength : 1);
  if (raw.z === modelLength) copy.rotation.y = Math.PI / 2;

  // Titik asal tiap GLB ada di tempat berbeda, ada yang di lunas, ada yang di
  // tengah lambung, dan sebagian tidak berada di tengah panjangnya sama
  // sekali. Lambung digeser sampai pusat kotak pembatasnya duduk di sumbu
  // kamera untuk X dan Z, dan sampai lunasnya menyentuh y=0 untuk Y.
  //
  // Tanpa penengahan X dan Z, seluruh aritmetika fit kamera memakai asumsi
  // yang salah: ia memuat UKURAN kotak dengan anggapan kotak itu berpusat di
  // titik bidik, jadi lambung yang asalnya melenceng tetap terpotong di tepi
  // frame meskipun jaraknya sudah benar. Diverifikasi di checkpoint browser
  // Plan 5, tempat motor tanker terpotong di tepi kanan kanvas.
  const scaled = new THREE.Box3().setFromObject(copy);
  const center = scaled.getCenter(new THREE.Vector3());
  copy.position.set(-center.x, -scaled.min.y, -center.z);

  copy.traverse((node) => {
    if (node instanceof THREE.Mesh) {
      node.material = new THREE.MeshStandardMaterial({
        color: HULL_MATERIAL.color,
        metalness: HULL_MATERIAL.metalness,
        roughness: HULL_MATERIAL.roughness,
      });
    }
  });

  /**
   * Kotak pembatas diukur SETELAH skala dan rotasi, dan yang dipakai kotaknya,
   * bukan bola pembatasnya. Bola yang mengelilingi lambung punya radius sebesar
   * separuh panjang kapal, jadi memuatnya ke bukaan vertikal kamera membuat
   * kapal panjang tampil kecil di tengah frame yang mayoritas kosong.
   */
  const size = new THREE.Box3().setFromObject(copy).getSize(new THREE.Vector3());

  return { object: copy, size };
}

/**
 * Lantai panggung, sama seperti di Perbandingan Armada. Dengan foto poster dan
 * bingkai kartu sama-sama dilepas, satu-satunya yang menahan lambung adalah
 * bayangan kontak, dan bayangan tanpa bidang membuat kapal terbaca mengambang
 * di ruang kosong. Grid ini yang mengubahnya jadi objek yang berdiri di
 * studio.
 *
 * Tidak ada keterangan "1 kotak = sekian meter" di sini, berbeda dengan
 * comparator: hero menormalkan panjang lambung ke sepuluh satuan dunia apa pun
 * kelas kapalnya, jadi angka meter di panggung ini akan jadi angka karangan.
 */
function StageFloor() {
  return <gridHelper args={[20, 20, GRID_COLORS.main, GRID_COLORS.sub]} position={[0, -0.02, 0]} />;
}

function Vessel() {
  const { scene } = useGLTF(MODEL_URL, DRACO_PATH);
  const { object, size } = useMemo(() => prepare(scene), [scene]);
  const camera = useThree((state) => state.camera);
  const viewport = useThree((state) => state.size);
  const controls = useThree((state) => state.controls) as { target?: THREE.Vector3 } | null;

  /**
   * Kamera dipasang sekali setelah model terukur, lalu OrbitControls yang
   * pegang kendali. Tidak ada lagi useFrame yang menarik kamera tiap frame:
   * itu yang dulu bertengkar dengan tangan pengguna, dan brief-nya memang
   * meminta artefak yang bisa diputar manual seperti di perbandingan armada.
   */
  useEffect(() => {
    const aspect = viewport.height > 0 ? viewport.width / viewport.height : 1;
    // Margin 1,05, bukan 1,18. Panggung hero sekarang lebar dan tidak lagi
    // dibingkai kartu, jadi sisa ruang di sekeliling lambung tidak punya tepi
    // yang perlu dihormati: yang tersisa cuma jaminan bahwa putaran otomatis
    // tidak membawa diagonal jejak lambung keluar frame. Di bawah 1,02 haluan
    // mulai menyentuh tepi kanvas saat autoRotate melintasi sudut serong.
    const distance = fitCameraDistanceForBox(size, FOV, aspect, 1.05);
    if (distance <= 0) return;
    camera.position.set(distance * 0.72, distance * 0.34, distance * 0.6);
    const center = new THREE.Vector3(0, size.y * 0.45, 0);
    camera.lookAt(center);
    if (controls?.target) controls.target.copy(center);
  }, [camera, controls, size, viewport]);

  return (
    <>
      <primitive object={object} />
      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.55}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.49}
      />
    </>
  );
}

export function HeroCanvas() {
  const [wrapNode, attachWrap] = useElementHandle<HTMLDivElement>();
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const reduced = usePrefersReducedMotion();
  const { inViewport } = useInViewport(wrapNode);

  /**
   * Penundaannya yang menjaga LCP: poster next/image yang mengecat pertama dan
   * tetap jadi elemen LCP. Kalau kanvas dipasang di render pertama, WebGL ikut
   * bersaing di jendela pengukuran LCP tanpa mengubah apa yang sebenarnya
   * dilihat pengguna lebih dulu.
   */
  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    const timer = window.setTimeout(() => setMounted(true), 600);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  if (reduced || !mounted) return null;

  return (
    <div ref={attachWrap} className="absolute inset-0">
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: ready ? 1 : 0 }}
        aria-hidden
      >
        <Canvas
          camera={{ position: [8, 3, 6], fov: FOV }}
          dpr={[1, 1.5]}
          frameloop={inViewport ? "always" : "never"}
          onCreated={() => {
            setReady(true);
            // Kanvas ini tidak mengubah tinggi dokumen, tapi font dan gambar
            // di sekitarnya bisa saja baru selesai bersamaan dengannya.
            // Menghitung ulang di sini lebih murah daripada satu pin yang
            // mulai di koordinat basi.
            refreshScrollTriggers();
          }}
        >
          <Stage />
          <StageFloor />
          <Vessel />
        </Canvas>
      </div>

      <p
        className="pointer-events-none absolute bottom-0 left-0 font-mono text-[11px] text-ink-muted transition-opacity duration-700"
        style={{ opacity: ready ? 1 : 0 }}
      >
        Seret untuk memutar
      </p>
    </div>
  );
}

useGLTF.preload(MODEL_URL, DRACO_PATH);
