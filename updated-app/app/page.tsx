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
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"

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
    <span className="font-bold text-3xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
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
  const [step, setStep] = useState<"prompt" | "email">("prompt");
  const [loading, setLoading] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [headshotUrl, setHeadshotUrl] = useState("/untitled folder 2/SriramHeadshot.jpg");
  const [showPrompt, setShowPrompt] = useState(false);
  const [restatedPrompt, setRestatedPrompt] = useState("");
  const [imagesToday, setImagesToday] = useState(0);
  const maxImagesPerDay = 20;

  // Fetch today's image generation count on mount
  useEffect(() => {
    async function fetchImagesToday() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isoToday = today.toISOString();
      const res = await fetch('/api/images-today?since=' + encodeURIComponent(isoToday));
      const data = await res.json();
      setImagesToday(data.count || 0);
    }
    fetchImagesToday();
  }, []);

  const imagesLeft = Math.max(0, maxImagesPerDay - imagesToday);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    alert("Message sent! I'll get back to you soon.")
  }

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
    if (email.trim()) {
      setLoading(true);
      try {
        // 1. Call Flask API to generate image
        const flaskRes = await fetch('http://127.0.0.1:5000/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        const flaskData = await flaskRes.json();
        const imageUrl = flaskData.image;

        // 2. Store info in Supabase DB via your Next.js API
        await fetch('/api/submit-generation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, prompt, image_url: imageUrl }),
        });

        // 3. Update the UI to show the new image
        setHeadshotUrl(imageUrl);
        setRestatedPrompt(prompt);
        setShowPrompt(true);
        setImagesToday((prev) => prev + 1);
      } catch (err) {
        console.error('Error during image generation or DB upload:', err);
      }
      setTimeout(() => {
        setLoading(false);
        setShowGif(false);
      }, 6000);
    }
  };

  const stats = [
    { label: "Hackathon Wins", value: 4 },
    { label: "Years Experience", value: 7, suffix: "+" },
    { label: "Users Reached (Across Projects)", value: 1000, suffix: "+" },
   
  ]

  const experience = [
    {
      title: "Software and Strategy Intern",
      company: "Hacker Dojo",
      period: "April 2025 - Present",
      location: "Remote",
      description: [
        "-Contributed to Higher Road To You, an AI-driven mental health platform and collaborated with executives at Hacker Dojo to help support member outreach"
       
      ],
      technologies: ["Python", "Flask", "AWS", "OpenAI API", "React"]
    },
    {
      title: "Course Assistant<br />Computer Science 124",
      company: "University of Illinois Urbana-Champaign",
      period: "January 2025 - Present",
      location: "Urbana, IL",
      description: [
        "-Assisted students to develop and debug a full-stack application with user authentication, backend APIs, and frontend UI"
      ],
      technologies: ["Teaching", "Debugging", "Full-Stack"]
    },
    {
      title: "Machine Learning<br />Research Associate",
      company: "University of Illinois, Ward Lab",
      period: "October 2024 - June 2025",
      location: "Remote",
      description: [
        "-Processed satellite imagery and developed Machine Learning Models to predict habitat suitability of endangered bird species"
      ],
      technologies: ["Python", "MATLAB", "TensorFlow", "PyTorch"]
    },
    {
      title: "Infrastructure Lead",
      company: "Illinois Design Challenge",
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
      period: "September 2024 - Present",
      location: "Urbana, IL",
      description: [
        "-Engineered the 6-axis Robotic Arm, optimizing real-time path planning and obstacle avoidance algorithms"
      ],
      technologies: ["C++", "Arduino", "AWS RDS", "3D Printing", "ROS", "Gazebo"]
    },
    
  ]

  const projects = [
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
        "Implemented AI Features such as Cold Email Generator (used Chat GPT API to tailor emails specifically to a professor's specific projects) and Resume Reviewer (used a TfIdf vectorizer to compare a resume and job description)"
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
      image:  "/untitled folder 2/sriramwarriorsgame.jpg",
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

  // Update skills array type
  const skills: Skill[] = [
    { name: "C++", level: 90, icon: Code, projects: 6 },
    { name: "Python", level: 95, icon: Brain, projects: 8 },
    { name: "Java", level: 85, icon: Code, projects: 4 },
    { name: "JavaScript", level: 80, icon: Globe, projects: 4 },
    { name: "AWS (EC2, S3, RDS)", level: 80, icon: Database, projects: 4 },
    { name: "PostgreSQL", level: 80, icon: Database, projects: 4 },
    { name: "Git/GitHub", level: 90, icon: Users, projects: 8 },
    { name: "REST APIs", level: 85, icon: Globe, projects: 6 },
    { name: "Flask", level: 80, icon: Zap, projects: 4 },
    { name: "React", level: 85, icon: Globe, projects: 5 },
    { name: "TensorFlow", level: 80, icon: Brain, projects: 4 },
    { name: "PyTorch", level: 75, icon: Brain, projects: 3 },
    { name: "OpenCV", level: 75, icon: Camera, projects: 3 },
    { name: "scikit-learn", level: 75, icon: Brain, projects: 3 },
    { name: "Numpy", level: 80, icon: Database, projects: 4 },
    { name: "Pandas", level: 80, icon: Database, projects: 4 },
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
    grad: "Expected Graduation: 05/2027",
    major: "Computer Science + Linguistics",
    minor: "Data Science",
    gpa: "3.93/4.0",
    coursework: [
      "Data Structures and<br />Algorithms (C++)",
      "Data Science & Statistical<br />Foundations (Python)",
      "Copmuter Architecture br /> (C++)",
      "Statistical & Probabilistic<br />Analysis (R)",

    ]
  };

  const typedText = useTypingEffect("Hi, I'm Sriram Natarajan", 60);
  const isComplete = typedText === "Hi, I'm Sriram Natarajan";
  const namePart = isComplete ? "Sriram Natarajan" : typedText.replace("Hi, I'm ", "");
  const prefixPart = isComplete ? "Hi, I'm " : typedText.replace(namePart, "");

  // Enhanced SkillsCarousel with side buttons and autoplay
  function SkillsCarousel({ skills }: { skills: Skill[] }) {
    const [index, setIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const prev = () => setIndex((i) => (i === 0 ? skills.length - 1 : i - 1));
    const next = () => setIndex((i) => (i === skills.length - 1 ? 0 : i + 1));
    const skill = skills[index];
    const Icon = skill.icon;

    // Autoplay logic
    useEffect(() => {
      intervalRef.current = setInterval(() => {
        setIndex((i) => (i === skills.length - 1 ? 0 : i + 1));
      }, 3000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [skills.length]);

    // Pause on hover
    const handleMouseEnter = () => intervalRef.current && clearInterval(intervalRef.current);
    const handleMouseLeave = () => {
      intervalRef.current = setInterval(() => {
        setIndex((i) => (i === skills.length - 1 ? 0 : i + 1));
      }, 3000);
    };

    return (
      <div className="flex flex-col items-center space-y-4 relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div className="flex items-center justify-center w-full relative">
          {/* Left Arrow */}
          <button
            onClick={prev}
            aria-label="Previous Skill"
            className="absolute left-0 z-10 w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg hover:scale-110 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            tabIndex={0}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <Card className="p-8 flex flex-col items-center w-full max-w-md mx-auto bg-transparent shadow-none border-none">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center mr-4">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3">
                  <h3 className="font-bold text-white text-lg">{skill.name}</h3>
                </div>
              </div>
            </div>
          </Card>
          {/* Right Arrow */}
          <button
            onClick={next}
            aria-label="Next Skill"
            className="absolute right-0 z-10 w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-lg hover:scale-110 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            tabIndex={0}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 overflow-x-hidden">
      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        .animate-gradient { animation: gradient 8s ease infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/90 backdrop-blur-xl z-50 border-b border-blue-500/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_200%]">
              Sriram Natarajan
            </div>
            <div className="hidden md:flex space-x-8">
              {["About", "Education", "Experience", "Projects", "Skills", "Hobbies", "Contact"].map((item) => (
                item === "About" ? (
                  <a
                    key={item}
                    href="/#"
                    className="text-blue-100 hover:text-cyan-400 transition-all duration-300 relative group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
                  </a>
                ) : (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-blue-100 hover:text-cyan-400 transition-all duration-300 relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full transition-all duration-300"></span>
                </a>
                )
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-300 bg-transparent border-blue-400/50 text-blue-100"
            >
              <Download className="w-4 h-4 mr-2" />
              Resume
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-40 left-1/2 w-80 h-80 bg-cyan-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-200 text-sm font-medium border border-blue-400/30 shadow-sm backdrop-blur-sm">
                  <Star className="w-4 h-4 mr-2 animate-pulse" />
                  Available for new opportunities
                  <ChevronRight className="w-4 h-4 ml-2" />
                </div>

                <div className="space-y-4">
                  <h1 className="text-6xl lg:text-8xl font-bold text-white leading-tight">
                    {prefixPart}<span className="text-blue-300">{namePart}</span>
                  </h1>
                  <div className="text-2xl lg:text-3xl font-semibold text-blue-200 mb-4">
                    Computer Science + Linguistics Major,<br />
                    Data Science Minor
                  </div>
                  <p className="text-xl text-blue-100 leading-relaxed max-w-2xl">
                    {about}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-sm text-blue-200 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow"
                  asChild
                >
                  <Link href="/#contact">
                    <Mail className="w-5 h-5 mr-2" />
                    Let's Collaborate
                  </Link>
                </Button>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                {[
                  { icon: Github, href: "https://github.com/Sriramnat100", label: "GitHub" },
                  { icon: Linkedin, href: "https://www.linkedin.com/in/sriramnat/", label: "LinkedIn" },
                ].map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    className="p-3 rounded-full bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl text-white hover:text-blue-400 transition-all duration-300 hover:scale-110 border border-white/20"
                    aria-label={social.label}
                  >
                    <social.icon className="w-6 h-6" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative w-full max-w-lg mx-auto ml-20">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="relative">
                  {loading || showGif ? (
                    <img src="/untitled folder 2/pandaForwardRoll.gif" alt="Loading..." className="w-[600px] h-[600px] rounded-full border-8 border-white/20 shadow-2xl object-cover" />
                  ) : (
                  <Image
                      src={headshotUrl}
                    alt="Sriram Natarajan - Full-Stack Developer"
                    width={600}
                    height={600}
                    className="relative rounded-full border-8 border-white/20 shadow-2xl hover:scale-105 transition-transform duration-500"
                  />
                  )}
                    </div>
                  </div>
              <div className="mt-6 flex flex-col items-center justify-center text-center ml-12">
                {loading ? (
                  <div className="mt-6 flex flex-col items-center justify-center text-center">
                    <h2 className="text-2xl font-bold text-blue-200 mb-2">Loading... (This can take up to 20 seconds so feel free to come back)</h2>
                </div>
                ) : imagesLeft === 0 ? (
                  <div className="mt-6 flex flex-col items-center justify-center text-center">
                    <h2 className="text-2xl font-bold text-blue-200 mb-2"></h2>
              </div>
                ) : showPrompt ? (
                  <div className="mt-6 flex flex-col items-center justify-center text-center">
                    <h2 className="text-2xl font-bold text-blue-200 mb-2">You said:</h2>
                    <p className="text-xl text-blue-100">{restatedPrompt}</p>
            </div>
                ) : (
                  <form onSubmit={step === 'prompt' ? handlePromptSubmit : handleEmailSubmit} className="w-full max-w-md mx-auto">
                    {step === 'prompt' ? (
                      <>
                        <div className="mb-4 text-xl font-bold text-blue-200">
                          <span className="text-3xl font-extrabold text-blue-200">Don't like my <span className="text-orange-400 font-bold">orange background</span>, generate another background for me?</span>
                        </div>
                        <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="(EX: Put Sriram in a futuristic city on Mars)" className="border-blue-400/30 focus:border-blue-400 focus:ring-blue-400/20 bg-white/10 text-white placeholder:text-blue-200" rows={3} />
                        <Button
                          type="submit"
                          className="mt-4 w-full text-xl py-6 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow text-3xl"
                          style={{ fontSize: '2rem', padding: '1.5rem 2rem' }}
                        >
                          Add a new background!
                        </Button>
                      </>
                    ) : (
                      <>
                        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email to continue (no password I promise)" className="border-blue-400/30 focus:border-blue-400 focus:ring-blue-400/20 bg-white/10 text-white placeholder:text-blue-200" />
                        <Button
                          type="submit"
                          className="mt-4 w-full text-xl py-6 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-glow text-3xl"
                          style={{ fontSize: '2rem', padding: '1.5rem 2rem' }}
                        >
                          Add a new background!
                        </Button>
                      </>
                    )}
                    <div className="mt-6 text-blue-200 text-2xl font-bold text-center">
                      <span className="text-base font-medium">{imagesLeft}/20 free backgrounds left for the day <span className="text-red-400 font-bold">(image generation isn't cheap!)</span></span>
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
          className="py-24 px-2 sm:px-8 lg:px-16 bg-gradient-to-br from-blue-900 via-slate-800 to-blue-900 relative"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-4xl sm:text-5xl font-extrabold mb-4 whitespace-nowrap">
                <span className="text-white">University&nbsp;of&nbsp;Illinois,</span>
                <span className="text-blue-400">&nbsp;Urbana</span>
                <span className="text-orange-400">-Champaign</span>
              </h3>
              <div className="text-3xl text-blue-100 font-semibold mb-12">Expected Graduation: {education.grad.replace('Expected Graduation: ', '')}</div>
            </div>
            
            <div className="w-full grid grid-cols-1 lg:grid-cols-[250px_1fr_250px] gap-8 lg:gap-16 items-start">
              {/* Left: Major/Minor/GPA */}
              <div className="flex flex-col justify-between h-full min-h-[800px] items-center lg:items-start text-center lg:text-left">
                <div>
                  <div className="text-blue-400 text-3xl font-bold mb-2">Major</div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-white">{education.major}</div>
                </div>
                <div>
                  <div className="text-blue-400 text-3xl font-bold mb-2">Minor</div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-white">{education.minor}</div>
                </div>
                <div>
                  <div className="text-blue-400 text-3xl font-bold mb-2">GPA</div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-white">{education.gpa}</div>
                </div>
              </div>
              
              {/* Center: Alma Mater Statue Image */}
              <div className="flex justify-center items-center">
                <Image
                  src="/untitled folder 2/almamaterstatue.jpeg"
                  alt="UIUC Alma Mater Statue"
                  width={750}
                  height={800}
                  className="rounded-2xl shadow-2xl object-cover w-[750px] h-[800px]"
                />
              </div>
              
              {/* Right: Coursework */}
              <div className="flex flex-col items-start text-left max-w-xl w-full space-y-8">
                <h4 className="text-4xl sm:text-5xl font-extrabold text-blue-200 mb-8">Relevant Coursework</h4>
                <div className="flex flex-col gap-6 w-full">
                  <span className="bg-blue-800/60 text-blue-100 px-8 py-4 rounded-full text-xl sm:text-2xl font-bold shadow-sm border border-blue-400/20 w-full block text-left">
                    Data Structures and<br />Algorithms (C++)
                  </span>
                  <span className="bg-blue-800/60 text-blue-100 px-8 py-4 rounded-full text-xl sm:text-2xl font-bold shadow-sm border border-blue-400/20 w-full block text-left">
                    Data Science & Statistical<br />Foundations (Python)
                  </span>
                  <span className="bg-blue-800/60 text-blue-100 px-8 py-4 rounded-full text-xl sm:text-2xl font-bold shadow-sm border border-blue-400/20 w-full block text-left">
                    Computer Architecture <br />(C++)
                  </span>
                  <span className="bg-blue-800/60 text-blue-100 px-8 py-4 rounded-full text-xl sm:text-2xl font-bold shadow-sm border border-blue-400/20 w-full block text-left">
                    Statistical & Probabilistic<br />Analysis (R)
                  </span>
            
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* About Section */}
      {/* Removed entire section */}

      {/* Experience Timeline */}
      <section
        id="experience"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900 via-slate-800 to-blue-900"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">Professional Journey</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              My career progression through innovative companies and challenging projects
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-blue-400 to-cyan-400"></div>

            {experience.map((exp, index) => (
              <div
                key={index}
                className={`relative flex items-center mb-12 ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <div className={`w-full max-w-lg ${index % 2 === 0 ? "pr-2" : "pl-2"}`}>
                  <Card className="p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border-0 bg-white/10 backdrop-blur-sm border border-white/20 hover:scale-105">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {exp.title.includes('<br') ? (
                            <span dangerouslySetInnerHTML={{ __html: exp.title }} />
                          ) : (
                            exp.title
                          )}
                        </h3>
                        <p className="text-blue-400 font-semibold">{exp.company}</p>
                      </div>
                      <div className="flex flex-col items-end text-right text-sm text-blue-200 min-w-[140px] ml-4 gap-1 pt-1">
                        <div className="flex items-center whitespace-nowrap">
                          <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span>{exp.period}</span>
                        </div>
                        <div className="flex items-center whitespace-nowrap">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span>{exp.location}</span>
                        </div>
                      </div>
                    </div>
                    {/* Description */}
                    {Array.isArray(exp.description) ? (
                      (exp.description as string[]).map((desc, i) =>
                        typeof desc === 'string' && desc.includes('<br') ? (
                          <p key={i} className="text-blue-100 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: desc }} />
                        ) : (
                          <p key={i} className="text-blue-100 mb-4 leading-relaxed">{desc}</p>
                        )
                      )
                    ) : typeof exp.description === 'string' ? (
                      (exp.description as string).includes('<br') ? (
                        <p className="text-blue-100 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: exp.description as string }} />
                      ) : (
                        <p className="text-blue-100 mb-4 leading-relaxed">{exp.description as string}</p>
                      )
                    ) : null}
                    {/* Remove stats row for specific cards */}
                    {![
                      'Course Assistant Computer Science 124',
                      'IlliniResearch',
                      'Beyond Terra',
                      "Alzheimer's Researcher"
                    ].includes(exp.title.replace(/<br\s*\/?>(\s*)?/g, ' ').trim()) && (
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech, techIndex) => (
                          <Badge
                            key={techIndex}
                            variant="secondary"
                            className="bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 transition-colors border border-blue-400/30"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>

                {/* Timeline dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full border-4 border-slate-800 shadow-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section
        id="projects"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">Featured Projects</h2>
            <p className="text-xl text-blue-100 max-w-4xl mx-auto">
              Showcasing innovative solutions that have impacted thousands of users and driven significant business
              growth
            </p>
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
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-200 border-blue-400/30">
                        {project.category}
                      </Badge>
                      <h3 className="text-3xl font-bold text-white">{project.title}</h3>
                      <p className="text-lg text-blue-100 leading-relaxed">{project.longDescription}</p>
                    </div>

                    {/* Project Stats */}
                    <div className="grid grid-cols-3 gap-4 py-4">
                      {['FarmSmart (First Place Hack Illinois)', 'Calmoto'].includes(project.title) ? (
                        <>
                          <div></div>
                          <div></div>
                          <div></div>
                        </>
                      ) : (
                        <>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">{project.stats.users}</div>
                            <div className="text-sm text-blue-200">Active Users</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400 flex items-center justify-center">
                              {project.stats.rating} <Star className="w-5 h-5 ml-1 fill-current" />
                            </div>
                            <div className="text-sm text-blue-200">User Rating</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">{project.stats.downloads}</div>
                            <div className="text-sm text-blue-200">Downloads</div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.technologies.map((tech, techIndex) => (
                        <Badge
                          key={techIndex}
                          variant="outline"
                          className="bg-white/10 hover:bg-blue-500/20 hover:text-blue-200 transition-colors border-white/20 text-blue-100"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        asChild
                        className="hover:bg-blue-500/20 hover:border-blue-400 bg-transparent border-blue-400/50 text-blue-100"
                      >
                        <Link href={project.github}>
                          <Github className="w-5 h-5 mr-2" />
                          View Code
                        </Link>
                      </Button>
                      <Button
                        size="lg"
                        asChild
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <Link href={project.demo}>
                          <ExternalLink className="w-5 h-5 mr-2" />
                          Live Demo
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className={`relative ${index % 2 === 1 ? "lg:col-start-1" : ""}`}>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
                      <Image
                        src={project.image || "/placeholder.svg"}
                        alt={project.title}
                        width={700}
                        height={350}
                        className="relative rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500 border border-blue-400/30 object-cover w-[700px] h-[350px]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
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
                  className="overflow-hidden hover:shadow-2xl transition-all duration-500 group hover:scale-105 border-0 bg-white/10 backdrop-blur-sm border border-white/20"
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      width={700}
                      height={350}
                      className="w-full h-[350px] object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-white/90 text-gray-800">
                        {project.category}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl group-hover:text-blue-400 transition-colors text-white">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed text-blue-100">
                      {project.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Mini Stats */}
                    {![
                      'IlliniResearch',
                      'Beyond Terra',
                      "Alzheimer's Researcher"
                    ].includes(project.title) && (
                      <div className="flex justify-between text-sm text-blue-200">
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {project.stats.users}
                        </span>
                        <span className="flex items-center">
                          <Star className="w-4 h-4 mr-1 fill-current text-yellow-400" />
                          {project.stats.rating}
                        </span>
                        <span className="flex items-center">
                          <Download className="w-4 h-4 mr-1" />
                          {project.stats.downloads}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 3).map((tech, techIndex) => (
                        <Badge
                          key={techIndex}
                          variant="outline"
                          className="text-xs bg-blue-500/20 text-blue-200 border-blue-400/30"
                        >
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-200 border-blue-400/30">
                          +{project.technologies.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Buttons */}
                    {project.title === "Beyond Terra" ? (
                      <Button
                        size="lg"
                        asChild
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 mt-2"
                      >
                        <Link href="https://drive.google.com/drive/u/1/folders/1qRmqG-BfqBlJLqzdnd1UOSWiOVFkGsKW" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Demo
                        </Link>
                      </Button>
                    ) : (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="flex-1 bg-transparent border-blue-400/50 text-blue-100 hover:bg-blue-500/20"
                        >
                          <Link href={project.github}>
                            <Github className="w-3 h-3 mr-1" />
                            Code
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          asChild
                          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          <Link href={project.demo}>
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Demo
                          </Link>
                        </Button>
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
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900 via-slate-800 to-blue-900"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">Skills & Expertise</h2>
            <p className="text-xl text-blue-100 max-w-4xl mx-auto">
              Mastery across the full technology stack with deep expertise in modern frameworks and AI technologies
            </p>
          </div>

          <SkillsCarousel skills={skills} />
        </div>
      </section>

      {/* Hobbies Section */}
      <section
        id="hobbies"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">Hobbies & Interests</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
             When I'm not coding, I'm usually doing one of the following:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hobbies.map((hobby, index) => {
              const Icon = hobby.icon;
              return (
                <Card
                  key={index}
                  className="overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 bg-white/10 backdrop-blur-sm border border-white/20 group"
                >
                  <div className="relative overflow-hidden">
                    <Image
                      src={hobby.image || "/placeholder.svg"}
                      alt={hobby.name}
                      width={700}
                      height={350}
                      className="w-full h-[350px] object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div
                      className={`absolute top-4 left-4 w-12 h-12 rounded-full bg-gradient-to-r ${hobby.color} flex items-center justify-center shadow-lg`}
                    >
                      <Icon />
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-xl group-hover:text-blue-400 transition-colors text-white">
                      {hobby.name}
                    </CardTitle>
                    <CardDescription className="leading-relaxed text-blue-100">{hobby.description}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900 via-slate-800 to-blue-900"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-6">Let's Create Something Amazing</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Ready to bring your vision to life? Let's discuss our next project and create something extraordinary
              together!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-white">Get in Touch</h3>
                <p className="text-lg text-blue-100 leading-relaxed">
                  Whether you're a startup looking to build your MVP or an enterprise seeking to innovate, I'm here to
                  help transform your ideas into reality.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    icon: Mail,
                    label: "Email",
                    value: "sriram6@illinois.edu",
                    href: "mailto:sriram.natarajan@email.com",
                  },
                  {
                    icon: Linkedin,
                    label: "LinkedIn",
                    value: "linkedin.com/in/sriramnat",
                    href: "https://linkedin.com/in/sriramnat",
                  },
                  {
                    icon: Github,
                    label: "GitHub",
                    value: "github.com/Sriramnat100",
                    href: "https://github.com/Sriramnat100",
                  },
                ].map((contact, index) => (
                  <div
                    key={index}
                    className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow border border-white/20"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                      <contact.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{contact.label}</div>
                      <Link href={contact.href} className="text-blue-400 hover:text-blue-300 transition-colors">
                        {contact.value}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 p-6 rounded-xl border border-blue-400/30 backdrop-blur-sm">
                <h4 className="font-bold text-white mb-2">Quick Response Guarantee</h4>
                <p className="text-blue-100 text-sm">
                  I typically respond to all inquiries within 24 hours. For urgent projects, feel free to mention it in
                  your message.
                </p>
              </div>
            </div>

            {/* Right: Add NBA Store image */}
            <div className="flex items-center justify-center">
              <Image
                src="/untitled folder 2/nbastore.jpeg"
                alt="NBA Store"
                width={500}
                height={500}
                className="rounded-2xl shadow-2xl object-cover max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-t border-blue-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-indigo-900/20"></div>
        <div className="max-w-7xl mx-auto relative">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                Sriram Natarajan
              </div>
              <p className="text-blue-100 mb-6 leading-relaxed max-w-md">
                Full-Stack Developer & AI Architect passionate about creating innovative solutions that make a
                difference in the world.
              </p>
              <div className="flex space-x-4">
                {[
                  { icon: Github, href: "https://github.com/Sriramnat100", label: "GitHub" },
                  { icon: Linkedin, href: "https://www.linkedin.com/in/sriramnat/", label: "LinkedIn" },
                ].map((social, index) => (
                  <Link
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-slate-800 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-blue-500/20"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {["About", "Projects", "Skills", "Contact"].map((link) => (
                  <li key={link}>
                    <a href={link === 'About' ? '/#' : `#${link.toLowerCase()}`} className="text-blue-200 hover:text-blue-400 transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Services</h4>
              <ul className="space-y-2 text-blue-200">
                <li>Web Development</li>
                <li>Mobile Apps</li>
                <li>AI Solutions</li>
                <li>Consulting</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-blue-200">
              © 2025 Sriram Natarajan. All rights reserved. Built with Next.js and deployed on Vercel.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
