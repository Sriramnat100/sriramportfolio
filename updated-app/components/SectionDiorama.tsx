"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentType, MutableRefObject, PointerEvent as ReactPointerEvent } from "react";
import { useFrame } from "@react-three/fiber";
import { View, PerspectiveCamera, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { MiniIsland } from "./hero3d/MiniIsland";

export type ObjectProps = { hovered: boolean; reduceMotion: boolean };

// Spins the figure like a display turntable. Idles slowly, holds still while
// hovered (so you can actually look at it), and the drag handler below adds
// to the same ref, so a flick nudges it rather than fighting the auto-spin.
function Turntable({
  rotationRef,
  hovered,
  reduceMotion,
  children,
}: {
  rotationRef: MutableRefObject<number>;
  hovered: boolean;
  reduceMotion: boolean;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!group.current) return;
    if (!reduceMotion && !hovered) rotationRef.current += delta * 0.25;
    group.current.rotation.y = rotationRef.current;
  });
  return (
    <group ref={group} position={[0, -0.3, 0]}>
      {children}
    </group>
  );
}

/**
 * One landmark from the hero island, alone on its own mini-island, rendered
 * into a box in the page. The 3D goes through the shared <DioramaCanvas>
 * (see that file); this component only owns the box's pointer handling.
 */
export default function SectionDiorama({
  Object,
  className,
}: {
  Object: ComponentType<ObjectProps>;
  className?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  // Random starting angle so the boxes down the page don't all face the
  // same way. Client-only component (dynamic, ssr:false), so no hydration
  // mismatch to worry about.
  const rotationRef = useRef(Math.random() * Math.PI * 2);
  const drag = useRef({ active: false, lastX: 0 });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = { active: true, lastX: e.clientX };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    rotationRef.current += (e.clientX - drag.current.lastX) * 0.012;
    drag.current.lastX = e.clientX;
  };
  const endDrag = () => {
    drag.current.active = false;
  };

  return (
    // Pointer handlers live on this wrapper rather than on <View> itself so
    // we don't depend on drei forwarding arbitrary DOM props.
    <div
      className={`${className ?? ""} cursor-grab active:cursor-grabbing`}
      style={{ touchAction: "pan-y" }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        endDrag();
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <View className="h-full w-full">
        {/* Each view needs its own camera — otherwise every box would be
            fighting over the shared canvas's default one. */}
        <PerspectiveCamera makeDefault position={[0, 1.75, 3.95]} rotation={[-0.36, 0, 0]} fov={34} />
        <ambientLight intensity={0.8} color="#fff6ea" />
        <directionalLight position={[3, 5, 3]} intensity={1.2} color="#fff3e0" />
        <pointLight position={[-2, 2, -2]} intensity={0.4} color="#b34a1c" />

        <Turntable rotationRef={rotationRef} hovered={hovered} reduceMotion={reduceMotion}>
          <MiniIsland hovered={hovered} />
          <ContactShadows position={[0, -0.02, 0]} opacity={0.32} blur={2} scale={1.6} far={0.6} />
          <Object hovered={hovered} reduceMotion={reduceMotion} />
        </Turntable>
      </View>
    </div>
  );
}
