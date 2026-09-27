"use client";

import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";
import type { ObjectProps } from "./SectionDiorama";

// Three.js needs a client-only render. The wrapper below holds the box's
// aspect ratio while the chunk loads, so nothing jumps.
const SectionDiorama = dynamic(() => import("./SectionDiorama"), { ssr: false });

export const SECTION_COUNT = 7;

/**
 * A section of the page framed as a figure in its display box: the landmark
 * from the hero island, boxed and labelled like packaging, sticky beside
 * the section's content on wide screens.
 */
export default function DioramaSection({
  id,
  index,
  title,
  tagline,
  Object,
  children,
}: {
  id: string;
  index: number;
  title: string;
  tagline: string;
  Object: ComponentType<ObjectProps>;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-16 border-t-[3px] border-ink px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[21rem_1fr] lg:gap-14 xl:grid-cols-[24rem_1fr] xl:gap-20">
        {/* The figure, in its box */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="toy-box bg-paper-2">
            <div className="flex items-center justify-between gap-3 border-b-[3px] border-ink bg-ink px-4 py-2 text-paper">
              <h2 className="font-display text-2xl uppercase leading-none tracking-wide sm:text-3xl">{title}</h2>
              <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em]">
                No. {String(index).padStart(2, "0")} / {String(SECTION_COUNT).padStart(2, "0")}
              </span>
            </div>
            <div className="relative aspect-[4/3] border-b-[3px] border-ink bg-paper lg:aspect-square">
              <SectionDiorama Object={Object} className="absolute inset-0" />
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
              <span className="truncate">{tagline}</span>
              <span className="shrink-0">Drag to spin</span>
            </div>
          </div>
        </div>

        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
