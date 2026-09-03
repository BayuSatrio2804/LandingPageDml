"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { FLEET_MODEL_BY_SLUG } from "@/content/model-credits";
import type { FleetClass } from "@/content/types";
import { Stage } from "../three/stage";
import { fitCameraDistanceForBox } from "../three/fit-camera";
import { DECK_MATERIAL, HULL_MATERIAL, GRID_COLORS } from "../three/materials";
import { buildHullGeometry, buildHullShape, buildSuperstructureGeometry } from "./hull-geometry";
import { segmentAt, segmentOpacities } from "@/lib/motion/segments";
import { refreshScrollTriggers } from "@/lib/motion/gsap";

const FOV = 38;
/**
 * Bagian tiap iris progress yang dipakai menyeberang ke kelas berikutnya.
 * Sisanya jeda diam. Nilai 0,35 memberi kelas terakhir jeda penuh sepanjang
 * seperlima scroll terakhir, jadi Ro-Ro Ferry sudah berdiri utuh jauh sebelum
 * pin dilepas.
 */
const TRANSITION = 0.35;
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
    //
    // ContactShadows di Stage duduk tetap di y=0, jadi normalisasi Y juga yang
    // menjaga lambung tidak mengambang di atas bayangannya. Dihitung sesudah
    // rotasi karena memutar bisa mengubah batas-batasnya.
    const placed = new THREE.Box3().setFromObject(copy);
    const center = placed.getCenter(new THREE.Vector3());
    copy.position.set(-center.x, -placed.min.y, -center.z);
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
function BuiltHull({ fleetClass }: { fleetClass: FleetClass | undefined }) {
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
  fleetClass,
  index,
  opacityRef,
  sizesRef,
}: {
  fleetClass: FleetClass | undefined;
  index: number;
  opacityRef: React.RefObject<number[]>;
  sizesRef: React.RefObject<THREE.Vector3[]>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const modelUrl = fleetClass ? FLEET_MODEL_BY_SLUG[fleetClass.slug] : null;

  /**
   * Radius bola pembatas diukur dari geometri yang benar-benar ada di scene,
   * satu kali, sebelum frame pertama sempat menyembunyikan grup ini.
   *
   * Versi Plan 4 menurunkan radius kamera dari separuh panjang kelas lalu
   * menambal kekurangannya dengan margin 1,5, karena separuh panjang tidak
   * tahu apa-apa soal tinggi tiang dan deckhouse. Akibatnya kelas kecil
   * seperti tugboat, yang tiangnya lebih tinggi dari separuh panjangnya,
   * tetap terpotong, sementara kelas panjang tampil terlalu kecil. Mengukur
   * kotak yang sebenarnya membuat margin bisa turun ke angka jujur dan
   * "zoom sesuai ukuran kapal" jadi benar untuk kelima kelas.
   */
  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.updateWorldMatrix(true, true);
    const size = new THREE.Box3().setFromObject(group).getSize(new THREE.Vector3());
    if (Number.isFinite(size.x) && Number.isFinite(size.y) && size.x > 0) {
      sizesRef.current[index] = size;
    }
  }, [index, sizesRef]);

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
        <BuiltHull fleetClass={fleetClass} />
      )}
    </group>
  );
}

/**
 * Satu kotak grid selalu 10 m dunia dan tidak pernah berubah ukuran, jadi ia
 * tetap jadi patokan skala meskipun kamera mendekat mengikuti kelas yang
 * sedang tampil: kapal pendek difoto dari dekat memperbesar kotaknya juga,
 * dan panjang lambung tetap bisa dihitung dalam satuan kotak.
 *
 * Dua garis tengahnya tidak lagi berwarna aksen. Dengan kamera yang kini
 * mendekat sesuai ukuran kapal, sepasang garis oranye sepanjang 200 m
 * membentang melewati tepi kanvas dan terbaca sebagai goresan nyasar, bukan
 * sebagai sumbu.
 */
function ScaleGrid() {
  return <gridHelper args={[20, 20, GRID_COLORS.main, GRID_COLORS.sub]} position={[0, -0.02, 0]} />;
}

type OrbitTarget = { target: THREE.Vector3 };

function Rig({
  fleetClasses,
  progressRef,
  onActiveIndexChange,
}: {
  fleetClasses: FleetClass[];
  progressRef: React.RefObject<number>;
  onActiveIndexChange: (index: number) => void;
}) {
  const initialOpacity = useMemo(() => fleetClasses.map(() => 0), [fleetClasses]);
  const opacityRef = useRef<number[]>(initialOpacity);
  // Cadangan sebelum pengukuran selesai: dimensi dari data kelas, dalam satuan
  // dunia yang sama dengan hull-geometry.ts (meter dibagi sepuluh).
  //
  // useMemo, bukan argumen useRef langsung: argumen useRef dievaluasi setiap
  // render walau hasilnya dibuang setelah render pertama, jadi bentuk lama
  // mengkonstruksi satu Vector3 per kelas armada di setiap render.
  const initialSizes = useMemo(
    () =>
      fleetClasses.map(
        (entry) =>
          new THREE.Vector3(entry.lengthMeters / 10, entry.beamMeters / 25, entry.beamMeters / 10),
      ),
    [fleetClasses],
  );
  const sizesRef = useRef<THREE.Vector3[]>(initialSizes);
  const lastIndexRef = useRef(-1);
  const groupRef = useRef<THREE.Group>(null);
  const offset = useMemo(() => new THREE.Vector3(), []);
  const framed = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const { camera } = state;
    // Dibaca dari state useFrame, bukan lewat useThree di badan komponen.
    // OrbitControls memang untuk dimutasi tiap frame, sedangkan nilai yang
    // dikembalikan sebuah hook tidak boleh ditulisi (react-hooks/immutability),
    // dan aturan itu benar untuk kasus umumnya.
    const controls = state.controls as OrbitTarget | null;
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.12;

    const segment = segmentAt(progressRef.current ?? 0, fleetClasses.length, TRANSITION);
    opacityRef.current = segmentOpacities(segment, fleetClasses.length);

    /**
     * Ukuran ikut di-lerp lintas pasangan kelas, bukan meloncat di batas
     * indeks. Versi Plan 4 menghitung jarak dari indeks bulat saja, jadi
     * targetnya berpindah seketika di tengah crossfade dan kamera mengejarnya
     * dengan lerp: itu yang terlihat sebagai sentakan zoom tiap ganti kelas.
     */
    const sizes = sizesRef.current;
    const near = sizes[segment.index];
    const far = sizes[segment.index + 1] ?? near;
    if (!near || !far) return;
    framed.copy(near).lerp(far, segment.blend);

    const aspect = state.size.height > 0 ? state.size.width / state.size.height : 1;
    const distance = fitCameraDistanceForBox(framed, FOV, aspect, 1.18);
    if (distance <= 0) return;

    /**
     * Hanya JARAK dan tinggi titik bidik yang dikendalikan di sini; sudut
     * orbit tetap milik OrbitControls. Menulis camera.position penuh seperti
     * versi sebelumnya berarti setiap kali pengguna memutar kapal dengan
     * tangan, frame berikutnya menariknya kembali ke sudut tetap.
     */
    const target = controls?.target;
    const ease = Math.min(1, delta * 2.4);
    const centerY = framed.y * 0.5;

    if (target) {
      target.y = THREE.MathUtils.lerp(target.y, centerY, ease);
      offset.copy(camera.position).sub(target);
      const nextLength = THREE.MathUtils.lerp(offset.length(), distance, ease);
      camera.position.copy(target).add(offset.setLength(nextLength));
    } else {
      offset.copy(camera.position);
      const nextLength = THREE.MathUtils.lerp(offset.length(), distance, ease);
      camera.position.copy(offset.setLength(nextLength));
      camera.lookAt(0, centerY, 0);
    }

    if (segment.index !== lastIndexRef.current) {
      lastIndexRef.current = segment.index;
      onActiveIndexChange(segment.index);
    }
  });

  return (
    <group ref={groupRef}>
      {fleetClasses.map((fleetClass, index) => (
        <ClassGroup
          key={fleetClass.slug}
          fleetClass={fleetClass}
          index={index}
          opacityRef={opacityRef}
          sizesRef={sizesRef}
        />
      ))}
    </group>
  );
}

export function FleetCanvas({
  fleetClasses,
  progressRef,
  onActiveIndexChange,
  active,
}: {
  fleetClasses: FleetClass[];
  progressRef: React.RefObject<number>;
  onActiveIndexChange: (index: number) => void;
  /** Panggung sedang di dekat viewport. Di luar itu render loop dimatikan. */
  active: boolean;
}) {
  return (
    <Canvas
      camera={{ position: [8, 4, 8], fov: FOV }}
      dpr={[1, 1.5]}
      frameloop={active ? "always" : "never"}
      onCreated={refreshScrollTriggers}
    >
      <Stage />
      <ScaleGrid />
      <Rig fleetClasses={fleetClasses} progressRef={progressRef} onActiveIndexChange={onActiveIndexChange} />
      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        minPolarAngle={Math.PI * 0.16}
        maxPolarAngle={Math.PI * 0.49}
      />
    </Canvas>
  );
}

for (const url of Object.values(FLEET_MODEL_BY_SLUG)) {
  if (url) useGLTF.preload(url, DRACO_PATH);
}
