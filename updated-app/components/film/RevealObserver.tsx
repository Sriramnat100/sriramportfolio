"use client";

import { useEffect } from "react";

// One observer for every `.reveal` element on the page, so the scenes that
// only need a fade-up can stay server components.
export default function RevealObserver() {
  useEffect(() => {
    // Check in, so the layout's fail-open timer leaves reveals to us.
    document.documentElement.classList.add("io");
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
