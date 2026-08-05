"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Canvas } from "@react-three/fiber";
import { ChevronDown } from "lucide-react";
import DioramaScene from "./hero3d/DioramaScene";

export default function Hero3D() {
  const [reduceMotion, setReduceMotion] = useState(false);
  // Manual drag rotation (radians) — read every frame by DioramaScene, so a
  // plain ref avoids re-rendering React on every pointer move. rotationRef
  // is horizontal (yaw, unbounded — a full spin is fine); pitchRef is
  // vertical tilt, clamped so the view can't flip upside down.
  const rotationRef = useRef(0);
  const pitchRef = useRef(0);
  // Set on pointerup so a pedestal's click-to-navigate is swallowed when the
  // gesture that ended on it was actually a drag, not a tap/click.
  const suppressClickRef = useRef(false);
  const drag = useRef({ active: false, lastX: 0, lastY: 0, startX: 0, startY: 0, moved: 0 });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = { active: true, lastX: e.clientX, lastY: e.clientY, startX: e.clientX, startY: e.clientY, moved: 0 };
    // Deliberately no setPointerCapture here — capturing on this wrapper
    // redirects subsequent pointer events away from the canvas underneath,
    // which broke react-three-fiber's own click/raycast handling entirely.
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.lastX;
    const dy = e.clientY - drag.current.lastY;
    drag.current.lastX = e.clientX;
    drag.current.lastY = e.clientY;
    // Track max distance from the start point, not a running sum of
    // per-event deltas — summing inflated this well past any reasonable
    // threshold after just a few pointermove ticks, misclassifying an
    // ordinary click's natural jitter as a drag and swallowing navigation.
    const distFromStart = Math.hypot(e.clientX - drag.current.startX, e.clientY - drag.current.startY);
    drag.current.moved = Math.max(drag.current.moved, distFromStart);
    rotationRef.current += dx * 0.006;
    pitchRef.current = Math.max(-0.5, Math.min(0.5, pitchRef.current + dy * 0.003));
  };

  const endDrag = () => {
    if (!drag.current.active) return;
    suppressClickRef.current = drag.current.moved > 12;
    drag.current.active = false;
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-paper">
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 3.4, 9], fov: 38 }}
          gl={{ antialias: true }}
        >
          <DioramaScene
            reduceMotion={reduceMotion}
            rotationRef={rotationRef}
            pitchRef={pitchRef}
            suppressClickRef={suppressClickRef}
          />
        </Canvas>
      </div>

      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center px-6 pt-12 text-center sm:pt-16">
        {/* No entrance animation here on purpose — the dynamic-import
            loading fallback in page.tsx renders this exact same heading
            and plays the fade-in on it first (since Hero3D's JS chunk
            takes a moment to load). If this element replayed the
            animation on mount too, the name would flash to full opacity
            with the fallback, snap back to invisible when this real
            version mounted, then fade in a second time. Rendering
            straight into the settled end-state here makes the swap
            invisible. */}
        <h1 className="font-mono text-3xl font-medium tracking-tight text-ink sm:text-6xl">
          Hi, I&apos;m Sriram Natarajan
        </h1>
        <p className="animate-intro-cue mt-4 font-mono text-xs uppercase tracking-[0.3em] text-ink-soft sm:text-sm">
          Click something below — or drag the island to look around.
        </p>
      </div>

      <button
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
        className="group pointer-events-auto absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center text-ink transition-colors hover:text-accent animate-intro-cue"
        aria-label="Scroll down"
      >
        <span className="mb-2 font-mono text-sm font-bold uppercase tracking-[0.3em]">Scroll</span>
        <ChevronDown className="h-10 w-10 animate-bounce" strokeWidth={2.5} />
      </button>
    </section>
  );
}
