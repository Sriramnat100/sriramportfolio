import Image from "next/image";
import { EARLIER, WORK_ON_WHITE } from "@/lib/content";

// Scene 06. The supporting cast, set as a quiet typographic index: a small
// logo tile, the name, one line. It keeps the charcoal of the C3 scene so the
// work reads as one chapter.
export default function Earlier() {
  return (
    <section
      aria-labelledby="earlier-title"
      data-nav-theme={WORK_ON_WHITE ? "light" : "dark"}
      className={`pb-[22svh] pt-[16svh] ${WORK_ON_WHITE ? "theme-white" : "bg-coal"}`}
    >
      <div className="frame">
        <h2 id="earlier-title" className="t-headline reveal">
          Along the way.
        </h2>

        <ul className="mt-[8svh] border-t border-[var(--rule)]">
          {EARLIER.map((r, i) => (
            <li
              key={r.org}
              className="reveal grid gap-x-10 gap-y-2 border-b border-[var(--rule)] py-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)_9rem] md:py-10"
              style={{ ["--d" as string]: `${i * 70}ms` }}
            >
              <div className="flex items-start gap-4 sm:gap-5">
                <Image
                  src={r.logo}
                  alt=""
                  width={52}
                  height={52}
                  className="mt-0.5 size-11 shrink-0 rounded-[12px] ring-1 ring-[var(--tile-ring)] sm:size-[52px]"
                />
                <div>
                  <h3 className="t-title">{r.org}</h3>
                  <p className="t-small mt-1">{r.role}</p>
                </div>
              </div>
              <p className="t-body max-w-[34rem] md:pt-1">{r.line}</p>
              <div className="t-small flex items-baseline gap-5 md:flex-col md:items-end md:gap-1 md:pt-2">
                <span>{r.years}</span>
                {r.link && (
                  <a href={r.link.href} target="_blank" rel="noopener noreferrer" className="tap link text-[var(--fg)]">
                    {r.link.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
