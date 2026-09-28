"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { useCalm } from "./useCalm";
import { CURRY_SEASON, CURRY_THREES } from "@/lib/curry-threes";

// Scene 11. The page turns from night to day on the way in, then holds on a
// half court while every three Steph Curry made in his 2016–17 championship
// season lands on it, in the order he made them, with the count keeping score.

const TOTAL = CURRY_THREES.length;
// Court space: 500 × 470 (tenths of a foot), half-court line at y = 0,
// baseline at y = 470, hoop 5.25 ft off the baseline. Seen from half court,
// so NBA coordinates are rotated 180°.
const HOOP_Y = 470 - 52.5;
const toX = (lx: number) => 250 - lx;
const toY = (ly: number) => HOOP_Y - ly;
// The one make from past half court is pinned to the top edge, labelled
// with its distance.
const DEEP = CURRY_THREES.find((s) => s && toY(s[1]) < 0) ?? null;
const DEEP_FT = DEEP ? Math.round(Math.hypot(DEEP[0], DEEP[1]) / 10) : 0;

export default function Warriors() {
  const ref = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const shotsRef = useRef<SVGGElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const shown = useRef(TOTAL);
  const calm = useCalm();

  // The turn from night to day happens over an empty lead-in, before any
  // text arrives, so nothing is ever set gray on gray mid-turn. A black
  // overlay fades out (opacity only) instead of repainting the background.
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start 0.33"] });
  const night = useTransform(enter, [0, 1], [1, 0]);
  const { scrollYProgress: p } = useScroll({ target: pinRef, offset: ["start start", "end end"] });

  // Show the first n shots. Only the dots whose state changes are touched.
  const show = (n: number) => {
    const g = shotsRef.current;
    if (!g) return;
    const dots = g.children;
    const from = Math.min(n, shown.current);
    const to = Math.max(n, shown.current);
    for (let i = from; i < to; i++) {
      const el = dots[i] as SVGElement | undefined;
      if (!el) continue;
      if (i < n) el.removeAttribute("data-off");
      else el.setAttribute("data-off", "");
    }
    shown.current = n;
    if (countRef.current) countRef.current.textContent = String(n);
  };
  const target = (v: number) => (calm ? TOTAL : Math.round(Math.min(1, Math.max(0, (v - 0.06) / 0.78)) * TOTAL));

  useEffect(() => {
    show(target(p.get()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calm]);
  useMotionValueEvent(p, "change", (v) => show(target(v)));

  return (
    <section ref={ref} aria-labelledby="warriors-title" data-nav-theme="light" className="theme-light relative isolate">
      <motion.div
        aria-hidden
        data-film-night
        style={{ opacity: night }}
        className="pointer-events-none absolute inset-0 -z-10 bg-black will-change-[opacity]"
      />
      <div aria-hidden className="h-[50svh]" />
      <div
        ref={pinRef}
        className="relative h-[210vh] motion-reduce:h-auto"
        style={calm ? { height: "auto" } : undefined}
      >
      <div className="sticky top-0 flex min-h-[100svh] items-center pb-[5svh] pt-[10svh] [@media(max-height:760px)]:pt-[7svh]">
        <div className="frame grid w-full items-center gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-[5vw]">
          <div>
            <Image
              src="/film/logos/warriors.svg"
              alt="Golden State Warriors"
              width={48}
              height={48}
              className="reveal mb-6 size-11 sm:size-12 [@media(max-height:760px)]:mb-3 [@media(max-height:760px)]:size-9"
            />
            <p className="t-eyebrow reveal">Off the clock</p>
            <h2 id="warriors-title" className="t-headline reveal mt-3" style={{ ["--d" as string]: "100ms" }}>
              Huge
              <br /> Warriors fan.
            </h2>
            <p className="reveal mt-6 lg:mt-[10svh] lg:[@media(max-height:760px)]:mt-[4svh]" style={{ ["--d" as string]: "200ms" }}>
              <span className="sr-only">{TOTAL} </span>
              <span
                ref={countRef}
                aria-hidden
                className="block font-bold tabular-nums leading-none tracking-[-0.045em] text-[clamp(56px,min(7.5vw,15svh),120px)]"
              >
                {TOTAL}
              </span>
              <span className="mt-3 block max-w-[26rem] text-[clamp(19px,1.6vw,24px)] font-semibold leading-snug tracking-[-0.012em]">
                3 Pointers Made By The Greatest Of All Time, Stephen Curry from{" "}
                <span className="whitespace-nowrap">2016–2017.</span>
              </span>
            </p>
          </div>

          <figure className="reveal m-0" style={{ ["--d" as string]: "120ms" }}>
            <svg
              viewBox="0 -14 500 494"
              className="mx-auto block h-auto max-h-[56svh] w-full lg:max-h-[74svh]"
              role="img"
              aria-label={`Half-court shot chart: the ${TOTAL} three-pointers Stephen Curry made in the ${CURRY_SEASON} regular season, clustered around the arc and heaviest on the wings.`}
            >
              <g fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.25" vectorEffect="non-scaling-stroke">
                <rect x="0" y="0" width="500" height="470" vectorEffect="non-scaling-stroke" />
                <path d="M30 470 V328 A237.5 237.5 0 0 1 470 328 V470" vectorEffect="non-scaling-stroke" />
                <rect x="170" y="280" width="160" height="190" vectorEffect="non-scaling-stroke" />
                <path d="M190 280 A60 60 0 0 1 310 280" vectorEffect="non-scaling-stroke" />
                <path d="M190 280 A60 60 0 0 0 310 280" strokeDasharray="6 7" vectorEffect="non-scaling-stroke" />
                <path d="M210 430 V417.5 A40 40 0 0 1 290 417.5 V430" vectorEffect="non-scaling-stroke" />
                <path d="M220 430 H280" vectorEffect="non-scaling-stroke" />
                <circle cx="250" cy={HOOP_Y} r="7.5" vectorEffect="non-scaling-stroke" />
                <path d="M190 0 A60 60 0 0 0 310 0" vectorEffect="non-scaling-stroke" />
              </g>
              <g ref={shotsRef}>
                {CURRY_THREES.map((shot, i) => {
                  // A make with no recorded location keeps its place in the
                  // sequence (so the count stays right) but draws nothing.
                  if (!shot) return <circle key={i} className="shot" r="0" />;
                  const y = toY(shot[1]);
                  return <circle key={i} className="shot" cx={toX(shot[0])} cy={y < 0 ? -7 : y} r="4.2" />;
                })}
              </g>
              {DEEP && (
                <text x={toX(DEEP[0]) + 10} y="-4" className="fill-current text-[11px] opacity-70">
                  {DEEP_FT} ft
                </text>
              )}
            </svg>
            <figcaption className="t-small mt-5 text-center lg:text-left">
              Above: a visualization of every three Steph Curry made in his 2016–17 season. The most 3 pointers ever
              made by one player in a championship season. Data: NBA.com/Stats.
            </figcaption>
          </figure>
        </div>
      </div>
      </div>
    </section>
  );
}
