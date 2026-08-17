import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { buildHullShape } from "./hull-geometry";
import { FLEET_CLASSES } from "@/content/fleet";

describe("buildHullShape", () => {
  it("menghasilkan THREE.Shape untuk setiap kelas armada", () => {
    for (const fleetClass of FLEET_CLASSES) {
      const shape = buildHullShape(fleetClass);
      expect(shape).toBeInstanceOf(THREE.Shape);
    }
  });

  it("bounding box shape sebanding dengan lengthMeters kelas", () => {
    const tanker = FLEET_CLASSES.find((entry) => entry.slug === "motor-tanker");
    const tug = FLEET_CLASSES.find((entry) => entry.slug === "tugboat");
    expect(tanker).toBeDefined();
    expect(tug).toBeDefined();
    if (!tanker || !tug) return;

    const tankerShape = buildHullShape(tanker);
    const tugShape = buildHullShape(tug);
    const tankerBox = new THREE.Box2().setFromPoints(tankerShape.getPoints());
    const tugBox = new THREE.Box2().setFromPoints(tugShape.getPoints());
    const tankerLength = tankerBox.max.x - tankerBox.min.x;
    const tugLength = tugBox.max.x - tugBox.min.x;
    expect(tankerLength).toBeGreaterThan(tugLength);
  });
});
