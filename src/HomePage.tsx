import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useScroll } from "motion/react";
import { 
  Github, 
  Linkedin, 
  Mail, 
  ArrowUpRight,
  Download,
  Music2,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects, usePosts, useSkills, useSettings } from './hooks/useContent';
import { TOOLS } from '../constants';

// --- Types ---
type Section = "home" | "work" | "notebook" | "tools" | "life" | "about" | "contact";

// --- Data ---
const projects = [
  { 
    title: "Notebook OS", 
    category: "Portfolio", 
    tags: ["React", "UI/UX"], 
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1543286386-2e659306cd6c?q=80&w=2000&auto=format&fit=crop"
    ]
  },
  { 
    title: "LILT Finnish", 
    category: "Learning App", 
    tags: ["React Native", "Expo", "TypeScript"], 
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1510519138130-47b2c9cb00e5?q=80&w=2000&auto=format&fit=crop"
    ]
  },
  { 
    title: "VINCE Avatar", 
    category: "System Design", 
    tags: ["C#", "Avatar", "Unity"], 
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1614729939124-032f0b5609ce?q=80&w=2000&auto=format&fit=crop"
    ]
  },
  { 
    title: "Move Fitness", 
    category: "Aggregator", 
    tags: ["React", "Motion"], 
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=2000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2000&auto=format&fit=crop"
    ]
  },
  { 
    title: "Dark Neon", 
    category: "Tech Site", 
    tags: ["WebGL", "Three.js"], 
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2000&auto=format&fit=crop"
    ]
  }
];

const articles = [
  { date: "Dec 26", title: "Camera Capture Refinement - Fluent Alignment", category: "Devlog", readTime: "5 min", tags: ["Computer Vision", "UI"] },
  { date: "Dec 26", title: "Bridging the Gap - Extension to App Sync", category: "Devlog", readTime: "4 min", tags: ["Architecture", "State Management"] },
  { date: "Dec 25", title: "LingoSync Evolution - From OCR to Intelligent Learning", category: "Tech Note", readTime: "8 min", tags: ["AI", "React Native"] },
  { date: "Dec 25", title: "Tactics Game Devlog 1 VFX Update", category: "Devlog", readTime: "3 min", tags: ["Unity", "Shaders"] },
  { date: "Dec 25", title: "Tactics Game Devlog 2 AI System Upgrade", category: "Devlog", readTime: "6 min", tags: ["Game AI", "C#"] }
];

const tools = [
  { name: "Nordic Design System", desc: "A sustainable, highly accessible component library.", icon: "🌿", url: "#", type: "Docs" },
  { name: "HTML 5 Demo", desc: "Simple HTML5 boilerplate demo", icon: "🌐", url: "#", type: "Demo" },
  { name: "Resume Builder", desc: "Professional Resume/CV format for Finnish market.", icon: "📄", url: "#", type: "Tool" },
  { name: "Image to PDF", desc: "Convert multiple images to a single PDF locally.", icon: "📑", url: "#", type: "Utility" },
  { name: "Image to Text", desc: "Extract text from images using AI (OCR)", icon: "🔮", url: "#", type: "Utility" }
];

const lifeItems = [
  {
    title: "Silence & Nature",
    desc: "Hiking in the Finnish archipelago or foraging in local forests. Nature is where I reset my mind.",
    image: "https://images.unsplash.com/photo-1500829243541-74b676fecc20?q=80&w=1000&auto=format&fit=crop",
    span: "md:col-span-2 md:row-span-2"
  },
  {
    title: "Ice Swimming",
    desc: "Avantouinti. The ultimate system reboot after a long week of coding.",
    image: "https://images.unsplash.com/photo-1549468057-5b6faf4ae621?q=80&w=800&auto=format&fit=crop",
    span: "md:col-span-1 md:row-span-1"
  },
  {
    title: "Photography",
    desc: "Documenting the stark contrasts of Nordic light and minimalist architecture.",
    image: "https://images.unsplash.com/photo-1493606371202-6275828f90f3?q=80&w=800&auto=format&fit=crop",
    span: "md:col-span-1 md:row-span-1"
  }
];


const defaultResumeSkillGroups = [
  { category: "AI Workflow", items: ["GitHub Copilot", "Claude (Code)", "Cursor", "CodeX"] },
  { category: "Game Engines", items: ["Unity (primary)", "Unreal (basic)"] },
  { category: "Web / Mobile", items: ["React Native (Expo)", "Three.js", "Node.js", "TypeScript", "Firebase", "Python", "C#"] },
  { category: "Workflow", items: ["GitHub", "Jira", "Cloud deployment", "CI/CD (GitHub Actions)"] },
  { category: "Graphics", items: ["Blender", "Maya", "ZBrush", "Substance Painter", "3ds Max", "Marmoset Toolbag"] },
  { category: "Creative", items: ["Lightroom", "Photoshop", "Premiere Pro", "After Effects"] }
];

const experiences = [
  {
    role: "Founder & Full-Stack Developer",
    company: "SkyhouseZhou",
    period: "1.2026 - Present",
    location: "Turku, Finland",
    descriptions: [
      "Owned the product end to end, from <strong>mobile engineering</strong> and <strong>backend architecture</strong> to data workflows, performance optimization, and release readiness.",
      "Designed an <strong>AI-powered content pipeline</strong> to automate daily content sourcing, generation, and publishing, substantially reducing manual operations.",
      "Implemented an <strong>AI-assisted feedback loop</strong> that translated user feedback into faster content improvements and data updates.",
      "Built a centralized <strong>Firebase/Firestore</strong> content system supporting nearly 3,000 cloud-managed vocabulary items and shared learning materials."
    ]
  },
  {
    role: "Unity Developer Intern",
    company: "Turku UAS - FIT (VINCE Project)",
    period: "09.2025 - 12.2025",
    location: "Turku, Finland",
    descriptions: [
      "Built a <strong>Unity avatar system</strong> to help the VINCE team create and manage character presets efficiently for an immigrant integration project.",
      "Organized the avatar content into a modular setup using <strong>ScriptableObjects</strong>, supporting 20 components and ~30 preset combinations.",
      "Created <strong>editor tools</strong> to streamline preset creation, reducing setup time from ~10 minutes to ~1 minute, with automatic sync/loading to a database."
    ]
  },
  {
    role: "Founder & Software Engineering Dev Manager",
    company: "Shanghai Demu Network",
    period: "2019 - 2024",
    location: "Shanghai, China",
    descriptions: [
      "Contributed to <strong>1000+ scanned/reconstructed artifacts</strong> for national-level and regional museums.",
      "Produced <strong>~50 online panoramic exhibitions</strong> and interactive showcase experiences, coordinating scope, schedule, QA, and client acceptance.",
      "Owned end-to-end delivery across multiple museum clients. <strong>Led museum digitization projects</strong> from planning to delivery."
    ]
  },
  {
    role: "3D Environment Artist",
    company: "Virtuos",
    period: "2018 - 2019",
    location: "Shanghai, China",
    descriptions: [
      "Worked in an AAA production pipeline on the <strong>Need for Speed</strong> project, producing environment assets and supporting integration workflows.",
      "Delivered production-ready environment assets within an established <strong>AAA pipeline</strong> and collaboration process."
    ]
  },
  {
    role: "Product Creative Team Leader",
    company: "Shanghai Zhongxin Info Dev",
    period: "2014 - 2018",
    location: "Shanghai, China",
    descriptions: [
      "Delivered <strong>digital twin archive solutions</strong> for dozens of provincial/municipal institutions, combining 3D content production with real-world systems.",
      "Led coordination across <strong>requirements, scheduling, production, maintenance, and quality control</strong> within the team."
    ]
  }
];

// --- Components ---

const Loader = ({ onComplete }: { onComplete: () => void }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={count >= 100 ? { y: "-100%", borderBottomLeftRadius: "50%", borderBottomRightRadius: "50%" } : { y: 0 }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
      onAnimationComplete={() => {
        if (count >= 100) onComplete();
      }}
      className="fixed inset-0 z-[100] bg-ink text-bg flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="font-display text-[20vw] leading-none mb-8 w-full text-center tracking-tighter mix-blend-difference">
        {Math.min(count, 100)}%
      </div>
      <div className="w-full max-w-[300px] h-[2px] bg-white/10 relative overflow-hidden rounded-full">
        <motion.div 
          className="absolute top-0 left-0 bottom-0 bg-white"
          initial={{ width: "0%" }}
          animate={{ width: `${Math.min(count, 100)}%` }}
          transition={{ ease: "linear", duration: 0.1 }}
        />
      </div>
    </motion.div>
  );
};

const BackgroundBlobs = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 40, stiffness: 50 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const clickScale = useSpring(1, { damping: 20, stiffness: 200 });

  const x1 = useTransform(smoothX, [-1, 1], [-60, 60]);
  const y1 = useTransform(smoothY, [-1, 1], [-60, 60]);

  const x2 = useTransform(smoothX, [-1, 1], [80, -80]);
  const y2 = useTransform(smoothY, [-1, 1], [80, -80]);

  const x3 = useTransform(smoothX, [-1, 1], [-40, 40]);
  const y3 = useTransform(smoothY, [-1, 1], [40, -40]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(x);
      mouseY.set(y);
    };

    const handleMouseDown = () => clickScale.set(1.05);
    const handleMouseUp = () => clickScale.set(1);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [mouseX, mouseY, clickScale]);

  return (
    <motion.div style={{ scale: clickScale }} className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
      {/* Large rotating wireframe circle */}
      <motion.div style={{ x: x2, y: y2 }} className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: [0, 360], scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] rounded-full border border-ink/[0.08]"
        />
      </motion.div>

      {/* Floating geometric shapes & rulers */}
      <motion.div style={{ x: x3, y: y3 }} className="absolute inset-0">
        {/* Floating triangle */}
        <motion.svg 
          animate={{ rotate: [0, 90, 180, 270, 360], x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[25%] left-[15%] w-16 h-16 md:w-20 md:h-20 text-ink/10"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <polygon points="50,10 90,90 10,90" />
        </motion.svg>

        {/* Floating rectangle */}
        <motion.div 
          animate={{ rotate: [360, 270, 180, 90, 0], x: [0, 50, 0], y: [0, -50, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[25%] right-[25%] w-16 h-24 md:w-20 md:h-32 border border-ink/10"
        />

        {/* Animated concentric circles */}
        <motion.div 
          animate={{ scale: [0.95, 1.1, 0.95], rotate: [0, -180, -360] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -right-[5%] w-[40vw] h-[40vw] border-[0.5px] border-dashed border-accent/20 rounded-full flex items-center justify-center overflow-hidden"
        >
          <motion.div 
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="w-[80%] h-[80%] border-[0.5px] border-ink/10 rounded-full" 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} 
            className="absolute w-[60%] h-[60%] border-[0.5px] border-accent/20 rounded-full" 
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const SectionHeading = ({ children, subtitle, className = "mb-20 md:mb-32" }: { children: ReactNode, subtitle?: string, className?: string }) => (
  <div className={`${className} space-y-4 md:space-y-6`}>
    {subtitle && (
      <div className="overflow-hidden">
        <motion.p 
          initial={{ y: "100%" }}
          whileInView={{ y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="text-xs md:text-sm uppercase tracking-[0.4em] font-bold text-ink/70"
        >
          {subtitle}
        </motion.p>
      </div>
    )}
    <div className="overflow-hidden">
      <motion.h2 
        initial={{ y: "120%", rotate: 2 }}
        whileInView={{ y: 0, rotate: 0 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
        className="text-5xl md:text-6xl xl:text-7xl font-display font-medium text-ink tracking-tight py-2"
      >
        {children}
      </motion.h2>
    </div>
  </div>
);

const pageVariants = {
  initial: { opacity: 0, y: 30, scale: 0.98, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, y: -30, scale: 1.02, filter: "blur(8px)" },
};
const pageTransition = { duration: 0.8, ease: [0.22, 1, 0.36, 1] };

const ProjectShowcase = ({
  projects,
  onOpenProject,
  onOpenAll
}: {
  projects: any[];
  onOpenProject: (project: any) => void;
  onOpenAll: () => void;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= projects.length) setActiveIndex(0);
  }, [activeIndex, projects.length]);

  if (!projects.length) return null;

  const activeProject = projects[activeIndex];
  const nextIndex = (activeIndex + 1) % projects.length;
  const nextProject = projects[nextIndex];
  const result = activeProject.outcome || activeProject.results?.[0] || activeProject.year;
  const summary = activeProject.desc || activeProject.overview;
  const selectPrevious = () => setActiveIndex((activeIndex - 1 + projects.length) % projects.length);
  const selectNext = () => setActiveIndex(nextIndex);

  return (
    <div className="mx-auto w-full max-w-[1600px] border-y border-ink/10 bg-[#F5F0E8] shadow-[0_28px_80px_rgba(28,28,28,0.08)]">
      <div
        className="outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
        tabIndex={0}
        aria-label="Selected project chapters. Use the left and right arrow keys to change project."
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') selectPrevious();
          if (event.key === 'ArrowRight') selectNext();
        }}
      >
        <div className="hidden min-h-[690px] lg:grid lg:grid-cols-[0.8fr_1.35fr_3.05fr_0.95fr]">
          <div className="relative flex flex-col justify-between overflow-hidden bg-accent px-8 py-10 text-[#F8F1E8]">
            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em]">
              <span className="h-px w-8 bg-current/60" />
              Current chapter
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={activeIndex}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="-ml-3 font-display text-[clamp(8rem,13vw,13rem)] font-medium leading-[0.72] tracking-[-0.1em]"
                aria-hidden="true"
              >
                {String(activeIndex + 1).padStart(2, '0')}
              </motion.span>
            </AnimatePresence>
            <p className="max-w-[10rem] text-[10px] font-medium uppercase leading-relaxed tracking-[0.2em] text-[#F8F1E8]/75">
              Selected work<br />2022—{new Date().getFullYear()}
            </p>
          </div>

          <div className="flex flex-col justify-between border-r border-ink/10 bg-[#F8F4ED] px-9 py-10 xl:px-11">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProject.id || activeProject.title}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex h-full flex-col"
              >
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-ink/45">
                  <span>{String(activeIndex + 1).padStart(2, '0')}</span>
                  <span className="h-px flex-1 bg-ink/15" />
                  <span>{activeProject.category}</span>
                </div>
                <div className="mt-16 xl:mt-20">
                  <h2 className="font-editorial text-[clamp(2.8rem,4vw,5rem)] font-semibold leading-[0.83] tracking-[-0.055em] text-ink">
                    {activeProject.title}
                  </h2>
                  <p className="mt-8 max-w-[22rem] text-sm leading-7 text-ink/60">{summary}</p>
                </div>
                <div className="mt-auto space-y-7 pt-14">
                  <div className="grid grid-cols-[4.5rem_1fr] gap-4 border-t border-ink/10 pt-5 text-xs">
                    <span className="font-semibold uppercase tracking-[0.16em] text-ink/35">Role</span>
                    <span className="leading-5 text-ink/75">{activeProject.role}</span>
                  </div>
                  <div className="grid grid-cols-[4.5rem_1fr] gap-4 border-t border-ink/10 pt-5 text-xs">
                    <span className="font-semibold uppercase tracking-[0.16em] text-ink/35">Tools</span>
                    <span className="leading-5 text-ink/75">{activeProject.tags.slice(0, 4).join(' · ') || 'Design & Development'}</span>
                  </div>
                  <div className="grid grid-cols-[4.5rem_1fr] gap-4 border-t border-ink/10 pt-5 text-xs">
                    <span className="font-semibold uppercase tracking-[0.16em] text-ink/35">Impact</span>
                    <span className="font-medium leading-5 text-accent">{result}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenProject(activeProject)}
                  className="group mt-10 flex w-full items-center justify-between border-t border-ink pt-5 text-left text-xs font-bold uppercase tracking-[0.18em] text-ink transition-colors hover:text-accent"
                >
                  View case study
                  <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative flex items-center justify-center overflow-hidden bg-[#D9D5CE] px-[6%] py-[7%]">
            <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:radial-gradient(rgba(28,28,28,0.18)_0.7px,transparent_0.7px)] [background-size:7px_7px]" />
            <AnimatePresence mode="wait">
              <motion.button
                key={activeProject.id || activeProject.title}
                type="button"
                onClick={() => onOpenProject(activeProject)}
                initial={{ opacity: 0, scale: 0.95, rotate: -1 }}
                animate={{ opacity: 1, scale: 1, rotate: -1.35 }}
                exit={{ opacity: 0, scale: 1.03, rotate: 0.5 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="group relative z-10 w-full max-w-[860px] bg-[#FCFAF5] p-3 shadow-[0_32px_75px_rgba(28,28,28,0.22)] outline-none transition-shadow hover:shadow-[0_38px_90px_rgba(28,28,28,0.29)] focus-visible:ring-2 focus-visible:ring-accent xl:p-4"
                aria-label={`Open ${activeProject.title} case study`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-white">
                  <img src={activeProject.image} alt={`${activeProject.title} project preview`} className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.015]" />
                </div>
              </motion.button>
            </AnimatePresence>
            <p className="absolute bottom-5 left-6 z-10 text-[9px] font-bold uppercase tracking-[0.22em] text-ink/35">Selected frame · {activeProject.year}</p>
          </div>

          <button
            type="button"
            onClick={selectNext}
            className="group relative overflow-hidden text-left text-white outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
            aria-label={`Show next project: ${nextProject.title}`}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={nextProject.id || nextProject.title}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6 }}
                src={nextProject.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover grayscale-[35%] transition-transform duration-700 group-hover:scale-105"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-[#756579]/80 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/45" />
            <div className="relative flex h-full flex-col justify-between px-7 py-10">
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/75">Next chapter</div>
              <div>
                <span className="font-display text-8xl font-medium leading-none tracking-[-0.08em] text-white/90">{String(nextIndex + 1).padStart(2, '0')}</span>
                <h3 className="mt-8 font-editorial text-4xl font-semibold leading-[0.9] tracking-[-0.04em]">{nextProject.title}</h3>
                <p className="mt-5 text-[10px] font-semibold uppercase leading-5 tracking-[0.2em] text-white/65">
                  {nextProject.tags.slice(0, 3).join(' · ') || nextProject.category}
                </p>
                <span className="mt-8 inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Explore next <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
                </span>
              </div>
            </div>
          </button>
        </div>

        <div className="lg:hidden">
          <div className="grid grid-cols-[5.5rem_1fr] border-b border-ink/10">
            <div className="flex items-end bg-accent px-4 py-6 text-[#F8F1E8]">
              <span className="font-display text-6xl font-medium leading-none tracking-[-0.09em]">{String(activeIndex + 1).padStart(2, '0')}</span>
            </div>
            <div className="flex flex-col justify-between bg-[#F8F4ED] px-5 py-6">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-ink/40">Current chapter · {activeProject.category}</p>
              <h2 className="mt-6 font-editorial text-4xl font-semibold leading-[0.9] tracking-[-0.045em] text-ink sm:text-5xl">{activeProject.title}</h2>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.button
              key={activeProject.id || activeProject.title}
              type="button"
              onClick={() => onOpenProject(activeProject)}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="block w-full bg-[#D9D5CE] px-5 py-8 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent sm:px-10 sm:py-12"
            >
              <div className="rotate-[-1deg] bg-[#FCFAF5] p-2 shadow-[0_20px_45px_rgba(28,28,28,0.2)] sm:p-3">
                <div className="aspect-[4/3] overflow-hidden bg-white">
                  <img src={activeProject.image} alt={`${activeProject.title} project preview`} className="h-full w-full object-contain" />
                </div>
              </div>
            </motion.button>
          </AnimatePresence>
          <div className="bg-[#F8F4ED] px-5 py-7 sm:px-10 sm:py-9">
            <p className="text-sm leading-6 text-ink/60">{summary}</p>
            <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-6 border-t border-ink/10 pt-6 text-xs">
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-ink/35">Role</span>
                <span className="mt-2 block leading-5 text-ink/75">{activeProject.role}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-ink/35">Impact</span>
                <span className="mt-2 block font-medium leading-5 text-accent">{result}</span>
              </div>
            </div>
            <button type="button" onClick={() => onOpenProject(activeProject)} className="mt-8 flex w-full items-center justify-between border-t border-ink pt-4 text-xs font-bold uppercase tracking-[0.17em] text-ink">
              View case study <ArrowUpRight size={17} />
            </button>
          </div>
        </div>

        <div className="flex min-h-32 flex-col border-t border-ink/10 bg-[#F8F4ED] lg:flex-row">
          <div className="grid flex-1 grid-cols-3 sm:grid-cols-5 lg:flex">
            {projects.map((project, index) => (
              <button
                key={project.id || project.title}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-current={activeIndex === index ? 'true' : undefined}
                className={`group relative min-h-20 border-r border-ink/10 px-4 py-5 text-left transition-colors lg:min-w-[150px] lg:flex-1 lg:px-6 lg:py-7 ${activeIndex === index ? 'bg-[#EEE6DB]' : 'hover:bg-[#F1EBE2]'}`}
              >
                <span className={`text-[10px] font-bold tracking-[0.18em] ${activeIndex === index ? 'text-accent' : 'text-ink/30'}`}>{String(index + 1).padStart(2, '0')}</span>
                <span className={`mt-3 hidden truncate text-xs font-semibold lg:block ${activeIndex === index ? 'text-ink' : 'text-ink/45'}`}>{project.title}</span>
                <span className={`absolute bottom-0 left-0 h-1 bg-accent transition-all duration-500 ${activeIndex === index ? 'w-full' : 'w-0 group-hover:w-1/3'}`} />
              </button>
            ))}
          </div>
          <div className="flex min-h-20 items-stretch border-t border-ink/10 lg:min-w-[290px] lg:border-l lg:border-t-0">
            <button type="button" onClick={selectPrevious} className="flex flex-1 items-center justify-center border-r border-ink/10 text-ink transition-colors hover:bg-accent hover:text-white" aria-label="Previous project"><ArrowLeft size={20} /></button>
            <button type="button" onClick={selectNext} className="flex flex-1 items-center justify-center border-r border-ink/10 text-ink transition-colors hover:bg-accent hover:text-white" aria-label="Next project"><ArrowRight size={20} /></button>
            <button type="button" onClick={onOpenAll} className="flex flex-[1.25] items-center justify-center px-4 text-center text-[9px] font-bold uppercase tracking-[0.15em] text-accent transition-colors hover:bg-accent hover:text-white">All cases</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectItem = ({ project, index, onClick }: { project: any, index: number, onClick: () => void }) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div 
      layoutId={`project-container-${project.title}`}
      ref={ref}
      initial={{ opacity: 0, y: 80 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: false, margin: "-100px" }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      className="group border-b border-ink/10 py-12 md:py-20 flex flex-col xl:flex-row xl:items-center justify-between gap-8 xl:gap-12 cursor-pointer relative"
      onClick={onClick}
    >
      <div className="space-y-6 w-full xl:w-5/12 relative z-10 transition-transform duration-700 group-hover:translate-x-4">
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-ink/40 group-hover:text-accent transition-colors">
          <span>0{index + 1}</span>
          <div className="w-8 h-[1px] bg-ink/20 group-hover:bg-accent/50 transition-colors" />
          <motion.span layoutId={`project-category-${project.title}`}>{project.category}</motion.span>
        </div>
        <motion.h3 layoutId={`project-title-${project.title}`} className="text-3xl md:text-4xl lg:text-5xl font-display font-medium text-ink group-hover:text-accent transition-colors duration-500">
          {project.title}
        </motion.h3>
        <div className="flex gap-4 flex-wrap pt-4 text-[10px] uppercase tracking-widest font-bold text-ink/40 group-hover:text-ink/80 transition-colors">
          {project.tags.map((tag: string) => (
            <span key={tag} className="border border-ink/10 px-3 py-1 rounded-full group-hover:border-ink/30 transition-colors">{tag}</span>
          ))}
        </div>
      </div>
      
      <div className="w-full xl:w-7/12 relative z-10 mt-8 xl:mt-0 overflow-hidden rounded-[2rem] aspect-[4/3] xl:aspect-[16/10] bg-ink/5">
        <motion.img 
          layoutId={`project-image-${project.title}`}
          src={project.image} 
          alt={project.title} 
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-700 group-hover:opacity-90" 
        />
        <div className="absolute inset-0 bg-ink/10 group-hover:bg-transparent transition-colors duration-500" />
      </div>
    </motion.div>
  );
};

const ProjectOverlay = ({
  project,
  projects,
  onClose,
  onSelectProject
}: {
  project: any;
  projects: any[];
  onClose: () => void;
  onSelectProject: (p: any) => void;
}) => {
  return (
    <motion.div
      key="modal-backdrop"
      id="project-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-bg overflow-y-auto overflow-x-hidden flex flex-col"
    >
      <button 
        onClick={onClose}
        type="button"
        aria-label="Close project case study"
        className="fixed top-[4.5rem] right-6 md:top-10 md:right-10 w-9 h-9 md:w-12 md:h-12 flex items-center justify-center bg-white/80 backdrop-blur-md border border-ink/10 rounded-full z-[60] hover:bg-white text-ink hover:text-accent transition-all group"
      >
        <span aria-hidden="true" className="text-xl leading-none md:text-2xl group-hover:rotate-90 transition-transform duration-300">×</span>
      </button>
      
      <AnimatePresence mode="wait">
        <ProjectDetail 
          key={project.title} 
          project={project} 
          projects={projects} 
          onSelectProject={onSelectProject} 
        />
      </AnimatePresence>
    </motion.div>
  );
};

const ProjectDetail = ({ project, projects, onSelectProject }: any) => {
  useEffect(() => {
    document.getElementById('project-overlay')?.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
  }, []);

  const currentIndex = projects.findIndex((p: any) => p.title === project.title);
  const nextProject = projects[(currentIndex + 1) % projects.length];
  const prevProject = projects[(currentIndex - 1 + projects.length) % projects.length];
  const galleryItems = (project.gallery || [])
    .map((item: any) => typeof item === 'string' ? { type: 'image', url: item, caption: '' } : item)
    .filter((item: any) => item?.url);
  const getMediaLink = (item: any) => item?.linkUrl || item?.href || item?.link || item?.targetUrl || "";
  const normalizeMediaLink = (url: string) => {
    const value = url.trim();
    if (!value) return "";
    if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(value)) return value;
    return `https://${value}`;
  };
  const isNewTabLink = (url: string) => /^(https?:\/\/|mailto:|tel:)/i.test(url);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      layoutId={`project-container-${project.title}`}
      className="flex-1 w-full flex flex-col relative z-10 pt-12 md:pt-32"
    >
      <div className="max-w-6xl mx-auto px-6 w-full flex flex-col items-start relative z-10 flex-1">
        <motion.div layoutId={`project-category-${project.title}`} className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2 md:mb-6">
          {project.category}
        </motion.div>
        <motion.h2 layoutId={`project-title-${project.title}`} className="text-5xl pr-14 md:pr-0 md:text-7xl lg:text-8xl font-display font-medium text-ink mb-16 md:mb-24 tracking-tight leading-none">
          {project.title}
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 w-full mb-20 md:mb-32">
          <div className="md:col-span-8 space-y-8">
            <h3 className="text-xl font-display font-medium text-ink">Project Overview</h3>
            <p className="text-xl font-light leading-relaxed text-ink/80">
              {project.overview || project.desc}
            </p>
            {project.desc && project.desc !== project.overview && (
              <p className="text-base font-light leading-relaxed text-ink/60">{project.desc}</p>
            )}
          </div>
          <div className="md:col-span-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-6 border-b border-ink/10 pb-4">Technologies Stack</h3>
            <div className="flex gap-2 flex-wrap">
              {project.tags.map((tag: string) => (
                <span key={tag} className="border border-ink/10 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold text-ink/60">{tag}</span>
              ))}
            </div>
            {project.link && (
              <a
                href={normalizeMediaLink(project.link)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-bg transition-colors hover:bg-accent"
              >
                Visit live project <ArrowUpRight size={13} />
              </a>
            )}
          </div>
        </div>

        {/* Main Image */}
        <div className="w-full relative bg-ink/5 rounded-[2rem] md:rounded-[3rem] overflow-hidden mb-20 md:mb-32">
          <motion.img 
            layoutId={`project-image-${project.title}`}
            src={project.image} 
            alt={project.title}
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Challenges & Solutions */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mb-20 md:mb-32 w-full max-w-4xl mx-auto"
        >
          <div className="space-y-6">
            <h3 className="text-2xl font-display font-medium text-ink">The Challenge</h3>
            <p className="text-lg font-light leading-relaxed text-ink/80">
              {project.challenge || "Designing a clear product experience while balancing technical constraints, performance, and real-world usability."}
            </p>
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-display font-medium text-ink">The Solution</h3>
            <p className="text-lg font-light leading-relaxed text-ink/80">
              {project.solution || "Built a focused, responsive system with a modular architecture and a visual language tailored to the product's core workflow."}
            </p>
          </div>
        </motion.div>

        {/* Gallery */}
        {galleryItems.length > 0 && (
          <div className="w-full mb-20 md:mb-32">
            <div className="flex items-end justify-between gap-8 mb-8 md:mb-12">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-ink/40 mb-3">Visual Archive</div>
                <h3 className="text-3xl md:text-5xl font-display font-medium text-ink">Project Mosaic</h3>
              </div>
              <div className="hidden md:block h-px flex-1 max-w-sm bg-ink/10">
                <div className="h-px w-28 bg-accent" />
              </div>
            </div>

            <div className="columns-1 md:columns-2 2xl:columns-3 gap-0">
              {galleryItems.map((item: any, idx: number) => {
                const mediaLink = normalizeMediaLink(getMediaLink(item));
                const mediaBody = item.type === 'video' ? (
                  <video
                    src={item.url}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-auto object-contain bg-ink"
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.caption || `Gallery ${idx + 1}`}
                    className="w-full h-auto object-contain"
                  />
                );

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: Math.min(idx * 0.04, 0.24), ease: [0.76, 0, 0.24, 1] }}
                    className={`group relative mb-0 inline-block w-full break-inside-avoid overflow-visible align-top ${mediaLink ? 'cursor-pointer' : ''}`}
                  >
                    {mediaLink && item.type !== 'video' ? (
                      <a
                        href={mediaLink}
                        target={isNewTabLink(mediaLink) ? "_blank" : undefined}
                        rel={isNewTabLink(mediaLink) ? "noopener noreferrer" : undefined}
                        aria-label={`Open ${item.caption || `gallery item ${idx + 1}`}`}
                        className="block"
                      >
                        {mediaBody}
                      </a>
                    ) : mediaBody}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="pointer-events-none absolute left-5 right-5 bottom-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="inline-flex rounded-full bg-bg/85 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-ink/50 border border-ink/10 mb-2">
                        {item.type === 'video' ? 'Video' : 'Image'} {String(idx + 1).padStart(2, '0')}
                      </div>
                      {item.caption && (
                        <p className="max-w-[90%] text-sm md:text-base font-display font-medium text-bg drop-shadow-sm">
                          {item.caption}
                        </p>
                      )}
                    </div>
                    {mediaLink && (
                      <a
                        href={mediaLink}
                        target={isNewTabLink(mediaLink) ? "_blank" : undefined}
                        rel={isNewTabLink(mediaLink) ? "noopener noreferrer" : undefined}
                        onClick={(event) => event.stopPropagation()}
                        className="absolute right-5 top-5 z-10 inline-flex items-center gap-1.5 rounded-full border border-bg/50 bg-ink/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-bg opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100"
                      >
                        Open <ArrowUpRight size={12} />
                      </a>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Results / Outcomes */}
        <motion.div
  
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="hidden w-full bg-accent/[0.03] rounded-[3rem] p-10 md:p-16 border border-accent/10 mb-32"
        >
          <h3 className="text-2xl font-display font-medium text-ink mb-12">Key Outcomes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            <div className="space-y-3">
              <div className="text-5xl md:text-6xl font-display font-medium text-accent">300%</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50">Performance Boost</div>
            </div>
            <div className="space-y-3">
              <div className="text-5xl md:text-6xl font-display font-medium text-accent">50ms</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50">Interaction Latency</div>
            </div>
            <div className="space-y-3">
              <div className="text-5xl md:text-6xl font-display font-medium text-accent">&gt;99%</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50">Crash-Free Rate</div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Footer */}
        <div className="w-full border-t border-ink/10 pt-20 pb-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0">
          <div 
            onClick={() => onSelectProject(prevProject)}
            className="group cursor-pointer flex flex-col items-start"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-4 flex items-center gap-2 group-hover:text-accent transition-colors">
              <span className="w-6 h-[1px] bg-ink/20 group-hover:bg-accent transition-colors" /> Previous
            </span>
            <h4 className="text-lg md:text-xl font-medium text-ink/70 group-hover:text-accent transition-colors">
              {prevProject.title}
            </h4>
          </div>
          <div 
            onClick={() => onSelectProject(nextProject)}
            className="group cursor-pointer flex flex-col items-start md:items-end md:text-right"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-4 flex items-center justify-end gap-2 group-hover:text-accent transition-colors">
              Next <span className="w-6 h-[1px] bg-ink/20 group-hover:bg-accent transition-colors" />
            </span>
            <h4 className="text-lg md:text-xl font-medium text-ink/70 group-hover:text-accent transition-colors">
              {nextProject.title}
            </h4>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

const ArticleOverlay = ({
  article,
  articles,
  onClose,
  onSelectArticle
}: {
  article: any;
  articles: any[];
  onClose: () => void;
  onSelectArticle: (a: any) => void;
}) => {
  return (
    <motion.div
      key="modal-backdrop-article"
      id="article-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-bg overflow-y-auto overflow-x-hidden flex flex-col"
    >
      <button 
        onClick={onClose}
        className="fixed top-[4.5rem] right-6 md:top-10 md:right-10 w-9 h-9 md:w-12 md:h-12 flex items-center justify-center bg-white/80 backdrop-blur-md border border-ink/10 rounded-full z-[60] hover:bg-white text-ink hover:text-accent transition-all group"
      >
        <span className="text-base md:text-xl group-hover:rotate-90 transition-transform duration-300">✕</span>
      </button>
      
      <AnimatePresence mode="wait">
        <ArticleDetail 
          key={article.title} 
          article={article} 
          articles={articles} 
          onSelectArticle={onSelectArticle} 
        />
      </AnimatePresence>
    </motion.div>
  );
};

const ArticleDetail = ({ article, articles, onSelectArticle }: any) => {
  useEffect(() => {
    document.getElementById('article-overlay')?.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
  }, []);

  const currentIndex = articles.findIndex((a: any) => a.title === article.title);
  const nextArticle = articles[(currentIndex + 1) % articles.length];
  const prevArticle = articles[(currentIndex - 1 + articles.length) % articles.length];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      layoutId={`article-container-${article.title}`}
      className="flex-1 w-full flex flex-col relative z-10 pt-12 md:pt-32 pb-20"
    >
      <div className="max-w-4xl mx-auto px-6 w-full flex flex-col items-start relative z-10 flex-1">
        <div className="flex items-center gap-4 mb-2 md:mb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-1 rounded-sm">
            {article.category}
          </span>
          <span className="text-xs text-ink/40 font-mono">
            {article.date}
          </span>
        </div>
        <motion.h2 layoutId={`article-title-${article.title}`} className="text-4xl pr-14 md:pr-0 md:text-6xl font-display font-medium text-ink mb-16 md:mb-24 tracking-tight leading-loose md:leading-normal">
          {article.title}
        </motion.h2>
        
        <div className="prose prose-lg prose-p:text-ink/80 prose-headings:text-ink max-w-none w-full mb-32 font-light leading-relaxed">
          <p className="lead text-xl md:text-2xl text-ink mb-12">
            This log details the methodology and problem-solving journey of building <strong>{article.title}</strong>. In the spirit of Nordic transparency, I'll walk through not just the successes, but the dead-ends and learnings along the way.
          </p>
          <div className="flex gap-2 flex-wrap mb-10">
            {article.tags?.map((tag: string) => (
              <span key={tag} className="border border-ink/10 px-3 py-1 rounded-full text-xs text-ink/60">{tag}</span>
            ))}
          </div>
          <h3 className="text-2xl font-display font-medium text-ink mt-12 mb-6">Initial Exploration & Empathy</h3>
          <p>
            When approaching this problem, the primary goal was ensuring the digital experience felt as accessible and calm as our physical environments here in Finland. We started by taking a step back and asking: <em>Does this feature actually bring value to the user, or is it just noise?</em>
          </p>
          <p>
            The prototype went through three iterations. The first was theoretically sound but practically clumsy.
          </p>
          <blockquote className="border-l-2 border-accent/50 pl-6 my-10 italic text-ink/70">
            "Good design is obvious. Great design is transparent and respectful of the user's focus."
          </blockquote>
          <h3 className="text-2xl font-display font-medium text-ink mt-12 mb-6">The Technical Solution</h3>
          <p>
            Our architecture leans heavily on minimal, sustainable code. Rather than pulling in heavy libraries, we wrote lean, focused utility functions. This not only decreases load times (crucial for users on slower connections) but reduces the overall carbon footprint of our digital product.
          </p>
          <p>
            Moving forward, the focus will be on further integrating these principles. You can find the open-source snippets in my repositories.
          </p>
        </div>

        {/* Navigation Footer */}
        <div className="w-full border-t border-ink/10 pt-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 mt-auto">
          <div 
            onClick={() => onSelectArticle(prevArticle)}
            className="group cursor-pointer flex flex-col items-start"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-4 flex items-center gap-2 group-hover:text-accent transition-colors">
              <span className="w-6 h-[1px] bg-ink/20 group-hover:bg-accent transition-colors" /> Previous Log
            </span>
            <h4 className="text-base md:text-lg font-medium text-ink/70 group-hover:text-accent transition-colors line-clamp-2">
              {prevArticle.title}
            </h4>
          </div>
          <div 
            onClick={() => onSelectArticle(nextArticle)}
            className="group cursor-pointer flex flex-col items-start md:items-end md:text-right"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-4 flex items-center justify-end gap-2 group-hover:text-accent transition-colors">
              Next Log <span className="w-6 h-[1px] bg-ink/20 group-hover:bg-accent transition-colors" />
            </span>
            <h4 className="text-base md:text-lg font-medium text-ink/70 group-hover:text-accent transition-colors line-clamp-2">
              {nextArticle.title}
            </h4>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LifeItemCard = ({ item, index }: { item: any, index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <motion.div 
      viewport={{ once: false, margin: "-50px" }}
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.8, ease: "easeOut" }}
      ref={ref}
      className={`relative overflow-hidden rounded-3xl group ${item.span} min-h-[300px] md:min-h-[400px] bg-ink/5 cursor-pointer border border-transparent hover:border-ink/10 transition-colors pointer-events-auto`}
    >
      <motion.img 
        style={{ y }}
        src={item.image} 
        alt={item.title} 
        className="absolute inset-0 w-full h-[130%] -top-[15%] object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent pointer-events-none transition-opacity duration-1000 group-hover:opacity-70"></div>
      <div className="absolute bottom-0 left-0 p-8 md:p-12 pointer-events-none">
        <motion.h5 
          className="font-display font-medium text-2xl md:text-3xl text-white mb-3 group-hover:text-[#FAFAFA] transition-colors"
        >
          {item.title}
        </motion.h5>
        <p className="text-base font-light text-white/80 max-w-lg group-hover:text-white/95 transition-colors">{item.desc}</p>
      </div>
    </motion.div>
  );
};

const LifeCollageSection = ({ items, portrait, centerImage }: { items: any[]; portrait?: string | null; centerImage?: string | null }) => {
  const interestItems = items.filter((item) => item?.title || item?.image).slice(0, 6);
  const fallbackPortrait = interestItems.find((item) => item?.image)?.image;
  const portraitImage = centerImage || portrait || fallbackPortrait;
  const collageItems = [
    { title: "Basketball", image: "/images/life/collage/basketball.png" },
    { title: "Cooking", image: "/images/life/collage/cooking.png" },
    { title: "Photography", image: "/images/life/collage/photography.png" },
    { title: "Design & Development", image: "/images/life/collage/gaming.png" }
  ];
  const cardSlots = [
    { className: "lg:left-[8%] lg:top-[12%] lg:w-[28%]", connector: "M30 33 C36 37 42 43 47 51" },
    { className: "lg:right-[7%] lg:top-[11%] lg:w-[28%]", connector: "M70 33 C64 37 58 43 53 51" },
    { className: "lg:left-[7%] lg:top-[48%] lg:w-[28%]", connector: "M29 63 C37 62 43 59 48 55" },
    { className: "lg:right-[7%] lg:top-[48%] lg:w-[28%]", connector: "M71 63 C63 62 57 59 52 55" }
  ];
  const doodles = [
    { src: "/images/life/doodles/list.png", className: "right-[15.5%] bottom-[6.2%] w-[16rem] rotate-0 opacity-92" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-100px" }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      className="relative min-h-[980px] overflow-hidden px-5 py-12 md:p-14"
    >
      <div className="absolute inset-0 bg-[#F4EEE4]" />
      <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_1px_1px,rgba(28,28,28,0.2)_1px,transparent_0)] bg-[length:18px_18px]" />
      <div className="absolute left-[9%] top-[10%] hidden h-64 w-64 rounded-full border border-accent/15 lg:block" />
      <div className="absolute right-[8%] bottom-[9%] hidden h-80 w-80 rounded-full border border-ink/10 lg:block" />
      <motion.img
        src="/images/life/portrait-paper-brush.png"
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.98, rotate: -7 }}
        whileInView={{ opacity: 0.68, scale: 1, rotate: -7 }}
        viewport={{ once: false, margin: "-120px" }}
        transition={{ duration: 0.9, delay: 0.04, ease: [0.76, 0, 0.24, 1] }}
        className="pointer-events-none absolute left-1/2 top-1/2 z-[2] hidden w-[43%] max-w-none -translate-x-1/2 -translate-y-1/2 mix-blend-multiply lg:block"
      />
      <div className="pointer-events-none absolute inset-0 z-[26] hidden lg:block">
        {doodles.map((doodle, index) => (
          <motion.img
            key={doodle.src}
            src={doodle.src}
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0, y: 14, rotate: index % 2 === 0 ? -4 : 4 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: false, margin: "-120px" }}
            transition={{ duration: 0.7, delay: 1.05 + index * 0.06, ease: [0.76, 0, 0.24, 1] }}
            className={`absolute mix-blend-multiply ${doodle.className}`}
          />
        ))}
      </div>

      <svg className="pointer-events-none absolute inset-0 z-[14] hidden h-full w-full lg:block" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <filter id="life-rough-line">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="8" />
            <feDisplacementMap in="SourceGraphic" scale="0.22" />
          </filter>
        </defs>
        {cardSlots.map((slot, index) => (
          <g key={`life-line-${index}`} filter="url(#life-rough-line)">
            <motion.path
              d={slot.connector}
              fill="none"
              stroke="rgba(174,119,72,0.34)"
              strokeWidth="0.075"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: false, margin: "-120px" }}
              transition={{ duration: 1.05, delay: 0.7 + index * 0.1, ease: [0.76, 0, 0.24, 1] }}
            />
          </g>
        ))}
      </svg>

      <motion.img
        src="/images/life/love-life-growing.png"
        alt=""
        aria-hidden="true"
        initial={{ opacity: 0, y: 22, rotate: -2 }}
        whileInView={{ opacity: 0.82, y: 0, rotate: -2 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 0.8, delay: 1.35, ease: [0.76, 0, 0.24, 1] }}
        className="pointer-events-none absolute bottom-[5%] left-[6%] z-[26] hidden w-[28%] mix-blend-multiply lg:block"
      />

      <div className="relative z-20 flex min-h-[820px] flex-col items-center justify-center gap-7 lg:block">
        <motion.div
          initial={{ opacity: 0, y: 34, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, margin: "-120px" }}
          transition={{ duration: 0.85, delay: 0.12, ease: [0.76, 0, 0.24, 1] }}
          className="relative z-30 lg:absolute lg:left-1/2 lg:top-1/2 lg:w-[36%] lg:-translate-x-1/2 lg:-translate-y-1/2"
        >
          <div className="absolute inset-x-8 bottom-2 h-8 rounded-full bg-ink/15 blur-xl" />
          <div className="relative w-72 md:w-96 lg:w-full">
            {portraitImage ? (
              <img
                src={portraitImage}
                alt="Personal portrait"
                className="relative z-10 w-full h-auto max-h-[900px] object-contain drop-shadow-[0_24px_32px_rgba(28,28,28,0.16)]"
              />
            ) : (
              <div className="relative z-10 w-full aspect-[3/5] rounded-full border border-dashed border-ink/15 flex items-center justify-center text-ink/35 font-display text-4xl">
                Life
              </div>
            )}
          </div>
        </motion.div>

        {collageItems.map((item, index) => (
          <motion.article
            key={`${item.title || "life"}-${index}`}
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.75, delay: 0.48 + index * 0.12, ease: [0.76, 0, 0.24, 1] }}
            whileHover={{ y: -6, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
            className={`relative z-[18] w-full max-w-xs lg:absolute ${cardSlots[index]?.className || ""}`}
          >
            {item.image && (
              <div className="relative inline-block">
                <img src={item.image} alt={item.title || "Life interest"} className="relative z-10 block w-full h-auto object-contain drop-shadow-[0_16px_22px_rgba(28,28,28,0.08)]" />
              </div>
            )}
          </motion.article>
        ))}

        <div className="hidden">
          {["Stay Curious", "Be Present", "Keep Creating", "Enjoy the Process"].map((line, index) => (
            <div key={line} className="flex items-center gap-3 py-1.5 border-b border-ink/10 last:border-b-0 text-sm font-hand text-ink/70">
              <span className="text-accent">{index === 0 ? "✦" : index === 1 ? "◎" : index === 2 ? "✎" : "♡"}</span>
              {line}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const AllProjectsOverlay = ({ projects, onClose, onSelectProject }: { projects: any[], onClose: () => void, onSelectProject: (p: any) => void }) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    document.getElementById('all-projects-overlay')?.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
  }, [activeCategory, viewMode]);

  const categories = ["All", ...Array.from(new Set(projects.map(p => p.category)))];
  const filteredProjects = activeCategory === "All" ? projects : projects.filter(p => p.category === activeCategory);

  return (
    <motion.div
      key="all-projects-overlay"
      id="all-projects-overlay"
      initial={{ opacity: 0, y: "10%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "10%" }}
      transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-[60] bg-bg overflow-y-auto overflow-x-hidden flex flex-col pt-24 pb-40 px-6 md:px-12 lg:px-24"
    >
      <button 
        onClick={onClose}
        className="fixed top-[4.5rem] right-6 md:top-10 md:right-10 w-9 h-9 md:w-12 md:h-12 flex items-center justify-center bg-white/80 backdrop-blur-md border border-ink/10 rounded-full z-[70] hover:bg-white text-ink hover:text-accent transition-all group shadow-sm"
      >
        <span className="text-base md:text-xl group-hover:rotate-90 transition-transform duration-300">✕</span>
      </button>

      <div className="max-w-[1400px] w-full mx-auto relative flex-1 flex flex-col">
        <div className="mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8 z-10 relative">
          <div>
            <motion.h2 layoutId="caseArchiveHeading" className="text-5xl md:text-7xl lg:text-8xl font-display font-medium text-ink tracking-tight mb-8">Case Archive</motion.h2>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                    activeCategory === cat ? "bg-ink text-bg" : "bg-ink/5 border border-ink/10 text-ink/60 hover:bg-ink/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-1 bg-ink/5 p-1 rounded-full border border-ink/10">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-full transition-all ${viewMode === "grid" ? "bg-white shadow-sm text-ink" : "text-ink/40 hover:text-ink/60"}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-full transition-all ${viewMode === "list" ? "bg-white shadow-sm text-ink" : "text-ink/40 hover:text-ink/60"}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
            </button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 w-full max-w-[1400px] mx-auto z-10 relative"
          >
            <AnimatePresence>
              {filteredProjects.map((project, i) => (
                <motion.div
                  layoutId={`all-project-grid-${project.title}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  key={project.title}
                  onClick={() => onSelectProject(project)}
                  className="group cursor-pointer flex flex-col gap-4"
                >
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-ink/5 border border-ink/10 relative">
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="px-1">
                    <h3 className="text-xl font-display font-medium text-ink group-hover:text-accent transition-colors">{project.title}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mt-1">{project.category}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-[1400px] mx-auto flex flex-col z-10 relative"
          >
            <AnimatePresence>
              {filteredProjects.map((project, i) => (
                <motion.div
                  layoutId={`all-project-list-${project.title}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  key={project.title}
                  onClick={() => onSelectProject(project)}
                  className="group cursor-pointer border-b border-ink/10 py-6 md:py-10 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full"
                >
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-bold text-ink/20 w-8">0{i + 1}</span>
                    <h3 className="text-2xl md:text-5xl font-display font-medium text-ink group-hover:text-accent group-hover:translate-x-4 transition-all duration-300">{project.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 md:w-1/3 justify-start md:justify-end">
                    <div className="flex gap-2 flex-wrap text-left md:text-right">
                       {project.tags.slice(0, 2).map((tag: string) => (
                         <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-ink/40 rounded-full px-3 py-1 bg-ink/5 group-hover:bg-ink/10 transition-colors">{tag}</span>
                       ))}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent whitespace-nowrap hidden lg:block bg-accent/10 px-2 py-1 rounded-sm">{project.category}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default function App() {
  const navigate = useNavigate();

  // Firebase data hooks
  const { projects: rawProjects, loading: projectsLoading } = useProjects();
  const { posts: rawPosts, loading: postsLoading } = usePosts();
  const { skills: rawSkills, loading: skillsLoading } = useSkills();
  const { settings, loading: settingsLoading } = useSettings();

  const projects = rawProjects.map(p => ({
    id: p.id,
    title: p.title,
    category: p.category,
    tags: p.tags || [],
    image: p.coverImage || p.media?.[0]?.url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    gallery: p.media || [],
    color: p.themeColor || "bg-ink",
    desc: p.description || p.shortDescription || p.oneLiner || p.content?.overview || "A detailed project exploring new interfaces.",
    overview: p.content?.overview || p.description || p.shortDescription || p.oneLiner,
    challenge: p.content?.challenges,
    solution: p.content?.solutions,
    results: p.content?.results || [],
    outcome: p.outcome,
    year: p.year || "2024",
    role: p.role || "Lead Developer",
    link: p.liveUrl || p.demoUrl || p.githubUrl,
    featured: p.featured || false
  }));

  const featuredProjects = projects.filter(project => project.featured);
  const showcaseProjects = (featuredProjects.length ? featuredProjects : projects).slice(0, 5);

  const articles = rawPosts.map(p => ({
    id: p.id,
    title: p.title,
    category: p.category || "Post",
    date: p.date ? new Date(p.date).toLocaleDateString() : "Recent",
    readTime: p.readTime || "5 min read",
    content: p.content,
    tags: p.tags || [],
    coverImage: p.coverImage
  }));

  const tools = TOOLS;
  const recentProjectIds = settings?.homepage?.recentProjectIds || [];
  const recentProjects = recentProjectIds.length > 0
    ? recentProjectIds
      .map(id => projects.find(project => project.id === id || project.title === id))
      .filter(Boolean)
      .slice(0, 2)
    : projects.slice(0, 2);
  const configuredLifeItems = settings?.homepage?.lifeItems?.length
    ? settings.homepage.lifeItems.map((item, index) => ({
      ...lifeItems[index],
      ...item,
      span: lifeItems[index]?.span || ""
    }))
    : lifeItems;

  const groupedResumeSkills = rawSkills
    .map((skill: any) => {
      const rawItems = Array.isArray(skill.items)
        ? skill.items
        : Array.isArray(skill.skills)
          ? skill.skills
          : typeof skill.items === "string"
            ? skill.items.split(/\u00b7|\u00c2\u00b7|\|/)
            : [];

      return {
        category: skill.category || skill.name,
        items: rawItems.map((item: string) => item.trim()).filter(Boolean)
      };
    })
    .filter(group => group.category && group.items.length > 0);
  const displayResumeSkills = groupedResumeSkills.length > 0 ? groupedResumeSkills : defaultResumeSkillGroups;

  const loading = projectsLoading || postsLoading || skillsLoading || settingsLoading;

  const [activeSection, setActiveSection] = useState<Section>("home");
  const [time, setTime] = useState("");
  const photo = settings?.welcome?.homePhotoUrl || settings?.welcome?.avatarUrl || null;
  const heroLine1 = settings?.welcome?.heroLine1 || "Interactive";
  const heroLine2 = settings?.welcome?.heroLine2 || "Experiences";
  const heroLine3 = settings?.welcome?.heroLine3 || "Engineer.";
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id as Section);
        }
      });
    }, { rootMargin: "-40% 0px -59% 0px" });

    setTimeout(() => {
      document.querySelectorAll("section[id]").forEach(sec => observer.observe(sec));
    }, 1000);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const navContainer = document.getElementById('mobile-nav-container');
    const activeItem = document.getElementById(`nav-item-${activeSection}`);
    if (navContainer && activeItem) {
      const scrollLeft = activeItem.offsetLeft - navContainer.clientWidth / 2 + activeItem.clientWidth / 2;
      navContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeSection]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navItems: { id: Section, label: string }[] = [
    { id: "home", label: "Index" },
    { id: "work", label: "Work" },
    { id: "notebook", label: "Notebook" },
    { id: "tools", label: "Tools" },
    { id: "life", label: "Life" },
    { id: "about", label: "Profile" },
    { id: "contact", label: "Contact" }
  ];

  return (
    <main className="min-h-screen relative selection:bg-ink selection:text-white pb-20 overflow-x-hidden">
      <AnimatePresence>
        {loading && <Loader key="loader" onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      <motion.div 
        style={{ scaleX: scrollYProgress, transformOrigin: "0%", opacity: loading ? 0 : 1 }} 
        className="fixed top-0 left-0 right-0 h-1 bg-accent z-50 rounded-r-full transition-opacity duration-1000"
      />

      <BackgroundBlobs />
      <div className="fixed inset-0 dot-pattern -z-10 pointer-events-none" />

      {/* Header Navigation */}
      <header className="fixed top-0 inset-x-0 p-6 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center z-40 pointer-events-none">
        <div className="space-y-1 pointer-events-auto">
          <h1 className="text-xl font-bold tracking-tight text-ink font-display cursor-pointer" onClick={() => scrollTo("home")}>Zhou Bowen</h1>
          <p className="text-[10px] text-ink/50 uppercase tracking-[0.2em] font-bold">Creative Development</p>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 pointer-events-auto mt-4 md:mt-0">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`text-[10px] uppercase tracking-widest font-bold transition-colors relative ${activeSection === item.id ? "text-ink" : "text-ink/40 hover:text-ink/80"}`}
            >
              {item.label}
              {activeSection === item.id && (
                <motion.div layoutId="navIndicator" className="absolute -bottom-2 left-0 right-0 h-[2px] bg-ink" />
              )}
            </button>
          ))}
        </nav>

        <div className="hidden lg:flex flex-col items-end gap-1 pointer-events-auto">
          <div className="text-xs font-mono text-ink/60">{time}</div>
          <p className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Turku / FI</p>
        </div>
      </header>

      {/* Mobile Nav (Bottom) */}
      <div id="mobile-nav-container" className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl p-1.5 rounded-full border border-ink/10 flex items-center shadow-lg z-50 overflow-x-auto max-w-[90vw] scroll-smooth hide-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            id={`nav-item-${item.id}`}
            onClick={() => scrollTo(item.id)}
            className={`relative px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold transition-colors whitespace-nowrap rounded-full ${activeSection === item.id ? "text-bg" : "text-ink/60"}`}
          >
            <span className="relative z-10">{item.label}</span>
            {activeSection === item.id && (
              <motion.div layoutId="navIndicatorMobile" transition={{ type: "spring", stiffness: 300, damping: 30 }} className="absolute inset-0 bg-ink rounded-full shadow-sm" />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col w-full relative">
        
        {/* --- HOME SECTION --- */}
          <section 
            id="home"
            className="min-h-screen flex flex-col justify-center px-6 md:px-12 xl:px-24 pt-32 pb-32 lg:pb-24"
          >
            <div className="w-full max-w-[1400px] mx-auto flex flex-col relative w-full">
              
              {/* Massive Typographical Header */}
              <div className="relative text-[14vw] sm:text-[12vw] lg:text-[110px] xl:text-[140px] 2xl:text-[160px] font-display font-medium text-ink leading-[0.85] tracking-tighter w-full mb-16 md:mb-24 lg:mb-32">
                
                {/* Background Photo */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 50 }} 
                  animate={!loading ? { opacity: 1, scale: 1, y: 0 } : {}} 
                  transition={{ duration: 1.2, delay: 0.2, ease: [0.2, 0.65, 0.3, 0.9] }}
                  className="absolute left-1/2 md:left-[55%] lg:left-[60%] -translate-x-1/2 md:-translate-x-0 -top-[10%] md:-top-[30%] lg:-top-[45%] w-[65vw] md:w-[400px] lg:w-[500px] xl:w-[600px] aspect-square z-0 group overflow-hidden"
                  style={photo ? { WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)', maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)' } : {}}
                >
                  {photo ? (
                    <img src={photo} alt="My true self" className="w-full h-full object-cover grayscale opacity-90 mix-blend-multiply group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 rounded-full m-8 border border-dashed border-ink/10 pointer-events-none" />
                  )}
                </motion.div>

                <div className="overflow-hidden pb-8 -mb-8 mb-2 md:mb-4 flex justify-start relative z-10 pointer-events-none">
                  <motion.div initial={{ y: "110%", rotate: 2 }} animate={!loading ? { y: 0, rotate: 0 } : {}} transition={{ duration: 1.2, delay: 0.2, ease: [0.76, 0, 0.24, 1] }} className="pb-2">
                    {heroLine1}
                  </motion.div>
                </div>
                <div className="overflow-hidden pb-8 -mb-8 flex justify-center -mt-2 md:-mt-4 lg:-mt-6 relative z-10 pointer-events-none">
                  <motion.div initial={{ y: "110%", rotate: 2 }} animate={!loading ? { y: 0, rotate: 0 } : {}} transition={{ duration: 1.2, delay: 0.3, ease: [0.76, 0, 0.24, 1] }} className="italic bg-clip-text text-transparent bg-gradient-to-r from-accent via-sage to-coral animate-gradient bg-[length:200%_auto] transition-all opacity-90 hover:opacity-100 pointer-events-auto cursor-crosshair px-4 sm:px-6 pb-2">
                    {heroLine2}
                  </motion.div>
                </div>
                <div className="overflow-hidden pb-8 -mb-8 flex justify-end mt-0 md:-mt-2 lg:-mt-6 relative z-10 pointer-events-none">
                  <motion.div initial={{ y: "110%", rotate: 2 }} animate={!loading ? { y: 0, rotate: 0 } : {}} transition={{ duration: 1.2, delay: 0.4, ease: [0.76, 0, 0.24, 1] }} className="pb-2">
                    {heroLine3}
                  </motion.div>
                </div>
              </div>

              {/* Bottom Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-end border-t border-ink/10 pt-8 mt-auto">
                
                {/* Intro */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }} animate={!loading ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.6, duration: 1, ease: [0.76, 0, 0.24, 1] }}
                  className="lg:col-span-6 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-center"
                >
                  <p className="text-lg md:text-xl font-light text-ink/80 leading-relaxed max-w-lg">
                    Bridging the gap between technical art and software engineering. Crafting peaceful digital experiences through minimal code.
                  </p>
                </motion.div>
                
                <div className="hidden lg:block lg:col-span-1"></div>

                {/* Recent Works */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }} animate={!loading ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.8, duration: 1, ease: [0.76, 0, 0.24, 1] }}
                  className="lg:col-span-5 flex flex-col"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink/50">Recent Works</h4>
                    <button onClick={() => scrollTo("work")} className="text-[10px] font-bold uppercase tracking-widest text-accent hover:opacity-70 transition-opacity flex items-center gap-1">All <ArrowUpRight size={10} /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recentProjects.map((project, idx) => (
                       <motion.div layoutId={`project-container-${project.title}`} key={idx} className="group cursor-pointer flex items-center gap-4 p-2 -mx-2 rounded-xl hover:bg-ink/5 transition-colors border border-transparent hover:border-ink/10" onClick={() => setSelectedProject(project)}>
                         <div className="w-12 h-12 rounded-lg overflow-hidden bg-ink/5 relative flex-shrink-0">
                           <motion.img layoutId={`project-image-${project.title}`} src={project.image} alt={project.title} className="w-full h-full object-contain group-hover:opacity-90 transition-opacity duration-500" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <motion.h5 layoutId={`project-title-${project.title}`} className="text-sm font-display font-medium text-ink truncate group-hover:text-accent transition-colors">{project.title}</motion.h5>
                           <motion.p layoutId={`project-category-${project.title}`} className="text-[10px] text-ink/40 uppercase tracking-widest truncate mt-0.5">{project.category}</motion.p>
                         </div>
                       </motion.div>
                    ))}
                  </div>
                </motion.div>

              </div>
            </div>
          </section>

        {/* --- WORK SECTION --- */}
          <div className="w-full flex md:hidden items-center justify-center pt-8 pb-4">
             <div className="w-12 h-[2px] bg-ink/10 rounded-full"></div>
          </div>
          <section 
            id="work"
            className="pt-16 pb-32 md:pt-24 md:pb-40"
          >
            <div className="mx-auto mb-9 flex w-full max-w-[1600px] items-end justify-between px-6 md:mb-12 md:px-10 lg:hidden">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-accent">Selected projects</p>
                <h2 className="mt-3 font-editorial text-4xl font-semibold tracking-[-0.04em] text-ink md:text-6xl">A chapter for each idea.</h2>
              </div>
              <p className="hidden max-w-[20rem] text-right text-xs leading-6 text-ink/45 md:block">Browse the work as a sequence of stories—each shaped by a different problem, medium and outcome.</p>
            </div>
            <ProjectShowcase
              projects={showcaseProjects}
              onOpenAll={() => setShowAllProjects(true)}
              onOpenProject={(project) => {
                if (project.title.toLowerCase().includes('notebook os') || project.title.toLowerCase().includes('personal site')) {
                  navigate('/os');
                } else {
                  setSelectedProject(project);
                }
              }}
            />
          </section>

        {/* --- NOTEBOOK SECTION --- */}
          <div className="w-full flex md:hidden items-center justify-center pt-8 pb-4">
             <div className="w-12 h-[2px] bg-ink/10 rounded-full"></div>
          </div>
          <section 
            id="notebook"
            className="pt-16 md:pt-40 px-6 md:px-20 lg:px-40 pb-40"
          >
            <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
              <div className="lg:w-1/4 shrink-0">
                <div className="lg:sticky lg:top-40 z-20">
                  <SectionHeading subtitle="Thoughts & Logs" className="mb-0">Notebook</SectionHeading>
                </div>
              </div>
              <div className="lg:w-3/4">
                <div className="flex flex-col border-t border-ink/10 lg:border-t-0 mt-8 lg:mt-0">
                    {articles.map((article, i) => (
                      <motion.article 
                        key={i} 
                        viewport={{ once: false, margin: "-50px" }}
                        initial={{ opacity: 0, x: -20 }} 
                        whileInView={{ opacity: 1, x: 0 }} 
                        transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                        layoutId={`article-container-${article.title}`}
                        className="group cursor-pointer relative py-12 md:py-16 border-b border-ink/10 flex flex-col md:flex-row md:items-center justify-between gap-6"
                        onClick={() => setSelectedArticle(article)}
                      >
                        <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-0 h-[2px] bg-ink group-hover:w-4 transition-all duration-300 hidden md:block" />
                        <div className="space-y-4 max-w-2xl md:group-hover:translate-x-4 transition-transform duration-500">
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-1 rounded-sm">{article.category}</span>
                            <span className="text-xs text-ink/40 font-mono">{article.date} &middot; {article.readTime}</span>
                          </div>
                          <motion.h3 layoutId={`article-title-${article.title}`} className="text-2xl md:text-3xl lg:text-4xl font-display font-medium text-ink group-hover:text-accent transition-colors duration-300">
                            {article.title}
                          </motion.h3>
                        </div>
                        <div className="w-12 h-12 rounded-full border border-ink/10 flex items-center justify-center group-hover:bg-ink group-hover:text-bg transition-colors shrink-0">
                          <ArrowUpRight size={16} />
                        </div>
                      </motion.article>
                    ))}
                </div>
              </div>
            </div>
          </section>

        {/* --- TOOLS SECTION --- */}
          <div className="w-full flex md:hidden items-center justify-center pt-8 pb-4">
             <div className="w-12 h-[2px] bg-ink/10 rounded-full"></div>
          </div>
          <section 
            id="tools"
            className="pt-16 md:pt-40 px-6 md:px-20 lg:px-40 pb-40"
          >
            <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
              <div className="lg:w-1/4 shrink-0">
                <div className="lg:sticky lg:top-40 z-20">
                  <SectionHeading subtitle="Experiments & Tools" className="mb-0">Practice & Demos</SectionHeading>
                </div>
              </div>
              <div className="lg:w-3/4 space-y-4 border-t border-ink/10 lg:border-t-0 mt-8 lg:mt-0 pt-0">
                {tools.map((tool, i) => (
                  <motion.a 
                    href={tool.url}
                    key={tool.name} 
                    viewport={{ once: false, margin: "-50px" }}
                    initial={{ opacity: 0, x: -30 }} 
                    whileInView={{ opacity: 1, x: 0 }} 
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.1 }}
                    className="flex flex-col xl:flex-row xl:items-center justify-between py-6 md:py-8 border-b border-ink/5 group hover:bg-ink/[0.02] hover:pl-8 px-4 transition-all duration-500 rounded-xl"
                  >
                    <div className="flex items-center gap-6">
                      <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500 origin-left scale-75 group-hover:scale-100">{tool.icon}</span>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-display font-medium text-ink group-hover:text-accent transition-colors">{tool.name}</h3>
                          <span className="border border-ink/10 text-[10px] uppercase font-bold text-ink/40 px-2 py-0.5 rounded-full">{tool.type}</span>
                        </div>
                        <p className="text-sm font-mono text-ink/50 mt-1">{tool.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 xl:mt-0 opacity-50 group-hover:opacity-100 transition-opacity">
                      <span className="hidden md:inline text-[10px] font-bold uppercase tracking-widest text-accent">Launch</span>
                      <div className="w-10 h-10 rounded-full border border-ink/10 flex items-center justify-center group-hover:bg-accent group-hover:text-white group-hover:border-transparent transition-colors">
                        <ArrowUpRight size={18} className="transform group-hover:rotate-45 transition-transform" />
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </section>

        {/* --- LIFE SECTION --- */}
          <div className="w-full flex md:hidden items-center justify-center pt-8 pb-4">
             <div className="w-12 h-[2px] bg-ink/10 rounded-full"></div>
          </div>
          <section 
            id="life"
            className="pt-16 md:pt-40 pb-40"
          >
            <div className="px-6 md:px-20 lg:px-40">
              <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
                <div className="lg:w-1/4 shrink-0">
                  <SectionHeading subtitle="Personal Interests" className="mb-0">Life & Hobbies</SectionHeading>
                </div>
              </div>
            </div>
            <div className="mt-12 md:mt-16 w-full bg-[#F4EEE4]">
              <div className="w-full">
                <LifeCollageSection items={configuredLifeItems} portrait={photo} centerImage="/images/life/center-person.png" />
              </div>
            </div>
          </section>

        {/* --- ABOUT / PROFILE SECTION --- */}
          <div className="w-full flex md:hidden items-center justify-center pt-8 pb-4">
             <div className="w-12 h-[2px] bg-ink/10 rounded-full"></div>
          </div>
          <section 
            id="about"
            className="pt-16 md:pt-40 px-6 md:px-20 lg:px-40 pb-40"
          >
            <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
              <div className="lg:w-1/4 shrink-0">
                <div className="lg:sticky lg:top-40 z-20">
                  <SectionHeading subtitle="Profile" className="mb-0">Professional Experience</SectionHeading>
                </div>
              </div>
              <div className="lg:w-3/4 space-y-32 border-t border-ink/10 lg:border-t-0 mt-8 lg:mt-0 pt-8 lg:pt-0">
                
                {/* WORK EXPERIENCE */}
                <div className="flex flex-col gap-6 md:gap-8">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-accent tracking-[0.4em]">
                      Work
                    </h4>
                  </div>
                  <div className="flex flex-col">
                    {experiences.map((exp, i) => (
                      <motion.div 
                        key={i} 
                        viewport={{ once: true, margin: "-50px" }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="group relative flex gap-6 md:gap-8"
                      >
                        {/* Timeline styling */}
                        <div className="flex flex-col items-center pt-2 md:pt-1.5 mt-[-2px] self-stretch">
                          <motion.div 
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                            viewport={{ once: true, margin: "-50px" }}
                            className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border border-ink/20 bg-ink/5 group-hover:border-accent group-hover:bg-accent/10 transition-colors z-10 shrink-0" 
                          />
                          {i !== experiences.length - 1 && (
                            <motion.div 
                              initial={{ scaleY: 0 }}
                              whileInView={{ scaleY: 1 }}
                              transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                              viewport={{ once: true, margin: "-50px" }}
                              className="w-[1px] flex-1 bg-ink/10 mt-2 origin-top" 
                            />
                          )}
                        </div>

                        <div className="flex flex-col gap-6 flex-1 pb-16 pt-1 md:pt-0">
                          <div className="flex flex-col gap-1">
                            <h3 className="text-xl md:text-2xl font-display font-medium text-ink group-hover:text-accent transition-colors">{exp.role}</h3>
                            <div className="flex items-center gap-3">
                               <span className="text-[10px] font-bold uppercase tracking-widest text-accent/80 transition-colors">{exp.period}</span>
                               <span className="text-[10px] uppercase font-mono text-ink/40 tracking-wider">{exp.location}</span>
                               <span className="text-[10px] uppercase font-bold tracking-wider text-ink/70">{exp.company}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col">
                            <ul className="space-y-3 pl-0 list-none">
                              {exp.descriptions.map((desc, dId) => (
                                <li key={dId} className="text-sm md:text-base font-light text-ink/80 leading-relaxed flex items-start gap-4">
                                  <span className="pt-[10px]"><span className="block w-[3px] h-[3px] bg-accent/40 rounded-full group-hover:bg-accent transition-colors shrink-0"></span></span>
                                  <span dangerouslySetInnerHTML={{ __html: desc }} className="[&>strong]:font-medium [&>strong]:text-ink" />
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* EDUCATION */}
                <div className="flex flex-col gap-6 md:gap-8 border-t border-ink/10 pt-16">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-accent tracking-[0.4em]">
                      Education
                    </h4>
                  </div>
                  <div className="flex flex-col">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true, margin: "-50px" }}
                      className="group relative flex gap-6 md:gap-8"
                    >
                      <div className="flex flex-col items-center pt-2 md:pt-1.5 mt-[-2px] self-stretch">
                        <motion.div 
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                          viewport={{ once: true, margin: "-50px" }}
                          className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border border-ink/20 bg-ink/5 group-hover:border-accent group-hover:bg-accent/10 transition-colors z-10 shrink-0" 
                        />
                        <motion.div 
                          initial={{ scaleY: 0 }}
                          whileInView={{ scaleY: 1 }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                          viewport={{ once: true, margin: "-50px" }}
                          className="w-[1px] flex-1 bg-ink/10 mt-2 origin-top" 
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1 flex-1 pb-16 pt-1 md:pt-0">
                        <h3 className="text-lg md:text-xl font-display font-medium text-ink group-hover:text-accent transition-colors">Turku University</h3>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-bold uppercase tracking-widest text-accent/80 transition-colors">2024 - Present</span>
                           <span className="text-[10px] font-bold uppercase tracking-wider text-ink/70">Master's Studies in Smart Systems</span>
                        </div>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true, margin: "-50px" }}
                      className="group relative flex gap-6 md:gap-8"
                    >
                      <div className="flex flex-col items-center pt-2 md:pt-1.5 mt-[-2px] self-stretch">
                        <motion.div 
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                          viewport={{ once: true, margin: "-50px" }}
                          className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border border-ink/20 bg-ink/5 group-hover:border-accent group-hover:bg-accent/10 transition-colors z-10 shrink-0" 
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1 flex-1 pb-4 pt-1 md:pt-0">
                        <h3 className="text-lg md:text-xl font-display font-medium text-ink group-hover:text-accent transition-colors">Turku University of Applied Sciences</h3>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-bold uppercase tracking-widest text-accent/80 transition-colors">Graduated 2021</span>
                           <span className="text-[10px] font-bold uppercase tracking-wider text-ink/70">Bachelor's Degree in ICT Engineering</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* TECHNICAL SKILLS & LANGUAGES */}
                <div className="flex flex-col gap-12 md:gap-14 border-t border-ink/10 pt-16">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-accent tracking-[0.4em]">
                      Skills
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 lg:gap-x-28 gap-y-16">
                    {displayResumeSkills.map((skill, i) => (
                      <motion.div 
                        key={i} 
                        viewport={{ once: true, margin: "-50px" }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.1 }}
                        className="space-y-5 pb-2"
                      >
                        <h5 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/75">{skill.category}</h5>
                        <div className="flex flex-wrap gap-2.5">
                          {skill.items.map((item: string, idx: number) => (
                            <span key={idx} className="px-4 py-2 bg-white/35 border border-ink/10 text-ink/65 text-sm rounded-md leading-none">
                              {item}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                    <motion.div 
                      viewport={{ once: true, margin: "-50px" }}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
                      className="space-y-5 pb-4 md:col-span-1"
                    >
                      <h5 className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/75">Languages</h5>
                      <div className="flex flex-col mt-4 max-w-xl">
                        <div className="flex justify-between items-center border-b border-ink/8 py-3">
                          <span className="text-base text-ink/75">Mandarin Chinese</span>
                          <span className="text-[10px] uppercase font-bold tracking-[0.18em] text-ink/40">Native</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-ink/8 py-3">
                          <span className="text-base text-ink/75">English</span>
                          <span className="text-[10px] uppercase font-bold tracking-[0.18em] text-ink/40">Fluent</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-ink/8 py-3">
                          <span className="text-base text-ink/75">Japanese</span>
                          <span className="text-[10px] uppercase font-bold tracking-[0.18em] text-ink/40">Basic</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>

              </div>
            </div>
          </section>

        {/* --- CONTACT SECTION --- */}
          <div className="w-full flex md:hidden items-center justify-center pt-8 pb-4">
             <div className="w-12 h-[2px] bg-ink/10 rounded-full"></div>
          </div>
          <section 
            id="contact"
            className="pt-16 md:pt-40 px-6 md:px-20 lg:px-40 pb-40 min-h-screen flex flex-col justify-center"
          >
            <div className="w-full max-w-[1400px] mx-auto">
              <div className="flex justify-between items-center mb-16 md:mb-24">
                <SectionHeading subtitle="Connect" className="mb-0">Get in touch</SectionHeading>
                <div className="hidden md:flex items-center gap-2 text-xs font-mono text-ink/70 bg-ink/5 border border-ink/10 px-4 py-2 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-sage animate-pulse"></span>
                  Available for new opportunities in Finland
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, margin: "-50px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <h3 className="text-4xl md:text-5xl lg:text-7xl font-display font-medium text-ink leading-tight mb-8">
                    Let's build<br/><span className="text-ink/40">something honest.</span>
                  </h3>
                  <p className="text-lg md:text-xl text-ink/60 font-light mb-12 max-w-md">
                    I'm currently based in Turku, Finland, and open to full-time roles, freelance projects, or just a good chat over coffee.
                  </p>
                  
                  <div className="space-y-6 flex flex-col items-start text-base md:text-lg overflow-hidden">
                    {[
                      { icon: <Mail size={20} />, text: "zhoubowen.skyhouse@gmail.com", href: "mailto:zhoubowen.skyhouse@gmail.com", isDiv: false },
                      { icon: <Linkedin size={20} />, text: "LinkedIn Profile", href: "https://linkedin.com/in/bowen-zhou-skyhouse", isDiv: false },
                      { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>, text: "+358 415710055", href: "#", isDiv: true }
                    ].map((link, i) => {
                      const Wrapper = link.isDiv ? motion.div : motion.a;
                      return (
                        // @ts-ignore
                        <Wrapper 
                          key={i}
                          href={!link.isDiv ? link.href : undefined} 
                          target={!link.isDiv && link.href.startsWith("http") ? "_blank" : undefined}
                          initial={{ y: "100%", opacity: 0 }}
                          whileInView={{ y: 0, opacity: 1 }}
                          viewport={{ once: false, margin: "-50px" }}
                          transition={{ duration: 0.6, delay: 0.2 + i * 0.1, ease: [0.76, 0, 0.24, 1] }}
                          className="flex items-center gap-4 text-ink hover:text-accent transition-colors group border border-transparent p-2 rounded-full hover:border-ink/10"
                        >
                          <span className="w-12 h-12 rounded-full border border-ink/10 flex items-center justify-center group-hover:bg-accent group-hover:border-transparent group-hover:text-white transition-all">
                            {link.icon}
                          </span>
                          {link.text}
                        </Wrapper>
                      );
                    })}
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  className="bg-ink/[0.02] border border-ink/5 p-8 md:p-12 rounded-3xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <ArrowUpRight size={120} />
                  </div>
                  <h4 className="text-2xl md:text-3xl font-display font-medium text-ink mb-2">Drop a message</h4>
                  <p className="text-sm text-ink/50 font-light mb-8">Reach out and I'll get back to you as soon as possible.</p>
                  <form className="space-y-4">
                    <input type="text" placeholder="Your Name" className="w-full bg-transparent border-b border-ink/20 py-4 focus:outline-none focus:border-ink focus:bg-ink/[0.02] rounded-t-lg transition-all font-light placeholder:text-ink/30 px-2" />
                    <input type="email" placeholder="Your Email" className="w-full bg-transparent border-b border-ink/20 py-4 focus:outline-none focus:border-ink focus:bg-ink/[0.02] rounded-t-lg transition-all font-light placeholder:text-ink/30 px-2" />
                    <textarea placeholder="Tell me about your project or idea..." rows={4} className="w-full bg-transparent border-b border-ink/20 py-4 focus:outline-none focus:border-ink focus:bg-ink/[0.02] rounded-t-lg transition-all font-light placeholder:text-ink/30 resize-none px-2"></textarea>
                    <button type="button" className="mt-8 px-8 py-4 bg-ink text-bg rounded-md hover:bg-accent transition-colors flex items-center gap-2 font-medium w-full md:w-fit cursor-pointer">
                      Send Message <ChevronRight size={16} />
                    </button>
                  </form>
                </motion.div>
              </div>
            </div>
          </section>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectOverlay
            project={selectedProject}
            projects={projects}
            onClose={() => setSelectedProject(null)}
            onSelectProject={setSelectedProject}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAllProjects && (
          <AllProjectsOverlay
            projects={projects}
            onClose={() => setShowAllProjects(false)}
            onSelectProject={(p) => {
              setShowAllProjects(false);
              setTimeout(() => setSelectedProject(p), 300);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedArticle && (
          <ArticleOverlay
            article={selectedArticle}
            articles={articles}
            onClose={() => setSelectedArticle(null)}
            onSelectArticle={setSelectedArticle}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes music-bar {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
      `}</style>
    </main>
  );
}
