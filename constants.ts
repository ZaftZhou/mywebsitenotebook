import { Project, Skill, PostType, PostSection } from './types';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const DEFAULT_TEMPLATES: Record<PostType, PostSection[]> = {
  tech_note: [
    { id: 'sec_problem', title: 'Problem', blocks: [{ id: generateId(), type: 'text', content: '' }] },
    { id: 'sec_approach', title: 'Approach', blocks: [{ id: generateId(), type: 'text', content: '' }] },
    { id: 'sec_impl', title: 'Implementation', blocks: [{ id: generateId(), type: 'text', content: '' }] },
    { id: 'sec_tradeoffs', title: 'Trade-offs', blocks: [{ id: generateId(), type: 'text', content: '' }] },
    { id: 'sec_result', title: 'Result', blocks: [{ id: generateId(), type: 'text', content: '' }] },
    { id: 'sec_takeaway', title: 'Takeaway', blocks: [{ id: generateId(), type: 'text', content: '' }] },
  ],
  devlog: [
    { id: 'sec_updates', title: 'What Changed', blocks: [{ id: generateId(), type: 'text', content: '' }] },
    { id: 'sec_why', title: 'Why', blocks: [{ id: generateId(), type: 'text', content: '' }] },
    { id: 'sec_before_after', title: 'Before / After', blocks: [{ id: generateId(), type: 'text', content: '' }] },
    { id: 'sec_challenges', title: 'Challenges & Fixes', blocks: [{ id: generateId(), type: 'text', content: '' }] },
    { id: 'sec_next', title: 'Next Steps', blocks: [{ id: generateId(), type: 'text', content: '' }] },
  ],
  postmortem: [
    { id: 'sec_goal', title: 'Goal', blocks: [{ id: generateId(), type: 'text', content: '' }] },
    { id: 'sec_good', title: 'What Went Well', blocks: [{ id: generateId(), type: 'text', content: '' }] },
    { id: 'sec_bad', title: 'What Went Wrong', blocks: [{ id: generateId(), type: 'text', content: '' }] },
    { id: 'sec_root', title: 'Root Cause', blocks: [{ id: generateId(), type: 'text', content: '' }] },
    { id: 'sec_action', title: 'Action Items', blocks: [{ id: generateId(), type: 'text', content: '' }] },
  ]
};

export const PROJECTS: Project[] = [
  {
    id: "p1", title: "Finnish Learning", category: "App", year: "2024", role: "Solo Dev", tags: ["React Native", "Expo", "TypeScript"], outcome: "Productivity", color: "bg-blue-200", featured: true, oneLiner: "Vocabulary learning app with custom categorization flows.",
    content: {
      overview: "A mobile productivity app designed for effective language acquisition. It features a custom vocabulary database, categorized learning flows, and interactive quizzes.",
      stack: ["React Native", "Expo", "TypeScript", "AsyncStorage"],
      results: ["Rapid iteration cycle", "Highly usable UI"],
      challenges: "Designing an intuitive information architecture for complex word relations.",
      solutions: "Implemented a flexible tagging system and spaced repetition logic."
    },
    media: [
      { type: 'image', aspect: 'aspect-[9/19]', caption: 'Vocabulary List', color: 'bg-blue-100' },
      { type: 'image', aspect: 'aspect-[9/19]', caption: 'Quiz Interface', color: 'bg-blue-50' }
    ]
  },
  {
    id: "p2", title: "VINCE Avatar Sys", category: "Unity", year: "2025", role: "Unity Dev", tags: ["C#", "Avatar", "System Design"], outcome: "TUAS Project", color: "bg-cat-unity", featured: true, oneLiner: "Customizable avatar system for Virtual Integration Home.",
    content: {
      overview: "Developed the Avatar Customization System for the VINCE project at TUAS. Focused on a data-driven, decoupled architecture that allows for persistent character states and easy expansion.",
      stack: ["Unity", "C#", "ScriptableObjects", "JSON"],
      results: ["Modular system architecture", "Persistent user data"],
      challenges: "Decoupling logic from UI for maximum flexibility.",
      solutions: "Used an event-driven approach with strictly typed data containers."
    },
    media: [
      { type: 'image', aspect: 'aspect-video', caption: 'Avatar Editor', color: 'bg-slate-200' },
      { type: 'image', aspect: 'aspect-video', caption: 'System Architecture', color: 'bg-slate-300' }
    ]
  },
  {
    id: "p3", title: "Commercial 3D", category: "3D", year: "2017-2022", role: "Tech Artist", tags: ["Three.js", "Photogrammetry", "Unity"], outcome: "Commercial", color: "bg-orange-200", featured: true, oneLiner: "End-to-end 3D interactive content pipeline.",
    content: {
      overview: "A collection of commercial and cultural projects involving the full 3D pipeline: Photogrammetry scanning, reconstruction/optimization in Blender/ZBrush, and final interactive delivery in Web (Three.js) or VR (Unity). Clients included Philips and local museums.",
      stack: ["Three.js", "Blender", "Substance", "Unity"],
      results: ["Philips Medical Showcase", "Museum Artifact Digitization", "Minhang VR Archive"],
      challenges: "Optimizing high-fidelity scans for real-time web rendering.",
      solutions: "Advanced retopology workflows and texture baking."
    },
    media: [
      { type: 'image', aspect: 'aspect-video', caption: 'Museum Artifact Scan', color: 'bg-amber-100' },
      { type: 'image', aspect: 'aspect-video', caption: 'Philips Interactive', color: 'bg-blue-100' }
    ]
  },
  {
    id: "p4", title: "News Summary", category: "App", year: "2024", role: "Dev", tags: ["React Native", "API"], outcome: "MVP", color: "bg-green-200", featured: false, oneLiner: "Clean, fast news aggregarot with summary features.",
    content: {
      overview: "An information app focusing on reading experience. It aggregates news from multiple sources and provides concise summaries.",
      stack: ["React Native", "Expo", "News API"],
      results: ["Fast loading times", "Clean typography"],
      challenges: "Handling diverse data formats from different sources.",
      solutions: "Created a unified data adapter pattern."
    },
    media: [
      { type: 'image', aspect: 'aspect-[9/19]', caption: 'Feed View', color: 'bg-emerald-50' }
    ]
  },
  {
    id: "p5", title: "Personal Site", category: "Web", year: "2024", role: "Full Stack", tags: ["Vite", "Node.js"], outcome: "Portfolio", color: "bg-cat-web", featured: false, oneLiner: "Component-based OS portfolio.",
    content: {
      overview: "This website! A structured display of my personal brand, featuring a 'Notebook OS' theme, Node.js backend scripts, and a highly polished React frontend.",
      stack: ["React", "Vite", "Tailwind", "Node.js"],
      results: ["Highly performant", "Unique aesthetic"],
      challenges: "Balancing 'OS' interaction with web usability.",
      solutions: "Command Palette and responsive layouts."
    },
    media: []
  },
  {
    id: "p6", title: "Vibe Coding", category: "Dev", year: "2024", role: "Indie", tags: ["AI", "Prototype"], outcome: "Experiments", color: "bg-purple-200", featured: false, oneLiner: "Rapid prototypes validating fun ideas.",
    content: {
      overview: "A series of rapid experiments focusing on 'Vibe-coding'—prioritizing speed, fun, and immediate usability. Includes various small tools and visual demos.",
      stack: ["Unity", "Web", "AI Tools"],
      results: ["Multiple working demos"],
      challenges: "Stopping before over-engineering.",
      solutions: "Strict time-boxing for each prototype."
    },
    media: []
  }
];


export const TOOLS = [
  {
    id: 'html-playground',
    title: 'HTML 5 Demo',
    icon: '🌐',
    desc: 'Simple HTML5 boilerplate demo',
    url: '/tools/index.html',
    color: 'bg-blue-100'
  },
  // Add more tools here as you go
  {
    id: 'cover-letter',
    title: 'Cover Letter',
    icon: '📝',
    desc: 'Cover Letter Tool',
    url: '/tools/CoverLetter/index.html',
    color: 'bg-purple-100'
  },
  {
    id: 'resume-builder',
    title: 'Resume Builder',
    icon: '📄',
    desc: 'Professional Resume/CV Builder',
    url: '/tools/Resume/index.html',
    color: 'bg-green-100'
  },
  {
    id: 'image-to-pdf',
    title: 'Image to PDF',
    icon: '📑',
    desc: 'Convert multiple images to a single PDF document.',
    url: '/tools/ImageToPdf/index.html',
    color: 'bg-orange-100'
  },
  {
    id: 'ocr-tool',
    title: 'Image to Text',
    icon: '🔮',
    desc: 'Extract text from images using AI (OCR).',
    url: '/tools/ImageToText/index.html',
    color: 'bg-blue-100'
  }
];

export const SKILLS: Skill[] = [
  { name: "Unity/C#", desc: "Core Dev", bg: "bg-cat-unity", value: 95, category: "Core" },
  { name: "3D Pipeline", desc: "Scan-to-Engine", bg: "bg-cat-3d", value: 90, category: "Core" },
  { name: "React/Web", desc: "Full Stack", bg: "bg-cat-web", value: 85, category: "Web" },
  { name: "React Native", desc: "Mobile App", bg: "bg-cat-app", value: 80, category: "Web" },
  { name: "Tech Art", desc: "VFX/Shaders", bg: "bg-purple-200", value: 80, category: "Core" },
  { name: "Game AI", desc: "Logic/Behavior", bg: "bg-red-200", value: 75, category: "Core" },
];
