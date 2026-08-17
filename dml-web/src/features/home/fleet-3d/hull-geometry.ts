import * as THREE from "three";
import type { FleetClass } from "@/content/types";

/**
 * Profil lambung disederhanakan jadi enam titik kontrol: haluan lancip,
 * bahu, badan paralel, buritan. Diskalakan dari lengthMeters dan
 * beamMeters kelas kapal, dibagi 10 supaya unit dunia three.js tetap
 * kecil (skala meter jadi dm, memudahkan kamera default tanpa near/far
 * ekstrem).
 */
export function buildHullShape(fleetClass: FleetClass): THREE.Shape {
  const length = fleetClass.lengthMeters / 10;
  const halfBeam = fleetClass.beamMeters / 20;

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(length * 0.08, halfBeam * 0.6);
  shape.lineTo(length * 0.2, halfBeam);
  shape.lineTo(length * 0.85, halfBeam);
  shape.lineTo(length, halfBeam * 0.3);
  shape.lineTo(length * 0.85, -halfBeam);
  shape.lineTo(length * 0.2, -halfBeam);
  shape.lineTo(length * 0.08, -halfBeam * 0.6);
  shape.closePath();

  return shape;
}

export function buildHullGeometry(fleetClass: FleetClass): THREE.ExtrudeGeometry {
  const shape = buildHullShape(fleetClass);
  const depth = Math.max(fleetClass.beamMeters / 40, 0.3);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, steps: 1 });
  geometry.rotateX(Math.PI / 2);
  geometry.center();
  return geometry;
}

export function buildSuperstructureGeometry(fleetClass: FleetClass): THREE.BoxGeometry {
  const length = fleetClass.lengthMeters / 10;
  const beam = fleetClass.beamMeters / 10;
  const superstructureLength = fleetClass.slug === "ro-ro-ferry" ? length * 0.6 : length * 0.15;
  const height = fleetClass.slug === "ro-ro-ferry" ? beam * 0.5 : beam * 0.35;
  return new THREE.BoxGeometry(superstructureLength, height, beam * 0.5);
}
