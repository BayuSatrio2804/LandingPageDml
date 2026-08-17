"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { FLEET_CLASSES } from "@/content/fleet";
import { buildHullGeometry, buildSuperstructureGeometry } from "./hull-geometry";

const WIREFRAME_COLOR = "#FF5A1F";
const HULL_COLOR = "#18292F";

function ClassMesh({ index, opacityRef }: { index: number; opacityRef: React.RefObject<number[]> }) {
  const fleetClass = FLEET_CLASSES[index];
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const wireMaterialRef = useRef<THREE.LineBasicMaterial>(null);
  const superstructureMaterialRef = useRef<THREE.MeshBasicMaterial>(null);

  const hullGeometry = useMemo(() => (fleetClass ? buildHullGeometry(fleetClass) : null), [fleetClass]);
  const superGeometry = useMemo(() => (fleetClass ? buildSuperstructureGeometry(fleetClass) : null), [fleetClass]);
  // Dimemo-kan terhadap hullGeometry: sebelumnya dibuat langsung di body
  // komponen (di luar useMemo), jadi THREE.EdgesGeometry baru dialokasikan
  // di SETIAP render, bukan cuma saat hullGeometry berubah. Temuan
  // react-doctor/three-no-object-construction-in-render dan
  // react-doctor/r3f-no-inline-resource-prop (baris JSX geometry={edges} di
  // bawah) sama-sama berakar dari sini.
  const edges = useMemo(() => (hullGeometry ? new THREE.EdgesGeometry(hullGeometry) : null), [hullGeometry]);

  useFrame(() => {
    const opacity = opacityRef.current[index] ?? 0;
    if (materialRef.current) materialRef.current.opacity = opacity;
    if (wireMaterialRef.current) wireMaterialRef.current.opacity = opacity;
    if (superstructureMaterialRef.current) superstructureMaterialRef.current.opacity = opacity;
  });

  if (!fleetClass || !hullGeometry || !superGeometry || !edges) return null;

  return (
    <group>
      <mesh geometry={hullGeometry}>
        <meshBasicMaterial ref={materialRef} color={HULL_COLOR} transparent opacity={0} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial ref={wireMaterialRef} color={WIREFRAME_COLOR} transparent opacity={0} />
      </lineSegments>
      <mesh geometry={superGeometry} position={[0, 0.6, 0]}>
        <meshBasicMaterial ref={superstructureMaterialRef} color={HULL_COLOR} transparent opacity={0} />
      </mesh>
    </group>
  );
}

function Rig({ progressRef }: { progressRef: React.RefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  // useRef(FLEET_CLASSES.map(() => 0)) langsung mengevaluasi map() itu di
  // SETIAP render meski hasilnya cuma dipakai sekali sebagai nilai awal
  // (argumen useRef bukan lazy initializer seperti useState). Array awal
  // dihitung lewat useMemo (deps kosong, jadi hanya sekali) supaya useRef
  // menerima referensi yang sudah stabil. Sesudah render pertama, isinya
  // ditulis ulang langsung lewat opacityRef.current di useFrame di bawah
  // (loop 60fps R3F, di luar siklus render React), bukan dibaca sebagai
  // turunan reaktif dari render -- makanya bukan opacityRef itu sendiri
  // yang di-useMemo-kan.
  const initialOpacity = useMemo(() => FLEET_CLASSES.map(() => 0), []);
  const opacityRef = useRef<number[]>(initialOpacity);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }

    const progress = progressRef.current ?? 0;
    const position = progress * (FLEET_CLASSES.length - 1);
    const activeIndex = Math.min(Math.floor(position), FLEET_CLASSES.length - 1);
    const localProgress = position - activeIndex;

    opacityRef.current = FLEET_CLASSES.map((_, index) => {
      if (index === activeIndex) return 1 - localProgress;
      if (index === activeIndex + 1) return localProgress;
      return 0;
    });
  });

  return (
    <group ref={groupRef}>
      {FLEET_CLASSES.map((fleetClass, index) => (
        <ClassMesh key={fleetClass.slug} index={index} opacityRef={opacityRef} />
      ))}
    </group>
  );
}

export function FleetCanvas({ progressRef }: { progressRef: React.RefObject<number> }) {
  return (
    <Canvas camera={{ position: [4, 2, 4], fov: 45 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 2]} intensity={0.8} />
      <Rig progressRef={progressRef} />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </Canvas>
  );
}
