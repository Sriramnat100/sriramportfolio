"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useCalm } from "./useCalm";
import { RIVIAN } from "@/lib/content";

// Scene 03. What an inverter does, drawn by the scroll: a pulse train whose
// widths follow a sine, the sine that its average becomes, then the two
// more phases a motor needs. The picture holds while the captions change.

const W = 1440;
const H = 360;
const MID = H / 2;
const AMP = 132;
const CYCLES = 2;
const PERIODS = 72; // switching periods across the width
const DEPTH = 0.9; // modulation depth: how far each pulse's width swings

const TAU = Math.PI * 2;
const wave = (x: number, phase = 0) => Math.sin((TAU * CYCLES * x) / W + phase);

// Center-aligned PWM: each period is high for duty·w, centered in the period.
// Its running average is exactly MID − DEPTH·AMP·sin(x).
function pwmPath() {
  const w = W / PERIODS;
  const hi = MID - AMP;
  const lo = MID + AMP;
  let d = `M0 ${lo}`;
  for (let i = 0; i < PERIODS; i++) {
    const x0 = i * w;
    const duty = 0.5 + 0.5 * DEPTH * wave(x0 + w / 2);
    const a = x0 + ((1 - duty) * w) / 2;
    const b = x0 + ((1 + duty) * w) / 2;
    d += ` H${a.toFixed(2)} V${hi} H${b.toFixed(2)} V${lo}`;
  }
  return d + ` H${W}`;
}

function sinePath(phase: number) {
  let d = "";
  for (let x = 0; x <= W; x += 4) {
    const y = MID - DEPTH * AMP * wave(x, phase);
    d += `${x === 0 ? "M" : " L"}${x} ${y.toFixed(2)}`;
  }
  return d;
}

const PWM = pwmPath();
const PHASE_A = sinePath(0);
const PHASE_B = sinePath(-TAU / 3);
const PHASE_C = sinePath(TAU / 3);

export default function Inverter() {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Pulses sweep in, then the average draws over them, then two more phases.
  const pulses = useTransform(p, [0.02, 0.3], [calm ? W : 0, W]);
  const pulsesFade = useTransform(p, [0.34, 0.62, 0.9], [1, calm ? 0.22 : 0.3, 0.12]);
  // Waves are wiped in left to right with clip rects. pathLength can't be
  // used here: with non-scaling strokes inside preserveAspectRatio="none",
  // Chrome measures the dash in screen space and draws far too fast on phones.
  const wipeA = useTransform(p, [0.34, 0.62], [calm ? W : 0, W]);
  const wipeBC = useTransform(p, [0.66, 0.92], [calm ? W : 0, W]);

  const cap1 = useTransform(p, [0.26, 0.33], [1, calm ? 1 : 0]);
  const cap2 = useTransform(p, [0.3, 0.37, 0.6, 0.67], [calm ? 1 : 0, 1, 1, calm ? 1 : 0]);
  const cap3 = useTransform(p, [0.63, 0.7], [calm ? 1 : 0, 1]);
  const caps = [cap1, cap2, cap3];

  return (
    <section
      ref={ref}
      id="work"
      aria-labelledby="rivian-title"
      data-nav-theme="dark"
      className="relative h-[300vh] bg-black motion-reduce:h-auto"
      style={calm ? { height: "auto" } : undefined}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-between overflow-hidden pb-[7svh] pt-[15svh]">
        <div className="frame">
          <p className="t-eyebrow reveal">
            {RIVIAN.company} · {RIVIAN.when}
          </p>
          <h2 id="rivian-title" className="t-headline reveal mt-3" style={{ ["--d" as string]: "120ms" }}>
            DC in.
            <br className="sm:hidden" /> Motion out.
          </h2>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-[30svh] w-full overflow-visible"
          role="img"
          aria-label="A train of switching pulses whose widths follow a sine wave; their average draws a smooth sine, then two more sine waves offset by 120 degrees."
        >
          <defs>
            <clipPath id="pulse-reveal">
              <motion.rect x="0" y="-20" height={H + 40} style={{ width: pulses }} />
            </clipPath>
            <clipPath id="a-reveal">
              <motion.rect x="0" y="-20" height={H + 40} style={{ width: wipeA }} />
            </clipPath>
            <clipPath id="bc-reveal">
              <motion.rect x="0" y="-20" height={H + 40} style={{ width: wipeBC }} />
            </clipPath>
          </defs>
          <line x1="0" x2={W} y1={MID} y2={MID} stroke="#2c2c2e" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <motion.path
            d={PWM}
            fill="none"
            stroke="#8e8e93"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
            clipPath="url(#pulse-reveal)"
            style={{ opacity: pulsesFade }}
          />
          <motion.path
            d={PHASE_B}
            fill="none"
            stroke="#6e6e73"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            clipPath="url(#bc-reveal)"
          />
          <motion.path
            d={PHASE_C}
            fill="none"
            stroke="#48484a"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            clipPath="url(#bc-reveal)"
          />
          <motion.path
            d={PHASE_A}
            fill="none"
            stroke="#f5f5f7"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
            clipPath="url(#a-reveal)"
          />
        </svg>

        <div className="frame grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-16">
          {calm ? (
            <ol className="t-title max-w-[26ch] space-y-3">
              {RIVIAN.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          ) : (
            <div className="t-title grid max-w-[26ch] [&>*]:[grid-area:1/1]">
              {RIVIAN.steps.map((s, i) => (
                <motion.p key={s} style={{ opacity: caps[i] }}>
                  {s}
                </motion.p>
              ))}
            </div>
          )}
          <p className="t-small max-w-[22rem] md:text-right">
            {RIVIAN.role} on the inverter team — the power electronics between the battery and the motors. C, C++, and Python.
          </p>
        </div>
      </div>
    </section>
  );
}
