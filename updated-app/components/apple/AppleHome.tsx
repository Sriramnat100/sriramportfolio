"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ content */

const NAV = [
  { label: "Work", href: "#work" },
  { label: "Projects", href: "#projects" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const FEATURED = [
  {
    eyebrow: "First Place — HackIllinois 2025",
    title: "FarmSmart",
    line: "An AI chatbot that helps farmers read their own fields. Yield, cost, and disease — in one place.",
    image: "/untitled folder 2/farmsmartlogo.jpg",
    href: "https://devpost.com/software/farmsmart-b8uskz",
    tone: "dark" as const,
  },
  {
    eyebrow: "Second Place — HackIllinois 2026",
    title: "Cat Vision Copilot",
    line: "Computer vision that finds component defects on Caterpillar machinery before a human would.",
    image: "/untitled folder 2/cvc.jpg",
    href: "https://devpost.com/software/cat-vision",
    tone: "light" as const,
  },
];

const ROLES = [
  {
    company: "C3 AI",
    logo: "/logos/c3l.png",
    role: "Forward Deployed Software Engineer Intern",
    period: "May 2026 — Aug 2026",
    place: "Redwood City, CA",
    line: "Federal team. Python, SQL, and the C3 AI platform.",
  },
  {
    company: "Rivian",
    logo: "/logos/rivianlogo.png",
    role: "Embedded Software Engineer Intern",
    period: "Feb 2026 — May 2026",
    place: "Champaign, IL",
    line: "Inverter team — firmware in C and C++.",
  },
  {
    company: "Hacker Dojo",
    logo: "/logos/hdfinal.png",
    role: "Software and Strategy Intern",
    period: "Apr 2025 — Aug 2025",
    place: "Mountain View, CA",
    line: "Shipped on an AI health platform used by more than 1,000 people.",
  },
  {
    company: "Ward Lab, Illinois",
    logo: "/logos/fwlab.png",
    role: "Machine Learning Research Associate",
    period: "Oct 2024 — Jun 2025",
    place: "Urbana, IL",
    line: "Satellite imagery models predicting habitat suitability for endangered species.",
  },
  {
    company: "Gies Disruption Labs",
    logo: "/logos/gies.png",
    role: "Software Engineer Intern",
    period: "Sep 2024 — Dec 2025",
    place: "Urbana, IL",
    line: "A 6-axis robotic arm — real-time path planning and obstacle avoidance.",
  },
];

const PROJECTS = [
  {
    title: "Calmoto",
    kind: "Computer Vision",
    line: "Drowsiness detection at 88% accuracy, with an LLM that reads to you to keep you awake.",
    image: "/untitled folder 2/testThing.jpg",
    href: "https://devpost.com/software/calmoto",
  },
  {
    title: "IlliniResearch",
    kind: "Web Platform",
    line: "Connects UIUC students to campus research, with a cold-email generator and résumé reviewer.",
    image: "/untitled folder 2/illiniresearch.png",
    href: "https://github.com/CS196Illinois/FA24-Group8",
  },
  {
    title: "Seed Drone",
    kind: "Embedded",
    line: "A drone payload that has planted more than 3,000 seedballs, tracked by GPS over time.",
    image: "/untitled folder 2/btlogo.png",
    href: "https://seedrone.vercel.app",
  },
  {
    title: "Alzheimer's Research",
    kind: "Deep Learning",
    line: "A convolutional net reading MRI scans for the earliest signs of Alzheimer's.",
    image: "/untitled folder 2/alzhiemersresearch.png",
    href: "https://github.com/Sriramnat100/ASDRP_Files",
  },
];

const STATS = [
  { value: "4", label: "Hackathon wins" },
  { value: "1,000+", label: "People using what I've built" },
  { value: "3.85", label: "GPA at Illinois" },
  { value: "7+", label: "Years building" },
];

/* ------------------------------------------------------------------- motion */

// One observer for every element that rises into place on scroll.
function useReveal() {
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>(".ap-reveal"));
    if (!targets.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((el) => el.classList.add("ap-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("ap-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* --------------------------------------------------------------------- page */

export default function AppleHome() {
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useReveal();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      // Hero text drifts up and dims slightly as you leave it — Apple's
      // standard "the headline hands you off to the next section" move.
      const el = heroRef.current;
      if (el) {
        const p = Math.min(window.scrollY / 600, 1);
        el.style.transform = `translate3d(0, ${-p * 60}px, 0)`;
        el.style.opacity = String(1 - p * 0.85);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="ap-root">
      <style>{CSS}</style>

      {/* ------------------------------------------------------------- nav */}
      <header className={`ap-nav ${scrolled ? "ap-nav-solid" : ""}`}>
        <nav className="ap-nav-inner" aria-label="Main">
          <a href="#top" className="ap-nav-brand">
            Sriram
          </a>
          <ul className="ap-nav-links">
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
          <a className="ap-nav-cta" href="/untitled folder 2/SriramNatarajanResume 3.31.12 PM.pdf">
            Résumé
          </a>
        </nav>
      </header>

      <main id="top">
        {/* ----------------------------------------------------------- hero */}
        <section className="ap-hero">
          <div ref={heroRef} className="ap-hero-inner">
            <p className="ap-eyebrow ap-reveal">Computer Science + Linguistics, Illinois</p>
            <h1 className="ap-hero-title ap-reveal ap-d1">Sriram Natarajan</h1>
            <p className="ap-hero-sub ap-reveal ap-d2">
              I build things where machine learning meets the physical world.
              <br />
              Sometimes that&apos;s a model. Sometimes it&apos;s a drone.
            </p>
            <div className="ap-hero-actions ap-reveal ap-d3">
              <a className="ap-btn" href="#work">
                See the work
              </a>
              <a className="ap-link" href="#contact">
                Get in touch <span aria-hidden>&rsaquo;</span>
              </a>
            </div>
          </div>
          <div className="ap-hero-glow" aria-hidden />
        </section>

        {/* ---------------------------------------------------------- stats */}
        <section className="ap-band">
          <div className="ap-wrap">
            <ul className="ap-stats">
              {STATS.map((s, i) => (
                <li key={s.label} className={`ap-reveal ap-d${i}`}>
                  <span className="ap-stat-value">{s.value}</span>
                  <span className="ap-stat-label">{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* -------------------------------------------------------- featured */}
        <section id="work" className="ap-section">
          <div className="ap-wrap">
            <h2 className="ap-section-title ap-reveal">
              Built to win.
              <span className="ap-muted"> Then built to last.</span>
            </h2>
            <div className="ap-tiles">
              {FEATURED.map((f, i) => (
                <a
                  key={f.title}
                  href={f.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`ap-tile ap-tile-${f.tone} ap-reveal ap-d${i}`}
                >
                  <div className="ap-tile-copy">
                    <p className="ap-tile-eyebrow">{f.eyebrow}</p>
                    <h3 className="ap-tile-title">{f.title}</h3>
                    <p className="ap-tile-line">{f.line}</p>
                    <span className="ap-tile-more">
                      Learn more <span aria-hidden>&rsaquo;</span>
                    </span>
                  </div>
                  <div className="ap-tile-media">
                    <Image src={f.image} alt={f.title} width={900} height={900} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------- sticky statement */}
        <section className="ap-sticky">
          <div className="ap-sticky-rail">
            <div className="ap-sticky-pin">
              <p className="ap-eyebrow">Experience</p>
              <h2 className="ap-sticky-title">
                Five teams.
                <br />
                Satellites to inverters.
              </h2>
              <p className="ap-sticky-note">
                Research labs, a federal enterprise-AI team, an EV drivetrain group, and a
                hackathon platform for 250&nbsp;people.
              </p>
            </div>
            <ol className="ap-roles">
              {ROLES.map((r) => (
                <li key={r.company} className="ap-role ap-reveal">
                  <div className="ap-role-logo">
                    <Image src={r.logo} alt="" width={96} height={96} />
                  </div>
                  <div className="ap-role-body">
                    <p className="ap-role-company">{r.company}</p>
                    <p className="ap-role-title">{r.role}</p>
                    <p className="ap-role-line">{r.line}</p>
                    <p className="ap-role-meta">
                      {r.period} · {r.place}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* -------------------------------------------------------- projects */}
        <section id="projects" className="ap-band ap-section">
          <div className="ap-wrap">
            <h2 className="ap-section-title ap-reveal">
              More to explore.
            </h2>
          </div>
          <div className="ap-rail" role="list">
            {PROJECTS.map((p) => (
              <a
                key={p.title}
                href={p.href}
                target="_blank"
                rel="noreferrer"
                role="listitem"
                className="ap-card ap-reveal"
              >
                <div className="ap-card-media">
                  <Image src={p.image} alt={p.title} width={700} height={700} />
                </div>
                <p className="ap-card-kind">{p.kind}</p>
                <h3 className="ap-card-title">{p.title}</h3>
                <p className="ap-card-line">{p.line}</p>
              </a>
            ))}
          </div>
        </section>

        {/* ----------------------------------------------------------- about */}
        <section id="about" className="ap-section ap-about">
          <div className="ap-wrap ap-wrap-narrow">
            <h2 className="ap-statement ap-reveal">
              I like problems that are a little too ambitious for the amount of time I have.
            </h2>
            <div className="ap-about-grid">
              <div className="ap-reveal ap-d1">
                <p className="ap-about-body">
                  I&apos;m a Computer Science and Linguistics major at the University of Illinois
                  Urbana-Champaign, with a minor in Data Science. Most of what I build sits where
                  software, machine learning, and the real world overlap — a model that reads a
                  leaf, a drone that plants a seed, a platform a few hundred people depend on for a
                  weekend.
                </p>
                <p className="ap-about-body">
                  I&apos;m always up for collaborating, learning something new, or chasing an idea
                  that feels out of reach.
                </p>
              </div>
              <dl className="ap-facts ap-reveal ap-d2">
                <div>
                  <dt>University</dt>
                  <dd>Illinois Urbana-Champaign</dd>
                </div>
                <div>
                  <dt>Studying</dt>
                  <dd>Computer Science + Linguistics</dd>
                </div>
                <div>
                  <dt>Minor</dt>
                  <dd>Data Science</dd>
                </div>
                <div>
                  <dt>Graduating</dt>
                  <dd>May 2028</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- contact */}
        <section id="contact" className="ap-band ap-contact">
          <div className="ap-wrap ap-wrap-narrow">
            <h2 className="ap-contact-title ap-reveal">Let&apos;s build something.</h2>
            <p className="ap-contact-sub ap-reveal ap-d1">
              Internships, research, or an idea you can&apos;t stop thinking about.
            </p>
            <div className="ap-hero-actions ap-reveal ap-d2">
              <a className="ap-btn" href="mailto:sriram6@illinois.edu">
                Email me
              </a>
              <a className="ap-link" href="https://github.com/Sriramnat100" target="_blank" rel="noreferrer">
                GitHub <span aria-hidden>&rsaquo;</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="ap-footer">
        <div className="ap-wrap">
          <p>Designed and built by Sriram Natarajan.</p>
          <p className="ap-footer-fine">
            An independent portfolio. Not affiliated with, or endorsed by, any company named above.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------------------- css */

const CSS = `
.ap-root {
  --ink: #1d1d1f;
  --ink-soft: #6e6e73;
  --paper: #ffffff;
  --paper-alt: #f5f5f7;
  --blue: #0071e3;
  --hairline: rgba(0,0,0,0.08);
  font-family: var(--ap-font), -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  color: var(--ink);
  background: var(--paper);
  -webkit-font-smoothing: antialiased;
  letter-spacing: -0.01em;
}
.ap-root * { box-sizing: border-box; }
.ap-root h1, .ap-root h2, .ap-root h3, .ap-root p, .ap-root ul, .ap-root ol, .ap-root dl, .ap-root dd {
  margin: 0; padding: 0; list-style: none;
}
.ap-root a { color: inherit; text-decoration: none; }

/* nav */
.ap-nav {
  position: sticky; top: 0; z-index: 50;
  background: rgba(255,255,255,0.72);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  transition: box-shadow .3s ease, background .3s ease;
}
.ap-nav-solid { box-shadow: 0 0 0 0.5px var(--hairline); }
.ap-nav-inner {
  display: flex; align-items: center; gap: 24px;
  height: 48px; max-width: 1024px; margin: 0 auto; padding: 0 22px;
}
.ap-nav-brand { font-size: 17px; font-weight: 600; letter-spacing: -0.02em; }
.ap-nav-links { display: flex; gap: 28px; margin-left: auto; }
.ap-nav-links a {
  font-size: 12px; font-weight: 400; color: rgba(29,29,31,0.85);
  transition: color .2s ease;
}
.ap-nav-links a:hover { color: var(--ink); }
.ap-nav-cta {
  font-size: 12px; font-weight: 500; color: var(--blue);
  padding: 5px 12px; border-radius: 980px; border: 1px solid rgba(0,113,227,0.4);
  transition: background .2s ease, color .2s ease;
}
.ap-nav-cta:hover { background: var(--blue); color: #fff; border-color: var(--blue); }

/* layout */
.ap-wrap { max-width: 1024px; margin: 0 auto; padding: 0 22px; }
.ap-wrap-narrow { max-width: 760px; }
.ap-section { padding: 110px 0; }
.ap-band { background: var(--paper-alt); }

/* hero */
.ap-hero {
  position: relative; overflow: hidden;
  min-height: 78vh;
  display: flex; align-items: center; justify-content: center;
  text-align: center; padding: 120px 22px 100px;
}
.ap-hero-inner { position: relative; z-index: 1; max-width: 860px; will-change: transform, opacity; }
.ap-hero-glow {
  position: absolute; left: 50%; top: 42%; width: 900px; height: 900px;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(0,113,227,0.10), rgba(0,113,227,0) 62%);
  pointer-events: none;
}
.ap-eyebrow {
  font-size: 19px; font-weight: 500; color: var(--blue);
  letter-spacing: -0.01em; margin-bottom: 8px;
}
.ap-hero-title {
  font-size: clamp(48px, 9vw, 104px);
  font-weight: 600; line-height: 1.04; letter-spacing: -0.025em;
}
.ap-hero-sub {
  margin-top: 22px; font-size: clamp(19px, 2.2vw, 26px);
  line-height: 1.38; color: var(--ink-soft); font-weight: 400;
}
.ap-hero-actions {
  margin-top: 34px; display: flex; gap: 26px; align-items: center; justify-content: center;
  flex-wrap: wrap;
}
.ap-btn {
  background: var(--blue); color: #fff; font-size: 17px; font-weight: 400;
  padding: 12px 23px; border-radius: 980px; transition: background .2s ease;
}
.ap-btn:hover { background: #0077ed; }
.ap-link { color: var(--blue); font-size: 17px; }
.ap-link:hover { text-decoration: underline; }
.ap-link span, .ap-tile-more span { display: inline-block; margin-left: 2px; }

/* stats */
.ap-stats {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px;
  padding: 72px 0; text-align: center;
}
.ap-stat-value {
  display: block; font-size: clamp(34px, 4vw, 52px); font-weight: 600; letter-spacing: -0.025em;
}
.ap-stat-label { display: block; margin-top: 6px; font-size: 15px; color: var(--ink-soft); }

/* section headings */
.ap-section-title {
  font-size: clamp(32px, 4.4vw, 56px); font-weight: 600; line-height: 1.08;
  letter-spacing: -0.022em; margin-bottom: 44px;
}
.ap-muted { color: var(--ink-soft); }

/* featured tiles */
.ap-tiles { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.ap-tile {
  position: relative; overflow: hidden; border-radius: 22px;
  min-height: 560px; display: flex; flex-direction: column;
  padding: 44px 40px 0;
  transition: transform .5s cubic-bezier(.28,.11,.32,1);
}
.ap-tile:hover { transform: translateY(-4px); }
.ap-tile-dark { background: #161617; color: #f5f5f7; }
.ap-tile-light { background: var(--paper-alt); color: var(--ink); }
.ap-tile-eyebrow { font-size: 13px; font-weight: 500; letter-spacing: 0.01em; opacity: 0.66; }
.ap-tile-title {
  margin-top: 8px; font-size: clamp(30px, 3.4vw, 42px); font-weight: 600; letter-spacing: -0.022em;
}
.ap-tile-line { margin-top: 12px; font-size: 17px; line-height: 1.5; opacity: 0.74; max-width: 34ch; }
.ap-tile-more { margin-top: 18px; display: inline-block; font-size: 16px; color: var(--blue); }
.ap-tile-dark .ap-tile-more { color: #2997ff; }
.ap-tile-media {
  margin-top: auto; align-self: center; width: 100%; max-width: 330px;
  aspect-ratio: 1; position: relative; overflow: hidden;
  border-radius: 20px 20px 0 0;
}
.ap-tile-media img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* sticky experience */
.ap-sticky { padding: 110px 0 130px; }
.ap-sticky-rail {
  max-width: 1024px; margin: 0 auto; padding: 0 22px;
  display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 64px; align-items: start;
}
.ap-sticky-pin { position: sticky; top: 130px; }
.ap-sticky-title {
  font-size: clamp(30px, 3.6vw, 46px); font-weight: 600; line-height: 1.08; letter-spacing: -0.022em;
}
.ap-sticky-note { margin-top: 16px; font-size: 17px; line-height: 1.55; color: var(--ink-soft); }
.ap-roles { display: flex; flex-direction: column; }
.ap-role {
  display: flex; gap: 20px; padding: 30px 0;
  border-top: 1px solid var(--hairline);
}
.ap-role:first-child { border-top: none; padding-top: 0; }
.ap-role-logo {
  flex: 0 0 52px; height: 52px; border-radius: 13px; overflow: hidden;
  background: var(--paper-alt); display: grid; place-items: center;
}
.ap-role-logo img { width: 100%; height: 100%; object-fit: contain; padding: 7px; }
.ap-role-company { font-size: 20px; font-weight: 600; letter-spacing: -0.015em; }
.ap-role-title { margin-top: 2px; font-size: 16px; color: var(--ink); }
.ap-role-line { margin-top: 8px; font-size: 16px; line-height: 1.5; color: var(--ink-soft); }
.ap-role-meta { margin-top: 8px; font-size: 13px; color: var(--ink-soft); }

/* project rail */
.ap-rail {
  display: flex; gap: 20px; overflow-x: auto; scroll-snap-type: x mandatory;
  padding: 4px 22px 40px; margin: 0 auto; max-width: 1024px;
  scrollbar-width: none;
}
.ap-rail::-webkit-scrollbar { display: none; }
.ap-card {
  flex: 0 0 300px; scroll-snap-align: start;
  background: var(--paper); border-radius: 18px; overflow: hidden;
  padding-bottom: 26px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.06);
  transition: transform .4s cubic-bezier(.28,.11,.32,1), box-shadow .4s ease;
}
.ap-card:hover { transform: translateY(-4px); box-shadow: 0 10px 26px rgba(0,0,0,0.10); }
.ap-card-media { aspect-ratio: 4 / 3; background: var(--paper-alt); }
.ap-card-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ap-card-kind {
  margin: 22px 24px 0; font-size: 12px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-soft);
}
.ap-card-title { margin: 6px 24px 0; font-size: 22px; font-weight: 600; letter-spacing: -0.018em; }
.ap-card-line { margin: 8px 24px 0; font-size: 15px; line-height: 1.5; color: var(--ink-soft); }

/* about */
.ap-statement {
  font-size: clamp(28px, 3.6vw, 44px); font-weight: 600; line-height: 1.14;
  letter-spacing: -0.022em; margin-bottom: 48px;
}
.ap-about-grid { display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 56px; }
.ap-about-body { font-size: 17px; line-height: 1.6; color: var(--ink-soft); }
.ap-about-body + .ap-about-body { margin-top: 18px; }
.ap-facts { border-top: 1px solid var(--hairline); }
.ap-facts > div { padding: 14px 0; border-bottom: 1px solid var(--hairline); }
.ap-facts dt { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-soft); }
.ap-facts dd { margin-top: 3px; font-size: 16px; font-weight: 500; }

/* contact */
.ap-contact { padding: 120px 0 130px; text-align: center; }
.ap-contact-title {
  font-size: clamp(34px, 5vw, 60px); font-weight: 600; letter-spacing: -0.024em; line-height: 1.06;
}
.ap-contact-sub { margin-top: 16px; font-size: 19px; color: var(--ink-soft); }

/* footer */
.ap-footer {
  background: var(--paper-alt); border-top: 1px solid var(--hairline);
  padding: 26px 0 40px; font-size: 12px; color: var(--ink-soft); line-height: 1.5;
}
.ap-footer-fine { margin-top: 6px; }

/* reveal */
.ap-reveal {
  opacity: 0; transform: translateY(26px);
  transition: opacity .8s cubic-bezier(.28,.11,.32,1), transform .8s cubic-bezier(.28,.11,.32,1);
}
.ap-in { opacity: 1; transform: none; }
.ap-d1 { transition-delay: .08s; }
.ap-d2 { transition-delay: .16s; }
.ap-d3 { transition-delay: .24s; }

@media (max-width: 860px) {
  .ap-section { padding: 80px 0; }
  .ap-stats { grid-template-columns: repeat(2, 1fr); padding: 56px 0; }
  .ap-tiles { grid-template-columns: 1fr; }
  .ap-tile { min-height: 470px; padding: 36px 28px 0; }
  .ap-sticky-rail { grid-template-columns: 1fr; gap: 40px; }
  .ap-sticky-pin { position: static; }
  .ap-about-grid { grid-template-columns: 1fr; gap: 36px; }
  .ap-nav-links { gap: 20px; }
}
@media (max-width: 560px) {
  .ap-nav-links { display: none; }
  .ap-hero { min-height: 68vh; padding-top: 80px; }
  .ap-card { flex-basis: 78vw; }
}
`;
