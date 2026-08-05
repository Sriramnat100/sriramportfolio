"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import {
  LighthouseObject,
  TempleObject,
  TreasureChestObject,
  LaunchPadObject,
  ToolsObject,
  BasketballHoopObject,
  PhoneBoothObject,
} from "./SceneObjects";
import { Water, PalmTree, Rocks, Dolphin, FishSchool, Turtle } from "./Environment";

const COLOR = {
  paper: "#f6f1e7",
  sand: "#e8d7ab",
  sandDark: "#cdb37c",
  grass: "#7fa36a",
  grassDark: "#66884f",
  line: "#d8cfbc",
  accent: "#b34a1c",
};

// Footprint of one mini-island's sand base — used both for the geometry and
// for spacing math (label/island collision checks) below.
const MINI_ISLAND_RADIUS = 1.0;

type ObjectProps = { hovered: boolean; reduceMotion: boolean };

type LandmarkDef = {
  id: string;
  label: string;
  targetId: string;
  ariaLabel: string;
  Object: ComponentType<ObjectProps>;
};

// Seven separate islands, not one shared landmass — an archipelago you hop
// between rather than a crowded single platform. Order matters: it's
// index-matched against WIDE_POSITIONS/NARROW_POSITIONS below, where the
// first 4 entries land in the back row and the last 3 in the front row (the
// one closer to the camera/viewer) — so the most important sections
// (Experience, Projects, Skills) are listed last, putting them up front.
const LANDMARKS: LandmarkDef[] = [
  { id: "about", label: "About", targetId: "about", ariaLabel: "About me — the lighthouse", Object: LighthouseObject },
  {
    id: "education",
    label: "Education",
    targetId: "education",
    ariaLabel: "Education — the old temple",
    Object: TempleObject,
  },
  {
    id: "hobbies",
    label: "Hobbies",
    targetId: "hobbies",
    ariaLabel: "Hobbies — the basketball hoop",
    Object: BasketballHoopObject,
  },
  {
    id: "contact",
    label: "Contact",
    targetId: "contact",
    ariaLabel: "Get in touch — the phone booth",
    Object: PhoneBoothObject,
  },
  {
    id: "experience",
    label: "Experience",
    targetId: "experience",
    ariaLabel: "Experience — the treasure chest",
    Object: TreasureChestObject,
  },
  {
    id: "projects",
    label: "Projects",
    targetId: "projects",
    ariaLabel: "Projects — the launch pad",
    Object: LaunchPadObject,
  },
  { id: "skills", label: "Skills", targetId: "skills", ariaLabel: "Skills and tools", Object: ToolsObject },
];

// [x, z] per island, same order as LANDMARKS above — a back row of 4 and a
// front row of 3, spaced well beyond MINI_ISLAND_RADIUS * landmarkScale so
// islands never touch. Widened further than the visual minimum as extra
// insurance for hit-testing (see the hit-cylinder note below) — adjacent
// islands, especially across the front/back rows, were close enough that a
// nearer island's hit area could intercept a ray meant for one behind it.
const WIDE_POSITIONS: [number, number][] = [
  [-5.25, -1.9],
  [-1.75, -1.9],
  [1.75, -1.9],
  [5.25, -1.9],
  [-3.5, 1.8],
  [0, 1.8],
  [3.5, 1.8],
];

// Narrow/portrait needs a tighter horizontal spread — vertical FOV (and so
// the z-extent budget) doesn't change with aspect ratio, but horizontal FOV
// shrinks a lot, so this uses two tight columns instead of wide rows.
// Rows are staggered left/right rather than lined up in strict columns —
// with the camera looking down at an angle, perfectly stacked columns cause
// a far island to visually sit "behind" a near one in the same spot.
const NARROW_POSITIONS: [number, number][] = [
  [-1.7, -4.2],
  [1.6, -4.2],
  [-1.0, -1.5],
  [2.0, -1.5],
  [-2.0, 1.5],
  [1.0, 1.5],
  [-0.2, 4.2],
];

// Pulled in from the previous radius (~8.2) — trees that far out were
// sitting right at (or past) the edge of the camera frustum, so only
// fragments of them were ever visible, reading as "disconnected" pieces.
const PALM_RING: { position: [number, number, number]; scale: number; rotationY: number }[] = [
  { position: [0, -0.08, -6.6], scale: 1.4, rotationY: 0.3 },
  { position: [4.6, -0.08, -4.6], scale: 1.2, rotationY: -0.6 },
  { position: [6.4, -0.08, 0], scale: 1.3, rotationY: 1.2 },
  { position: [4.6, -0.08, 4.6], scale: 1.15, rotationY: -1.5 },
  { position: [0, -0.08, 6.6], scale: 1.2, rotationY: 0.9 },
  { position: [-4.6, -0.08, 4.6], scale: 1.25, rotationY: 2.0 },
  { position: [-6.4, -0.08, 0], scale: 1.35, rotationY: -0.9 },
  { position: [-4.6, -0.08, -4.6], scale: 1.1, rotationY: 0.7 },
];
const ROCK_RING: [number, number, number][] = [
  [2.4, -0.08, -5.9],
  [-2.4, -0.08, -5.9],
];

function scrollToSection(id: string, reduceMotion: boolean) {
  document.getElementById(id)?.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
}

/** A small two-tone island: a sand base with a grass cap, sized for one landmark. */
function MiniIsland({ hovered }: { hovered: boolean }) {
  return (
    <>
      <mesh position={[0, -0.29, 0]}>
        <cylinderGeometry args={[MINI_ISLAND_RADIUS, MINI_ISLAND_RADIUS + 0.15, 0.14, 10]} />
        <meshStandardMaterial color={COLOR.sandDark} flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[MINI_ISLAND_RADIUS - 0.1, MINI_ISLAND_RADIUS, 0.12, 10]} />
        <meshStandardMaterial color={COLOR.sand} flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[MINI_ISLAND_RADIUS - 0.15, MINI_ISLAND_RADIUS - 0.1, 0.1, 10]} />
        <meshStandardMaterial color={COLOR.grassDark} flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[MINI_ISLAND_RADIUS - 0.24, MINI_ISLAND_RADIUS - 0.15, 0.02, 10]} />
        <meshStandardMaterial
          color={hovered ? COLOR.accent : COLOR.grass}
          flatShading
          emissive={hovered ? COLOR.accent : "#000000"}
          emissiveIntensity={hovered ? 0.25 : 0}
        />
      </mesh>
    </>
  );
}

type DioramaSceneProps = {
  reduceMotion: boolean;
  rotationRef: MutableRefObject<number>;
  pitchRef: MutableRefObject<number>;
  suppressClickRef: MutableRefObject<boolean>;
};

export default function DioramaScene({ reduceMotion, rotationRef, pitchRef, suppressClickRef }: DioramaSceneProps) {
  const { camera, size } = useThree();
  const rig = useRef<THREE.Group>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const narrow = size.width / size.height < 0.85;
  const landmarkScale = narrow ? 1.15 : 1.3;
  const VFOV_DEG = 38;

  const positions = narrow ? NARROW_POSITIONS : WIDE_POSITIONS;

  const landmarks = useMemo(
    () => LANDMARKS.map((l, i) => ({ ...l, position: [positions[i][0], 0.08, positions[i][1]] as [number, number, number] })),
    [positions]
  );

  const maxX = Math.max(...positions.map((p) => Math.abs(p[0])));
  const maxZ = Math.max(...positions.map((p) => Math.abs(p[1])));

  // Solve the distance that keeps every island inside the FOV for this
  // viewport's aspect ratio (vertical FOV is fixed, but horizontal FOV
  // shrinks a lot on narrow/portrait screens). Margin accounts for each
  // island's own visible radius, not just the object standing on it.
  const dist = useMemo(() => {
    const aspect = size.width / size.height;
    const vFovRad = (VFOV_DEG * Math.PI) / 180;
    const hFovRad = 2 * Math.atan(Math.tan(vFovRad / 2) * aspect);
    const margin = MINI_ISLAND_RADIUS * landmarkScale + 0.4;
    const distForWidth = (maxX + margin) / Math.tan(hFovRad / 2);
    const distForDepth = (maxZ + margin) / Math.tan(vFovRad / 2) + maxZ * 0.3;
    return Math.max(8, distForWidth, distForDepth);
  }, [size.width, size.height, maxX, maxZ, landmarkScale]);

  useLayoutEffect(() => {
    const y = dist * 0.42; // preserve the downward tilt angle at any distance
    camera.position.set(0, y, dist);
    camera.lookAt(0, -1.3, 0);
    if (camera instanceof THREE.PerspectiveCamera) camera.updateProjectionMatrix();
  }, [camera, dist]);

  useFrame((state) => {
    if (!rig.current) return;
    // Both horizontal spin (yaw) and vertical tilt (pitch) are fully
    // user-controlled via drag (rotationRef/pitchRef, set in Hero3D). A
    // small bounded wobble keeps it feeling alive at rest.
    const wobble = reduceMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.1) * 0.04;
    rig.current.rotation.y = rotationRef.current + wobble;
    rig.current.rotation.x = pitchRef.current;
  });

  return (
    <>
      <fog attach="fog" args={[COLOR.paper, dist * 0.6, dist * 2.1]} />
      <ambientLight intensity={0.75} color="#fff6ea" />
      <directionalLight position={[4, 6, 4]} intensity={1.15} color="#fff3e0" />
      <pointLight position={[-3, 2, -3]} intensity={0.5} color={COLOR.accent} />

      <group ref={rig} position={[0, -1.3, 0]}>
        <Water reduceMotion={reduceMotion} />

        {PALM_RING.map((palm, i) => (
          <PalmTree key={i} position={palm.position} scale={palm.scale} rotationY={palm.rotationY} />
        ))}
        {ROCK_RING.map((pos, i) => (
          <Rocks key={i} position={pos} />
        ))}

        <Dolphin radius={5.3} speed={0.2} phase={0} leapPhase={0} reduceMotion={reduceMotion} scale={1.2} />
        <Dolphin radius={5.9} speed={-0.15} phase={2.4} leapPhase={1.6} reduceMotion={reduceMotion} scale={1.15} />
        <Dolphin radius={6.5} speed={0.12} phase={4.2} leapPhase={3.1} reduceMotion={reduceMotion} scale={1.25} />

        <Turtle radius={4.9} speed={-0.08} phase={1.1} reduceMotion={reduceMotion} scale={1.2} />

        <FishSchool center={[3.4, 0, 0]} radius={0.45} speed={0.65} phase={0} color="#e2b23c" reduceMotion={reduceMotion} scale={1.2} />
        <FishSchool center={[-3.4, 0, 0]} radius={0.4} speed={-0.55} phase={2} color="#3fa9c9" reduceMotion={reduceMotion} scale={1.2} />
        <FishSchool center={[0, 0, 3.2]} radius={0.4} speed={0.5} phase={4.5} color="#d95f8c" reduceMotion={reduceMotion} scale={1.2} />
        <FishSchool center={[0, 0, -3.2]} radius={0.35} speed={-0.7} phase={1.3} color="#7fbf6a" reduceMotion={reduceMotion} scale={1.2} />

        {landmarks.map((l) => {
          const hovered = hoveredId === l.id;
          const ObjectComp = l.Object;
          return (
            <group
              key={l.id}
              position={l.position}
              scale={landmarkScale}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredId(l.id);
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredId((cur) => (cur === l.id ? null : cur));
                document.body.style.cursor = "auto";
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (suppressClickRef.current) return; // that "click" was actually a drag
                scrollToSection(l.targetId, reduceMotion);
              }}
            >
              <MiniIsland hovered={hovered} />

              {/* Invisible hit area — sized to comfortably cover each
                  object's own footprint (the geometry itself is often too
                  thin to click reliably) without reaching into a
                  neighboring island's space. The old version (radius 0.6,
                  height 1.4) was big and tall enough that, from the camera's
                  angle, a nearer island's cylinder could intercept a ray
                  meant for one behind it — read as "hovering the bottom of
                  one island selects a different one." */}
              <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.42, 0.42, 1, 8]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>

              <ContactShadows position={[0, -0.02, 0]} opacity={0.32} blur={2} scale={1.6} far={0.6} />

              <ObjectComp hovered={hovered} reduceMotion={reduceMotion} />

              <Html position={[0, -0.35, 0.5]} center>
                <button
                  type="button"
                  onClick={() => scrollToSection(l.targetId, reduceMotion)}
                  onMouseEnter={() => setHoveredId(l.id)}
                  onMouseLeave={() => setHoveredId((cur) => (cur === l.id ? null : cur))}
                  onFocus={() => setHoveredId(l.id)}
                  onBlur={() => setHoveredId((cur) => (cur === l.id ? null : cur))}
                  aria-label={l.ariaLabel}
                  className={`whitespace-nowrap border font-mono uppercase backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                    narrow ? "px-1.5 py-0.5 text-[9px] tracking-[0.1em]" : "px-2 py-0.5 text-[10px] tracking-[0.12em]"
                  } ${hovered ? "border-accent bg-accent text-paper" : "border-line bg-paper/90 text-ink"}`}
                >
                  {l.label}
                </button>
              </Html>
            </group>
          );
        })}
      </group>
    </>
  );
}
