"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useCalm } from "./useCalm";

// Scene 01. The name is the picture: two lines of lit type set to exactly the
// same width, like a title card. Scrolling away separates them — the first
// name lifts faster than the surname — and the copy hands off to scene 02.
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLSpanElement>(null);
  const lastRef = useRef<HTMLSpanElement>(null);
  const calm = useCalm();

  // Fit each line to the block's width. The vw sizes in the markup are close
  // estimates for first paint; this makes them exact for whichever font the
  // device actually renders (SF Pro, Inter, …).
  useEffect(() => {
    const fit = () => {
      const block = blockRef.current;
      if (!block) return;
      const target = block.clientWidth;
      for (const el of [firstRef.current, lastRef.current]) {
        if (!el) continue;
        el.style.fontSize = "100px";
        const w = el.scrollWidth;
        if (w) el.style.fontSize = `${(100 * target) / w}px`;
      }
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    if (blockRef.current) ro.observe(blockRef.current);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const m = calm ? 0 : 1;
  const firstY = useTransform(scrollYProgress, [0, 1], ["0%", `${-38 * m}%`]);
  const lastY = useTransform(scrollYProgress, [0, 1], ["0%", `${-14 * m}%`]);
  const nameOpacity = useTransform(scrollYProgress, [0, 0.85], [1, calm ? 1 : 0.15]);
  const nameScale = useTransform(scrollYProgress, [0, 1], [1, 1 + 0.05 * m]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.32], [1, calm ? 1 : 0]);
  const copyY = useTransform(scrollYProgress, [0, 0.32], [0, -48 * m]);

  return (
    <section
      ref={ref}
      id="top"
      data-nav-theme="dark"
      className="relative h-[100svh] min-h-[560px] overflow-hidden bg-black"
    >
      <motion.div
        style={{ opacity: nameOpacity, scale: nameScale }}
        className="frame absolute inset-x-0 top-[31svh] sm:top-[13svh]"
      >
        <div ref={blockRef} className="intro-letters w-full">
          <h1 className="font-bold uppercase tracking-[-0.052em]">
            <motion.span
              ref={firstRef}
              style={{ y: firstY }}
              className="lit lit-sheen block w-max whitespace-nowrap text-[26vw] leading-[0.8] will-change-transform"
            >
              Sriram
            </motion.span>{" "}
            <motion.span
              ref={lastRef}
              style={{ y: lastY }}
              className="lit-dim lit-sheen mt-[0.09em] block w-max whitespace-nowrap text-[14.6vw] leading-[0.8] will-change-transform"
            >
              Natarajan
            </motion.span>
          </h1>
        </div>
      </motion.div>

      <motion.div
        style={{ opacity: copyOpacity, y: copyY }}
        className="hero-copy frame absolute inset-x-0 bottom-0 flex flex-col gap-5 pb-[max(36px,6svh)] md:flex-row md:items-end md:justify-between"
      >
        <p className="intro-copy t-display">
          From model
          <br />
          to machine.
        </p>
        <div className="intro-aside max-w-[19rem] md:pb-2 md:text-right">
          <p className="t-small">
            Computer Science + Linguistics at the University of Illinois. Most recently at C3&nbsp;AI and Rivian.
          </p>
          <a href="#work" className="tap link mt-3 hidden text-[14px] font-medium text-paper sm:inline-block">
            See the work
          </a>
        </div>
      </motion.div>
    </section>
  );
}
