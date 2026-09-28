"use client";

import { useId, useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useCalm } from "./useCalm";
import { ARM } from "@/lib/content";

// Scene 05. The six-axis arm, lit like a product, with the problem it solves
// drawn over the photo as the page scrolls: the straight line to the target
// runs through an obstacle, so a path is planned around it.
//
// The photo and the overlay share one coordinate space (the photo's own
// pixels), so they stay aligned at every size. Phones get a tighter crop.

const START = [915, 225] as const; // just under the left arm's tool
const GOAL = [1068, 660] as const; // between the right arm's open jaws
const OBSTACLE = { cx: 975, cy: 430, r: 58 };
const STRAIGHT = `M${START} L${GOAL}`;
const PLANNED = `M${START} C850 300, 845 520, ${GOAL}`;
// Where the straight line first meets the obstacle.
const HIT = (() => {
  const [x0, y0] = START;
  const dx = GOAL[0] - x0;
  const dy = GOAL[1] - y0;
  const fx = x0 - OBSTACLE.cx;
  const fy = y0 - OBSTACLE.cy;
  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - OBSTACLE.r * OBSTACLE.r;
  const t = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);
  return [x0 + dx * t, y0 + dy * t] as const;
})();

export default function Arm() {
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
      aria-labelledby="arm-title"
      data-nav-theme="dark"
      className="relative h-[280vh] bg-black motion-reduce:h-auto"
      style={calm ? { height: "auto" } : undefined}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-between overflow-hidden pb-[7svh] pt-[14svh]">
        <div className="frame">
          <p className="t-eyebrow reveal">
            {ARM.org} · {ARM.what}
          </p>
          <h2 id="arm-title" className="t-headline reveal mt-3" style={{ ["--d" as string]: "120ms" }}>
            <span className="sr-only">Gies Disruption Labs robotic arm: </span>
            Six axes.
            <br className="sm:hidden" /> One clear path.
          </h2>
        </div>

        <div className="frame min-h-0">
          <Scene p={p} calm={calm} viewBox="0 0 1812 868" fit="meet" className="mx-auto hidden h-auto max-h-[50svh] w-full md:block" />
          <Scene p={p} calm={calm} viewBox="600 60 700 760" fit="slice" className="mx-auto block h-auto max-h-[44svh] w-full md:hidden" />
        </div>

        <div className="frame grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-16">
          {calm ? (
            <ol className="t-title max-w-[30ch] space-y-3">
              {ARM.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          ) : (
            <div data-film-stack className="t-title grid max-w-[30ch] [&>*]:[grid-area:1/1]">
              {ARM.steps.map((s, i) => (
                <motion.p key={s} style={{ opacity: caps[i] }}>
                  {s}
                </motion.p>
              ))}
            </div>
          )}
          <div className="t-small max-w-[22rem] md:text-right">
            <p>{ARM.role}</p>
            <a href={ARM.href} target="_blank" rel="noopener noreferrer" className="link mt-2 inline-block text-paper">
              The arm<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Scene({
  p,
  calm,
  viewBox,
  fit,
  className,
}: {
  p: MotionValue<number>;
  calm: boolean;
  viewBox: string;
  fit: "meet" | "slice";
  className: string;
}) {
  const id = useId().replace(/:/g, "");
  const k = calm ? 1 : 0;
  const ends = useTransform(p, [0.04, 0.12], [k, 1]);
  const ring = useTransform(p, [0.34, 0.46], [k, 1]);
  const ringLabel = useTransform(p, [0.42, 0.48], [k, 1]);
  const straight = useTransform(p, [0.38, 0.56], [k, 1]);
  const straightFade = useTransform(p, [0.66, 0.76], [1, 0.25]);
  const hit = useTransform(p, [0.55, 0.6], [k, 1]);
  const planned = useTransform(p, [0.68, 0.9], [k, 1]);
  const arrive = useTransform(p, [0.88, 0.93], [k, 1]);

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio={`xMidYMid ${fit}`}
      data-film-draw
      data-film-show
      className={className}
      style={{ aspectRatio: viewBox.split(" ").slice(2).join(" / ") }}
      role="img"
      aria-label="Two white 3D-printed robotic arms on black. Drawn over them: a straight line from one arm's tool to the other's open gripper passes through a circular obstacle, and a curved planned path bends around the obstacle to reach the gripper."
    >
      <image href="/film/robot-arms.webp" x="0" y="0" width="1812" height="868" />

      {/* Mask regions are pinned to the photo's full frame; the default region
          is measured from the viewBox origin and would clip the phone crop. */}
      <defs>
        <mask id={`${id}-straight`} maskUnits="userSpaceOnUse" x="0" y="0" width="1812" height="868">
          <motion.path d={STRAIGHT} stroke="#fff" strokeWidth="12" fill="none" style={{ pathLength: straight }} />
        </mask>
        <mask id={`${id}-ring`} maskUnits="userSpaceOnUse" x="0" y="0" width="1812" height="868">
          <motion.circle
            cx={OBSTACLE.cx}
            cy={OBSTACLE.cy}
            r={OBSTACLE.r}
            stroke="#fff"
            strokeWidth="12"
            fill="none"
            style={{ pathLength: ring }}
          />
        </mask>
      </defs>

      {/* The obstacle */}
      <circle
        cx={OBSTACLE.cx}
        cy={OBSTACLE.cy}
        r={OBSTACLE.r}
        fill="none"
        stroke="#a1a1a6"
        strokeWidth="3"
        strokeDasharray="10 10"
        mask={`url(#${id}-ring)`}
      />
      <motion.text
        x={OBSTACLE.cx}
        y={OBSTACLE.cy + OBSTACLE.r + 30}
        textAnchor="middle"
        fill="#a1a1a6"
        fontSize="22"
        fontWeight="500"
        style={{ opacity: ringLabel }}
      >
        obstacle
      </motion.text>

      {/* The straight line, and where it collides */}
      <motion.g style={{ opacity: straightFade }}>
        <path
          d={STRAIGHT}
          fill="none"
          stroke="#f5f5f7"
          strokeWidth="3"
          strokeDasharray="12 12"
          mask={`url(#${id}-straight)`}
        />
      </motion.g>
      <motion.path
        d={`M${HIT[0] - 12} ${HIT[1] - 12} l24 24 M${HIT[0] + 12} ${HIT[1] - 12} l-24 24`}
        stroke="#f5f5f7"
        strokeWidth="4"
        strokeLinecap="round"
        style={{ opacity: hit }}
      />

      {/* The planned path */}
      <motion.path
        d={PLANNED}
        fill="none"
        stroke="#f5f5f7"
        strokeWidth="4.5"
        style={{ pathLength: planned }}
      />

      {/* Start and goal */}
      <motion.g style={{ opacity: ends }}>
        <circle cx={START[0]} cy={START[1]} r="9" fill="#f5f5f7" />
        <circle cx={GOAL[0]} cy={GOAL[1]} r="14" fill="none" stroke="#f5f5f7" strokeWidth="3" />
      </motion.g>
      <motion.circle cx={GOAL[0]} cy={GOAL[1]} r="7" fill="#f5f5f7" style={{ opacity: arrive }} />
    </svg>
  );
}
