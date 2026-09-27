// The hero's name plate. Rendered twice on purpose — once by page.tsx's
// dynamic-import loading fallback (with the entrance animation) and once by
// Hero3D itself (already in the settled end-state) — so the swap from
// fallback to the real 3D hero is invisible. Keep the markup identical.
export default function HeroTitle({ animate = false }: { animate?: boolean }) {
  return (
    <div className={animate ? "animate-intro-name" : undefined}>
      <div className="stamp mb-4 -rotate-2">Hi, I&apos;m</div>
      <h1 className="title-extrude font-display text-[clamp(3rem,8.5vw,7.5rem)] uppercase leading-[0.9] tracking-[0.02em] text-ink">
        Sriram Natarajan
      </h1>
    </div>
  );
}
