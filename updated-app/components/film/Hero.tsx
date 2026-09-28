"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useCalm } from "./useCalm";

// Scene 01. The name is the picture: two lines of lit type set to exactly the
// same width, like a title card. Scrolling away separates them — the first
// name lifts faster than the surname — and the copy hands off to scene 02.
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLSpanElement>(null);
  const lastRef = useRef<HTMLSpanElement>(null);
  const calm = useCalm();

  // Size the name to whichever runs out first, width or height:
  //   1. fit each line to the block's width (both lines end up equally wide),
  //   2. if the pair would then run into the copy at the bottom — short, wide
  //      windows — shrink both together until they end a clear gap above it.
  // The sizes in the markup are close estimates for first paint (capped by
  // height too); this makes them exact for whichever font the device renders.
  // Offsets, not bounding rects, so the scroll and intro transforms don't count.
  useEffect(() => {
    const fit = () => {
      const block = blockRef.current;
      const lines = [firstRef.current, lastRef.current];
      if (!block || lines.some((el) => !el)) return;
      const width = block.clientWidth;
      const sizes = lines.map((el) => {
        el!.style.fontSize = "100px";
        return el!.scrollWidth ? (100 * width) / el!.scrollWidth : 100;
      });
      lines.forEach((el, i) => (el!.style.fontSize = `${sizes[i]}px`));

      const name = nameRef.current;
      const copy = copyRef.current;
      if (!name || !copy) return;
      const gap = Math.max(24, window.innerHeight * 0.05);
      const room = copy.offsetTop - gap - name.offsetTop;
      const height = block.offsetHeight;
      if (room > 0 && height > room) {
        const k = room / height;
        lines.forEach((el, i) => (el!.style.fontSize = `${sizes[i] * k}px`));
      }
    };
    fit();
    document.fonts?.ready.then(fit);
    const ro = new ResizeObserver(fit);
    if (blockRef.current) ro.observe(blockRef.current);
    if (copyRef.current) ro.observe(copyRef.current);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  // Light follows the pointer across the letters (fine pointers only).
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || calm) return;
    for (const el of [firstRef.current, lastRef.current]) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      el.style.setProperty("--ma", "0.95");
    }
  };
  const onPointerLeave = () => {
    for (const el of [firstRef.current, lastRef.current]) el?.style.setProperty("--ma", "0");
  };

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
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <motion.div
        ref={nameRef}
        style={{ opacity: nameOpacity, scale: nameScale }}
        className="frame absolute inset-x-0 top-[31svh] sm:top-[13svh]"
      >
        <div ref={blockRef} className="intro-letters w-full">
          <h1 className="font-extrabold uppercase tracking-[-0.04em] [font-family:ui-rounded,var(--font-sans)]">
            <motion.span
              ref={firstRef}
              style={{ y: firstY }}
              className="chrome block w-max whitespace-nowrap text-[min(25vw,40svh)] leading-[0.82] will-change-transform [--in:0.15s]"
            >
              Sriram
            </motion.span>{" "}
            <motion.span
              ref={lastRef}
              style={{ y: lastY }}
              className="chrome mt-[0.09em] block w-max whitespace-nowrap text-[min(14.2vw,22.7svh)] leading-[0.82] will-change-transform [--in:0.55s]"
            >
              Natarajan
            </motion.span>
          </h1>
        </div>
      </motion.div>

      <motion.div
        ref={copyRef}
        style={{ opacity: copyOpacity, y: copyY }}
        className="hero-copy frame absolute inset-x-0 bottom-0 flex flex-col gap-5 pb-[max(36px,6svh)] md:flex-row md:items-end md:justify-between"
      >
        <p className="intro-copy t-display">
          From concept
          <br />
          to reality.
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
