"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Github, Linkedin, Mail } from "lucide-react";

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
      className="group/rolodex mx-auto w-full max-w-md outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
      aria-label="Contact rolodex — use arrow keys or the buttons to flip"
    >
      <div className="relative" style={{ perspective: "1200px" }}>
        {/* Cards behind (peek of the stack) */}
        <div className="absolute inset-x-4 top-3 h-full border-2 border-ink/25 bg-paper-2" aria-hidden />
        <div className="absolute inset-x-2 top-1.5 h-full border-2 border-ink/45 bg-paper-2" aria-hidden />

        {/* The index card */}
        <div
          onTransitionEnd={onCardTransitionEnd}
          className={`relative origin-bottom ${
            phase === "in" ? "" : "transition-transform duration-300 ease-in"
          }`}
          style={{
            transform: `rotateX(${rotation}deg)`,
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="toy-box relative overflow-hidden bg-paper px-8 pb-10 pt-7 text-ink">
            {/* Ruled lines like a real index card */}
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  "repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, rgba(31,58,95,0.28) 28px)",
                backgroundPosition: "0 64px",
              }}
            />
            <div className="pointer-events-none absolute inset-x-0 top-[52px] h-[2px] bg-accent/70" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.25em] text-ink-soft">
                  <Icon className="h-4 w-4 text-ink" />
                  {card.label}
                </div>
                <div className="font-mono text-xs text-ink-soft">
                  {index + 1} / {CARDS.length}
                </div>
              </div>

              <div className="mt-6 break-all font-mono text-lg font-semibold text-ink sm:text-xl">
                {card.value}
              </div>

              <a
                href={card.href}
                target={card.href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="toy-shadow-sm mt-6 inline-flex items-center gap-2 border-2 border-ink bg-ink px-4 py-2 font-mono text-xs font-medium uppercase tracking-[0.15em] text-paper transition-colors hover:bg-accent"
              >
                {card.action} →
              </a>
            </div>

            {/* Spindle notches cut into the bottom edge */}
            <div className="absolute -bottom-1 left-[22%] h-5 w-8 -translate-x-1/2 rounded-t-full bg-ink" />
            <div className="absolute -bottom-1 left-[78%] h-5 w-8 -translate-x-1/2 rounded-t-full bg-ink" />
          </div>
        </div>

        {/* Axle + knobs */}
        <div className="relative mt-[-6px] flex items-center" aria-hidden>
          <div className="z-10 h-8 w-8 rounded-full border-[3px] border-ink bg-paper-2" />
          <div className="z-0 -mx-1 h-3 flex-1 bg-ink" />
          <div className="z-10 h-8 w-8 rounded-full border-[3px] border-ink bg-paper-2" />
        </div>
        {/* Base */}
        <div className="mx-6 h-4 bg-ink" aria-hidden />
      </div>

      {/* Flip controls */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          onClick={() => flip(-1)}
          className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-paper text-ink transition-colors hover:bg-ink hover:text-paper"
          aria-label="Previous card"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-ink-soft">
          flip · next: <span className="text-ink">{peek.label}</span>
        </div>
        <button
          onClick={() => flip(1)}
          className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-paper text-ink transition-colors hover:bg-ink hover:text-paper"
          aria-label="Next card"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
