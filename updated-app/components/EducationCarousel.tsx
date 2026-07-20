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
      <div className="relative w-full aspect-[4/5] lg:aspect-auto lg:h-full overflow-hidden border border-line bg-paper shadow-sm">
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

        {/* Caption */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 pt-12">
          <div className="text-sm font-semibold text-white drop-shadow sm:text-base">
            {IMAGES[index].caption}
          </div>
        </div>

        {/* Prev / Next */}
        <button
          onClick={() => go(-1)}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition-all hover:bg-black/70 group-hover:opacity-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition-all hover:bg-black/70 group-hover:opacity-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          {IMAGES.map((img, i) => (
            <button
              key={img.src}
              onClick={() => setIndex(i)}
              aria-label={`Go to photo ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-5 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
