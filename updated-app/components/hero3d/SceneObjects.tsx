"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Site palette, mirrored from globals.css, plus island-only materials that
// don't exist as CSS tokens.
const COLOR = {
  ink: "#1d1a15",
  inkSoft: "#5c5548",
  accent: "#b34a1c",
  navy: "#1f3a5f",
  wood: "#8a6239",
  woodDark: "#6b4a2f",
  woodLight: "#a9835a",
  rope: "#c9a86a",
  metal: "#7c7c78",
  // lighthouse
  lighthouse: "#f2ede0",
  lighthouseRed: "#b3402c",
  lanternGlass: "#dff3f0",
  beam: "#ffe9a8",
  // temple
  stone: "#b8ab93",
  stoneDark: "#93876f",
  // treasure chest
  gold: "#dfb23c",
  gem: "#3c6ddf",
  gemRed: "#a3352c",
  // cave rock (also used for the lighthouse's base rock)
  caveRock: "#8f8579",
  caveRockDark: "#5f574c",
  // tools
  stumpWood: "#9a6b3f",
  stumpRing: "#7a4f2c",
  toolHandle: "#a9835a",
  // rocket
  rocketBody: "#f2ede0",
  // phone booth
  boothRed: "#a3352c",
  boothRedDark: "#7c261f",
  boothGlass: "#dff3f0",
};

type ObjectProps = { hovered: boolean; reduceMotion: boolean };

/** About — a lighthouse with a continuously sweeping light beam. */
export function LighthouseObject({ hovered, reduceMotion }: ObjectProps) {
  const group = useRef<THREE.Group>(null);
  const beam = useRef<THREE.Group>(null);
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (beam.current && !reduceMotion) {
      beam.current.rotation.y += delta * (hovered ? 1.4 : 0.7);
    }
    if (group.current) {
      const amp = reduceMotion ? 0.1 : hovered ? 1.4 : 1;
      group.current.position.y = 0.02 * Math.sin(t * 1.1 + phase.current) * amp;
      const targetScale = hovered ? 1.06 : 1;
      group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 6);
    }
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.22, 0.3, 0.7, 8]} />
        <meshStandardMaterial color={COLOR.lighthouse} flatShading roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 0.3, 8]} />
        <meshStandardMaterial color={COLOR.lighthouse} flatShading roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.305, 0.32, 0.14, 8]} />
        <meshStandardMaterial color={COLOR.lighthouseRed} flatShading />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.255, 0.27, 0.14, 8]} />
        <meshStandardMaterial color={COLOR.lighthouseRed} flatShading />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.22, 8]} />
        <meshStandardMaterial
          color={COLOR.lanternGlass}
          flatShading
          emissive={COLOR.lanternGlass}
          emissiveIntensity={hovered ? 0.6 : 0.3}
        />
      </mesh>
      <mesh position={[0, 1.22, 0]}>
        <coneGeometry args={[0.2, 0.22, 8]} />
        <meshStandardMaterial color={COLOR.lighthouseRed} flatShading />
      </mesh>
      <group ref={beam} position={[0, 1.05, 0]}>
        <mesh position={[0.55, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.16, 1.0, 3, 1, true]} />
          <meshStandardMaterial
            color={COLOR.beam}
            flatShading
            emissive={COLOR.beam}
            emissiveIntensity={0.8}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
      <mesh position={[0.24, 0.02, 0.18]} rotation={[0.2, 0.5, 0.1]}>
        <dodecahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial color={COLOR.caveRock} flatShading roughness={0.9} />
      </mesh>
    </group>
  );
}

/** Education — an old stone temple, weathered and mostly still. */
export function TempleObject({ hovered, reduceMotion }: ObjectProps) {
  const group = useRef<THREE.Group>(null);
  const phase = useRef(Math.random() * Math.PI * 2);
  const columnOffsets: [number, number][] = [
    [-0.32, -0.18],
    [0.32, -0.18],
    [-0.32, 0.18],
    [0.32, 0.18],
  ];

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (!group.current) return;
    const amp = reduceMotion ? 0.06 : hovered ? 1.3 : 1;
    group.current.position.y = 0.012 * Math.sin(t * 0.9 + phase.current) * amp;
    const targetScale = hovered ? 1.06 : 1;
    group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 6);
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.05, 0.1, 0.75]} />
        <meshStandardMaterial color={COLOR.stone} flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <boxGeometry args={[0.85, 0.08, 0.58]} />
        <meshStandardMaterial color={COLOR.stoneDark} flatShading roughness={0.9} />
      </mesh>
      {columnOffsets.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.36, z]}>
          <cylinderGeometry args={[0.045, 0.05, 0.42, 8]} />
          <meshStandardMaterial color={COLOR.stone} flatShading roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.78, 0.06, 0.5]} />
        <meshStandardMaterial color={COLOR.stoneDark} flatShading />
      </mesh>
      <mesh position={[0, 0.68, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.45, 0.16, 4]} />
        <meshStandardMaterial color={COLOR.stone} flatShading />
      </mesh>
      <mesh position={[0.55, 0.05, 0.35]} rotation={[0, 0.4, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.045, 0.32, 8]} />
        <meshStandardMaterial color={COLOR.stoneDark} flatShading />
      </mesh>
    </group>
  );
}

/** Experience — a domed treasure chest, lid thrown open, loot spilling out. */
export function TreasureChestObject({ hovered, reduceMotion }: ObjectProps) {
  const group = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const phase = useRef(Math.random() * Math.PI * 2);

  // Loot heaped just above the rim (box top is y=0.32). Anything lower than
  // that is swallowed by the solid body mesh — the old set sat at y=0.28-0.31
  // and half the pile was simply buried inside the wood.
  const coinPositions: [number, number, number][] = [
    [-0.12, 0.335, 0.06],
    [0.06, 0.35, 0.1],
    [0.15, 0.335, -0.02],
    [-0.03, 0.36, 0.0],
    [0.1, 0.34, -0.09],
    [-0.14, 0.345, -0.07],
  ];

  const gemPositions: [number, number, number, string][] = [
    [-0.05, 0.375, 0.04, COLOR.gem],
    [0.12, 0.365, 0.07, COLOR.gemRed],
  ];

  const cornerPositions: [number, number][] = [
    [-0.25, -0.16],
    [0.25, -0.16],
    [-0.25, 0.16],
    [0.25, 0.16],
  ];

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const amp = reduceMotion ? 0.1 : hovered ? 1.6 : 1;
    if (group.current) {
      group.current.position.y = 0.025 * Math.sin(t * 1.2 + phase.current) * amp;
      const targetScale = hovered ? 1.07 : 1;
      group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 6);
    }
    if (lid.current) {
      // ~35-45°. Enough to read as thrown open, shallow enough that the
      // lid's hinge edge and the box's back rim stay visibly together.
      const base = hovered ? 0.78 : 0.62;
      lid.current.rotation.x = -(base + Math.sin(t * 1.4 + phase.current) * 0.04 * amp);
    }
  });

  return (
    <group ref={group}>
      {/* footed base skirt, slightly wider than the body for a grounded silhouette */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.6, 0.05, 0.42]} />
        <meshStandardMaterial color={COLOR.woodDark} flatShading roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.55, 0.32, 0.36]} />
        <meshStandardMaterial color={COLOR.wood} flatShading roughness={0.7} />
      </mesh>
      {/* dark inset just below the rim — reads as the hollow interior seen
          through the opening, so the loot looks like it's sitting *in* the
          chest rather than resting on a solid wooden block */}
      <mesh position={[0, 0.315, 0]}>
        <boxGeometry args={[0.47, 0.015, 0.28]} />
        <meshStandardMaterial color={COLOR.caveRockDark} flatShading roughness={0.9} />
      </mesh>
      <mesh position={[-0.18, 0.16, 0]}>
        <boxGeometry args={[0.04, 0.34, 0.38]} />
        <meshStandardMaterial color={COLOR.metal} flatShading />
      </mesh>
      <mesh position={[0.18, 0.16, 0]}>
        <boxGeometry args={[0.04, 0.34, 0.38]} />
        <meshStandardMaterial color={COLOR.metal} flatShading />
      </mesh>
      {/* brass corner caps */}
      {cornerPositions.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.3, z]}>
          <boxGeometry args={[0.045, 0.045, 0.045]} />
          <meshStandardMaterial color={COLOR.gold} flatShading roughness={0.4} />
        </mesh>
      ))}
      {/* hasp lock plate + ring */}
      <mesh position={[0, 0.2, 0.19]}>
        <boxGeometry args={[0.08, 0.1, 0.04]} />
        <meshStandardMaterial color={COLOR.gold} flatShading emissive={COLOR.gold} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.15, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.025, 0.008, 5, 10]} />
        <meshStandardMaterial color={COLOR.gold} flatShading />
      </mesh>
      {/* Lid, hinged at the box's back-top edge (y=0.32, z=-0.185).
          The dome alone used to be the whole lid, but a theta-clipped
          sphere is a hollow shell with no bottom cap — swung open and
          seen from the front it showed only a thin curved band of
          backface-culled geometry, reading as a wooden arc hovering
          in mid-air rather than a lid. The flat plank below it closes
          that underside and gives the lid real body. */}
      <group position={[0, 0.32, -0.185]}>
        <group ref={lid}>
          {/* solid underside plank — spans the box footprint exactly */}
          <mesh position={[0, 0.025, 0.185]}>
            <boxGeometry args={[0.57, 0.05, 0.37]} />
            <meshStandardMaterial color={COLOR.woodDark} flatShading roughness={0.75} />
          </mesh>
          {/* domed top, seated on the plank */}
          <mesh position={[0, 0.05, 0.185]} scale={[0.285, 0.11, 0.185]}>
            <sphereGeometry args={[1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={COLOR.wood} flatShading roughness={0.7} />
          </mesh>
          {/* lip trim along the lid's front edge */}
          <mesh position={[0, 0.025, 0.365]}>
            <boxGeometry args={[0.57, 0.055, 0.02]} />
            <meshStandardMaterial color={COLOR.metal} flatShading />
          </mesh>
        </group>
      </group>
      {coinPositions.map((p, i) => (
        <mesh key={i} position={p} rotation={[i, i * 0.7, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.015, 8]} />
          <meshStandardMaterial
            color={COLOR.gold}
            flatShading
            emissive={COLOR.gold}
            emissiveIntensity={hovered ? 0.9 : 0.5}
          />
        </mesh>
      ))}
      {gemPositions.map(([x, y, z, color], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[i, i * 0.9, 0]}>
          <octahedronGeometry args={[0.04, 0]} />
          <meshStandardMaterial color={color} flatShading emissive={color} emissiveIntensity={hovered ? 0.8 : 0.4} />
        </mesh>
      ))}
    </group>
  );
}

/** Projects — a rocket on a launch pad, slowly spinning with a flickering flame. */
export function LaunchPadObject({ hovered, reduceMotion }: ObjectProps) {
  const group = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Mesh>(null);
  const phase = useRef(Math.random() * Math.PI * 2);

  const finAngles = [0, 120, 240];

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const amp = reduceMotion ? 0.1 : hovered ? 1.7 : 1;
    if (group.current) {
      group.current.position.y = 0.02 * Math.sin(t * 1.2 + phase.current) * amp;
      group.current.rotation.y += delta * 0.2 * (reduceMotion ? 0.2 : hovered ? 2 : 1);
      const targetScale = hovered ? 1.07 : 1;
      group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 6);
    }
    if (flame.current) {
      const flicker = 0.6 + Math.abs(Math.sin(t * 11 + phase.current)) * 0.4 * amp;
      flame.current.scale.set(1, flicker * (hovered ? 1.5 : 1), 1);
      const mat = flame.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = hovered ? 1.6 : 0.9;
    }
  });

  return (
    <group ref={group}>
      {/* launch pad */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.24, 0.28, 0.06, 8]} />
        <meshStandardMaterial color={COLOR.metal} flatShading roughness={0.6} />
      </mesh>
      {/* gantry towers */}
      <mesh position={[0.22, 0.3, 0]}>
        <boxGeometry args={[0.035, 0.5, 0.035]} />
        <meshStandardMaterial color={COLOR.metal} flatShading />
      </mesh>
      <mesh position={[-0.22, 0.3, 0]}>
        <boxGeometry args={[0.035, 0.5, 0.035]} />
        <meshStandardMaterial color={COLOR.metal} flatShading />
      </mesh>
      <mesh position={[0.22, 0.5, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.03, 0.16, 0.03]} />
        <meshStandardMaterial color={COLOR.metal} flatShading />
      </mesh>
      <mesh position={[-0.22, 0.5, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.03, 0.16, 0.03]} />
        <meshStandardMaterial color={COLOR.metal} flatShading />
      </mesh>

      {/* nose cone */}
      <mesh position={[0, 0.82, 0]}>
        <coneGeometry args={[0.15, 0.32, 7]} />
        <meshStandardMaterial color={COLOR.rocketBody} flatShading roughness={0.5} />
      </mesh>
      {/* body */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.44, 7]} />
        <meshStandardMaterial color={COLOR.rocketBody} flatShading roughness={0.5} />
      </mesh>
      {/* stripe */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.158, 0.158, 0.08, 7]} />
        <meshStandardMaterial color={COLOR.accent} flatShading />
      </mesh>
      {/* porthole */}
      <mesh position={[0, 0.66, 0.145]}>
        <circleGeometry args={[0.04, 10]} />
        <meshStandardMaterial color={COLOR.lanternGlass} flatShading emissive={COLOR.lanternGlass} emissiveIntensity={0.3} />
      </mesh>
      {/* fins */}
      {finAngles.map((deg) => (
        <mesh
          key={deg}
          position={[Math.sin((deg * Math.PI) / 180) * 0.14, 0.32, Math.cos((deg * Math.PI) / 180) * 0.14]}
          rotation={[0, (-deg * Math.PI) / 180, 0]}
        >
          <coneGeometry args={[0.08, 0.2, 3]} />
          <meshStandardMaterial color={COLOR.navy} flatShading />
        </mesh>
      ))}
      {/* flame */}
      <mesh ref={flame} position={[0, 0.24, 0]}>
        <coneGeometry args={[0.08, 0.24, 6]} />
        <meshStandardMaterial color={COLOR.accent} emissive={COLOR.accent} emissiveIntensity={0.9} flatShading />
      </mesh>
    </group>
  );
}

/** Skills — a tree stump with a hammer, wrench, and saw. */
export function ToolsObject({ hovered, reduceMotion }: ObjectProps) {
  const group = useRef<THREE.Group>(null);
  const hammer = useRef<THREE.Group>(null);
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const amp = reduceMotion ? 0.1 : hovered ? 1.6 : 1;
    if (group.current) {
      group.current.position.y = 0.02 * Math.sin(t * 1.3 + phase.current) * amp;
      const targetScale = hovered ? 1.08 : 1;
      group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 6);
    }
    if (hammer.current) {
      hammer.current.rotation.z = 0.15 + Math.sin(t * 3 + phase.current) * 0.08 * amp;
    }
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.26, 0.3, 0.26, 10]} />
        <meshStandardMaterial color={COLOR.stumpWood} flatShading roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.01, 10]} />
        <meshStandardMaterial color={COLOR.stumpRing} flatShading />
      </mesh>
      <group ref={hammer} position={[0.05, 0.26, 0]} rotation={[0, 0, 0.15]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
          <meshStandardMaterial color={COLOR.toolHandle} flatShading />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.14, 0.07, 0.07]} />
          <meshStandardMaterial color={COLOR.metal} flatShading />
        </mesh>
      </group>
      <group position={[-0.22, 0.24, 0.12]} rotation={[0, 0, -0.5]}>
        <mesh>
          <cylinderGeometry args={[0.018, 0.018, 0.34, 6]} />
          <meshStandardMaterial color={COLOR.metal} flatShading />
        </mesh>
        <mesh position={[0, 0.19, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.045, 0.018, 5, 10, Math.PI]} />
          <meshStandardMaterial color={COLOR.metal} flatShading />
        </mesh>
      </group>
      <mesh position={[0.24, 0.28, -0.1]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.3, 0.09, 0.01]} />
        <meshStandardMaterial color={COLOR.metal} flatShading />
      </mesh>
      <mesh position={[0.36, 0.24, -0.1]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.09, 0.03, 0.03]} />
        <meshStandardMaterial color={COLOR.toolHandle} flatShading />
      </mesh>
    </group>
  );
}

/** Hobbies — a basketball hoop, ball mid-dribble beneath the net. */
export function BasketballHoopObject({ hovered, reduceMotion }: ObjectProps) {
  const group = useRef<THREE.Group>(null);
  const ball = useRef<THREE.Group>(null);
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const amp = reduceMotion ? 0.1 : hovered ? 1.6 : 1;
    if (group.current) {
      group.current.position.y = 0.015 * Math.sin(t * 1.1 + phase.current) * amp;
      const targetScale = hovered ? 1.07 : 1;
      group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 6);
    }
    if (ball.current) {
      // Dribble: an abs-sine gives the sharp bounce/settle rhythm of a real
      // ball, rather than a smooth pendulum sway.
      const speed = reduceMotion ? 0.6 : hovered ? 3.4 : 2;
      const bounce = Math.abs(Math.sin(t * speed + phase.current));
      ball.current.position.y = 0.07 + bounce * 0.14 * amp;
      ball.current.rotation.y += delta * 1.5 * (hovered ? 2 : 1);
    }
  });

  return (
    <group ref={group}>
      {/* weighted base */}
      <mesh position={[0, 0.02, -0.16]}>
        <cylinderGeometry args={[0.1, 0.12, 0.05, 10]} />
        <meshStandardMaterial color={COLOR.metal} flatShading roughness={0.6} />
      </mesh>
      {/* pole */}
      <mesh position={[0, 0.26, -0.16]}>
        <cylinderGeometry args={[0.022, 0.028, 0.5, 8]} />
        <meshStandardMaterial color={COLOR.metal} flatShading roughness={0.55} />
      </mesh>
      {/* angled arm to backboard */}
      <mesh position={[0, 0.48, -0.09]} rotation={[0.95, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.16, 6]} />
        <meshStandardMaterial color={COLOR.metal} flatShading />
      </mesh>
      {/* backboard */}
      <mesh position={[0, 0.5, -0.02]}>
        <boxGeometry args={[0.32, 0.22, 0.02]} />
        <meshStandardMaterial color={COLOR.lighthouse} flatShading roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.47, -0.008]}>
        <boxGeometry args={[0.13, 0.09, 0.006]} />
        <meshStandardMaterial color={COLOR.accent} flatShading />
      </mesh>
      {/* rim */}
      <mesh position={[0, 0.4, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.09, 0.013, 6, 12]} />
        <meshStandardMaterial
          color={COLOR.accent}
          flatShading
          emissive={COLOR.accent}
          emissiveIntensity={hovered ? 0.5 : 0.15}
        />
      </mesh>
      {/* net — an open-ended cone hanging from the rim */}
      <mesh position={[0, 0.31, 0.08]}>
        <coneGeometry args={[0.085, 0.17, 10, 1, true]} />
        <meshStandardMaterial color={COLOR.lighthouse} flatShading transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
      {/* basketball, dribbling in front of the hoop */}
      <group ref={ball} position={[0.18, 0.07, 0.26]}>
        <mesh>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshStandardMaterial color={COLOR.accent} flatShading roughness={0.7} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.09, 0.006, 4, 12]} />
          <meshStandardMaterial color={COLOR.ink} flatShading />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.09, 0.006, 4, 12]} />
          <meshStandardMaterial color={COLOR.ink} flatShading />
        </mesh>
      </group>
    </group>
  );
}

/** Contact — a classic red phone booth, its sign glowing like it's ringing. */
export function PhoneBoothObject({ hovered, reduceMotion }: ObjectProps) {
  const group = useRef<THREE.Group>(null);
  const sign = useRef<THREE.Mesh>(null);
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const amp = reduceMotion ? 0.1 : hovered ? 1.4 : 1;
    if (group.current) {
      group.current.position.y = 0.015 * Math.sin(t * 1.0 + phase.current) * amp;
      const targetScale = hovered ? 1.07 : 1;
      group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 6);
    }
    if (sign.current) {
      const mat = sign.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = (0.5 + Math.abs(Math.sin(t * 2.4 + phase.current)) * 0.4) * (hovered ? 1.6 : 1);
    }
  });

  return (
    <group ref={group}>
      {/* plinth */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.36, 0.06, 0.36]} />
        <meshStandardMaterial color={COLOR.boothRedDark} flatShading roughness={0.6} />
      </mesh>
      {/* body */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.32, 0.5, 0.32]} />
        <meshStandardMaterial color={COLOR.boothRed} flatShading roughness={0.5} />
      </mesh>
      {/* corner posts, slightly proud of the body for a paneled look */}
      {[
        [-0.16, -0.16],
        [0.16, -0.16],
        [-0.16, 0.16],
        [0.16, 0.16],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.32, z]}>
          <boxGeometry args={[0.03, 0.5, 0.03]} />
          <meshStandardMaterial color={COLOR.boothRedDark} flatShading />
        </mesh>
      ))}
      {/* window glass, front and sides */}
      <mesh position={[0, 0.36, 0.161]}>
        <boxGeometry args={[0.24, 0.34, 0.01]} />
        <meshStandardMaterial color={COLOR.boothGlass} flatShading emissive={COLOR.boothGlass} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0.161, 0.36, 0]}>
        <boxGeometry args={[0.01, 0.34, 0.24]} />
        <meshStandardMaterial color={COLOR.boothGlass} flatShading emissive={COLOR.boothGlass} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[-0.161, 0.36, 0]}>
        <boxGeometry args={[0.01, 0.34, 0.24]} />
        <meshStandardMaterial color={COLOR.boothGlass} flatShading emissive={COLOR.boothGlass} emissiveIntensity={0.25} />
      </mesh>
      {/* window mullions on the front pane */}
      <mesh position={[0, 0.36, 0.166]}>
        <boxGeometry args={[0.24, 0.02, 0.005]} />
        <meshStandardMaterial color={COLOR.boothRedDark} flatShading />
      </mesh>
      <mesh position={[0, 0.36, 0.166]}>
        <boxGeometry args={[0.02, 0.34, 0.005]} />
        <meshStandardMaterial color={COLOR.boothRedDark} flatShading />
      </mesh>
      {/* roof */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.36, 0.05, 0.36]} />
        <meshStandardMaterial color={COLOR.boothRedDark} flatShading />
      </mesh>
      <mesh position={[0, 0.67, 0]}>
        <boxGeometry args={[0.22, 0.08, 0.22]} />
        <meshStandardMaterial color={COLOR.boothRed} flatShading />
      </mesh>
      {/* glowing "call me" sign */}
      <mesh ref={sign} position={[0, 0.48, 0.17]}>
        <boxGeometry args={[0.18, 0.05, 0.02]} />
        <meshStandardMaterial color={COLOR.boothGlass} flatShading emissive={COLOR.boothGlass} emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}
