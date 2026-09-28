"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useCalm } from "./useCalm";

// Scene 07. A single MRI slice, native black-on-black, read top to bottom by
// a scan line as the page scrolls. Centered, unlike the scenes around it.
export default function Scan() {
  const ref = useRef<HTMLElement>(null);
  const calm = useCalm();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const scale = useTransform(p, [0, 0.5], [calm ? 1 : 0.9, 1]);
  // The veil shrinks toward the bottom as the line passes; transform-only.
  const veil = useTransform(p, [0.12, 0.78], [calm ? 0 : 1, 0]);
  const line = useTransform(p, [0.12, 0.78], [calm ? "100%" : "0%", "100%"]);
  const lineOpacity = useTransform(p, [0.1, 0.14, 0.74, 0.8], [0, calm ? 0 : 1, calm ? 0 : 1, 0]);

  return (
    <section
      ref={ref}
      aria-labelledby="scan-title"
      data-nav-theme="dark"
      className="relative h-[230vh] bg-black motion-reduce:h-auto"
      style={calm ? { height: "auto" } : undefined}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center gap-[4svh] px-6 pt-12 text-center">
        <div>
          <p className="t-eyebrow reveal">Research</p>
          <h2 id="scan-title" className="t-headline reveal mt-2" style={{ ["--d" as string]: "100ms" }}>
            Reading the brain, early.
          </h2>
        </div>

        <motion.div style={{ scale }} className="relative aspect-[1158/1359] h-[44svh] max-h-[600px] lg:h-[54svh]">
          <Image
            src="/film/mri.webp"
            alt="An axial MRI slice of a human brain in grayscale."
            fill
            sizes="(max-width: 640px) 80vw, 520px"
            className="object-contain"
          />
          <motion.div aria-hidden style={{ scaleY: veil }} className="absolute inset-0 origin-bottom bg-black/85" />
          <motion.div aria-hidden style={{ y: line, opacity: lineOpacity }} className="absolute inset-0">
            <div className="h-px w-full bg-paper/80" />
          </motion.div>
        </motion.div>

        <div className="max-w-[36rem]">
          <p className="t-body">
            A convolutional network that classifies MRI scans for early signs of Alzheimer’s disease — built in{" "}
            <strong>TensorFlow and Keras.</strong>
          </p>
          <a
            href="https://github.com/Sriramnat100/ASDRP_Files"
            target="_blank"
            rel="noopener noreferrer"
            className="tap link t-small mt-4 inline-block text-paper"
          >
            Code<span className="sr-only"> for the Alzheimer’s research (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </section>
  );
}
