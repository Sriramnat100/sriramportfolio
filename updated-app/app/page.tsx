import Nav from "@/components/film/Nav";
import Hero from "@/components/film/Hero";
import Manifesto from "@/components/film/Manifesto";
import Inverter from "@/components/film/Inverter";
import Unify from "@/components/film/Unify";
import Arm from "@/components/film/Arm";
import Earlier from "@/components/film/Earlier";
import Wins from "@/components/film/Wins";
import SeedDrone from "@/components/film/SeedDrone";
import Scan from "@/components/film/Scan";
import Illinois from "@/components/film/Illinois";
import Warriors from "@/components/film/Warriors";
import Contact, { Footer } from "@/components/film/Contact";
import RevealObserver from "@/components/film/RevealObserver";

// The homepage is a sequence of scenes, each carrying one idea:
//   01 Hero       the name, as a title card
//   02 Manifesto  what kind of software
//   03 Inverter   Rivian — shown, not listed
//   04 Unify      C3 AI and the Defense Logistics Agency — the same treatment
//   05 Arm        Gies Disruption Labs — the six-axis arm and its path planning
//   06 Earlier    the rest of the résumé, quietly
//   07 Wins       projects, one figure each
//   08 SeedDrone  hardware, lit like a product
//   09 Scan       research
//   10 Illinois   school, drawn by hand, and coursework
//   11 Warriors   the person — and the turn from dark to light
//   12 Contact
export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Manifesto />
        <Inverter />
        <Unify />
        <Arm />
        <Earlier />
        <Wins />
        <SeedDrone />
        <Scan />
        <Illinois />
        <Warriors />
        <Contact />
      </main>
      <Footer />
      <RevealObserver />
    </>
  );
}
