"use client";

import { useEffect, useRef } from "react";
import { useScroll, useSpring, useTransform } from "framer-motion";
import { useCalm } from "./useCalm";

// The closing figure: a curved form made only of straight lines. Two rings,
// one above the other, joined by straight rods. While the rods run straight
// up it is a cylinder; as the page scrolls in, the top ring turns against the
// bottom one and the rods cross into a waisted tower, a hyperboloid, the
// shape of a cooling tower or a lattice mast. Two families of rods, twisted
// opposite ways, weave the lattice. The pointer turns it a little.

const VW = 540;
const VH = 900;
const CX = VW / 2;
const CY = VH / 2;
const R = 250; // ring radius
const HALF = 380; // half the height between the rings
const TILT = 0.28; // camera elevation, radians
const FOCAL = 1900; // perspective distance
const N = 54; // rods per family

const TAU = Math.PI * 2;
const TWIST_FROM = 0.06 * Math.PI;
const TWIST_TO = 0.72 * Math.PI;

type Pt = { x: number; y: number; d: number };

// World: y up, z toward the viewer. Spin about the vertical axis, then tilt.
function project(a: number, y: number, spin: number): Pt {
  const x = R * Math.cos(a + spin);
  const z = R * Math.sin(a + spin);
  const cos = Math.cos(TILT);
  const sin = Math.sin(TILT);
  const depth = z * cos + y * sin;
  const s = FOCAL / (FOCAL - depth);
  return { x: CX + x * s, y: CY - (y * cos - z * sin) * s, d: depth };
}

function rods(twist: number, spin: number) {
  const out: { x1: number; y1: number; x2: number; y2: number; o: number }[] =
    [];
  for (const dir of [1, -1]) {
    for (let i = 0; i < N; i++) {
      const a = (TAU * i) / N + (dir === -1 ? Math.PI / N : 0);
      const lo = project(a, -HALF, spin);
      const hi = project(a + dir * twist, HALF, spin);
      // Rods nearer the viewer are darker, so the lattice reads as a volume.
      const near = ((lo.d + hi.d) / 2 / R + 1) / 2;
      out.push({
        x1: lo.x,
        y1: lo.y,
        x2: hi.x,
        y2: hi.y,
        o: 0.07 + 0.5 * near ** 1.6,
      });
    }
  }
  return out;
}

function ring(y: number) {
  let d = "";
  for (let i = 0; i <= 96; i++) {
    const p = project((TAU * i) / 96, y, 0);
    d += `${i ? " L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }
  return d + " Z";
}

const TOP = ring(HALF);
const BOTTOM = ring(-HALF);
// What the server renders, and what reduced motion keeps: the finished form.
const FINAL = rods(TWIST_TO, 0);

const ease = (t: number) => 1 - (1 - t) ** 3;

export default function Lattice({ className = "" }: { className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const calm = useCalm();
  // Finished once the whole figure is on screen.
  const { scrollYProgress: p } = useScroll({
    target: box,
    offset: ["start end", "end end"],
  });
  const twist = useTransform(
    p,
    (v) =>
      TWIST_FROM + (TWIST_TO - TWIST_FROM) * ease(Math.min(1, Math.max(0, v))),
  );
  const spin = useTransform(p, (v) => 0.9 * (1 - Math.min(1, Math.max(0, v))));
  const lean = useSpring(0, { stiffness: 40, damping: 18 });

  useEffect(() => {
    const el = box.current;
    if (!el || calm) return;
    const lines = Array.from(el.querySelectorAll<SVGLineElement>("line"));
    let frame = 0;
    const draw = () => {
      frame = 0;
      rods(twist.get(), spin.get() + lean.get()).forEach((r, i) => {
        const l = lines[i];
        l.setAttribute("x1", r.x1.toFixed(1));
        l.setAttribute("y1", r.y1.toFixed(1));
        l.setAttribute("x2", r.x2.toFixed(1));
        l.setAttribute("y2", r.y2.toFixed(1));
        l.setAttribute("stroke-opacity", r.o.toFixed(3));
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const offs = [
      twist.on("change", schedule),
      spin.on("change", schedule),
      lean.on("change", schedule),
    ];
    draw();

    const fine = window.matchMedia("(pointer: fine)").matches;
    const onMove = (e: PointerEvent) =>
      lean.set((e.clientX / window.innerWidth - 0.5) * 0.7);
    if (fine) window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      offs.forEach((off) => off());
      if (fine) window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      // Leave the finished form behind if motion is turned off mid-visit.
      FINAL.forEach((r, i) => {
        const l = lines[i];
        l.setAttribute("x1", r.x1.toFixed(1));
        l.setAttribute("y1", r.y1.toFixed(1));
        l.setAttribute("x2", r.x2.toFixed(1));
        l.setAttribute("y2", r.y2.toFixed(1));
        l.setAttribute("stroke-opacity", r.o.toFixed(3));
      });
    };
  }, [calm, twist, spin, lean]);

  return (
    <div ref={box} aria-hidden="true" className={className}>
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        focusable="false"
        className="h-full w-full overflow-visible"
      >
        <path
          d={TOP}
          fill="none"
          stroke="var(--fg)"
          strokeOpacity="0.32"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={BOTTOM}
          fill="none"
          stroke="var(--fg)"
          strokeOpacity="0.32"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <g
          stroke="var(--fg)"
          strokeWidth="1"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        >
          {FINAL.map((r, i) => (
            <line
              key={i}
              x1={r.x1.toFixed(1)}
              y1={r.y1.toFixed(1)}
              x2={r.x2.toFixed(1)}
              y2={r.y2.toFixed(1)}
              strokeOpacity={r.o.toFixed(3)}
              vectorEffect="non-scaling-stroke"
              suppressHydrationWarning
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
