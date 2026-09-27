"use client";

// Site palette, mirrored from globals.css, plus the island-only sand/grass
// materials that don't exist as CSS tokens. Shared by the hero archipelago
// (DioramaScene) and the per-section display boxes (SectionDiorama).
export const ISLAND_COLOR = {
  paper: "#f6f1e7",
  sand: "#e8d7ab",
  sandDark: "#cdb37c",
  grass: "#7fa36a",
  grassDark: "#66884f",
  line: "#d8cfbc",
  accent: "#b34a1c",
};

// Footprint of one mini-island's sand base — used both for the geometry and
// for spacing math (label/island collision checks) in DioramaScene.
export const MINI_ISLAND_RADIUS = 1.0;

/** A small two-tone island: a sand base with a grass cap, sized for one landmark. */
export function MiniIsland({ hovered }: { hovered: boolean }) {
  return (
    <>
      <mesh position={[0, -0.29, 0]}>
        <cylinderGeometry args={[MINI_ISLAND_RADIUS, MINI_ISLAND_RADIUS + 0.15, 0.14, 10]} />
        <meshStandardMaterial color={ISLAND_COLOR.sandDark} flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, -0.16, 0]}>
        <cylinderGeometry args={[MINI_ISLAND_RADIUS - 0.1, MINI_ISLAND_RADIUS, 0.12, 10]} />
        <meshStandardMaterial color={ISLAND_COLOR.sand} flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[MINI_ISLAND_RADIUS - 0.15, MINI_ISLAND_RADIUS - 0.1, 0.1, 10]} />
        <meshStandardMaterial color={ISLAND_COLOR.grassDark} flatShading roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[MINI_ISLAND_RADIUS - 0.24, MINI_ISLAND_RADIUS - 0.15, 0.02, 10]} />
        <meshStandardMaterial
          color={hovered ? ISLAND_COLOR.accent : ISLAND_COLOR.grass}
          flatShading
          emissive={hovered ? ISLAND_COLOR.accent : "#000000"}
          emissiveIntensity={hovered ? 0.25 : 0}
        />
      </mesh>
    </>
  );
}
