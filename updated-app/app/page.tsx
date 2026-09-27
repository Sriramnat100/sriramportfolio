"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Github, Linkedin, Mail, ExternalLink, ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import EducationCarousel from "@/components/EducationCarousel"
import Rolodex from "@/components/Rolodex"
import HeroTitle from "@/components/HeroTitle"
import DioramaSection from "@/components/DioramaSection"
import {
  LighthouseObject,
  TempleObject,
  TreasureChestObject,
  LaunchPadObject,
  ToolsObject,
  BasketballHoopObject,
  PhoneBoothObject,
} from "@/components/hero3d/SceneObjects"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@supabase/supabase-js"

// Three.js/WebGL needs a client-only render — no SSR — and the fallback keeps
// the paper background + name plate in place while the 3D bundle loads.
const Hero3D = dynamic(() => import("@/components/Hero3D"), {
  ssr: false,
  loading: () => (
    <section className="relative flex h-screen w-full items-start justify-center overflow-hidden bg-paper px-6 pt-10 text-center sm:pt-12">
      <HeroTitle animate />
    </section>
  ),
})

// The one shared WebGL canvas every section's display box renders into.
const DioramaCanvas = dynamic(() => import("@/components/DioramaCanvas"), { ssr: false })

const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const NAV = [
  { label: "About", id: "about" },
  { label: "Education", id: "education" },
  { label: "Experience", id: "experience" },
  { label: "Projects", id: "projects" },
  { label: "Skills", id: "skills" },
  { label: "Hobbies", id: "hobbies" },
  { label: "Contact", id: "contact" },
]

// Small stamped chip for a technology / tool name.
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block border-2 border-ink bg-paper px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink">
      {children}
    </span>
  )
}

// Ink button / link — the only button style on the page.
const BTN =
  "toy-shadow-sm inline-flex items-center gap-2 border-2 border-ink bg-ink px-4 py-2 font-mono text-xs font-medium uppercase tracking-[0.15em] text-paper transition-colors hover:bg-accent disabled:opacity-60"
const BTN_GHOST =
  "inline-flex items-center gap-2 border-2 border-ink bg-paper px-4 py-2 font-mono text-xs font-medium uppercase tracking-[0.15em] text-ink transition-colors hover:bg-ink hover:text-paper"

// Expandable course card (Education section)
type Course = { code: string; title: string; tools: string[]; description: string; skills: string[] };
function CourseCard({ course }: { course: Course }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-2 border-ink bg-paper transition-shadow ${open ? "toy-shadow-sm" : ""}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left"
        aria-expanded={open}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="shrink-0 bg-ink px-2 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-paper">
            {course.code}
          </span>
          <span className="font-semibold text-ink">{course.title}</span>
        </div>
        <ChevronDown className={`h-5 w-5 shrink-0 text-ink transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="space-y-4 border-t-2 border-dashed border-ink/40 px-4 pb-5 pt-4">
            <p className="text-sm leading-relaxed text-ink-soft">{course.description}</p>
            <div>
              <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Tools &amp; Languages</div>
              {course.tools.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {course.tools.map((tool) => (
                    <Chip key={tool}>{tool}</Chip>
                  ))}
                </div>
              ) : (
                <span className="text-sm italic text-ink-soft/80">Theory-focused — no coding</span>
              )}
            </div>
            <div>
              <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Skills Learned</div>
              <div className="flex flex-wrap gap-1.5">
                {course.skills.map((skill) => (
                  <Chip key={skill}>{skill}</Chip>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [prompt, setPrompt] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [step, setStep] = useState<"prompt" | "email" | "otp">("prompt");
  const [loading, setLoading] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [headshotUrl, setHeadshotUrl] = useState("/untitled folder 2/SriramHeadshot.jpg");
  const [showPrompt, setShowPrompt] = useState(false);
  const [restatedPrompt, setRestatedPrompt] = useState("");
  const [imagesToday, setImagesToday] = useState(0);
  const maxImagesPerDay = 20;
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [scrolled, setScrolled] = useState(false);
  // The freshly generated headshot, so the "ready" notification can jump
  // straight to it. Back when the headshot was the page's first section,
  // scrollTo(top: 0) landed on it; the 3D island now owns that first
  // viewport, so scrolling to the top shows the island instead.
  const headshotRef = useRef<HTMLDivElement>(null);

  // Hide the nav while the intro splash is on screen; reveal it on scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch today's image generation count on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchImagesToday() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isoToday = today.toISOString();
      try {
        const res = await fetch('/api/images-today?since=' + encodeURIComponent(isoToday));
        const data = await res.json();
        if (isMounted) setImagesToday(data.count || 0);
      } catch (err) {
        // Leave the counter at 0 — the API will still enforce the cap.
        console.error('Could not fetch today\'s generation count:', err);
      }
    }
    fetchImagesToday();
    return () => {
      isMounted = false;
    };
  }, []);

  const imagesLeft = Math.max(0, maxImagesPerDay - imagesToday);

  // Shared image-generation routine. `verifiedFor` is an email we've already
  // confirmed (either via a one-time code, or because it's already in the DB).
  const runGeneration = async (verifiedFor: string) => {
    setLoading(true);
    setShowNotification(true);
    setNotificationMessage("Generating...");
    try {
      const genRes = await fetch('/api/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const genData = await genRes.json().catch(() => ({}));
      // A failed generation used to fall through here with imageUrl undefined
      // and still announce "Image ready!" — check the response for real.
      if (!genRes.ok || !genData.imageUrl) {
        throw new Error(genData.details || genData.error || `Generation failed (${genRes.status})`);
      }
      const imageUrl: string = genData.imageUrl;

      await fetch('/api/submit-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifiedFor, prompt, image_url: imageUrl }),
      });

      setHeadshotUrl(imageUrl);
      setRestatedPrompt(prompt);
      setShowPrompt(true);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isoToday = today.toISOString();
      const res = await fetch('/api/images-today?since=' + encodeURIComponent(isoToday));
      const data = await res.json();
      setImagesToday(data.count || 0);

      setTimeout(() => {
        setNotificationMessage("Image ready! 🎉");
      }, 4000);
    } catch (err) {
      console.error('Error during image generation or DB upload:', err);
      setNotificationMessage("Error generating image.");
    }
    setTimeout(() => {
      setLoading(false);
      setShowGif(false);
    }, 6000);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      setStep("email");
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imagesToday >= maxImagesPerDay) {
      alert("Sorry, it's not free for me to generate images. Come back tomorrow to put me somewhere else :)");
      return;
    }
    if (!email.trim()) return;
    setSendingOtp(true);
    setOtpError("");

    // If this email has generated before, it's already verified — skip the code.
    try {
      const checkRes = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const checkData = await checkRes.json();
      if (checkData.exists) {
        setSendingOtp(false);
        await runGeneration(email.trim());
        return;
      }
    } catch (err) {
      console.error('Email check failed, falling back to code verification:', err);
    }

    // New email — verify ownership with a one-time code.
    const { error } = await supabaseBrowser.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setSendingOtp(false);
    if (error) {
      setOtpError(error.message);
      return;
    }
    setStep("otp");
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setOtpError("");
    const { error: verifyError } = await supabaseBrowser.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: "email",
    });
    if (verifyError) {
      setOtpError("Invalid or expired code. Try again.");
      return;
    }

    await runGeneration(email.trim());
  };

  const stats = [
    { label: "Hackathon wins", value: "4" },
    { label: "Years building", value: "7+" },
    { label: "Users reached", value: "1000+" },
  ]

  const experience = [
    {
      title: "Forward Deployed Software Engineer Intern",
      company: "C3 AI",
      logo: "/logos/c3l.png",
      period: "May 2026 - August 2026",
      location: "Redwood City, CA",
      description: [
        "-Member of Federal Team"
      ],
      technologies: ["Python", "SQL", "C3 AI Platform"]
    },

    {
      title: "Embedded Software Engineer Intern",
      company: "Rivian",
      logo: "/logos/rivianlogo.png",
      period: "February 2026 - May 2026",
      location: "Champaign, IL",
      description: [
        "-Worked on Inverter Team"
      ],
      technologies: ["Python", "C++", "C"]
    },


    {
      title: "Software and Strategy Intern",
      company: "Hacker Dojo",
      logo: "/logos/hdfinal.png",
      period: "April 2025 - August 2025",
      location: "Mountain View, CA",
      description: [
        "-Contributed to AI-driven health & wellness platform (1000+ users)"

      ],
      technologies: ["Python", "Flask", "AWS", "OpenAI API", "React"]
    },
    {
      title: "Course Assistant<br />Computer Science 124",
      company: "University of Illinois Urbana-Champaign",
      logo: "/logos/uiuc.png",
      period: "January 2025 - Present",
      location: "Urbana, IL",
      description: [
        "-Assisted students to develop and debug a full-stack application with user authentication, backend APIs, and frontend UI"
      ],
      technologies: ["Teaching", "Debugging", "Full-Stack"],
      demo: "https://illinotes.com/",
      demoLabel: "one of my students' websites"
    },
    {
      title: "Machine Learning<br />Research Associate",
      company: "University of Illinois, Ward Lab",
      logo: "/logos/fwlab.png",
      period: "October 2024 - June 2025",
      location: "Urbana, IL",
      description: [
        "-Processed satellite imagery and developed Machine Learning Models to predict habitat suitability of endangered species"
      ],
      technologies: ["Python", "MATLAB", "TensorFlow", "PyTorch"],
      demo: "https://v0-bird-population-website.vercel.app/",
      demoLabel: "Research Website"
    },
    {
      title: "Infrastructure Lead",
      company: "Illinois Design Challenge",
      logo: "/logos/idclogo.jpeg",
      period: "September 2024 - Present",
      location: "Urbana, IL",
      description: [
       " -Led infrastructure team in constructing a web platform for the Midwest's largest cadathon (over 250 participants)"
      ],
      technologies: ["Flask", "React", "PostgreSQL", "REST APIs"]
    },
    {
      title: "Software Engineer Intern",
      company: "Gies Disruption Labs",
      logo: "/logos/gies.png",
      period: "September 2024 - December 2025",
      location: "Urbana, IL",
      description: [
        "-Engineered a 6-axis Robotic Arm, optimizing real-time path planning and obstacle avoidance algorithms"
      ],
      technologies: ["C++", "Arduino", "AWS RDS", "3D Printing", "ROS", "Gazebo"],
      demo: "https://v0-lerobot-arm.vercel.app/"
    },

  ]

  const projects = [
    {
      title: "Cat Vision Copilot (Second Place Hack Illinois)",
      period: "Feb 2026 - Mar 2026",
      description: [
        "Built an AI-powered inspection system to detect and analyze component defects on Caterpillar machinery"
      ],
      technologies: ["YOLO", "TypeScript", "OpenAI API", "TensorFlow", "Supabase"],
      featured: true,
      category: "AI/ML",
      longDescription: "Built an AI-powered inspection system to detect and analyze component defects on Caterpillar machinery",
      github: "https://github.com/Sriramnat100/HackIllinois26",
      demo: "https://devpost.com/software/cat-vision",
      image: "/untitled folder 2/cvc.jpg"
    },

    {
      title: "FarmSmart (First Place Hack Illinois)",
      period: "Feb 2025 - Mar 2025",
      description: [
        "Launched an interactive AI Chatbot (OpenAI API) to help farmers optimize crop yield and costs through data-driven insights.",
        "Displayed real-time revenue predictions for farmers' crops via React Native and Chart.js visualizations.",
        "Programmed and trained a TensorFlow and OpenCV model to detect plant disease, achieving 85% accuracy."
      ],
      technologies: ["OpenAI API", "React Native", "Chart.js", "TensorFlow", "OpenCV"],
      featured: true,
      category: "AI/ML",
      longDescription: "FarmSmart is an award-winning AI chatbot that helps farmers optimize crop yield and costs through data-driven insights, real-time revenue predictions, and plant disease detection.",
      stats: { users: "1000+", rating: 4.8, downloads: "2K+" },
      github: "https://github.com/mridhanbalaji/FarmSmart",
      demo: "https://devpost.com/software/farmsmart-b8uskz",
      image: "/untitled folder 2/farmsmartlogo.jpg"
    },
    {
      title: "Calmoto",
      period: "Dec 2024 - Feb 2025",
      description: [
        "Designed a real-time driver drowsiness detection system using TensorFlow, OpenCV, & Pytorch, achieving 88% accuracy in detecting fatigue indicators.",
        "Integrated LLMs (ElevenLabs, OpenAI) to read books and generate interactive questions to ensure drivers were awake/alert."
      ],
      technologies: ["TensorFlow", "OpenCV", "PyTorch", "ElevenLabs", "OpenAI"],
      featured: true,
      category: "AI/ML",
      longDescription: "Calmoto is a real-time driver drowsiness detection system with interactive LLM-based engagement to ensure driver alertness.",
      stats: { users: "500+", rating: 4.7, downloads: "1K+" },
      github: "https://github.com/ExtraMediumDev/HackNYU",
      demo: "https://devpost.com/software/calmoto",
      image: "/untitled folder 2/testThing.jpg"
    },
    {
      title: "IlliniResearch",
      period: "Sep 2024 - Dec 2024",
      description: [
        "Designed and implemented a Flask-based platform to connect UIUC students to research opportunities on campus (stored in SQL database). ",
        "Implemented AI Features such as Cold Email Generator (used Chat GPT API to tailor emails specifically to a professor's specific projects) and Resume Reviewer (used a TfIdf vectorizer to compare a resume and job description)."
      ],
      technologies: ["Java", "Android", "REST APIs", "SQLite", "JUnit"],
      featured: false,
      category: "Web App",
      longDescription: "IlliniResearch is a mobile app connecting UIUC students to 500+ research opportunities, with robust offline and online access.",
      stats: { users: "500+", rating: 4.6, downloads: "1K+" },
      github: "https://github.com/CS196Illinois/FA24-Group8",
      demo: "https://linktr.ee/sriramnat6",
      image: "/untitled folder 2/illiniresearch.png"
    },
    {
      title: "Seed Drone",
      period: "Sep 2023 - Jul 2024",
      description: [
        "Engineered a real-time embedded seed-dispersing sub-system in C++ using Arduino microcontrollers and servo motors. ",
        "Leveraged AWS RDS to develop a GPS coordinate tracking system to monitor seed growth over time.",
        " CAD-modeled, 3D-printed, and field-tested a drone payload subsystem for automated seed deployment (over 3,000 seedballs planted)."
      ],
      technologies: ["C++", "Arduino", "AWS RDS", "3D Printing"],
      featured: false,
      category: "IoT/Embedded",
      longDescription: "Seed Drone is an innovative drone-based system for automated seed dispersal and environmental monitoring.",
      stats: { users: "N/A", rating: 4.5, downloads: "N/A" },
      github: "#",
      demo: "https://seedrone.vercel.app",
      image: "/untitled folder 2/btlogo.png"
    },
    {
      title: "Alzheimer's Researcher",
      period: "Sep 2024 - Present",
      description: [
        "Developed a CNN in TensorFlow and Keras to classify MRI scans for early Alzheimer's detection. Designed a Sequential CNN architecture with Conv2D and used BinaryCrossentropy for precise label learning, applied data augmentation, and optimized with SGD and a learning-rate scheduler. Tracked performance with accuracy/loss visualizations."
      ],
      technologies: ["Flask", "React", "PostgreSQL", "REST APIs"],
      featured: false,
      category: "Research",
      longDescription: "Illinois Design Challenge is a full-stack hackathon platform supporting hundreds of participants and live event management.",
      stats: { users: "500+", rating: 4.7, downloads: "1K+" },
      github: "https://github.com/Sriramnat100/ASDRP_Files",
      demo: "https://github.com/Sriramnat100/ASDRP_Files",
      image:"/untitled folder 2/alzhiemersresearch.png"
    },
  ]

  const hobbies = [
    { name: "Running", image: "/untitled folder 2/runningpic.jpg", tilt: "-rotate-2" },
    { name: "Basketball", image: "/untitled folder 2/balltuff.png", tilt: "rotate-1" },
    { name: "Music", image: "/untitled folder 2/uziconcert.jpg", tilt: "-rotate-1" },
  ]

  // Grouped plainly — no made-up proficiency percentages.
  const skillGroups: { label: string; items: string[] }[] = [
    { label: "Languages", items: ["Python", "C++", "Java", "JavaScript / TypeScript", "SQL"] },
    { label: "ML & Data", items: ["TensorFlow", "PyTorch", "OpenCV", "scikit-learn", "NumPy", "Pandas"] },
    { label: "Web & Cloud", items: ["React", "Flask", "REST APIs", "PostgreSQL", "AWS (EC2, S3, RDS)", "Supabase"] },
    { label: "Tools", items: ["Git / GitHub", "Arduino", "ROS", "3D Printing"] },
  ]

  const about = `I'm a Computer Science and Linguistics major at the University of Illinois Urbana-Champaign, also pursuing a minor in Data Science. I love building things that sit at the intersection of software, machine learning, and real-world impact. I'm especially excited by projects that blend AI with practical problem-solving, and I'm always down to collaborate, learn something new, or chase an idea that feels a little too ambitious.`;
  const education = {
    school: "University of Illinois, Urbana-Champaign",
    grad: "Expected Graduation: 05/2028",
    major: "Computer Science + Linguistics",
    minor: "Data Science",
    gpa: "3.85/4.0",
  };

  const courses = [
    {
      code: "CS 374",
      title: "Intro to Algorithms & Models of Computation",
      tools: [],
      description:
        "Analysis of algorithms and the major paradigms of algorithm design: recursion, divide-and-conquer, dynamic programming, greedy, and graph algorithms. Covers formal models of computation (finite automata, Turing machines) and the limits of computation — reductions, undecidability, and NP-completeness.",
      skills: ["Dynamic Programming", "Divide & Conquer", "Greedy Algorithms", "Graph Algorithms", "Finite Automata", "Turing Machines", "NP-Completeness", "Reductions"],
    },
    {
      code: "CS 411",
      title: "Database Systems",
      tools: ["SQL", "Python", "JavaScript"],
      description:
        "The logical organization of databases: entity-relationship modeling and the relational model. Functional dependencies and normalization, query-language design and optimization, security and integrity, concurrency control, and distributed databases.",
      skills: ["Relational Modeling", "ER Diagrams", "Normalization", "Query Optimization", "Concurrency Control", "Distributed Databases"],
    },
    {
      code: "CS 225",
      title: "Data Structures",
      tools: ["C++"],
      description:
        "Core data structures — lists, stacks, queues, and trees — implemented in an object-oriented language. Solving computational problems with searches over graphs and trees, plus elementary analysis of algorithms.",
      skills: ["Lists / Stacks / Queues", "Trees", "Graphs", "Object-Oriented Programming", "Algorithm Analysis", "Memory Management"],
    },
    {
      code: "CS 233",
      title: "Computer Architecture",
      tools: ["Verilog", "Assembly", "C"],
      description:
        "Fundamentals of computer architecture from the logic-gate level up: digital logic design, machine-level programming, performance models of modern architectures, and hardware primitives for parallelism and security.",
      skills: ["Digital Logic Design", "Machine-Level Programming", "Performance Optimization", "Parallelism", "Hardware Security"],
    },
    {
      code: "CS 173",
      title: "Discrete Structures",
      tools: [],
      description:
        "Discrete mathematical structures used throughout computer science: sets, propositions, Boolean algebra, induction, recursion, relations, functions, and graphs.",
      skills: ["Set Theory", "Logic & Boolean Algebra", "Mathematical Induction", "Recursion", "Relations & Functions", "Graph Theory", "Proof Techniques"],
    },
    {
      code: "STAT 400",
      title: "Statistics & Probability",
      tools: ["R"],
      description:
        "Mathematical statistics built on probability: the calculus of probability, random variables, expectation, distribution functions, the central limit theorem, point estimation, confidence intervals, and hypothesis testing.",
      skills: ["Probability Theory", "Random Variables", "Distributions", "Central Limit Theorem", "Estimation", "Confidence Intervals", "Hypothesis Testing"],
    },
    {
      code: "MATH 257",
      title: "Linear Algebra with Computational Applications",
      tools: ["Python", "NumPy"],
      description:
        "Linear algebra with hands-on computation and data-science applications: linear systems, matrix operations, vector spaces, linear transformations, eigenvalues and eigenvectors, orthogonality, linear regression, linear dynamical systems, and the singular value decomposition.",
      skills: ["Matrix Operations", "Vector Spaces", "Linear Transformations", "Eigenvalues & Eigenvectors", "Orthogonality", "Linear Regression", "SVD"],
    },
    {
      code: "LING 270",
      title: "Language, Technology & Society",
      tools: [],
      description:
        "How humans built technologies to augment language — from writing and printing into the digital age. Explores automatic speech recognition, speech synthesis, and machine translation, the machine-learning theory behind them, and how they shape human-machine interaction.",
      skills: ["NLP Concepts", "Speech Recognition", "Speech Synthesis", "Machine Translation", "How ML Models Work", "Human-Machine Interaction"],
    },
  ];

  const featuredProjects = projects.filter((p) => p.featured)
  const otherProjects = projects.filter((p) => !p.featured)

  return (
    <>
      {/* Notification Popup */}
      {showNotification && (
        <div className="toy-shadow fixed right-6 top-6 z-[9999] flex items-center gap-4 border-[3px] border-ink bg-paper px-5 py-3.5 text-ink">
          <span className="font-mono text-xs uppercase tracking-[0.15em]">{notificationMessage}</span>
          {notificationMessage === "Image ready! 🎉" && (
            <button
              className="border-2 border-ink bg-ink px-3 py-1.5 font-mono text-xs uppercase tracking-[0.15em] text-paper transition-colors hover:bg-accent"
              onClick={() =>
                headshotRef.current?.scrollIntoView({
                  block: "center",
                  behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth",
                })
              }
            >
              See it
            </button>
          )}
          <button
            className="text-xl leading-none text-ink-soft hover:text-ink"
            onClick={() => setShowNotification(false)}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      )}

      <DioramaCanvas />

      <div className="min-h-screen overflow-x-hidden bg-paper text-ink">
      {/* Navigation */}
      <nav className={`fixed top-0 z-50 w-full border-b-[3px] border-ink bg-paper transition-transform duration-500 ${scrolled ? "translate-y-0" : "-translate-y-full"}`}>
        <div className="flex items-center justify-between gap-6 px-4 py-2 sm:px-6 lg:px-8">
          <Link href="/#" className="font-display text-2xl uppercase leading-none tracking-wide text-ink">
            Sriram Natarajan
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* 3D hero — interactive archipelago, click an island to jump to a section */}
      <Hero3D />

      {/* ------------------------------------------------------------------ */}
      {/* 01 · About — the lighthouse                                          */}
      <DioramaSection id="about" index={1} title="About" tagline="Lighthouse" Object={LighthouseObject}>
        <p className="max-w-3xl text-2xl font-medium leading-snug text-ink sm:text-3xl">
          I build things at the intersection of software, machine learning, and real-world impact.
        </p>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">{about}</p>

        {/* Stat stickers */}
        <div className="mt-10 flex flex-wrap gap-5">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`toy-shadow-sm border-[3px] border-ink bg-paper px-5 py-3 ${i % 2 === 0 ? "-rotate-1" : "rotate-1"}`}
            >
              <div className="font-display text-4xl leading-none text-ink">{stat.value}</div>
              <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/#contact" className={BTN}>
            <Mail className="h-4 w-4" />
            Get in touch
          </Link>
          {[
            { icon: Github, href: "https://github.com/Sriramnat100", label: "GitHub" },
            { icon: Linkedin, href: "https://www.linkedin.com/in/sriramnat/", label: "LinkedIn" },
          ].map((social) => (
            <Link
              key={social.label}
              href={social.href}
              className="flex h-10 w-10 items-center justify-center border-2 border-ink text-ink transition-colors hover:bg-ink hover:text-paper"
              aria-label={social.label}
            >
              <social.icon className="h-5 w-5" />
            </Link>
          ))}
        </div>

        {/* Headshot + repaint-the-backdrop generator */}
        <div className="mt-16 grid gap-8 border-t-2 border-dashed border-ink/40 pt-12 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-12">
          <div ref={headshotRef} className="toy-box relative w-full max-w-xs justify-self-center bg-paper p-3 md:justify-self-start">
            {loading || showGif ? (
              <img src="/untitled folder 2/pandaForwardRoll.gif" alt="Loading..." className="aspect-square w-full border-2 border-ink object-cover" />
            ) : (
              <Image
                src={headshotUrl}
                alt="Sriram Natarajan"
                width={600}
                height={600}
                className="w-full border-2 border-ink"
              />
            )}
            <div className="mt-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
              <span>Fig. 1</span>
              <span>{showPrompt ? "Custom paint" : "Factory paint"}</span>
            </div>
          </div>

          <div className="min-w-0">
            {loading ? (
              <div>
                <h3 className="font-display text-3xl uppercase text-ink">Working on it…</h3>
                <p className="mt-2 text-ink-soft">Feel free to keep scrolling — I&apos;ll let you know when it&apos;s ready.</p>
              </div>
            ) : imagesLeft === 0 ? (
              <div>
                <h3 className="font-display text-3xl uppercase text-ink">Sold out for today</h3>
                <p className="mt-2 text-ink-soft">Out of free generations — come back tomorrow.</p>
              </div>
            ) : showPrompt ? (
              <div>
                <h3 className="font-display text-3xl uppercase text-ink">You said:</h3>
                <p className="mt-2 text-lg italic text-ink-soft">&ldquo;{restatedPrompt}&rdquo;</p>
              </div>
            ) : (
              <form
                onSubmit={step === 'prompt' ? handlePromptSubmit : step === 'email' ? handleEmailSubmit : handleOtpSubmit}
                className="toy-shadow border-[3px] border-ink bg-paper-2 p-6"
              >
                <div className="stamp mb-4 -rotate-1">Custom paint job</div>
                {step === 'prompt' ? (
                  <>
                    <h3 className="font-display text-3xl uppercase leading-none text-ink">Not a fan of the orange backdrop?</h3>
                    <p className="mb-4 mt-3 text-sm text-ink-soft">
                      Type a scene and an AI model will re-shoot my headshot there. Genuinely — try it.
                    </p>
                    <Textarea
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      placeholder="e.g. put Sriram in a futuristic city on Mars"
                      className="rounded-none border-2 border-ink bg-paper text-ink placeholder:text-ink-soft/60 focus-visible:border-accent focus-visible:ring-0"
                      rows={3}
                    />
                    <button type="submit" className={`${BTN} mt-4 w-full justify-center`}>
                      Generate a new background
                    </button>
                  </>
                ) : step === 'email' ? (
                  <>
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Your email (no code sent if you've verified before)"
                      className="rounded-none border-2 border-ink bg-paper text-ink placeholder:text-ink-soft/60 focus-visible:border-accent focus-visible:ring-0"
                    />
                    {otpError && <div className="mt-2 text-sm text-accent">{otpError}</div>}
                    <button type="submit" disabled={sendingOtp} className={`${BTN} mt-4 w-full justify-center`}>
                      {sendingOtp ? "Sending code…" : "Send me a code"}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-3 text-sm text-ink-soft">
                      Check <span className="font-semibold text-ink">{email}</span> for a 6-digit code.
                    </div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      placeholder="6-digit code"
                      className="rounded-none border-2 border-ink bg-paper text-center tracking-widest text-ink placeholder:text-ink-soft/60 focus-visible:border-accent focus-visible:ring-0"
                    />
                    {otpError && <div className="mt-2 text-sm text-accent">{otpError}</div>}
                    <button type="submit" className={`${BTN} mt-4 w-full justify-center`}>
                      Verify &amp; generate
                    </button>
                  </>
                )}
                <div className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-ink-soft">
                  {imagesLeft}/20 free today — this costs me real money
                </div>
              </form>
            )}
          </div>
        </div>
      </DioramaSection>

      {/* ------------------------------------------------------------------ */}
      {/* 02 · Education — the temple                                          */}
      <DioramaSection id="education" index={2} title="Education" tagline="Temple" Object={TempleObject}>
        <h3 className="font-display text-4xl uppercase leading-[0.95] text-ink sm:text-5xl">
          University of Illinois
          <br />
          <span className="text-accent">Urbana-Champaign</span>
        </h3>
        <div className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
          Expected graduation · {education.grad.replace('Expected Graduation: ', '')}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Major", value: education.major },
            { label: "Minor", value: education.minor },
            { label: "GPA", value: education.gpa },
          ].map((item) => (
            <div key={item.label} className="border-[3px] border-ink bg-paper p-4">
              <div className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-accent">{item.label}</div>
              <div className="text-lg font-semibold leading-snug text-ink">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="lg:h-full">
            <EducationCarousel />
          </div>
          <div>
            <h4 className="font-display text-2xl uppercase text-ink">Relevant coursework</h4>
            <p className="mb-4 mt-1 text-sm text-ink-soft">Tap a course to see what I learned and the tools I used.</p>
            <div className="space-y-3">
              {courses.map((course) => (
                <CourseCard key={course.code} course={course} />
              ))}
            </div>
          </div>
        </div>
      </DioramaSection>

      {/* ------------------------------------------------------------------ */}
      {/* 03 · Experience — the treasure chest                                 */}
      <DioramaSection id="experience" index={3} title="Experience" tagline="Chest" Object={TreasureChestObject}>
        <h3 className="font-display text-4xl uppercase leading-[0.95] text-ink sm:text-5xl">Where I&apos;ve worked</h3>

        <div className="mt-8 border-t-[3px] border-ink">
          {experience.map((exp, index) => (
            <div key={index} className="grid gap-3 border-b-2 border-dashed border-ink/40 py-7 sm:grid-cols-[10rem_1fr] sm:gap-8">
              <div className="pt-1">
                {/* "February 2026 - May 2026" → "Feb 2026 – May 2026": fits the stamp */}
                <div className="stamp leading-[1.5]">{exp.period.replace(/([A-Za-z]{3})[a-z]+ /g, "$1 ").replace(" - ", " – ")}</div>
                <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft">{exp.location}</div>
              </div>

              <div className="min-w-0">
                <div className="flex items-start gap-4">
                  <Image
                    src={exp.logo}
                    alt={`${exp.company} logo`}
                    width={64}
                    height={64}
                    className="h-12 w-12 shrink-0 border-2 border-ink bg-white object-contain object-center p-1"
                  />
                  <div className="min-w-0">
                    <h4 className="text-lg font-semibold leading-tight text-ink sm:text-xl">
                      {exp.title.includes('<br') ? (
                        <span dangerouslySetInnerHTML={{ __html: exp.title.replace(/<br\s*\/?>/g, ' ') }} />
                      ) : (
                        exp.title
                      )}
                    </h4>
                    <p className="mt-0.5 font-mono text-xs uppercase tracking-[0.15em] text-accent">{exp.company}</p>
                  </div>
                </div>

                <div className="mt-3">
                  {exp.description.map((desc, i) => (
                    <p key={i} className="mb-2 leading-relaxed text-ink-soft">{desc.replace(/^\s*-\s*/, "")}</p>
                  ))}
                </div>

                {"demo" in exp && exp.demo ? (
                  <Link
                    href={exp.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-3 inline-flex items-center gap-1.5 border-b-2 border-ink text-sm font-medium text-ink transition-colors hover:border-accent hover:text-accent"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    {"demoLabel" in exp && exp.demoLabel ? exp.demoLabel : "Lerobot Project"}
                  </Link>
                ) : null}

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {exp.technologies.map((tech) => (
                    <Chip key={tech}>{tech}</Chip>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DioramaSection>

      {/* ------------------------------------------------------------------ */}
      {/* 04 · Projects — the launch pad                                       */}
      <DioramaSection id="projects" index={4} title="Projects" tagline="Launch pad" Object={LaunchPadObject}>
        <h3 className="font-display text-4xl uppercase leading-[0.95] text-ink sm:text-5xl">Things I&apos;ve built</h3>

        {/* Featured */}
        <div className="mt-8 space-y-10">
          {featuredProjects.map((project) => (
            <article key={project.title} className="toy-box bg-paper">
              <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <div className="relative aspect-[2/1] border-b-[3px] border-ink md:aspect-auto md:border-b-0 md:border-r-[3px]">
                  <Image
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="stamp">{project.category}</span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-ink-soft">{project.period}</span>
                  </div>
                  <h4 className="mt-4 font-display text-2xl uppercase leading-[1] text-ink sm:text-3xl">{project.title}</h4>
                  <p className="mt-3 leading-relaxed text-ink-soft">{project.longDescription}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <Chip key={tech}>{tech}</Chip>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={project.github} className={BTN}>
                      <Github className="h-4 w-4" />
                      Code
                    </Link>
                    <Link href={project.demo} className={BTN_GHOST}>
                      <ExternalLink className="h-4 w-4" />
                      Demo
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* The rest of the shelf */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {otherProjects.map((project) => (
            <article key={project.title} className="toy-shadow flex flex-col border-[3px] border-ink bg-paper">
              <div className="relative aspect-[3/2] border-b-[3px] border-ink">
                <Image
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">{project.category}</div>
                <h4 className="mt-2 font-display text-2xl uppercase leading-none text-ink">{project.title}</h4>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{project.description[0]}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.technologies.slice(0, 4).map((tech) => (
                    <Chip key={tech}>{tech}</Chip>
                  ))}
                </div>
                <div className="mt-auto flex gap-3 pt-5">
                  {project.title === "Seed Drone" ? (
                    <Link
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={BTN_GHOST}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Demo
                    </Link>
                  ) : (
                    <>
                      <Link href={project.github} className={BTN_GHOST}>
                        <Github className="h-4 w-4" />
                        Code
                      </Link>
                      <Link href={project.demo} className={BTN_GHOST}>
                        <ExternalLink className="h-4 w-4" />
                        Demo
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </DioramaSection>

      {/* ------------------------------------------------------------------ */}
      {/* 05 · Skills — the tool stump                                         */}
      <DioramaSection id="skills" index={5} title="Skills" tagline="Tool stump" Object={ToolsObject}>
        <h3 className="font-display text-4xl uppercase leading-[0.95] text-ink sm:text-5xl">Tools I reach for</h3>

        <div className="mt-8 space-y-8">
          {skillGroups.map((group) => (
            <div key={group.label}>
              <div className="mb-3 inline-block bg-ink px-3 py-1 font-display text-lg uppercase tracking-wide text-paper">
                {group.label}
              </div>
              <div className="flex flex-wrap gap-3">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="toy-shadow-sm border-2 border-ink bg-paper px-3.5 py-2 font-mono text-sm text-ink"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DioramaSection>

      {/* ------------------------------------------------------------------ */}
      {/* 06 · Hobbies — the basketball hoop                                   */}
      <DioramaSection id="hobbies" index={6} title="Hobbies" tagline="Hoop" Object={BasketballHoopObject}>
        <h3 className="font-display text-4xl uppercase leading-[0.95] text-ink sm:text-5xl">When I&apos;m not coding</h3>

        <div className="mt-10 grid gap-10 sm:grid-cols-2 xl:grid-cols-3">
          {hobbies.map((hobby) => (
            <figure key={hobby.name} className={`toy-shadow relative border-[3px] border-ink bg-paper p-3 pb-4 ${hobby.tilt}`}>
              {/* tape */}
              <div className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3 bg-accent/80" aria-hidden />
              <div className="relative aspect-[4/5] border-2 border-ink">
                <Image
                  src={hobby.image || "/placeholder.svg"}
                  alt={hobby.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 font-display text-2xl uppercase leading-none text-ink">{hobby.name}</figcaption>
            </figure>
          ))}
        </div>
      </DioramaSection>

      {/* ------------------------------------------------------------------ */}
      {/* 07 · Contact — the phone booth                                       */}
      <DioramaSection id="contact" index={7} title="Contact" tagline="Phone booth" Object={PhoneBoothObject}>
        <h3 className="font-display text-4xl uppercase leading-[0.95] text-ink sm:text-5xl">Get in touch</h3>
        <p className="mt-3 max-w-2xl text-lg text-ink-soft">
          Flip through the rolodex — email is the fastest way to reach me, and I actually reply.
        </p>

        <div className="mt-10 grid items-center gap-12 lg:grid-cols-2">
          <Rolodex />

          <figure className="toy-shadow relative w-full max-w-sm justify-self-center rotate-1 border-[3px] border-ink bg-paper p-3 pb-4">
            <div className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-2 bg-accent/80" aria-hidden />
            <Image
              src="/untitled folder 2/nbastore.jpeg"
              alt="Me at the NBA Store"
              width={500}
              height={642}
              className="h-auto w-full border-2 border-ink"
            />
            <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">NBA Store, NYC</figcaption>
          </figure>
        </div>
      </DioramaSection>

      {/* Footer */}
      <footer className="border-t-[3px] border-ink bg-ink px-4 py-12 text-paper sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 grid gap-10 md:grid-cols-3">
            <div>
              <div className="font-display text-3xl uppercase leading-none tracking-wide">Sriram Natarajan</div>
              <div className="mt-4 flex gap-3">
                {[
                  { icon: Github, href: "https://github.com/Sriramnat100", label: "GitHub" },
                  { icon: Linkedin, href: "https://www.linkedin.com/in/sriramnat/", label: "LinkedIn" },
                ].map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    className="flex h-9 w-9 items-center justify-center border-2 border-paper text-paper transition-colors hover:bg-paper hover:text-ink"
                    aria-label={social.label}
                  >
                    <social.icon className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-paper/60">Index</h4>
              <ul className="space-y-1.5">
                {NAV.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="font-mono text-xs uppercase tracking-[0.15em] text-paper transition-colors hover:text-accent">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-paper/60">Colophon</h4>
              <p className="max-w-xs text-sm leading-relaxed text-paper/80">
                Designed and built by me with Next.js and three.js, set in Anton and IBM Plex.
                Every figure on this page is hand-modelled — go spin them.
              </p>
            </div>
          </div>

          <div className="border-t-2 border-paper/20 pt-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-paper/60">
              © 2026 Sriram Natarajan · Champaign–Fremont
            </p>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}
