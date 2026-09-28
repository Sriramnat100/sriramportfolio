"use client";

import { useEffect, useState } from "react";
import { NAV, PERSON } from "@/lib/content";

// Out of the way on the hero — the name is the whole first screen — then it
// slides in as a thin blurred bar once the hero is mostly gone, and flips to
// dark text when a light scene is underneath it.
export default function Nav() {
  const [shown, setShown] = useState(false);
  const [light, setLight] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Watch a thin band at the top of the viewport: whichever scene is in
    // that band decides the bar's theme.
    const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-theme]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setLight((e.target as HTMLElement).dataset.navTheme === "light");
        }
      },
      { rootMargin: "0px 0px -94% 0px" }
    );
    scenes.forEach((s) => io.observe(s));

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  const bar = light
    ? "bg-paper/75 text-coal shadow-[0_1px_0_rgba(0,0,0,0.08)] backdrop-blur-xl backdrop-saturate-150"
    : "bg-black/60 text-paper shadow-[0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl backdrop-saturate-150";

  // While hidden it's also out of the tab order (invisible), so keyboard
  // focus never lands on a bar nobody can see.
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[transform,opacity,visibility,background-color,color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${bar} ${
        shown ? "visible translate-y-0 opacity-100" : "invisible -translate-y-full opacity-0"
      }`}
    >
      <nav aria-label="Primary" className="frame flex h-12 items-center justify-between">
        <a href="#top" className="whitespace-nowrap text-[14px] font-semibold tracking-[-0.01em]">
          {PERSON.name}
        </a>
        <ul className="flex items-center gap-5 text-[12px] sm:gap-8 sm:text-[13px]">
          {NAV.map((item) => (
            <li key={item.href} className={
                item.label === "Illinois" ? "hidden sm:block" : item.label === "Projects" ? "max-[380px]:hidden" : ""
              }>
              <a href={item.href} className="opacity-80 transition-opacity duration-300 hover:opacity-100">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
