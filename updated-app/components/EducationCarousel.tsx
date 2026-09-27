"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Drop the matching photo files into /public/education/ (see filenames below).
const IMAGES = [
  { src: "/untitled folder 2/almamaterstatue.jpeg", caption: "Alma Mater Statue" },
  { src: "/education/basketball-statefarm.jpeg", caption: "State Farm Center — Illini Basketball" },
  { src: "/education/campus-spring.jpeg", caption: "Spring Sandwich" },
  { src: "/education/football-gameday.jpeg", caption: "Memorial Stadium — Gameday" },
  { src: "/education/campus-sunset.jpeg", caption: "Winter Sunset on the Quad" },
  { src: "/education/campus-snow.jpeg", caption: "First Snow on Campus" },
  { src: "/education/first-cf.jpeg", caption: "First Career Fair" },
  { src: "/education/fall-sunset.jpeg", caption: "Fall Sunset" },
];

export default function EducationCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = IMAGES.length;

  const go = useCallback((delta: number) => setIndex((p) => (p + delta + n) % n), [n]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((p) => (p + 1) % n), 5000);
    return () => clearInterval(t);
  }, [paused, n]);

  return (
    <div
      className="group relative h-full w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="toy-box relative aspect-[4/5] w-full overflow-hidden bg-paper lg:aspect-auto lg:h-full">
        {IMAGES.map((img, i) => (
          <Image
            key={img.src}
            src={img.src}
            alt={img.caption}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            priority={i === 0}
            className={`object-cover transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}

        {/* Caption plate */}
        <div className="absolute bottom-3 left-3 border-2 border-ink bg-paper px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
          {IMAGES[index].caption}
        </div>

        {/* Prev / Next */}
        <button
          onClick={() => go(-1)}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border-2 border-ink bg-paper text-ink opacity-0 transition-all hover:bg-ink hover:text-paper group-hover:opacity-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center border-2 border-ink bg-paper text-ink opacity-0 transition-all hover:bg-ink hover:text-paper group-hover:opacity-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Counter */}
        <div className="absolute right-3 top-3 border-2 border-ink bg-ink px-2 py-1 font-mono text-[11px] text-paper">
          {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}
