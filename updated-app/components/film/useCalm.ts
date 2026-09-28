"use client";

import { useEffect, useState } from "react";

// prefers-reduced-motion, read after mount. framer-motion's own hook can
// answer differently on the first client render than the server did, which
// breaks hydration; this one always starts false and then settles.
export function useCalm() {
  const [calm, setCalm] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setCalm(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCalm(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return calm;
}
