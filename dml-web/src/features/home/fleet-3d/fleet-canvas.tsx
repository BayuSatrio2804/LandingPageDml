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

  const hullGeometry = useMemo(() => (fleetClass ? buildHullGeometry(fleetClass) : null), [fleetClass]);
  const superGeometry = useMemo(() => (fleetClass ? buildSuperstructureGeometry(fleetClass) : null), [fleetClass]);

  useFrame(() => {
    const opacity = opacityRef.current[index] ?? 0;
    if (materialRef.current) materialRef.current.opacity = opacity;
    if (wireMaterialRef.current) wireMaterialRef.current.opacity = opacity;
  });

  if (!fleetClass || !hullGeometry || !superGeometry) return null;

  const edges = new THREE.EdgesGeometry(hullGeometry);

  return (
    <group>
      <mesh geometry={hullGeometry}>
        <meshBasicMaterial ref={materialRef} color={HULL_COLOR} transparent opacity={0} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial ref={wireMaterialRef} color={WIREFRAME_COLOR} transparent opacity={0} />
      </lineSegments>
      <mesh geometry={superGeometry} position={[0, 0.6, 0]}>
        <meshBasicMaterial color={HULL_COLOR} transparent opacity={0} />
      </mesh>
    </group>
  );
}

function Rig({ progressRef }: { progressRef: React.RefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const opacityRef = useRef<number[]>(FLEET_CLASSES.map(() => 0));

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
