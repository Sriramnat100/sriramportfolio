import { PERSON } from "@/lib/content";
import Lattice from "./Lattice";

// Scene 10. The last word, and the only call to action that matters.
export default function Contact() {
  const others = [
    { label: "LinkedIn", href: PERSON.linkedin, external: true },
    { label: "GitHub", href: PERSON.github, external: true },
  ];

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      data-nav-theme="light"
      className="theme-light frame relative overflow-hidden pb-[12svh] pt-[7svh] lg:pb-[16svh] lg:pt-[22svh]"
    >
      {/* The heading's size is a variable so the figure beside it can be
          placed against its second line. */}
      <div className="contact-head">
        <Lattice className="contact-art pointer-events-none" />
        <p className="t-eyebrow reveal relative">Contact</p>
        <h2
          id="contact-title"
          className="reveal relative mt-3 text-[length:var(--hf)] font-bold leading-[0.92] tracking-[-0.05em]"
          style={{ ["--d" as string]: "100ms" }}
        >
          Let’s build
          <br />
          something cool.
        </h2>
      </div>

      <div className="reveal relative mt-[9svh]" style={{ ["--d" as string]: "200ms" }}>
        <a
          href={`mailto:${PERSON.email}`}
          className="link text-[clamp(26px,3.4vw,52px)] font-semibold tracking-[-0.025em]"
        >
          {PERSON.email}
        </a>
        <ul className="t-small mt-8 flex flex-wrap gap-x-8 gap-y-3">
          {others.map((o) => (
            <li key={o.label}>
              <a
                href={o.href}
                className="tap link text-coal"
                {...(o.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {o.label}
                {o.external && <span className="sr-only"> (opens in a new tab)</span>}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="theme-light">
      <div className="frame flex flex-col gap-2 border-t border-hair-light py-7 sm:flex-row sm:justify-between">
        <p className="t-small">© 2026 {PERSON.name}</p>
      </div>
    </footer>
  );
}
