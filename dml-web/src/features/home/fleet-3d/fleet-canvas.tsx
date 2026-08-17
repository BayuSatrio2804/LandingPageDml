"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { FLEET_CLASSES } from "@/content/fleet";
import { FLEET_MODEL_BY_SLUG } from "@/content/model-credits";
import type { FleetClass } from "@/content/types";
import { Stage } from "../three/stage";
import { fitCameraDistance } from "../three/fit-camera";
import { DECK_MATERIAL, HULL_MATERIAL, ACCENT_LINE_COLOR } from "../three/materials";
import { buildHullGeometry, buildHullShape, buildSuperstructureGeometry } from "./hull-geometry";
import { activeClassIndex } from "./class-index";

const FOV = 40;
const DRACO_PATH = "/draco/";

/**
 * Lambung dari model GLB. Materialnya ditimpa nilai bersama supaya tiga model
 * unduhan dan dua lambung buatan tidak terbaca sebagai dua kualitas berbeda
 * dalam satu frame.
 */
function ModelHull({ url, lengthMeters }: { url: string; lengthMeters: number }) {
  const { scene } = useGLTF(url, DRACO_PATH);
  const cloned = useMemo(() => {
    const copy = scene.clone(true);
    const box = new THREE.Box3().setFromObject(copy);
    const size = new THREE.Vector3();
    box.getSize(size);
    // Skala dunia disamakan ke satuan yang dipakai hull-geometry.ts: meter
    // dibagi sepuluh. Sumbu memanjang lambung tidak konsisten antar model
    // Sketchfab (diverifikasi saat implementasi: tanker dan tugboat punya
    // panjang di sumbu Z, ferry di sumbu X, tergantung transform root scene
    // penulis aslinya), jadi dimensi terpanjang bounding box yang dipakai
    // sebagai acuan, bukan size.x tetap. Tanpa ini, tanker (panjang di Z)
    // memakai size.x (lebar) sebagai acuan dan tampil sekitar delapan kali
    // lebih besar dari seharusnya.
    const modelLength = Math.max(size.x, size.y, size.z);
    const scale = modelLength > 0 ? lengthMeters / 10 / modelLength : 1;
    copy.scale.setScalar(scale);
    // Menyamakan hadap ke sumbu X, arah yang dipakai hull-geometry.ts
    // (buildHullShape memanjang di X). Tanpa ini, tanker dan tugboat
    // (panjang asli di Z) akan tegak lurus 90 derajat terhadap ferry dan dua
    // lambung buatan dalam frame yang sama.
    if (size.z === modelLength) copy.rotation.y = Math.PI / 2;
    // Titik asal tiap GLB ada di tempat berbeda, ada yang di lunas ada yang di
    // tengah lambung. ContactShadows di Stage duduk tetap di y=0, jadi tanpa
    // normalisasi ini sebagian lambung akan mengambang di atas bayangannya dan
    // sebagian lagi tenggelam menembusnya. Dihitung ulang sesudah rotasi
    // karena memutar bisa mengubah tinggi minimum.
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
  }, [scene, lengthMeters]);

  return <primitive object={cloned} />;
}

/**
 * Bulwark (pagar geladak) dan geladak atas kedua adalah artikulasi tambahan
 * di level komponen, bukan di hull-geometry.ts (berkas itu sengaja tidak
 * disentuh, geometrinya sudah benar). Checkpoint browser Delta 2 menemukan
 * satu kotak polos di atas lambung datar terbaca sebagai placeholder di
 * sebelah tiga model GLB berdetail (railing, deckhouse bertingkat,
 * propeller), bukan sebagai anggota keluarga yang sama. Dua bentuk ini
 * menambah siluet tanpa mengubah bentuk dasar lambung.
 */
function buildBulwarkGeometry(fleetClass: FleetClass): THREE.ExtrudeGeometry {
  const outer = buildHullShape(fleetClass);
  const inner = new THREE.Path(outer.getPoints().map((p) => new THREE.Vector2(p.x * 0.94, p.y * 0.8)));
  outer.holes = [inner];
  const depth = Math.max(fleetClass.beamMeters / 50, 0.18);
  const geometry = new THREE.ExtrudeGeometry(outer, { depth, bevelEnabled: false, steps: 1 });
  geometry.rotateX(Math.PI / 2);
  geometry.center();
  return geometry;
}

function buildUpperDeckGeometry(fleetClass: FleetClass): THREE.BoxGeometry {
  const length = fleetClass.lengthMeters / 10;
  const beam = fleetClass.beamMeters / 10;
  return new THREE.BoxGeometry(length * 0.09, beam * 0.2, beam * 0.32);
}

/**
 * Lambung untuk kelas yang tidak punya model. SPOB dan oil barge tipe kapal
 * khas Indonesia dan tidak ada di sumber manapun, jadi keduanya dibangun dari
 * primitif dan diberi material yang sama persis dengan model di atas.
 */
function BuiltHull({ index }: { index: number }) {
  const fleetClass = FLEET_CLASSES[index];
  const hullGeometry = useMemo(() => (fleetClass ? buildHullGeometry(fleetClass) : null), [fleetClass]);
  const superGeometry = useMemo(
    () => (fleetClass ? buildSuperstructureGeometry(fleetClass) : null),
    [fleetClass],
  );
  const bulwarkGeometry = useMemo(
    () => (fleetClass ? buildBulwarkGeometry(fleetClass) : null),
    [fleetClass],
  );
  const upperDeckGeometry = useMemo(
    () => (fleetClass ? buildUpperDeckGeometry(fleetClass) : null),
    [fleetClass],
  );

  if (!fleetClass || !hullGeometry || !superGeometry || !bulwarkGeometry || !upperDeckGeometry) return null;

  const hullDraft = Math.max(fleetClass.beamMeters / 40, 0.3);
  const beam = fleetClass.beamMeters / 10;
  const lowerDeckHeight = beam * 0.35;
  const upperDeckY = 0.6 + lowerDeckHeight / 2 + (beam * 0.2) / 2;

  return (
    <group>
      <mesh geometry={hullGeometry}>
        <meshStandardMaterial
          color={HULL_MATERIAL.color}
          metalness={HULL_MATERIAL.metalness}
          roughness={HULL_MATERIAL.roughness}
        />
      </mesh>
      <mesh geometry={bulwarkGeometry} position={[0, hullDraft / 2, 0]}>
        <meshStandardMaterial
          color={DECK_MATERIAL.color}
          metalness={DECK_MATERIAL.metalness}
          roughness={DECK_MATERIAL.roughness}
        />
      </mesh>
      <mesh geometry={superGeometry} position={[0, 0.6, 0]}>
        <meshStandardMaterial
          color={DECK_MATERIAL.color}
          metalness={DECK_MATERIAL.metalness}
          roughness={DECK_MATERIAL.roughness}
        />
      </mesh>
      <mesh geometry={upperDeckGeometry} position={[0, upperDeckY, 0]}>
        <meshStandardMaterial
          color={HULL_MATERIAL.color}
          metalness={HULL_MATERIAL.metalness}
          roughness={HULL_MATERIAL.roughness}
        />
      </mesh>
    </group>
  );
}

function ClassGroup({
  index,
  opacityRef,
}: {
  index: number;
  opacityRef: React.RefObject<number[]>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const fleetClass = FLEET_CLASSES[index];
  const modelUrl = fleetClass ? FLEET_MODEL_BY_SLUG[fleetClass.slug] : null;

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    const opacity = opacityRef.current[index] ?? 0;
    group.visible = opacity > 0.01;
    group.traverse((node) => {
      if (node instanceof THREE.Mesh && node.material instanceof THREE.MeshStandardMaterial) {
        node.material.transparent = true;
        node.material.opacity = opacity;
      }
    });
  });

  if (!fleetClass) return null;

  return (
    <group ref={groupRef}>
      {modelUrl ? (
        <ModelHull url={modelUrl} lengthMeters={fleetClass.lengthMeters} />
      ) : (
        <BuiltHull index={index} />
      )}
    </group>
  );
}

/**
 * Grid tetap sepanjang 10 m per kotak. Tidak ikut berganti saat kelas berganti,
 * jadi mata punya patokan tetap dan perbedaan panjang antar kelas benar-benar
 * terbaca sebagai perbedaan ukuran, bukan perubahan jarak kamera.
 */
function ScaleGrid() {
  return (
    <gridHelper args={[20, 20, ACCENT_LINE_COLOR, "#18292F"]} position={[0, -0.02, 0]} />
  );
}

function Rig({
  progressRef,
  onActiveIndexChange,
}: {
  progressRef: React.RefObject<number>;
  onActiveIndexChange: (index: number) => void;
}) {
  const initialOpacity = useMemo(() => FLEET_CLASSES.map(() => 0), []);
  const opacityRef = useRef<number[]>(initialOpacity);
  const lastIndexRef = useRef(-1);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ camera }, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.12;

    const { index, blend } = activeClassIndex(progressRef.current ?? 0, FLEET_CLASSES.length);
    opacityRef.current = FLEET_CLASSES.map((_, i) => {
      if (i === index) return 1 - blend;
      if (i === index + 1) return blend;
      return 0;
    });

    // Kamera mengikuti ukuran kelas aktif, bukan berdiri di posisi tetap.
    const active = FLEET_CLASSES[index];
    if (active) {
      const radius = active.lengthMeters / 20;
      // Margin dinaikkan dari default 1.15: radius di sini cuma separuh
      // panjang, tidak memperhitungkan tinggi deckhouse/tiang. Kelas kecil
      // seperti tugboat punya tiang yang melampaui separuh panjangnya,
      // dan margin default memotong ujung tiang di frame kamera.
      const distance = fitCameraDistance(radius, FOV, 1.5);
      const target = new THREE.Vector3(distance * 0.72, distance * 0.38, distance * 0.72);
      camera.position.lerp(target, Math.min(1, delta * 2.2));
      camera.lookAt(0, 0, 0);
    }

    if (index !== lastIndexRef.current) {
      lastIndexRef.current = index;
      onActiveIndexChange(index);
    }
  });

  return (
    <group ref={groupRef}>
      {FLEET_CLASSES.map((fleetClass, index) => (
        <ClassGroup key={fleetClass.slug} index={index} opacityRef={opacityRef} />
      ))}
    </group>
  );
}

export function FleetCanvas({
  progressRef,
  onActiveIndexChange,
}: {
  progressRef: React.RefObject<number>;
  onActiveIndexChange: (index: number) => void;
}) {
  return (
    <Canvas camera={{ position: [8, 4, 8], fov: FOV }} dpr={[1, 1.5]}>
      <Stage />
      <ScaleGrid />
      <Rig progressRef={progressRef} onActiveIndexChange={onActiveIndexChange} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </Canvas>
  );
}

for (const url of Object.values(FLEET_MODEL_BY_SLUG)) {
  if (url) useGLTF.preload(url, DRACO_PATH);
}
