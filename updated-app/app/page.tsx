"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Code,
  Database,
  Globe,
  Smartphone,
  Brain,
  Zap,
  Users,
  Trophy,
  Download,
  Star,
  Calendar,
  MapPin,
  Eye,
  ChevronRight,
  Play,
  Clock,
  Rocket,
  Camera,
  Gamepad2,
  Music,
  Plane,
  BookOpen,
  Coffee,
  ChevronLeft,
  ChevronDown,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import IntroSplash from "@/components/IntroSplash"
import EducationCarousel from "@/components/EducationCarousel"
import VinylPlayer from "@/components/VinylPlayer"
import VisitorMap from "@/components/VisitorMap"
import Rolodex from "@/components/Rolodex"
import { useState, useEffect, useRef } from "react"
import { createClient } from "@supabase/supabase-js"

const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Expandable course card (Education section)
type Course = { code: string; title: string; tools: string[]; description: string; skills: string[] };
function CourseCard({ course }: { course: Course }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-line bg-paper overflow-hidden transition-colors hover:border-accent/50">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="shrink-0 font-mono text-xs font-medium text-accent border border-accent/40 px-2.5 py-1">
            {course.code}
          </span>
          <span className="font-semibold text-ink">{course.title}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-ink-soft shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 space-y-4">
            <p className="text-ink-soft text-sm leading-relaxed">{course.description}</p>
            <div>
              <div className="font-mono text-accent text-xs uppercase tracking-wider mb-2">Tools &amp; Languages</div>
              {course.tools.length ? (
                <div className="flex flex-wrap gap-2">
                  {course.tools.map((tool) => (
                    <span key={tool} className="font-mono text-ink border border-line bg-paper-2 px-2.5 py-1 text-xs">
                      {tool}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-ink-soft/80 text-sm italic">Theory-focused — no coding</span>
              )}
            </div>
            <div>
              <div className="font-mono text-accent text-xs uppercase tracking-wider mb-2">Skills Learned</div>
              <div className="flex flex-wrap gap-2">
                {course.skills.map((skill) => (
                  <span key={skill} className="font-mono text-ink-soft border border-line px-2.5 py-1 text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setCount(Math.floor(progress * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return (
    <span>
      {count}
      {suffix}
    </span>
  )
}

// Define Skill type
interface Skill {
  name: string;
  level: number;
  icon: any;
  projects: number;
}

// Typing effect for hero headline
function useTypingEffect(text: string, speed: number = 60) {
  const [displayed, setDisplayed] = useState("");
  const hasTyped = useRef(false);

  useEffect(() => {
    if (hasTyped.current) return; // Only run once, ever
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text[i]);
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        hasTyped.current = true;
      }
    }, speed);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, []); // Only run on mount

  return hasTyped.current ? text : displayed;
}

export default function Portfolio() {
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      const res = await fetch('/api/images-today?since=' + encodeURIComponent(isoToday));
      const data = await res.json();
      if (isMounted) {
        console.log('Fetched images today:', data.count);
        setImagesToday(data.count || 0);
      }
    }
    fetchImagesToday();
    return () => {
      isMounted = false;
    };
  }, []);

  const imagesLeft = Math.max(0, maxImagesPerDay - imagesToday);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    alert("Message sent! I'll get back to you soon.")
  }

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
      const genData = await genRes.json();
      const imageUrl = genData.imageUrl;

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
    { label: "Hackathon Wins", value: 4 },
    { label: "Years Experience", value: 7, suffix: "+" },
    { label: "Users Reached (Across Projects)", value: 1000, suffix: "+" },
   
  ]

  const experience = [
    {
      title: "Forward Deployed Software Engineer Intern",
      company: "C3 AI",
      logo: "/logos/c3l.png",
      period: "May 2026 - Present",
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
      title: "Beyond Terra",
      period: "Sep 2023 - Jul 2024",
      description: [
        "Engineered a real-time embedded seed-dispersing sub-system in C++ using Arduino microcontrollers and servo motors. ",
        "Leveraged AWS RDS to develop a GPS coordinate tracking system to monitor seed growth over time.",
        " CAD-modeled, 3D-printed, and field-tested a drone payload subsystem for automated seed deployment (over 3,000 seedballs planted)."
      ],
      technologies: ["C++", "Arduino", "AWS RDS", "3D Printing"],
      featured: false,
      category: "IoT/Embedded",
      longDescription: "Beyond Terra is an innovative drone-based system for automated seed dispersal and environmental monitoring.",
      stats: { users: "N/A", rating: 4.5, downloads: "N/A" },
      github: "#",
      demo: "https://drive.google.com/drive/u/1/folders/1qRmqG-BfqBlJLqzdnd1UOSWiOVFkGsKW",
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
    {
      name: "Running",
      description: "",
      icon: () => <span role="img" aria-label="Running">🏃‍♂️</span>,
      image: "/untitled folder 2/runningpic.jpg",
      color: "",
    },
    {
      name: "Basketball",
      description: "",
      icon: () => <span role="img" aria-label="Basketball">🏀</span>,
      image:  "/untitled folder 2/balltuff.png",
      color: "",
    },
    {
      name: "Music",
      description: "",
      icon: () => <span role="img" aria-label="Music">🎤</span>,
      image: "/untitled folder 2/uziconcert.jpg",
      color: "",
    },
  ]

  // Grouped plainly — no made-up proficiency percentages.
  const skillGroups: { label: string; items: string[] }[] = [
    { label: "Languages", items: ["Python", "C++", "Java", "JavaScript / TypeScript", "SQL"] },
    { label: "ML & Data", items: ["TensorFlow", "PyTorch", "OpenCV", "scikit-learn", "NumPy", "Pandas"] },
    { label: "Web & Cloud", items: ["React", "Flask", "REST APIs", "PostgreSQL", "AWS (EC2, S3, RDS)", "Supabase"] },
    { label: "Tools", items: ["Git / GitHub", "Arduino", "ROS", "3D Printing"] },
  ]

  const name = "Sriram Natarajan";
  const contact = {
    phone: "510-755-7614",
    email: "sriram6@illinois.edu",
    location: "Fremont, California",
    citizenship: "US Citizen",
    linkedin: "https://www.linkedin.com/in/sriramnat/"
  };
  const about = `Hi! I'm Sriram Natarajan, a Computer Science and Linguistics major at the University of Illinois Urbana-Champaign, also pursuing a minor in Data Science. I love building things that sit at the intersection of software, machine learning, and real-world impact. I'm especially excited by projects that blend AI with practical problem-solving, and I'm always down to collaborate, learn something new, or chase an idea that feels a little too ambitious.`;
  const education = {
    school: "University of Illinois, Urbana-Champaign",
    grad: "Expected Graduation: 05/2028",
    major: "Computer Science + Linguistics",
    minor: "Data Science",
    gpa: "3.85/4.0",
    coursework: [
      "Intro to Algorithms & Models of Computation",
      "Data Structures & Algorithms (C++)",
      "Computer Architecture (C++)",
      "Database Systems (SQL)",
    ]
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

  const typedText = useTypingEffect("Hi, I'm Sriram Natarajan", 60);
  const isComplete = typedText === "Hi, I'm Sriram Natarajan";
  const namePart = isComplete ? "Sriram Natarajan" : typedText.replace("Hi, I'm ", "");
  const prefixPart = isComplete ? "Hi, I'm " : typedText.replace(namePart, "");

  return (
    <>
      {/* Notification Popup */}
      {showNotification && (
        <div className="fixed top-6 right-6 z-[9999] flex items-center gap-4 border border-line bg-paper px-5 py-3.5 text-ink shadow-lg">
          <span className="text-sm font-medium">{notificationMessage}</span>
          {notificationMessage === "Image ready! 🎉" && (
            <button
              className="bg-ink px-3 py-1.5 text-sm text-paper transition-colors hover:bg-accent"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Scroll to top
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
      <div className="min-h-screen bg-paper text-ink overflow-x-hidden">
      {/* Intro splash animations */}
      <style jsx global>{`
        @keyframes intro-name {
          0%   { opacity: 0; transform: translateY(28px) scale(0.94); filter: blur(14px); }
          60%  { filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes intro-fade-up {
          0%   { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-intro-name { animation: intro-name 1.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .animate-intro-cue  { animation: intro-fade-up 1s ease-out 2.2s both; }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full bg-paper/95 backdrop-blur z-50 border-b border-line transition-all duration-700 ${scrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"}`}>
        <div className="w-full px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center py-3.5">
            <a href="/#" className="font-display text-xl font-semibold tracking-tight text-ink">
              Sriram Natarajan
            </a>
            <div className="hidden md:flex items-center gap-7">
              {["About", "Education", "Experience", "Projects", "Skills", "Hobbies", "Music", "Contact"].map((item) => (
                <a
                  key={item}
                  href={item === "About" ? "/#" : `#${item.toLowerCase()}`}
                  className="font-mono text-[13px] uppercase tracking-wider text-ink-soft hover:text-accent transition-colors border-b border-transparent hover:border-accent pb-0.5"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Intro Splash — full-screen interactive name reveal */}
      <IntroSplash />

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                {/* <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 text-sm font-medium border border-blue-400/30 shadow-sm backdrop-blur-sm">
                  <Star className="w-4 h-4 mr-2 animate-pulse" />
                  Available for new opportunities
                  <ChevronRight className="w-4 h-4 ml-2" />
                </div> */}

                <div className="space-y-5">
                  <h1 className="font-display text-5xl lg:text-7xl font-medium text-ink leading-[1.05] tracking-tight">
                    {prefixPart}<span className="italic text-accent">{namePart}</span>
                  </h1>
                  <div className="font-mono text-sm uppercase tracking-wider text-ink-soft">
                    Computer Science + Linguistics · Data Science minor · UIUC
                  </div>
                  <p className="text-lg text-ink-soft leading-relaxed max-w-2xl">
                    {about}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-x-10 gap-y-4 py-6 border-y border-line">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="font-display text-3xl font-semibold text-ink">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="font-mono text-xs uppercase tracking-wider text-ink-soft mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <Button
                  size="lg"
                  className="rounded-none bg-ink text-paper hover:bg-accent transition-colors shadow-none"
                  asChild
                >
                  <Link href="/#contact">
                    <Mail className="w-5 h-5 mr-2" />
                    Get in touch
                  </Link>
                </Button>
                {[
                  { icon: Github, href: "https://github.com/Sriramnat100", label: "GitHub" },
                  { icon: Linkedin, href: "https://www.linkedin.com/in/sriramnat/", label: "LinkedIn" },
                ].map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    className="text-ink-soft hover:text-accent transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-6 h-6" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative w-full max-w-lg mx-auto lg:ml-20">
                <div className="relative">
                  {loading || showGif ? (
                    <img src="/untitled folder 2/pandaForwardRoll.gif" alt="Loading..." className="w-[600px] h-[600px] rounded-full border border-line shadow-lg object-cover" />
                  ) : (
                  <Image
                      src={headshotUrl}
                    alt="Sriram Natarajan"
                    width={600}
                    height={600}
                    className="relative rounded-full border border-line shadow-lg"
                    onLoad={() => {
                      // Image loaded successfully
                    }}
                  />
                  )}
                    </div>
                  </div>
              <div className="mt-8 flex flex-col items-center justify-center text-center">
                {loading ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <h2 className="font-display text-2xl font-semibold text-ink mb-2">Working on it…</h2>
                    <p className="text-ink-soft">Feel free to keep scrolling — I&apos;ll let you know when it&apos;s ready.</p>
                </div>
                ) : imagesLeft === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <p className="text-ink-soft text-sm">Out of free generations for today — come back tomorrow.</p>
              </div>
                ) : showPrompt ? (
                  <div className="flex flex-col items-center justify-center text-center">
                    <h2 className="font-display text-2xl font-semibold text-ink mb-2">You said:</h2>
                    <p className="text-lg text-ink-soft italic">&ldquo;{restatedPrompt}&rdquo;</p>
            </div>
                ) : (
                  <form onSubmit={step === 'prompt' ? handlePromptSubmit : step === 'email' ? handleEmailSubmit : handleOtpSubmit} className="w-full max-w-md mx-auto border border-line bg-paper-2/60 p-6 text-left">
                    {step === 'prompt' ? (
                      <>
                        <div className="mb-3 font-display text-xl font-semibold text-ink">
                          Not a fan of the orange backdrop?
                        </div>
                        <p className="mb-4 text-sm text-ink-soft">
                          Type a scene and an AI model will re-shoot my headshot there. Genuinely — try it.
                        </p>
                        <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g. put Sriram in a futuristic city on Mars" className="border-line focus:border-accent focus:ring-accent/20 bg-paper text-ink placeholder:text-ink-soft/60" rows={3} />
                        <Button
                          type="submit"
                          className="mt-4 w-full rounded-none bg-ink text-paper hover:bg-accent transition-colors font-semibold"
                        >
                          Generate a new background
                        </Button>
                      </>
                    ) : step === 'email' ? (
                      <>
                        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email (no code sent if you've verified before)" className="border-line focus:border-accent focus:ring-accent/20 bg-paper text-ink placeholder:text-ink-soft/60" />
                        {otpError && <div className="mt-2 text-accent text-sm">{otpError}</div>}
                        <Button
                          type="submit"
                          disabled={sendingOtp}
                          className="mt-4 w-full rounded-none bg-ink text-paper hover:bg-accent transition-colors font-semibold"
                        >
                          {sendingOtp ? "Sending code…" : "Send me a code"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="mb-3 text-ink-soft text-sm">
                          Check <span className="font-semibold text-ink">{email}</span> for a 6-digit code.
                        </div>
                        <Input type="text" inputMode="numeric" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit code" className="border-line focus:border-accent focus:ring-accent/20 bg-paper text-ink placeholder:text-ink-soft/60 tracking-widest text-center" />
                        {otpError && <div className="mt-2 text-accent text-sm">{otpError}</div>}
                        <Button
                          type="submit"
                          className="mt-4 w-full rounded-none bg-ink text-paper hover:bg-accent transition-colors font-semibold"
                        >
                          Verify &amp; generate
                        </Button>
                      </>
                    )}
                    <div className="mt-4 font-mono text-xs text-ink-soft text-center">
                      {imagesLeft}/20 free generations left today — this costs me real money.
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

              {/* Education Section */}
        <section
          id="education"
          className="py-24 px-4 sm:px-8 lg:px-10 bg-paper-2 border-y border-line relative"
        >
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-14">
              <div className="font-mono text-xs uppercase tracking-[0.25em] text-accent mb-3">01 · Education</div>
              <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-ink tracking-tight mb-3">
                University of Illinois, <span className="italic">Urbana-Champaign</span>
              </h3>
              <div className="font-mono text-sm text-ink-soft">
                Expected graduation · {education.grad.replace('Expected Graduation: ', '')}
              </div>
            </div>

            {/* Carousel · Major/Minor/GPA · Relevant Coursework — all equal height */}
            <div className="grid lg:grid-cols-[1.25fr_0.65fr_1.2fr] gap-6 lg:gap-8 items-stretch">
              {/* Carousel */}
              <div className="h-full">
                <EducationCarousel />
              </div>

              {/* Major / Minor / GPA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-col gap-4 h-full">
                {[
                  { label: "Major", value: education.major },
                  { label: "Minor", value: education.minor },
                  { label: "GPA", value: education.gpa },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="border border-line bg-paper p-5 flex flex-col justify-center lg:flex-1"
                  >
                    <div className="font-mono text-accent text-xs uppercase tracking-wider mb-2">
                      {item.label}
                    </div>
                    <div className="font-display text-xl font-semibold text-ink leading-snug">{item.value}</div>
                  </div>
                ))}
              </div>

              {/* Relevant Coursework — expandable cards */}
              <div>
                <h4 className="font-display text-2xl sm:text-3xl font-medium text-ink mb-2">Relevant Coursework</h4>
                <p className="text-ink-soft mb-5 text-sm">Tap a course to see what I learned and the tools I used.</p>
                <div className="space-y-3">
                  {courses.map((course) => (
                    <CourseCard key={course.code} course={course} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* About Section */}
      {/* Removed entire section */}

      {/* Experience */}
      <section
        id="experience"
        className="py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <div className="font-mono text-xs uppercase tracking-[0.25em] text-accent mb-3">02 · Experience</div>
            <h2 className="font-display text-4xl sm:text-5xl font-medium text-ink tracking-tight">Where I&apos;ve worked</h2>
          </div>

          <div className="divide-y divide-line border-y border-line">
            {experience.map((exp, index) => (
              <div key={index} className="grid gap-4 py-8 sm:grid-cols-[9rem_1fr] sm:gap-8">
                {/* Left rail: dates */}
                <div className="font-mono text-xs uppercase tracking-wide text-ink-soft pt-1">
                  {exp.period}
                  <div className="mt-1 normal-case tracking-normal text-ink-soft/70">{exp.location}</div>
                </div>

                {/* Entry */}
                <div>
                  <div className="flex items-start gap-4">
                    <Image
                      src={exp.logo}
                      alt={`${exp.company} logo`}
                      width={64}
                      height={64}
                      className="w-11 h-11 bg-white object-contain object-center p-1 shrink-0 border border-line"
                    />
                    <div className="min-w-0">
                      <h3 className="font-display text-xl font-semibold text-ink leading-tight">
                        {exp.title.includes('<br') ? (
                          <span dangerouslySetInnerHTML={{ __html: exp.title.replace(/<br\s*\/?>/g, ' ') }} />
                        ) : (
                          exp.title
                        )}
                      </h3>
                      <p className="text-accent font-medium">{exp.company}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    {Array.isArray(exp.description) ? (
                      (exp.description as string[]).map((desc, i) => (
                        <p key={i} className="text-ink-soft mb-2 leading-relaxed">{desc.replace(/^\s*-\s*/, "")}</p>
                      ))
                    ) : typeof exp.description === 'string' ? (
                      <p className="text-ink-soft mb-2 leading-relaxed">{(exp.description as string).replace(/^\s*-\s*/, "")}</p>
                    ) : null}
                  </div>

                  {"demo" in exp && exp.demo ? (
                    <Link
                      href={exp.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-navy underline decoration-line underline-offset-4 hover:text-accent text-sm font-medium mb-3 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                      {"demoLabel" in exp && exp.demoLabel ? exp.demoLabel : "Lerobot Project"}
                    </Link>
                  ) : null}

                  <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2">
                    {exp.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="font-mono text-xs text-ink-soft">
                        {tech}{techIndex < exp.technologies.length - 1 ? " ·" : ""}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section
        id="projects"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-paper-2 border-y border-line"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <div className="font-mono text-xs uppercase tracking-[0.25em] text-accent mb-3">03 · Projects</div>
            <h2 className="font-display text-4xl sm:text-5xl font-medium text-ink tracking-tight">Things I&apos;ve built</h2>
          </div>

          {/* Featured Projects */}
          <div className="space-y-20 mb-20">
            {projects
              .filter((p) => p.featured)
              .map((project, index) => (
                <div
                  key={index}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}
                >
                  <div className={`space-y-6 ${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                    <div className="space-y-4">
                      <Badge variant="outline" className="font-mono rounded-none bg-transparent text-accent border-accent/40">
                        {project.category}
                      </Badge>
                      <h3 className="font-display text-3xl font-semibold text-ink tracking-tight">{project.title}</h3>
                      <p className="text-lg text-ink-soft leading-relaxed">{project.longDescription}</p>
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                      {project.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="font-mono text-xs text-ink-soft">
                          {tech}{techIndex < project.technologies.length - 1 ? " ·" : ""}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-6 pt-1">
                      <Link
                        href={project.github}
                        className="inline-flex items-center gap-2 font-medium text-ink underline decoration-line underline-offset-4 hover:text-accent transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        View code
                      </Link>
                      <Link
                        href={project.demo}
                        className="inline-flex items-center gap-2 font-medium text-ink underline decoration-line underline-offset-4 hover:text-accent transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Live demo
                      </Link>
                    </div>
                  </div>

                  <div className={`relative ${index % 2 === 1 ? "lg:col-start-1" : ""}`}>
                    <Image
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      width={700}
                      height={350}
                      className="border border-line object-cover w-[700px] h-[350px]"
                    />
                  </div>
                </div>
              ))}
          </div>

          {/* Other Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects
              .filter((p) => !p.featured)
              .map((project, index) => (
                <Card
                  key={index}
                  className="overflow-hidden rounded-none border border-line bg-paper shadow-none transition-colors hover:border-accent/50 group"
                >
                  <div className="relative overflow-hidden border-b border-line">
                    <Image
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      width={700}
                      height={350}
                      className="w-full h-[300px] object-cover"
                    />
                  </div>

                  <CardHeader className="pb-2">
                    <div className="font-mono text-[11px] uppercase tracking-wider text-accent mb-1">
                      {project.category}
                    </div>
                    <CardTitle className="font-display text-xl font-semibold text-ink">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-ink-soft">
                      {project.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {project.technologies.slice(0, 4).map((tech, techIndex) => (
                        <span key={techIndex} className="font-mono text-xs text-ink-soft">
                          {tech}{techIndex < Math.min(project.technologies.length, 4) - 1 ? " ·" : ""}
                        </span>
                      ))}
                    </div>

                    {project.title === "Beyond Terra" ? (
                      <Link
                        href="https://drive.google.com/drive/u/1/folders/1qRmqG-BfqBlJLqzdnd1UOSWiOVFkGsKW"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:text-accent transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Demo
                      </Link>
                    ) : (
                      <div className="flex gap-5 pt-1">
                        <Link
                          href={project.github}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:text-accent transition-colors"
                        >
                          <Github className="w-3.5 h-3.5" />
                          Code
                        </Link>
                        <Link
                          href={project.demo}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:text-accent transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Demo
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section
        id="skills"
        className="py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <div className="font-mono text-xs uppercase tracking-[0.25em] text-accent mb-3">04 · Skills</div>
            <h2 className="font-display text-4xl sm:text-5xl font-medium text-ink tracking-tight">Tools I reach for</h2>
          </div>

          <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {skillGroups.map((group) => (
              <div key={group.label} className="bg-paper p-6">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">
                  {group.label}
                </div>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item} className="text-ink-soft leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hobbies Section */}
      <section
        id="hobbies"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-paper-2 border-y border-line"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <div className="font-mono text-xs uppercase tracking-[0.25em] text-accent mb-3">05 · Off the clock</div>
            <h2 className="font-display text-4xl sm:text-5xl font-medium text-ink tracking-tight">When I&apos;m not coding</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hobbies.map((hobby, index) => (
              <figure key={index} className="border border-line bg-paper p-3">
                <Image
                  src={hobby.image || "/placeholder.svg"}
                  alt={hobby.name}
                  width={700}
                  height={350}
                  className="w-full h-[320px] object-cover border border-line"
                />
                <figcaption className="pt-3 pb-1 px-1 font-mono text-sm text-ink">
                  {hobby.name}
                  {hobby.description ? <span className="text-ink-soft"> — {hobby.description}</span> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Music Section — vinyl player with my own recordings */}
      <section
        id="music"
        className="py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-14">
            <div className="font-mono text-xs uppercase tracking-[0.25em] text-accent mb-3">06 · Music</div>
            <h2 className="font-display text-4xl sm:text-5xl font-medium text-ink tracking-tight mb-3">Off the record</h2>
            <p className="text-lg text-ink-soft max-w-2xl">
              Yes, I also make music. Drop the needle — I recorded these myself.
            </p>
          </div>

          <VinylPlayer />
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-24 px-4 sm:px-6 lg:px-8 bg-paper-2 border-y border-line"
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <div className="font-mono text-xs uppercase tracking-[0.25em] text-accent mb-3">07 · Contact</div>
            <h2 className="font-display text-4xl sm:text-5xl font-medium text-ink tracking-tight mb-3">Get in touch</h2>
            <p className="text-lg text-ink-soft max-w-2xl">
              Flip through the rolodex — email is the fastest way to reach me, and I actually reply.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Rolodex — flip through contact cards */}
            <Rolodex />

            <figure className="justify-self-center">
              <Image
                src="/untitled folder 2/nbastore.jpeg"
                alt="Me at the NBA Store"
                width={500}
                height={500}
                className="border border-line object-cover max-w-full h-auto"
              />
              <figcaption className="pt-2 font-mono text-xs text-ink-soft">NBA Store, New York.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Visitor Map — every visitor drops a pin */}
      <section
        id="visitors"
        className="py-24 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <div className="font-mono text-xs uppercase tracking-[0.25em] text-accent mb-3">08 · Visitors</div>
            <h2 className="font-display text-4xl sm:text-5xl font-medium text-ink tracking-tight mb-3">You were here</h2>
            <p className="text-lg text-ink-soft max-w-2xl">
              Everyone who visits leaves a pin. Spin the globe — here&apos;s where the last few hundred people came from.
            </p>
          </div>

          <VisitorMap />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-paper-2 border-t border-line py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-10 md:grid-cols-3 mb-10">
            <div>
              <div className="font-display text-2xl font-semibold text-ink mb-3">
                Sriram Natarajan
              </div>
              <div className="flex gap-4">
                {[
                  { icon: Github, href: "https://github.com/Sriramnat100", label: "GitHub" },
                  { icon: Linkedin, href: "https://www.linkedin.com/in/sriramnat/", label: "LinkedIn" },
                ].map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    className="text-ink-soft hover:text-accent transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">Index</h4>
              <ul className="space-y-2">
                {["About", "Projects", "Skills", "Music", "Contact"].map((link) => (
                  <li key={link}>
                    <a href={link === 'About' ? '/#' : `#${link.toLowerCase()}`} className="text-ink-soft hover:text-accent transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">Colophon</h4>
              <p className="text-ink-soft text-sm leading-relaxed max-w-xs">
                Designed and built by me with Next.js, set in Fraunces and IBM Plex.
                The globe, vinyl, and rolodex are hand-rolled — go play with them.
              </p>
            </div>
          </div>

          <div className="border-t border-line pt-6">
            <p className="font-mono text-xs text-ink-soft">
              © 2026 Sriram Natarajan · Champaign–Fremont
            </p>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}
