// Everything the homepage says, in one place. Scenes import from here so the
// copy can be edited without touching layout or motion code.

export const PERSON = {
  name: "Sriram Natarajan",
  email: "sriram6@illinois.edu",
  linkedin: "https://www.linkedin.com/in/sriramnat/",
  github: "https://github.com/Sriramnat100",
};

export const NAV = [
  { label: "Work", href: "#work" },
  { label: "Projects", href: "#projects" },
  { label: "School", href: "#illinois" },
  { label: "Contact", href: "#contact" },
];

// Scene 02 — read word by word as the page scrolls.
// Software first; forward-deployed; hardware as one strand of it.
export const MANIFESTO =
  "I’m a software engineer who builds end to end, then ships it where it’s used. Forward‑deployed AI for federal teams. Firmware for an electric vehicle’s inverter. Full‑stack products with real users. Models that read crops, machinery, and brain scans.";

// Scene 03 — the inverter, explained while the waveform builds.
export const RIVIAN = {
  company: "Rivian",
  when: "Spring 2026",
  role: "Embedded Software Engineer Intern",
  steps: [
    "Switch a battery on and off thousands of times a second.",
    "Vary the width of every pulse, and the average becomes a wave.",
    "Three waves, 120° apart, turn a motor.",
  ],
};

// Trial: the two charcoal scenes (C3 AI and "Along the way") on white.
// Set to false to put them back on charcoal.
export const WORK_ON_WHITE = true;

// Scene 04 — the Defense Logistics Agency work at C3 AI, drawn the same way
// as the inverter. "About 5 million items" is from the Congressional Research
// Service primer on DLA (IF11543, Dec 2024).
export const C3 = {
  company: "C3 AI",
  when: "Summer 2026",
  client: "Defense Logistics Agency",
  role: "Forward Deployed Software Engineer Intern",
  sources: ["Suppliers", "Contracts", "Depots", "Orders", "Maintenance"],
  steps: [
    "The Defense Logistics Agency supplies the U.S. military: about 5 million items, tracked in systems that don’t talk.",
    "C3 AI unifies those records into one model of the supply chain.",
    "Then AI forecasts demand against stock on hand, and flags a shortfall before it happens.",
  ],
};

// Scene 05 — the six-axis arm from Gies Disruption Labs.
export const ARM = {
  org: "Gies Disruption Labs",
  what: "Robotic arm",
  role: "Software Engineer: real-time path planning and obstacle avoidance for a six-axis arm, in C++ with ROS and Gazebo.",
  href: "https://v0-lerobot-arm.vercel.app/",
  steps: [
    "Six joints, each with its own range of motion, moving as one.",
    "The straight line to the target runs right through an obstacle.",
    "So the path is planned around it, and recomputed in real time.",
  ],
};

export type Role = {
  org: string;
  logo: string; // a square tile in /public/film/logos
  role: string;
  years: string;
  line: string;
  link?: { href: string; label: string };
};

export const EARLIER: Role[] = [
  {
    org: "Hacker Dojo",
    logo: "/film/logos/hacker-dojo.png",
    role: "Software & Strategy Intern",
    years: "2025",
    line: "Helped build an AI health and wellness platform with more than 1,000 users.",
  },
  {
    org: "Ward Lab, Illinois",
    logo: "/film/logos/ward-lab.png",
    role: "Machine Learning Research Associate",
    years: "2024–25",
    line: "Processed satellite imagery and built models that predict habitat suitability for endangered species.",
    link: { href: "https://v0-bird-population-website.vercel.app/", label: "Research site" },
  },
  {
    org: "Illinois Design Challenge",
    logo: "/film/logos/idc.png",
    role: "Infrastructure Lead",
    years: "2024–now",
    line: "Led the infrastructure team building the web platform for the Midwest’s largest cadathon, with 250+ participants.",
  },
  {
    org: "CS 124, Illinois",
    logo: "/film/logos/cs124.png",
    role: "Course Assistant",
    years: "2025–now",
    line: "Helps students build and debug full‑stack apps, from auth to UI.",
    link: { href: "https://illinotes.com/", label: "A student’s app" },
  },
];

export type Project = {
  mark: string; // the giant figure that stands in for a product shot
  markNote: string; // what the figure means
  title: string;
  line: string;
  links: { href: string; label: string }[];
};

export const PROJECTS: Project[] = [
  {
    mark: "1st",
    markNote: "HackIllinois 2025",
    title: "FarmSmart",
    line: "An AI assistant that helps farmers read their own fields: crop‑disease detection at 85% accuracy, plus revenue forecasts.",
    links: [
      { href: "https://devpost.com/software/farmsmart-b8uskz", label: "Devpost" },
      { href: "https://github.com/mridhanbalaji/FarmSmart", label: "Code" },
    ],
  },
  {
    mark: "2nd",
    markNote: "HackIllinois 2026",
    title: "Cat Vision Copilot",
    line: "Computer vision that inspects Caterpillar machinery and flags component defects.",
    links: [
      { href: "https://devpost.com/software/cat-vision", label: "Devpost" },
      { href: "https://github.com/Sriramnat100/HackIllinois26", label: "Code" },
    ],
  },
  {
    mark: "88%",
    markNote: "Drowsiness detection accuracy",
    title: "Calmoto",
    line: "Watches a driver for signs of fatigue in real time, then reads to them and asks questions to keep them alert.",
    links: [
      { href: "https://devpost.com/software/calmoto", label: "Devpost" },
      { href: "https://github.com/ExtraMediumDev/HackNYU", label: "Code" },
    ],
  },
  {
    mark: "500+",
    markNote: "Research openings",
    title: "IlliniResearch",
    line: "Connects Illinois students with research on campus, with an AI cold‑email writer and résumé matcher.",
    links: [{ href: "https://github.com/CS196Illinois/FA24-Group8", label: "Code" }],
  },
];

// Seed Drone gets a scene of its own, between the projects and the research.
export const SEED_DRONE = {
  title: "Seed Drone",
  href: "https://seedrone.vercel.app",
};

// Grouped by department, highest level first; fills a 4-column grid in 3 rows.
export const COURSES = [
  { code: "CS 441", title: "Applied Machine Learning" },
  { code: "CS 421", title: "Programming Languages & Compilers" },
  { code: "CS 411", title: "Database Systems" },
  { code: "CS 374", title: "Algorithms & Models of Computation" },
  { code: "CS 233", title: "Computer Architecture" },
  { code: "CS 225", title: "Data Structures" },
  { code: "CS 173", title: "Discrete Structures" },
  { code: "LING 406", title: "Introduction to Computational Linguistics" },
  { code: "LING 307", title: "Elements of Semantics & Pragmatics" },
  { code: "LING 270", title: "Language, Technology & Society" },
  { code: "STAT 400", title: "Statistics & Probability" },
  { code: "MATH 257", title: "Linear Algebra with Computational Applications" },
];
