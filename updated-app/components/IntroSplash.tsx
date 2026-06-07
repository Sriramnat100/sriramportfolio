"use client";

import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

// Floating orb config: position (% of viewport), size (px), color, and a
// parallax "depth" factor — bigger = moves more with the cursor.
const ORBS = [
  { top: "12%", left: "10%", size: 720, depth: 0.9, color: "rgba(59,130,246,0.55)" },   // blue
  { top: "55%", left: "65%", size: 820, depth: 1.4, color: "rgba(34,211,238,0.45)" },   // cyan
  { top: "62%", left: "12%", size: 560, depth: 0.6, color: "rgba(99,102,241,0.50)" },   // indigo
  { top: "18%", left: "62%", size: 620, depth: 1.1, color: "rgba(56,189,248,0.42)" },   // sky
  { top: "38%", left: "38%", size: 500, depth: 1.8, color: "rgba(96,165,250,0.40)" },   // light blue
];

// Pull the r,g,b,a out of an "rgba(r,g,b,a)" string so we can build gradient stops.
function parseRgba(s: string) {
  const m = s.match(/rgba?\(([^)]+)\)/);
  const [r, g, b, a = "1"] = (m ? m[1] : "0,0,0,1").split(",").map((x) => x.trim());
  return { r: +r, g: +g, b: +b, a: +a };
}

const ORB_PARTS = ORBS.map((o) => {
  const c = parseRgba(o.color);
  return {
    leftPct: parseFloat(o.left) / 100,
    topPct: parseFloat(o.top) / 100,
    radius: o.size / 2,
    depth: o.depth,
    solid: `rgba(${c.r},${c.g},${c.b},${c.a})`,
    clear: `rgba(${c.r},${c.g},${c.b},0)`,
  };
});

// Famous constellations. Star coords are in a local 0..1 box (y points down);
// `lines` are index pairs to connect. Each is placed on screen at (cx,cy) as a
// fraction of the viewport, sized by `scale` (px), with a parallax `depth`.
type Constellation = {
  name: string;
  stars: [number, number][];
  lines: [number, number][];
  cx: number;
  cy: number;
  scale: number;
  depth: number;
};

const CONSTELLATIONS: Constellation[] = [
  {
    name: "Orion",
    stars: [[0.3, 0.12], [0.66, 0.16], [0.42, 0.5], [0.5, 0.53], [0.58, 0.56], [0.36, 0.92], [0.74, 0.9]],
    lines: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [0, 1], [5, 6]],
    cx: 0.12, cy: 0.66, scale: 140, depth: 14,
  },
  {
    name: "The Big Dipper",
    stars: [[0.08, 0.22], [0.1, 0.52], [0.36, 0.6], [0.34, 0.3], [0.56, 0.26], [0.76, 0.2], [0.96, 0.1]],
    lines: [[0, 3], [3, 2], [2, 1], [1, 0], [3, 4], [4, 5], [5, 6]],
    cx: 0.78, cy: 0.14, scale: 210, depth: 20,
  },
  {
    name: "Cassiopeia",
    stars: [[0.02, 0.3], [0.27, 0.72], [0.5, 0.28], [0.73, 0.7], [0.98, 0.22]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
    cx: 0.5, cy: 0.1, scale: 180, depth: 16,
  },
  {
    name: "Cygnus",
    stars: [[0.5, 0.05], [0.5, 0.52], [0.5, 0.98], [0.12, 0.46], [0.88, 0.4]],
    lines: [[0, 1], [1, 2], [3, 1], [1, 4]],
    cx: 0.68, cy: 0.5, scale: 150, depth: 12,
  },
  {
    name: "Leo",
    stars: [[0.3, 0.85], [0.28, 0.62], [0.3, 0.45], [0.38, 0.3], [0.5, 0.25], [0.55, 0.42], [0.62, 0.62], [0.92, 0.72]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [0, 6]],
    cx: 0.29, cy: 0.5, scale: 150, depth: 13,
  },
  {
    name: "Scorpius",
    stars: [[0.15, 0.1], [0.2, 0.22], [0.28, 0.38], [0.32, 0.55], [0.4, 0.68], [0.52, 0.78], [0.64, 0.8], [0.74, 0.72], [0.78, 0.6]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8]],
    cx: 0.18, cy: 0.85, scale: 150, depth: 15,
  },
  {
    name: "Gemini",
    stars: [[0.3, 0.1], [0.6, 0.12], [0.32, 0.4], [0.58, 0.42], [0.3, 0.7], [0.62, 0.72], [0.25, 0.9], [0.7, 0.9]],
    lines: [[0, 2], [2, 4], [4, 6], [1, 3], [3, 5], [5, 7], [0, 1], [2, 3]],
    cx: 0.1, cy: 0.33, scale: 140, depth: 12,
  },
  {
    name: "Taurus",
    stars: [[0.55, 0.55], [0.45, 0.5], [0.35, 0.42], [0.25, 0.32], [0.6, 0.45], [0.72, 0.32]],
    lines: [[3, 2], [2, 1], [1, 0], [0, 4], [4, 5]],
    cx: 0.37, cy: 0.27, scale: 150, depth: 13,
  },
  {
    name: "Ursa Minor",
    stars: [[0.9, 0.12], [0.72, 0.22], [0.54, 0.34], [0.42, 0.34], [0.5, 0.55], [0.3, 0.62], [0.22, 0.42]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]],
    cx: 0.67, cy: 0.77, scale: 170, depth: 17,
  },
  {
    name: "Lyra",
    stars: [[0.5, 0.1], [0.35, 0.35], [0.65, 0.4], [0.4, 0.7], [0.7, 0.75]],
    lines: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4]],
    cx: 0.06, cy: 0.5, scale: 110, depth: 11,
  },
  {
    name: "Aquila",
    stars: [[0.5, 0.5], [0.42, 0.4], [0.58, 0.42], [0.3, 0.3], [0.72, 0.28], [0.5, 0.78]],
    lines: [[3, 1], [1, 0], [0, 2], [2, 4], [0, 5], [1, 2]],
    cx: 0.93, cy: 0.52, scale: 120, depth: 12,
  },
  {
    name: "Boötes",
    stars: [[0.5, 0.95], [0.35, 0.65], [0.45, 0.4], [0.6, 0.2], [0.72, 0.45], [0.6, 0.62]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [2, 5]],
    cx: 0.87, cy: 0.71, scale: 150, depth: 14,
  },
  {
    name: "Sagittarius",
    stars: [[0.3, 0.3], [0.5, 0.25], [0.65, 0.4], [0.7, 0.55], [0.55, 0.6], [0.35, 0.62], [0.2, 0.5]],
    lines: [[0, 1], [1, 2], [2, 4], [4, 5], [5, 0], [2, 3], [1, 6], [6, 5]],
    cx: 0.41, cy: 0.73, scale: 150, depth: 13,
  },
  {
    name: "Crux",
    stars: [[0.5, 0.05], [0.5, 0.95], [0.18, 0.5], [0.82, 0.45]],
    lines: [[0, 1], [2, 3]],
    cx: 0.82, cy: 0.88, scale: 100, depth: 10,
  },
  {
    name: "Canis Major",
    stars: [[0.45, 0.3], [0.55, 0.45], [0.4, 0.5], [0.6, 0.7], [0.45, 0.8], [0.7, 0.55]],
    lines: [[0, 1], [1, 2], [1, 5], [5, 3], [3, 4], [2, 4]],
    cx: 0.55, cy: 0.86, scale: 140, depth: 13,
  },
  {
    name: "Pegasus",
    stars: [[0.25, 0.25], [0.72, 0.2], [0.78, 0.68], [0.3, 0.72], [0.05, 0.1], [0.0, 0.35]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [4, 5]],
    cx: 0.9, cy: 0.3, scale: 150, depth: 14,
  },
  {
    name: "Andromeda",
    stars: [[0.15, 0.3], [0.38, 0.4], [0.6, 0.5], [0.82, 0.6], [0.7, 0.78]],
    lines: [[0, 1], [1, 2], [2, 3], [2, 4]],
    cx: 0.63, cy: 0.29, scale: 160, depth: 15,
  },
  {
    name: "Perseus",
    stars: [[0.5, 0.35], [0.4, 0.2], [0.6, 0.5], [0.7, 0.7], [0.35, 0.55], [0.3, 0.75]],
    lines: [[1, 0], [0, 2], [2, 3], [0, 4], [4, 5]],
    cx: 0.22, cy: 0.14, scale: 140, depth: 13,
  },
  {
    name: "Hercules",
    stars: [[0.35, 0.4], [0.6, 0.38], [0.65, 0.62], [0.38, 0.65], [0.2, 0.25], [0.8, 0.2], [0.25, 0.85], [0.78, 0.85]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 5], [3, 6], [2, 7]],
    cx: 0.45, cy: 0.22, scale: 140, depth: 13,
  },
  {
    name: "Aquarius",
    stars: [[0.2, 0.3], [0.4, 0.35], [0.55, 0.3], [0.7, 0.4], [0.5, 0.55], [0.6, 0.7], [0.35, 0.6]],
    lines: [[0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [4, 6]],
    cx: 0.3, cy: 0.9, scale: 150, depth: 14,
  },
  {
    name: "Capricornus",
    stars: [[0.15, 0.3], [0.5, 0.2], [0.85, 0.45], [0.6, 0.7], [0.35, 0.6]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
    cx: 0.7, cy: 0.9, scale: 140, depth: 13,
  },
  {
    name: "Aries",
    stars: [[0.15, 0.6], [0.45, 0.45], [0.7, 0.35], [0.85, 0.4]],
    lines: [[0, 1], [1, 2], [2, 3]],
    cx: 0.55, cy: 0.2, scale: 120, depth: 11,
  },
  {
    name: "Pisces",
    stars: [[0.1, 0.3], [0.3, 0.35], [0.5, 0.4], [0.65, 0.5], [0.6, 0.7], [0.8, 0.75], [0.9, 0.6]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]],
    cx: 0.9, cy: 0.78, scale: 150, depth: 14,
  },
  {
    name: "Libra",
    stars: [[0.2, 0.6], [0.4, 0.35], [0.65, 0.3], [0.85, 0.55], [0.55, 0.7]],
    lines: [[0, 1], [1, 2], [2, 3], [1, 4], [2, 4]],
    cx: 0.06, cy: 0.7, scale: 120, depth: 12,
  },
  {
    name: "Virgo",
    stars: [[0.2, 0.3], [0.4, 0.45], [0.55, 0.6], [0.75, 0.55], [0.6, 0.8], [0.85, 0.3]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 5], [2, 4]],
    cx: 0.5, cy: 0.62, scale: 150, depth: 13,
  },
  {
    name: "Draco",
    stars: [[0.1, 0.8], [0.25, 0.6], [0.2, 0.4], [0.4, 0.3], [0.6, 0.35], [0.75, 0.25], [0.85, 0.45], [0.7, 0.55]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]],
    cx: 0.4, cy: 0.08, scale: 170, depth: 16,
  },
  {
    name: "Corona Borealis",
    stars: [[0.1, 0.6], [0.25, 0.4], [0.45, 0.32], [0.6, 0.35], [0.78, 0.45], [0.9, 0.65]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
    cx: 0.95, cy: 0.15, scale: 120, depth: 12,
  },
  {
    name: "Delphinus",
    stars: [[0.4, 0.3], [0.55, 0.25], [0.6, 0.45], [0.45, 0.5], [0.3, 0.65]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4]],
    cx: 0.95, cy: 0.62, scale: 100, depth: 10,
  },
  {
    name: "Triangulum",
    stars: [[0.2, 0.6], [0.8, 0.55], [0.5, 0.25]],
    lines: [[0, 1], [1, 2], [2, 0]],
    cx: 0.5, cy: 0.85, scale: 100, depth: 10,
  },
];

// Most constellation articles live at "<Name>_(constellation)". A few names are
// exceptions (e.g. the Big Dipper is an asterism, not a constellation).
const WIKI_OVERRIDES: Record<string, string> = {
  "The Big Dipper": "Big_Dipper",
};
function wikiUrl(name: string) {
  const slug =
    WIKI_OVERRIDES[name] ??
    name.replace(/^The /, "").replace(/ /g, "_") + "_(constellation)";
  return "https://en.wikipedia.org/wiki/" + encodeURI(slug);
}

export default function IntroSplash() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLAnchorElement>(null);

  // Cursor target (normalized 0..1) + pixel coords, and a smoothed value we
  // ease toward each frame so motion feels fluid, not twitchy.
  const target = useRef({ nx: 0.5, ny: 0.5, px: 0, py: 0 });
  const smooth = useRef({ nx: 0.5, ny: 0.5, px: 0, py: 0 });

  // Per-frame screen geometry for each constellation (for hit-testing clicks),
  // plus which one is currently revealed / hovered.
  const geom = useRef<{ cx: number; cy: number; minX: number; minY: number; maxX: number; maxY: number }[]>([]);
  const activeRef = useRef<number>(-1);
  const dragIndexRef = useRef<number>(-1);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      const rect = section.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // Faint, static background starfield (normalized positions → free on resize).
    const field = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.6 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
    }));

    // Drifting "star" particles that repel from the cursor (the ones you liked).
    const pCount = Math.max(70, Math.min(130, Math.floor((w * h) / 14000)));
    const parts = Array.from({ length: pCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));

    // Give each constellation a per-load home jitter + a slow wandering drift,
    // so the sky is never laid out the same way twice and is always moving.
    const placed = CONSTELLATIONS.map((c) => ({
      ...c,
      cx: c.cx + (Math.random() - 0.5) * 0.06,
      cy: c.cy + (Math.random() - 0.5) * 0.06,
      ampX: 22 + Math.random() * 34,
      ampY: 18 + Math.random() * 28,
      fx: 0.025 + Math.random() * 0.05,
      fy: 0.025 + Math.random() * 0.05,
      phx: Math.random() * Math.PI * 2,
      phy: Math.random() * Math.PI * 2,
      dragX: 0, // manual offset applied when the user drags this constellation
      dragY: 0,
    }));

    // Per-constellation, per-star twinkle phases.
    const phases = CONSTELLATIONS.map((c) => c.stars.map(() => Math.random() * Math.PI * 2));

    const hitTest = (px: number, py: number) => {
      let best = -1;
      let bestD = Infinity;
      geom.current.forEach((g, i) => {
        const pad = 24;
        if (px >= g.minX - pad && px <= g.maxX + pad && py >= g.minY - pad && py <= g.maxY + pad) {
          const d = Math.hypot(px - g.cx, py - g.cy);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
      });
      return best;
    };

    // Drag state: which constellation is grabbed, where the grab started, and
    // whether the pointer has moved enough to count as a drag (vs. a click).
    const drag = { index: -1, startX: 0, startY: 0, baseX: 0, baseY: 0, moved: false };
    dragIndexRef.current = -1;

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      target.current = {
        px,
        py,
        nx: Math.min(1, Math.max(0, px / rect.width)),
        ny: Math.min(1, Math.max(0, py / rect.height)),
      };
      if (drag.index >= 0) {
        const dx = px - drag.startX;
        const dy = py - drag.startY;
        if (Math.hypot(dx, dy) > 4) drag.moved = true;
        placed[drag.index].dragX = drag.baseX + dx;
        placed[drag.index].dragY = drag.baseY + dy;
      }
    };

    const onDown = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const i = hitTest(px, py);
      if (i >= 0) {
        drag.index = i;
        drag.startX = px;
        drag.startY = py;
        drag.baseX = placed[i].dragX;
        drag.baseY = placed[i].dragY;
        drag.moved = false;
        dragIndexRef.current = i;
      }
    };

    const onUp = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      if (drag.index >= 0 && !drag.moved) {
        // A click without dragging toggles the constellation's name label.
        activeRef.current = activeRef.current === drag.index ? -1 : drag.index;
      } else if (drag.index < 0) {
        // Clicked empty space — dismiss any label.
        if (hitTest(px, py) < 0) activeRef.current = -1;
      }
      drag.index = -1;
      dragIndexRef.current = -1;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    let raf = 0;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const render = () => {
      const t = performance.now() / 1000;
      smooth.current.nx = lerp(smooth.current.nx, target.current.nx, 0.06);
      smooth.current.ny = lerp(smooth.current.ny, target.current.ny, 0.06);
      smooth.current.px = lerp(smooth.current.px, target.current.px, 0.12);
      smooth.current.py = lerp(smooth.current.py, target.current.py, 0.12);

      const ox = (smooth.current.nx - 0.5) * 2; // -1..1
      const oy = (smooth.current.ny - 0.5) * 2;
      const mx = smooth.current.px;
      const my = smooth.current.py;

      ctx.clearRect(0, 0, w, h);

      // Orbs + spotlight — additive glow.
      ctx.globalCompositeOperation = "lighter";
      for (const o of ORB_PARTS) {
        const cx = o.leftPct * w + ox * o.depth * 40;
        const cy = o.topPct * h + oy * o.depth * 40;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, o.radius);
        g.addColorStop(0, o.solid);
        g.addColorStop(1, o.clear);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, o.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      const sr = Math.min(w, h) * 0.4;
      const sg = ctx.createRadialGradient(mx, my, 0, mx, my, sr);
      sg.addColorStop(0, "rgba(125,211,252,0.18)");
      sg.addColorStop(1, "rgba(125,211,252,0)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(mx, my, sr, 0, Math.PI * 2);
      ctx.fill();

      // Faint static starfield.
      for (const s of field) {
        const tw = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 1.5 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,222,255,${0.32 * tw})`;
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      // Drifting particles (with cursor repulsion + connecting lines).
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dxm = p.x - mx;
        const dym = p.y - my;
        const dm = Math.hypot(dxm, dym);
        if (dm < 130 && dm > 0.01) {
          const f = (130 - dm) / 130;
          p.x += (dxm / dm) * f * 1.2;
          p.y += (dym / dm) * f * 1.2;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(186,230,253,0.7)";
        ctx.fill();
      }
      for (let i = 0; i < parts.length; i++) {
        const a = parts[i];
        for (let j = i + 1; j < parts.length; j++) {
          const b = parts[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(125,211,252,${0.14 * (1 - dist / 120)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
        const dc = Math.hypot(a.x - mx, a.y - my);
        if (dc < 150) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mx, my);
          ctx.strokeStyle = `rgba(103,232,249,${0.2 * (1 - dc / 150)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Constellations (named, clickable).
      let hover = -1;
      const newGeom: typeof geom.current = [];
      placed.forEach((c, ci) => {
        // While being dragged, freeze the wander/parallax so it tracks the
        // cursor cleanly; otherwise apply the slow drift + parallax.
        const dragging = dragIndexRef.current === ci;
        const driftX = dragging ? 0 : c.ampX * Math.sin(t * c.fx + c.phx);
        const driftY = dragging ? 0 : c.ampY * Math.cos(t * c.fy + c.phy);
        const par = dragging ? 0 : 1;
        const pts = c.stars.map(([sx, sy]) => ({
          x: c.cx * w + (sx - 0.5) * c.scale + ox * c.depth * par + driftX + c.dragX,
          y: c.cy * h + (sy - 0.5) * c.scale + oy * c.depth * par + driftY + c.dragY,
        }));
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        let sumX = 0, sumY = 0;
        for (const p of pts) {
          minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
          maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
          sumX += p.x; sumY += p.y;
        }
        const cenX = sumX / pts.length;
        const cenY = sumY / pts.length;
        newGeom[ci] = { cx: cenX, cy: cenY, minX, minY, maxX, maxY };

        const pad = 24;
        if (mx >= minX - pad && mx <= maxX + pad && my >= minY - pad && my <= maxY + pad) hover = ci;
        const isHot = activeRef.current === ci || hover === ci || dragging;

        ctx.lineWidth = isHot ? 3 : 2;
        ctx.strokeStyle = isHot ? "rgba(186,230,253,0.95)" : "rgba(147,197,253,0.45)";
        ctx.shadowBlur = isHot ? 12 : 0;
        ctx.shadowColor = "rgba(125,211,252,0.9)";
        for (const [a, b] of c.lines) {
          ctx.beginPath();
          ctx.moveTo(pts[a].x, pts[a].y);
          ctx.lineTo(pts[b].x, pts[b].y);
          ctx.stroke();
        }
        pts.forEach((p, si) => {
          const tw = 0.7 + 0.3 * Math.sin(t * 2 + phases[ci][si]);
          const r = (isHot ? 5.5 : 4) * tw;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = isHot ? "rgba(224,242,254,1)" : "rgba(191,219,254,0.9)";
          ctx.fill();
        });
        ctx.shadowBlur = 0;
      });
      geom.current = newGeom;

      // Position the (clickable) Wikipedia label over the revealed constellation —
      // shown when one is clicked open OR while it's being dragged.
      const act = activeRef.current >= 0 ? activeRef.current : dragIndexRef.current;
      const labelEl = labelRef.current;
      if (labelEl) {
        if (act >= 0 && newGeom[act]) {
          const g = newGeom[act];
          labelEl.style.left = `${g.cx}px`;
          labelEl.style.top = `${g.minY - 12}px`;
          if (labelEl.dataset.idx !== String(act)) {
            const name = placed[act].name;
            labelEl.textContent = `${name}  ↗`;
            labelEl.href = wikiUrl(name);
            labelEl.dataset.idx = String(act);
          }
          labelEl.style.display = "block";
        } else if (labelEl.style.display !== "none") {
          labelEl.style.display = "none";
          labelEl.dataset.idx = "";
        }
      }

      section.style.cursor =
        dragIndexRef.current >= 0 ? "grabbing" : hover >= 0 ? "grab" : "default";

      if (tiltRef.current) {
        tiltRef.current.style.transform = `perspective(900px) rotateX(${-oy * 6}deg) rotateY(${ox * 8}deg)`;
      }

      if (!reduceMotion) raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900"
    >
      {/* All background effects (orbs, spotlight, starfield, particles, constellations) */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      {/* Name (with 3D tilt wrapper) */}
      <div ref={tiltRef} className="relative z-10 will-change-transform pointer-events-none">
        <h1 className="pointer-events-auto cursor-default px-6 text-center font-extrabold leading-none tracking-tight text-5xl sm:text-7xl lg:text-9xl bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-400 bg-clip-text text-transparent bg-[length:200%_200%] animate-intro-name transition-all duration-300 hover:bg-none hover:text-white hover:[text-shadow:0_0_28px_rgba(186,230,253,0.95),0_0_56px_rgba(56,189,248,0.65)]">
          Sriram Natarajan
        </h1>
      </div>

      {/* Clickable Wikipedia label for the revealed constellation */}
      <a
        ref={labelRef}
        target="_blank"
        rel="noopener noreferrer"
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
        style={{ display: "none", left: 0, top: 0 }}
        className="pointer-events-auto absolute z-20 hidden -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-cyan-300/50 bg-slate-900/85 px-3 py-1.5 text-sm font-semibold text-cyan-100 shadow-lg backdrop-blur transition-colors hover:border-cyan-200 hover:bg-slate-800 hover:text-white"
      />

      {/* Scroll-down cue */}
      <button
        onClick={() =>
          window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
        }
        className="group absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center text-blue-200/70 transition-colors hover:text-cyan-300 animate-intro-cue"
        aria-label="Scroll down"
      >
        <span className="mb-2 text-xs uppercase tracking-[0.3em]">Scroll</span>
        <ChevronDown className="h-6 w-6 animate-bounce" />
      </button>
    </section>
  );
}
