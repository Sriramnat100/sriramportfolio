"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useCalm } from "./useCalm";
import { PROJECTS } from "@/lib/content";

// Scene 06. Projects as a horizontal sequence: on large screens the row pins
// and vertical scroll carries it sideways; each panel leads with one huge
// figure instead of a screenshot. Phones get a plain vertical column.
export default function Wins() {
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const calm = useCalm();
  const [dist, setDist] = useState(0); // horizontal travel in px; 0 = not pinned

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const measure = () => {
      const track = trackRef.current;
      setDist(mq.matches && !calm && track ? Math.max(0, track.scrollWidth - window.innerWidth) : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    mq.addEventListener("change", measure);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
      window.removeEventListener("resize", measure);
    };
  }, [calm]);

  const { scrollYProgress } = useScroll({ target: pinRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);

  // Tabbing into a panel that is translated off-screen: scroll the page to
  // the point where that panel sits at the gutter. Keyboard focus only — a
  // mouse click also focuses the link, and moving the page under the cursor
  // would swallow the click.
  const onFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement;
    const track = trackRef.current;
    if (!dist || !t.matches(":focus-visible") || !pinRef.current || !track) return;
    const panel = t.closest<HTMLElement>("[data-panel]");
    if (!panel) return;
    const pad = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    const want = Math.min(dist, Math.max(0, panel.offsetLeft - track.offsetLeft - pad));
    window.scrollTo({ top: pinRef.current.getBoundingClientRect().top + window.scrollY + want, behavior: "instant" });
  };

  return (
    <section id="projects" aria-labelledby="projects-title" data-nav-theme="dark" className="bg-black">
      <div className="frame pb-[6svh] pt-[22svh] lg:pb-0">
        <p className="t-eyebrow reveal">Projects</p>
        <h2 id="projects-title" className="t-headline reveal mt-3" style={{ ["--d" as string]: "100ms" }}>
          Built against
          <br />
          the clock.
        </h2>
        <p className="t-body reveal mt-6 max-w-[30rem]" style={{ ["--d" as string]: "200ms" }}>
          <strong>2x hackathon winner.</strong> And a few things that took longer than a weekend.
        </p>
      </div>

      <div
        ref={pinRef}
        className="relative"
        style={dist ? { height: `calc(${dist}px + 100svh)` } : undefined}
      >
        <div
          className={calm ? "" : "lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:items-center lg:overflow-clip"}
        >
          <motion.div
            ref={trackRef}
            style={{ x }}
            onFocus={onFocus}
            className={`frame flex flex-col gap-[16svh] py-[12svh] ${calm ? "" : "lg:w-max lg:flex-row lg:gap-[9vw] lg:py-0 lg:will-change-transform"}`}
          >
            {PROJECTS.map((p) => (
              <article key={p.title} data-panel className={`reveal flex shrink-0 flex-col ${calm ? "" : "lg:w-[56vw]"}`}>
                <p
                  aria-hidden
                  className={`lit select-none font-bold leading-[0.84] tracking-[-0.06em] lg:text-[min(16.5vw,30svh)] ${
                    p.mark.length > 4 ? "text-[clamp(88px,24vw,190px)]" : "text-[clamp(112px,31vw,220px)]"
                  }`}
                >
                  {p.mark}
                </p>
                <p aria-hidden className="t-eyebrow mt-4">
                  {p.markNote}
                </p>
                <h3 className="t-title mt-[5svh] text-paper">
                  {p.title}
                  <span className="sr-only">
                    , {p.mark}, {p.markNote}
                  </span>
                </h3>
                <p className="t-body mt-3 max-w-[31rem]">{p.line}</p>
                <div className="t-small mt-6 flex gap-6">
                  {p.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="tap link text-paper">
                      {l.label}
                      <span className="sr-only"> for {p.title} (opens in a new tab)</span>
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
