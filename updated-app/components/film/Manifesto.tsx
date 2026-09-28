"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useCalm } from "./useCalm";
import { MANIFESTO } from "@/lib/content";

// Scene 02. Typography only. The paragraph holds still while the scroll
// reads it aloud, one word at a time.
export default function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useCalm();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.15", "end end"] });
  const words = MANIFESTO.split(" ");
  const n = words.length;

  return (
    <section
      ref={ref}
      aria-label="About"
      data-nav-theme="dark"
      className="relative h-[180vh] bg-black motion-reduce:h-auto"
      style={reduce ? { height: "auto" } : undefined}
    >
      <div className="sticky top-0 flex h-[100svh] items-center">
        <p className="frame max-w-[1340px] text-[clamp(30px,4.3vw,66px)] font-semibold leading-[1.13] tracking-[-0.026em]">
          {/* Read once, as a sentence, by screen readers; lit word by word on screen. */}
          <span className="sr-only">{MANIFESTO}</span>
          <span aria-hidden="true">
            {words.map((w, i) => {
              const start = (i / n) * 0.82;
              return (
                <Word key={i} progress={scrollYProgress} range={[start, start + 0.12]} still={reduce}>
                  {w}
                </Word>
              );
            })}
          </span>
        </p>
      </div>
    </section>
  );
}

function Word({
  progress,
  range,
  still,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  still: boolean;
  children: string;
}) {
  const opacity = useTransform(progress, range, [still ? 1 : 0.18, 1]);
  return (
    <>
      <motion.span className="manifesto-word" style={{ opacity }}>
        {children}
      </motion.span>{" "}
    </>
  );
}
