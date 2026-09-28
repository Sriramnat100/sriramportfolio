"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useCalm } from "./useCalm";
import { C3 } from "@/lib/content";

// Scene 04. The Defense Logistics Agency work at C3 AI, drawn by the scroll
// the way the inverter was, as a labelled three-part diagram:
//   1. records scattered across five kinds of source system,
//   2. streaming into one data model,
//   3. a forecast where demand overtakes stock on hand — the shortfall is
//      shaded and the moment it starts is flagged.
// Phones get their own layout: the chart takes over the same space in step 3.

type Pt = [number, number];
type Bez = [Pt, Pt, Pt, Pt];
type Layout = {
  vb: [number, number];
  font: number;
  dotR: number;
  rows: number[]; // y of each source row
  cluster: { x: number; dx: number; dy: number };
  slot: (col: number, row: number) => Pt;
  box: { x: number; y: number; w: number; h: number };
  modelLabel: Pt;
  arrow?: string;
  chart: {
    axis: string;
    demand: Bez;
    stock: Bez;
    labels: { stock: Pt; demand: Pt; shortfall: Pt; flag: Pt; weeks: Pt };
    base: number;
  };
  handoff: boolean; // stage 3 replaces stages 1–2 in the same space
};

const WIDE: Layout = {
  vb: [1440, 440],
  font: 20,
  dotR: 5,
  rows: [62, 140, 218, 296, 374],
  cluster: { x: 250, dx: 70, dy: 20 },
  slot: (c, r) => [566 + c * 28, 58 + r * 34.9],
  box: { x: 536, y: 30, w: 172, h: 372 },
  modelLabel: [622, 432],
  arrow: "M722 216 H834 M826 209 L836 216 L826 223",
  chart: {
    axis: "M860 380 H1430 M860 40 V380",
    demand: [[860, 300], [1050, 292], [1240, 148], [1430, 140]],
    stock: [[860, 140], [1050, 148], [1240, 292], [1430, 300]],
    labels: { stock: [868, 122], demand: [868, 334], shortfall: [1340, 228], flag: [1145, 416], weeks: [1430, 416] },
    base: 380,
  },
  handoff: false,
};

const NARROW: Layout = {
  vb: [390, 420],
  font: 14,
  dotR: 3.5,
  rows: [40, 110, 180, 250, 320],
  cluster: { x: 150, dx: 38, dy: 14 },
  slot: (c, r) => [270 + c * 22, 36 + r * 32],
  box: { x: 252, y: 14, w: 124, h: 332 },
  modelLabel: [314, 378],
  chart: {
    axis: "M12 330 H378 M12 30 V330",
    demand: [[12, 262], [134, 256], [256, 104], [378, 98]],
    stock: [[12, 98], [134, 104], [256, 256], [378, 262]],
    labels: { stock: [18, 84], demand: [18, 290], shortfall: [322, 184], flag: [195, 362], weeks: [378, 362] },
    base: 330,
  },
  handoff: true,
};

const PER = 10; // records per source
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function bezAt([p0, p1, p2, p3]: Bez, t: number): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]];
}
const bezPath = ([p0, p1, p2, p3]: Bez) => `M${p0} C${p1} ${p2} ${p3}`;
function shortfallArea(demand: Bez, stock: Bez) {
  const top = Array.from({ length: 21 }, (_, i) => bezAt(demand, 0.5 + i * 0.025));
  const bottom = Array.from({ length: 21 }, (_, i) => bezAt(stock, 1 - i * 0.025));
  return "M" + [...top, ...bottom].map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L") + " Z";
}

// Fixed scatter so server and client render the same picture.
const JITTER: Pt[] = (() => {
  let s = 20260927;
  const r = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  return Array.from({ length: 5 * PER }, () => [r() * 2 - 1, r() * 2 - 1] as Pt);
})();

export default function Unify() {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const cap1 = useTransform(p, [0.26, 0.33], [1, calm ? 1 : 0]);
  const cap2 = useTransform(p, [0.3, 0.37, 0.6, 0.67], [calm ? 1 : 0, 1, 1, calm ? 1 : 0]);
  const cap3 = useTransform(p, [0.63, 0.7], [calm ? 1 : 0, 1]);
  const caps = [cap1, cap2, cap3];

  return (
    <section
      ref={ref}
      aria-labelledby="c3-title"
      data-nav-theme="dark"
      className="relative h-[300vh] bg-coal motion-reduce:h-auto"
      style={calm ? { height: "auto" } : undefined}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-between overflow-hidden pb-[7svh] pt-[14svh]">
        <div className="frame">
          <p className="t-eyebrow reveal">
            {C3.company} · {C3.client} · {C3.when}
          </p>
          <h2 id="c3-title" className="t-headline reveal mt-3" style={{ ["--d" as string]: "120ms" }}>
            Supply in.
            <br className="sm:hidden" /> Readiness out.
          </h2>
        </div>

        <div className="frame">
          <Diagram layout={WIDE} p={p} calm={calm} className="hidden h-auto max-h-[44svh] w-full md:block" />
          <Diagram layout={NARROW} p={p} calm={calm} className="mx-auto block h-auto max-h-[42svh] w-full md:hidden" />
        </div>

        <div className="frame grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-16">
          {calm ? (
            <ol className="t-title max-w-[34ch] space-y-3">
              {C3.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          ) : (
            <div className="t-title grid max-w-[34ch] [&>*]:[grid-area:1/1]">
              {C3.steps.map((s, i) => (
                <motion.p key={s} style={{ opacity: caps[i] }}>
                  {s}
                </motion.p>
              ))}
            </div>
          )}
          <p className="t-small max-w-[22rem] md:text-right">
            {C3.role} on the Federal team in Redwood City, working with the {C3.client}. Python, SQL, and the C3&nbsp;AI
            Platform.
          </p>
        </div>
      </div>
    </section>
  );
}

function Diagram({
  layout: L,
  p,
  calm,
  className,
}: {
  layout: Layout;
  p: MotionValue<number>;
  calm: boolean;
  className: string;
}) {
  const k = calm ? 1 : 0; // start value: 1 means already finished
  const labels = useTransform(p, [0.02, 0.1], [k, 1]);
  const model = useTransform(p, [0.3, 0.38], [k, 1]);
  const handoff = useTransform(p, [0.6, 0.68], [1, L.handoff && !calm ? 0 : 1]);
  const axes = useTransform(p, [0.62, 0.68], [k, 1]);
  const lines = useTransform(p, [0.66, 0.86], [k, 1]);
  const area = useTransform(p, [0.84, 0.9], [k, 1]);
  const flag = useTransform(p, [0.86, 0.92], [k, 1]);
  const [cx, cy] = bezAt(L.chart.demand, 0.5);
  const text = { fontSize: L.font, fontWeight: 500 };

  return (
    <svg
      viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`}
      className={className}
      role="img"
      aria-label="Diagram. Records from suppliers, contracts, depots, orders and maintenance flow into one data model. A forecast then shows demand rising while stock on hand falls; where they cross, a shortfall is flagged."
    >
      {/* 1 + 2: the sources and the model they stream into */}
      <motion.g style={{ opacity: handoff }}>
        <motion.g style={{ opacity: labels }} fill="#86868b" {...text}>
          {C3.sources.map((s, i) => (
            <text key={s} x="0" y={L.rows[i] + L.font * 0.35}>
              {s}
            </text>
          ))}
        </motion.g>
        <motion.g style={{ opacity: model }}>
          <rect
            x={L.box.x}
            y={L.box.y}
            width={L.box.w}
            height={L.box.h}
            rx="16"
            fill="none"
            stroke="#48484a"
            strokeWidth="1.5"
          />
          <text x={L.modelLabel[0]} y={L.modelLabel[1]} textAnchor="middle" fill="#f5f5f7" {...text}>
            One data model
          </text>
        </motion.g>
        {JITTER.map((j, i) => {
          const src = Math.floor(i / PER);
          const n = i % PER;
          const from: Pt = [L.cluster.x + j[0] * L.cluster.dx, L.rows[src] + j[1] * L.cluster.dy];
          const to = L.slot(n % 5, src * 2 + Math.floor(n / 5));
          return <Record key={i} p={p} calm={calm} from={from} to={to} r={L.dotR} src={src} n={n} />;
        })}
        {L.arrow && (
          <motion.path d={L.arrow} style={{ opacity: axes }} fill="none" stroke="#86868b" strokeWidth="1.5" />
        )}
      </motion.g>

      {/* 3: the forecast */}
      <motion.g style={{ opacity: axes }}>
        <path d={L.chart.axis} fill="none" stroke="#48484a" strokeWidth="1.5" />
        <text x={L.chart.labels.weeks[0]} y={L.chart.labels.weeks[1]} textAnchor="end" fill="#86868b" {...text}>
          Weeks ahead
        </text>
      </motion.g>
      <motion.path
        d={shortfallArea(L.chart.demand, L.chart.stock)}
        fill="#f5f5f7"
        fillOpacity={0.12}
        style={{ opacity: area }}
      />
      <motion.path
        d={bezPath(L.chart.stock)}
        fill="none"
        stroke="#86868b"
        strokeWidth="2.5"
        style={{ pathLength: lines }}
      />
      <motion.path
        d={bezPath(L.chart.demand)}
        fill="none"
        stroke="#f5f5f7"
        strokeWidth="3"
        style={{ pathLength: lines }}
      />
      <motion.g style={{ opacity: axes }} {...text}>
        <text x={L.chart.labels.stock[0]} y={L.chart.labels.stock[1]} fill="#86868b">
          Stock on hand
        </text>
        <text x={L.chart.labels.demand[0]} y={L.chart.labels.demand[1]} fill="#f5f5f7">
          Forecast demand
        </text>
      </motion.g>
      <motion.g style={{ opacity: flag }} {...text}>
        <text x={L.chart.labels.shortfall[0]} y={L.chart.labels.shortfall[1]} textAnchor="middle" fill="#f5f5f7">
          Shortfall
        </text>
        <path
          d={`M${cx} ${cy} V${L.chart.base}`}
          stroke="#f5f5f7"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        <circle cx={cx} cy={cy} r="7" fill="#f5f5f7" />
        <circle cx={cx} cy={cy} r="15" fill="none" stroke="#f5f5f7" strokeOpacity="0.45" />
        <text x={L.chart.labels.flag[0]} y={L.chart.labels.flag[1]} textAnchor="middle" fill="#f5f5f7" fontWeight="600">
          Flagged
        </text>
      </motion.g>
    </svg>
  );
}

// One record: appears with its source, then glides into its slot in the model.
function Record({
  p,
  calm,
  from,
  to,
  r,
  src,
  n,
}: {
  p: MotionValue<number>;
  calm: boolean;
  from: Pt;
  to: Pt;
  r: number;
  src: number;
  n: number;
}) {
  const a = 0.03 + src * 0.035 + (n / PER) * 0.05;
  const m0 = 0.36 + src * 0.035 + (n / PER) * 0.04;
  const t = (v: number) => (calm ? 1 : ease(clamp((v - m0) / 0.14)));
  const opacity = useTransform(p, (v) => (calm ? 1 : clamp((v - a) / 0.05)));
  const x = useTransform(p, (v) => mix(from[0], to[0], t(v)));
  const y = useTransform(p, (v) => mix(from[1], to[1], t(v)));
  const fill = useTransform(p, (v) => (t(v) > 0.5 ? "#d1d1d6" : "#8e8e93"));
  return <motion.circle cx={x} cy={y} r={r} style={{ opacity, fill }} />;
}
