"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Github, Linkedin, Mail, Music2 } from "lucide-react";

const CARDS = [
  {
    label: "Email",
    value: "sriram6@illinois.edu",
    href: "mailto:sriram6@illinois.edu",
    action: "Write me",
    icon: Mail,
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/sriramnat",
    href: "https://www.linkedin.com/in/sriramnat/",
    action: "Connect",
    icon: Linkedin,
  },
  {
    label: "GitHub",
    value: "github.com/Sriramnat100",
    href: "https://github.com/Sriramnat100",
    action: "Follow",
    icon: Github,
  },
  {
    label: "SoundCloud",
    value: "soundcloud.com/young_rahmel",
    href: "https://soundcloud.com/young_rahmel",
    action: "Listen",
    icon: Music2,
  },
];

// A rolodex: index cards on a spindle. Flipping animates the current card
// down over the axle (rotateX) while the next card is revealed behind it.
export default function Rolodex() {
  const [index, setIndex] = useState(0);
  // phase: idle | out (current card folding away) | in (new card folding up)
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");
  const [direction, setDirection] = useState<1 | -1>(1);
  const nextIndexRef = useRef(0);

  const flip = useCallback(
    (dir: 1 | -1) => {
      if (phase !== "idle") return;
      nextIndexRef.current = (index + dir + CARDS.length) % CARDS.length;
      setDirection(dir);
      setPhase("out");
    },
    [index, phase]
  );

  // Two-step animation driven by transition end on the card.
  const onCardTransitionEnd = () => {
    if (phase === "out") {
      setIndex(nextIndexRef.current);
      setPhase("in");
      // Let the browser paint the flipped-in start position, then release.
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase("idle")));
    }
  };

  // Keyboard support when the widget is focused.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        flip(1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        flip(-1);
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [flip]);

  const card = CARDS[index];
  const Icon = card.icon;
  const peek = CARDS[(index + 1) % CARDS.length];

  // Card rotation for the current phase. "out" folds away from the viewer,
  // "in" starts folded toward the viewer and settles flat.
  const rotation =
    phase === "out" ? direction * -102 : phase === "in" ? direction * 96 : 0;

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      className="group/rolodex mx-auto w-full max-w-md outline-none"
      aria-label="Contact rolodex — use arrow keys or the buttons to flip"
    >
      <div className="relative" style={{ perspective: "1200px" }}>
        {/* Card behind (peek of the next card) */}
        <div className="absolute inset-x-4 top-3 h-full rounded-xl border border-amber-200/20 bg-[#e9e2d0]/20 blur-[0.5px]" aria-hidden />
        <div className="absolute inset-x-2 top-1.5 h-full rounded-xl border border-amber-200/30 bg-[#efe8d8]/30" aria-hidden />

        {/* The index card */}
        <div
          onTransitionEnd={onCardTransitionEnd}
          className={`relative origin-bottom rounded-xl shadow-2xl ${
            phase === "in" ? "" : "transition-transform duration-300 ease-in"
          }`}
          style={{
            transform: `rotateX(${rotation}deg)`,
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="relative overflow-hidden rounded-xl border border-amber-900/20 bg-[#f6f1e3] px-8 pb-10 pt-7 text-slate-800">
            {/* Ruled lines like a real index card */}
            <div
              className="pointer-events-none absolute inset-0 opacity-60"
              style={{
                background:
                  "repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, rgba(96,125,180,0.25) 28px)",
                backgroundPosition: "0 64px",
              }}
            />
            <div className="pointer-events-none absolute inset-x-0 top-[52px] h-px bg-red-400/50" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                  <Icon className="h-4 w-4 text-slate-600" />
                  {card.label}
                </div>
                <div className="font-mono text-xs text-slate-400">
                  {index + 1} / {CARDS.length}
                </div>
              </div>

              <div className="mt-6 break-all font-mono text-lg font-semibold text-slate-800 sm:text-xl">
                {card.value}
              </div>

              <a
                href={card.href}
                target={card.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-800 px-5 py-2 text-sm font-semibold text-amber-50 shadow transition-transform hover:scale-105"
              >
                {card.action} →
              </a>
            </div>

            {/* Spindle notches cut into the bottom edge */}
            <div className="absolute -bottom-1 left-[22%] h-5 w-8 -translate-x-1/2 rounded-t-full bg-slate-900" />
            <div className="absolute -bottom-1 left-[78%] h-5 w-8 -translate-x-1/2 rounded-t-full bg-slate-900" />
          </div>
        </div>

        {/* Axle + knobs */}
        <div className="relative mt-[-6px] flex items-center" aria-hidden>
          <div className="z-10 h-8 w-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 shadow-lg ring-2 ring-slate-800" />
          <div className="z-0 -mx-1 h-3 flex-1 rounded-full bg-gradient-to-b from-slate-600 to-slate-800 shadow-inner" />
          <div className="z-10 h-8 w-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 shadow-lg ring-2 ring-slate-800" />
        </div>
        {/* Base */}
        <div className="mx-6 h-4 rounded-b-2xl bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl" aria-hidden />
      </div>

      {/* Flip controls */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={() => flip(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-blue-100 transition-colors hover:bg-white/20"
          aria-label="Previous card"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
        <div className="text-xs uppercase tracking-[0.25em] text-blue-300/60">
          flip · next up: <span className="text-blue-200">{peek.label}</span>
        </div>
        <button
          onClick={() => flip(1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-blue-100 transition-colors hover:bg-white/20"
          aria-label="Next card"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
