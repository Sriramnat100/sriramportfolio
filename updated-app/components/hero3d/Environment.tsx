"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COLOR = {
  water: "#3f97a0",
  waterDeep: "#1f6068",
  woodDark: "#6b4a2f",
  wood: "#8a6239",
  frondA: "#4f7a4a",
  frondB: "#3f6b42",
  coconut: "#4a3423",
  rock: "#a8a196",
  rockDark: "#847d73",
  dolphin: "#5c7a8a",
  dolphinBelly: "#cfe0e3",
  dolphinFin: "#44606d",
  turtleShell: "#4f7a4a",
  turtleShellDark: "#3c5f38",
  turtlePlastron: "#cdbd8a",
  turtleSkin: "#5c8a52",
};

const WATER_Y = -0.08;

// Reference "forward" axis for orienting swimming creatures toward their
// next path point — see the useFrame comments below for why these can't
// just use group.lookAt(). Every creature here is modelled nose-toward -Z.
const FORWARD_NEG_Z = new THREE.Vector3(0, 0, -1);

/** A gently undulating low-poly ocean plane surrounding the islands. */
export function Water({ size = 30, reduceMotion }: { size?: number; reduceMotion: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => new THREE.PlaneGeometry(size, size, 18, 18), [size]);
  const base = useMemo(() => Float32Array.from(geometry.attributes.position.array), [geometry]);

  useFrame((state) => {
    if (reduceMotion) return;
    const t = state.clock.elapsedTime;
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3];
      const y = base[i * 3 + 1];
      const wave = Math.sin(x * 0.22 + t * 0.7) * 0.07 + Math.sin(y * 0.28 + t * 0.5 + x * 0.15) * 0.05;
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, WATER_Y, 0]}>
      <meshStandardMaterial
        color={COLOR.water}
        emissive={COLOR.waterDeep}
        emissiveIntensity={0.15}
        flatShading
        roughness={0.35}
        metalness={0.05}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

// Trunk built from two leaning segments, each chained from the *exact* top
// of the previous one (via actual trig, not hand-typed decimal guesses —
// that's what left a visible gap between the two segments last time, even
// though each one looked individually plausible). rotation.z=θ tilts a
// cylinder's "up" direction to (-sinθ, cosθ), so a segment centered at the
// midpoint between `base` and `base + length*(-sinθ, cosθ)` exactly meets
// the previous segment's end with no seam.
const TRUNK_LEAN_1 = 0.1;
const TRUNK_LEAN_2 = 0.24;
const TRUNK_LEN_1 = 0.62;
const TRUNK_LEN_2 = 0.5;
const TRUNK_DIR_1: [number, number] = [-Math.sin(TRUNK_LEAN_1), Math.cos(TRUNK_LEAN_1)];
const TRUNK_DIR_2: [number, number] = [-Math.sin(TRUNK_LEAN_2), Math.cos(TRUNK_LEAN_2)];
const TRUNK_BASE_1: [number, number] = [0, 0];
const TRUNK_TOP_1: [number, number] = [
  TRUNK_BASE_1[0] + TRUNK_DIR_1[0] * TRUNK_LEN_1,
  TRUNK_BASE_1[1] + TRUNK_DIR_1[1] * TRUNK_LEN_1,
];
const TRUNK_CENTER_1: [number, number] = [TRUNK_TOP_1[0] / 2, TRUNK_TOP_1[1] / 2];
const TRUNK_TOP_2: [number, number] = [
  TRUNK_TOP_1[0] + TRUNK_DIR_2[0] * TRUNK_LEN_2,
  TRUNK_TOP_1[1] + TRUNK_DIR_2[1] * TRUNK_LEN_2,
];
const TRUNK_CENTER_2: [number, number] = [
  (TRUNK_TOP_1[0] + TRUNK_TOP_2[0]) / 2,
  (TRUNK_TOP_1[1] + TRUNK_TOP_2[1]) / 2,
];

/** A simple low-poly palm tree: a bent trunk and a fan of drooping fronds. */
export function PalmTree({
  position,
  scale = 1,
  rotationY = 0,
}: {
  position: [number, number, number];
  scale?: number;
  rotationY?: number;
}) {
  const frondAngles = [0, 51, 102, 153, 204, 255, 306];

  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      {/* trunk, two segments chained end-to-end (see TRUNK_* constants above) */}
      <mesh position={[TRUNK_CENTER_1[0], TRUNK_CENTER_1[1], 0]} rotation={[0, 0, TRUNK_LEAN_1]}>
        <cylinderGeometry args={[0.045, 0.06, TRUNK_LEN_1, 6]} />
        <meshStandardMaterial color={COLOR.woodDark} flatShading roughness={0.85} />
      </mesh>
      <mesh position={[TRUNK_CENTER_2[0], TRUNK_CENTER_2[1], 0]} rotation={[0, 0, TRUNK_LEAN_2]}>
        <cylinderGeometry args={[0.03, 0.045, TRUNK_LEN_2, 6]} />
        <meshStandardMaterial color={COLOR.wood} flatShading roughness={0.85} />
      </mesh>

      {/* crown — anchored exactly at the trunk's top, with a solid hub
          bridging into the fronds (which themselves radiate outward from
          well past the anchor point and would otherwise leave a hole) */}
      <group position={[TRUNK_TOP_2[0], TRUNK_TOP_2[1], 0]}>
        <mesh>
          <sphereGeometry args={[0.09, 7, 6]} />
          <meshStandardMaterial color={COLOR.wood} flatShading roughness={0.85} />
        </mesh>
        {frondAngles.map((deg, i) => (
          <group key={deg} rotation={[0, (deg * Math.PI) / 180, 0]}>
            <mesh
              position={[0.3, -0.02, 0]}
              rotation={[0, 0, 0.18]}
              scale={[0.6, 0.1, 0.17]}
            >
              <sphereGeometry args={[0.5, 6, 5]} />
              <meshStandardMaterial color={i % 2 === 0 ? COLOR.frondA : COLOR.frondB} flatShading />
            </mesh>
          </group>
        ))}
        {/* a couple of coconuts tucked under the crown */}
        <mesh position={[0.06, -0.12, 0.05]}>
          <sphereGeometry args={[0.06, 6, 5]} />
          <meshStandardMaterial color={COLOR.coconut} flatShading />
        </mesh>
        <mesh position={[-0.02, -0.13, -0.06]}>
          <sphereGeometry args={[0.055, 6, 5]} />
          <meshStandardMaterial color={COLOR.coconut} flatShading />
        </mesh>
      </group>
    </group>
  );
}

/** A small cluster of beach rocks. */
export function Rocks({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.06, 0]} rotation={[0.3, 0.4, 0.1]}>
        <dodecahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial color={COLOR.rock} flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0.16, 0.03, 0.05]} rotation={[0.1, 1.1, 0.4]}>
        <dodecahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial color={COLOR.rockDark} flatShading roughness={0.9} />
      </mesh>
    </group>
  );
}

/**
 * A dolphin that circles the islands and periodically arcs above the water —
 * its vertical path spends most of the cycle below WATER_Y, where the
 * (opaque-ish) water plane naturally occludes it, so it reads as diving and
 * resurfacing rather than just bobbing.
 */
export function Dolphin({
  radius,
  speed,
  phase,
  leapPhase,
  reduceMotion,
  scale = 1,
}: {
  radius: number;
  speed: number;
  phase: number;
  leapPhase: number;
  reduceMotion: boolean;
  scale?: number;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = reduceMotion ? 0 : state.clock.elapsedTime;
    const theta = t * speed + phase;
    const y = Math.sin(t * 1.3 + leapPhase) * 0.4 - 0.12;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    group.current.position.set(x, y, z);

    const nextTheta = theta + Math.sign(speed || 1) * 0.05;
    const nextY = Math.sin((t + 0.08) * 1.3 + leapPhase) * 0.4 - 0.12;
    const nextX = Math.cos(nextTheta) * radius;
    const nextZ = Math.sin(nextTheta) * radius;
    // group.lookAt() treats its argument as a WORLD-space point, but this
    // group sits inside a parent rig with its own position offset —
    // passing raw local coordinates let that offset leak into the look
    // direction (a phantom multi-unit vertical component next to a
    // fractional real one), pointing every dolphin almost straight up.
    // Building the rotation from a purely local direction vector avoids
    // touching world space at all.
    // The snout is at -Z and the tail fin at +Z, so -Z is this model's
    // forward. (Object3D.lookAt aims +Z at its target for non-cameras,
    // which is why the original lookAt-based version swam tail-first.)
    const dir = new THREE.Vector3(nextX - x, nextY - y, nextZ - z).normalize();
    group.current.quaternion.setFromUnitVectors(FORWARD_NEG_Z, dir);
  });

  return (
    <group ref={group} scale={scale}>
      {/* body, nose toward -Z (tail fin at +Z, snout at -Z) */}
      <mesh scale={[0.11, 0.13, 0.4]}>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshStandardMaterial color={COLOR.dolphin} flatShading roughness={0.4} />
      </mesh>
      <mesh scale={[0.085, 0.08, 0.3]} position={[0, -0.045, 0.02]}>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshStandardMaterial color={COLOR.dolphinBelly} flatShading />
      </mesh>
      <mesh position={[0, 0.13, 0.03]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.05, 0.13, 3]} />
        <meshStandardMaterial color={COLOR.dolphinFin} flatShading />
      </mesh>
      <mesh position={[0, 0, 0.22]} rotation={[0, 0, Math.PI / 2]} scale={[0.16, 0.03, 0.09]}>
        <sphereGeometry args={[0.5, 6, 4]} />
        <meshStandardMaterial color={COLOR.dolphinFin} flatShading />
      </mesh>
      <mesh position={[0, -0.02, -0.22]} scale={[0.06, 0.06, 0.12]}>
        <sphereGeometry args={[0.5, 6, 5]} />
        <meshStandardMaterial color={COLOR.dolphin} flatShading />
      </mesh>
    </group>
  );
}

/** A tiny school of fish swimming a loose loop near an island's shore. */
export function FishSchool({
  center,
  radius,
  speed,
  phase,
  color,
  reduceMotion,
  scale = 1,
}: {
  center: [number, number, number];
  radius: number;
  speed: number;
  phase: number;
  color: string;
  reduceMotion: boolean;
  scale?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const fishOffsets: [number, number, number][] = [
    [0, 0, 0],
    [0.09, 0.01, -0.07],
    [-0.08, -0.005, -0.06],
  ];

  useFrame((state) => {
    if (!group.current) return;
    const t = reduceMotion ? 0 : state.clock.elapsedTime;
    const theta = t * speed + phase;
    const x = center[0] + Math.cos(theta) * radius;
    const z = center[2] + Math.sin(theta) * radius;
    const y = WATER_Y + 0.03 + Math.sin(t * 2 + phase) * 0.015;
    group.current.position.set(x, y, z);

    const nextTheta = theta + Math.sign(speed || 1) * 0.06;
    const nx = center[0] + Math.cos(nextTheta) * radius;
    const nz = center[2] + Math.sin(nextTheta) * radius;
    // See the Dolphin component above — lookAt() misreads local
    // coordinates as world-space under this group's offset parent, so we
    // build the rotation from a local direction vector instead.
    const dir = new THREE.Vector3(nx - x, 0, nz - z).normalize();
    group.current.quaternion.setFromUnitVectors(FORWARD_NEG_Z, dir);
  });

  return (
    <group ref={group} scale={scale}>
      {fishOffsets.map((offset, i) => (
        <group key={i} position={offset}>
          <mesh scale={[0.045, 0.03, 0.09]}>
            <sphereGeometry args={[0.5, 6, 5]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
          <mesh position={[0, 0, 0.06]} rotation={[0, Math.PI / 2, 0]} scale={[0.01, 0.045, 0.05]}>
            <coneGeometry args={[0.5, 1, 3]} />
            <meshStandardMaterial color={color} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** A sea turtle, paddling a slow, wide loop near the surface. */
export function Turtle({
  radius,
  speed,
  phase,
  reduceMotion,
  scale = 1,
}: {
  radius: number;
  speed: number;
  phase: number;
  reduceMotion: boolean;
  scale?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const flipperL = useRef<THREE.Mesh>(null);
  const flipperR = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = reduceMotion ? 0 : state.clock.elapsedTime;
    const theta = t * speed + phase;
    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;
    const y = WATER_Y - 0.03 + Math.sin(t * 0.8 + phase) * 0.02;
    group.current.position.set(x, y, z);

    const nextTheta = theta + Math.sign(speed || 1) * 0.035;
    const nx = Math.cos(nextTheta) * radius;
    const nz = Math.sin(nextTheta) * radius;
    // See the Dolphin component above — lookAt() misreads local
    // coordinates as world-space under this group's offset parent, so we
    // build the rotation from a local direction vector instead.
    const dir = new THREE.Vector3(nx - x, 0, nz - z).normalize();
    group.current.quaternion.setFromUnitVectors(FORWARD_NEG_Z, dir);

    const paddle = Math.sin(t * 2.6 + phase) * 0.35;
    if (flipperL.current) flipperL.current.rotation.z = paddle;
    if (flipperR.current) flipperR.current.rotation.z = -paddle;
  });

  return (
    <group ref={group} scale={scale}>
      {/* shell */}
      <mesh scale={[0.22, 0.13, 0.26]}>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshStandardMaterial color={COLOR.turtleShell} flatShading roughness={0.7} />
      </mesh>
      <mesh scale={[0.16, 0.02, 0.19]} position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.5, 6, 5]} />
        <meshStandardMaterial color={COLOR.turtleShellDark} flatShading />
      </mesh>
      {/* plastron / belly */}
      <mesh scale={[0.19, 0.06, 0.22]} position={[0, -0.06, 0]}>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshStandardMaterial color={COLOR.turtlePlastron} flatShading />
      </mesh>
      {/* head, toward -Z (forward) */}
      <mesh position={[0, 0.01, -0.27]} scale={[0.06, 0.06, 0.09]}>
        <sphereGeometry args={[0.5, 6, 5]} />
        <meshStandardMaterial color={COLOR.turtleSkin} flatShading />
      </mesh>
      {/* flippers */}
      <mesh ref={flipperL} position={[0.24, 0, 0.06]} rotation={[0, 0, 0.2]} scale={[0.16, 0.02, 0.09]}>
        <sphereGeometry args={[0.5, 6, 4]} />
        <meshStandardMaterial color={COLOR.turtleSkin} flatShading />
      </mesh>
      <mesh ref={flipperR} position={[-0.24, 0, 0.06]} rotation={[0, 0, -0.2]} scale={[0.16, 0.02, 0.09]}>
        <sphereGeometry args={[0.5, 6, 4]} />
        <meshStandardMaterial color={COLOR.turtleSkin} flatShading />
      </mesh>
      {/* tail */}
      <mesh position={[0, 0, 0.27]} scale={[0.03, 0.03, 0.05]}>
        <sphereGeometry args={[0.5, 5, 4]} />
        <meshStandardMaterial color={COLOR.turtleSkin} flatShading />
      </mesh>
    </group>
  );
}
