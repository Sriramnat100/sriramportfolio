"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useCalm } from "./useCalm";
import { SEED_DRONE } from "@/lib/content";

// Scene 07. A product shot, the way a launch page would light one: the drone
// alone on black, rising slowly as the page passes it, with a few seedballs
// falling from the payload — driven by the scroll, never on a loop.

// Where the payload's drop tube sits in the photo (fractions of the frame).
const TUBE = { x: 0.527, y: 0.955 };
const SEEDS = [
  { dx: -0.012, start: 0.22, speed: 1 },
  { dx: 0.01, start: 0.3, speed: 0.86 },
  { dx: -0.004, start: 0.38, speed: 1.1 },
  { dx: 0.016, start: 0.46, speed: 0.94 },
  { dx: -0.018, start: 0.54, speed: 1.04 },
  { dx: 0.004, start: 0.62, speed: 0.9 },
];

export default function SeedDrone() {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const m = calm ? 0 : 1;
  const lift = useTransform(p, [0, 1], [`${6 * m}%`, `${-6 * m}%`]);
  const scale = useTransform(p, [0, 0.5], [1 - 0.08 * m, 1]);

  return (
    <section ref={ref} aria-labelledby="drone-title" data-nav-theme="dark" className="relative overflow-hidden bg-black pb-[14svh] pt-[20svh]">
      <div className="frame relative z-10">
        <p className="t-eyebrow reveal">{SEED_DRONE.title}</p>
        <h2 id="drone-title" className="t-headline reveal mt-3" style={{ ["--d" as string]: "100ms" }}>
          Planting
          <br />
          from the air.
        </h2>
      </div>

      <motion.div style={{ y: lift, scale }} className="relative mx-auto mt-[6svh] w-[108vw] max-w-[1500px] sm:mt-[2svh] sm:w-[80vw]">
        <div className="relative aspect-[1672/941]">
          <Image
            src="/film/seed-drone.webp"
            alt="A white quadcopter in flight against black, carrying a custom seed-dispersal payload — wired electronics on a black mounting plate above a cylindrical drop tube."
            fill
            sizes="(max-width: 640px) 108vw, 88vw"
            className="object-contain"
          />
          {!calm &&
            SEEDS.map((s, i) => <Seed key={i} progress={p} seed={s} />)}
        </div>
      </motion.div>

      <div className="frame relative z-10 mt-[4svh] flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <p className="t-body reveal max-w-[34rem]">
          A seed‑dispersal payload I CAD‑modeled, 3D‑printed, and field‑tested — real‑time <strong>C++ on Arduino</strong>{" "}
          driving the servos, and <strong>GPS tracking on AWS</strong> to follow what grows.
        </p>
        <div className="reveal md:text-right" style={{ ["--d" as string]: "140ms" }}>
          <p className="lit font-bold leading-[0.9] tracking-[-0.05em] text-[clamp(72px,9vw,150px)]">3,000+</p>
          <p className="t-eyebrow mt-2">seedballs planted</p>
          <a
            href={SEED_DRONE.href}
            target="_blank"
            rel="noopener noreferrer"
            className="link t-small mt-4 inline-block text-paper"
          >
            Project site<span className="sr-only"> for Seed Drone (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function Seed({ progress, seed }: { progress: MotionValue<number>; seed: (typeof SEEDS)[number] }) {
  const end = Math.min(1, seed.start + 0.34 / seed.speed);
  const y = useTransform(progress, [seed.start, end], ["0%", "2600%"]);
  const opacity = useTransform(progress, [seed.start, seed.start + 0.03, end - 0.08, end], [0, 0.9, 0.5, 0]);
  return (
    <motion.span
      aria-hidden
      style={{ y, opacity, left: `${(TUBE.x + seed.dx) * 100}%`, top: `${TUBE.y * 100}%` }}
      className="absolute block h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-[#b9a58c] sm:h-[7px] sm:w-[7px]"
    />
  );
}
