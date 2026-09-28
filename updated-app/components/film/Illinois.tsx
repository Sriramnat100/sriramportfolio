"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useCalm } from "./useCalm";
import { FOELLINGER, type Group } from "./foellinger";
import { COURSES } from "@/lib/content";

// Scene 09. Foellinger Auditorium, drawn line by line as the page scrolls —
// lawn first, then the columns, the facade, the dome, and the trees last —
// then the coursework, set large enough to actually read.

const STAGES: Record<string, [number, number]> = {
  ground: [0.02, 0.2],
  body: [0.12, 0.42],
  details: [0.3, 0.56],
  dome: [0.44, 0.74],
  trees: [0.6, 0.86],
};
const BUCKETS = 4;

export default function Illinois() {
  const pinRef = useRef<HTMLDivElement>(null);
  const calm = useCalm();
  const { scrollYProgress: p } = useScroll({ target: pinRef, offset: ["start start", "end end"] });
  const caption = useTransform(p, [0.84, 0.92], [calm ? 1 : 0, 1]);

  return (
    <section id="illinois" aria-labelledby="illinois-title" data-nav-theme="dark" className="bg-black">
      <div ref={pinRef} className="relative h-[250vh] motion-reduce:h-auto" style={calm ? { height: "auto" } : undefined}>
        <div className="sticky top-0 flex h-[100svh] flex-col pb-[5svh] pt-[13svh]">
          <div className="frame flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-12">
            <div>
              <p className="t-eyebrow reveal">University of Illinois Urbana‑Champaign</p>
              <h2 id="illinois-title" className="t-headline reveal mt-3" style={{ ["--d" as string]: "100ms" }}>
                Fluent in both.
              </h2>
            </div>
            <p className="t-body reveal max-w-[30rem] md:pb-2" style={{ ["--d" as string]: "200ms" }}>
              <strong>Computer Science + Linguistics,</strong> with a minor in Data Science: how machines compute, and
              how people talk. <strong>3.85 GPA. Class of 2028.</strong>
            </p>
          </div>

          <div className="relative mt-[4svh] min-h-0 flex-1">
            <Drawing
              progress={p}
              calm={calm}
              viewBox="0 70 1200 700"
              strokeWidth={1.8}
              className="absolute inset-0 hidden h-full w-full md:block"
            />
            <Drawing
              progress={p}
              calm={calm}
              viewBox="170 70 860 700"
              strokeWidth={2.2}
              className="absolute inset-0 h-full w-full md:hidden"
            />
          </div>

          <motion.p style={{ opacity: caption }} className="frame t-small mt-3 text-center">
            Main Quad, UIUC.
          </motion.p>
        </div>
      </div>

      <div className="frame pb-[22svh] pt-[10svh]">
        <h3 className="t-eyebrow reveal">Coursework</h3>
        <ul className="mt-8 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
          {COURSES.map((c, i) => (
            <li
              key={c.code}
              className="reveal border-t border-hair py-6"
              style={{ ["--d" as string]: `${(i % 4) * 60}ms` }}
            >
              <p className="t-small tabular-nums">{c.code}</p>
              <p className="mt-2 text-[clamp(19px,1.5vw,22px)] font-semibold leading-snug tracking-[-0.012em] text-paper">
                {c.title}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Drawing({
  progress,
  calm,
  viewBox,
  strokeWidth,
  className,
}: {
  progress: MotionValue<number>;
  calm: boolean;
  viewBox: string;
  strokeWidth: number;
  className: string;
}) {
  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMax meet"
      data-film-draw
      className={className}
      role="img"
      aria-label="A line drawing of Foellinger Auditorium on the Main Quad: a ribbed dome with a lantern above a six-column portico, with trees on either side of the lawn."
      fill="none"
      stroke="#f5f5f7"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {FOELLINGER.map((g) => (
        <DrawGroup key={g.key} group={g} progress={progress} calm={calm} />
      ))}
    </svg>
  );
}

// Each group draws over its own stretch of the scroll; within a group the
// strokes are split into a few staggered waves so it doesn't all move at once.
function DrawGroup({ group, progress, calm }: { group: Group; progress: MotionValue<number>; calm: boolean }) {
  const [a, b] = STAGES[group.key];
  const span = b - a;
  const w0 = useTransform(progress, [a, a + span * 0.5], [calm ? 1 : 0, 1]);
  const w1 = useTransform(progress, [a + span * 0.17, a + span * 0.67], [calm ? 1 : 0, 1]);
  const w2 = useTransform(progress, [a + span * 0.33, a + span * 0.83], [calm ? 1 : 0, 1]);
  const w3 = useTransform(progress, [a + span * 0.5, b], [calm ? 1 : 0, 1]);
  const waves = [w0, w1, w2, w3];
  const fillOpacity = useTransform(progress, [a, a + span * 0.1], [calm ? 1 : 0, 1]);

  return (
    <g>
      {group.strokes.map((s, i) => (
        <motion.path
          key={i}
          d={s.d}
          strokeOpacity={s.o}
          fill={s.fill ? "#000" : "none"}
          style={{ pathLength: waves[i % BUCKETS], ...(s.fill ? { fillOpacity } : null) }}
        />
      ))}
    </g>
  );
}
