import { Project, Skill } from './types';

export const PROJECTS: Project[] = [
  {
    id: "p1", title: "Neon Drifter", category: "Unity", year: "2024", role: "Dev", tags: ["C#", "URP", "WebGL"], outcome: "50k+ Plays", color: "catUnity", featured: true, oneLiner: "A retro-wave arcade racer with procedural tracks.",
    content: { overview: "High-speed arcade game built to test WebGL performance limits. The goal was to create a sense of speed using vertex shaders and post-processing while keeping the draw calls low.", stack: ["Unity 2022", "C#", "Blender", "HLSL"], results: ["Featured on Itch.io", "60fps on mobile web"], challenges: "Generating infinite track segments without GC spikes.", solutions: "Implemented heavy object pooling and mesh combiners." },
    media: [
      { type: 'video', aspect: 'aspect-video', caption: 'Gameplay Trailer', color: 'bg-purple-900' },
      { type: 'image', aspect: 'aspect-video', caption: 'Main Menu UI', color: 'bg-purple-700' },
      { type: 'image', aspect: 'aspect-[4/5]', caption: 'Mobile Controls Layout', color: 'bg-indigo-600' },
      { type: 'image', aspect: 'aspect-video', caption: 'Procedural Generation Debug', color: 'bg-pink-800' }
    ]
  },
  {
    id: "p2", title: "Folio OS", category: "Web", year: "2023", role: "Full Stack", tags: ["React", "Tailwind"], outcome: "Awwwards Nominee", color: "catWeb", featured: true, oneLiner: "An operating system themed portfolio.",
    content: { overview: "A portfolio breaking standard scrolling patterns. It features a window manager, a file system abstraction, and drag-and-drop mechanics.", stack: ["React", "Framer Motion", "Tailwind", "Vite"], results: ["100/100 Lighthouse", "High engagement time"], challenges: "Managing window z-index and focus state efficiently.", solutions: "Centralized window manager hook with a reduction state machine." },
    media: [
      { type: 'image', aspect: 'aspect-video', caption: 'Desktop Overview', color: 'bg-orange-100' },
      { type: 'video', aspect: 'aspect-video', caption: 'Window Dragging Demo', color: 'bg-orange-200' },
      { type: 'image', aspect: 'aspect-[3/4]', caption: 'Mobile Response View', color: 'bg-stone-200' },
      { type: 'image', aspect: 'aspect-square', caption: 'Icon Design System', color: 'bg-orange-300' }
    ]
  },
  {
    id: "p3", title: "Zen Focus", category: "App", year: "2024", role: "UI Design", tags: ["SwiftUI", "iOS"], outcome: "Top 10 Productivity", color: "catApp", featured: false, oneLiner: "Minimalist meditation timer.",
    content: { overview: "Productivity tool focused on flow state. The interface is entirely gesture-based with no visible buttons during sessions.", stack: ["SwiftUI", "CoreData", "Figma"], results: ["4.9 Star Rating", "2k DAU"], challenges: "Designing an intuitive gesture-based interface without tutorials.", solutions: "Prototyped extensively in Origami Studio to fine-tune haptics." },
    media: [
      { type: 'image', aspect: 'aspect-[9/19]', caption: 'Timer Screen', color: 'bg-green-100' },
      { type: 'image', aspect: 'aspect-[9/19]', caption: 'Settings Panel', color: 'bg-green-200' },
      { type: 'video', aspect: 'aspect-[9/19]', caption: 'Haptic Feedback Flow', color: 'bg-emerald-100' },
      { type: 'image', aspect: 'aspect-square', caption: 'App Icon Grid', color: 'bg-green-300' }
    ]
  },
  {
    id: "p4", title: "Poly World", category: "3D", year: "2023", role: "Artist", tags: ["Blender"], outcome: "Best Seller", color: "cat3D", featured: true, oneLiner: "Low poly asset pack for prototyping.",
    content: { overview: "Modular 3D assets for cyberpunk environments. Includes over 200 prefabs sharing a single texture atlas.", stack: ["Blender", "Unity"], results: ["Used in 5 commercial games", "Top rated"], challenges: "Keeping polygon count low while maintaining a distinct style.", solutions: "Used custom normals and trim sheets for detailing." },
    media: [
      { type: 'image', aspect: 'aspect-video', caption: 'City Scene Render', color: 'bg-indigo-300' },
      { type: 'image', aspect: 'aspect-square', caption: 'Texture Atlas', color: 'bg-indigo-200' },
      { type: 'image', aspect: 'aspect-video', caption: 'Wireframe View', color: 'bg-slate-300' },
      { type: 'image', aspect: 'aspect-square', caption: 'Character Models', color: 'bg-violet-300' }
    ]
  },
  {
    id: "p5", title: "Shader Lab", category: "Unity", year: "2022", role: "Tech Art", tags: ["HLSL", "VFX"], outcome: "1k Stars", color: "catUnity", featured: false, oneLiner: "High-performance URP shaders.",
    content: { overview: "Open source shader library. Focuses on non-photorealistic rendering techniques for stylized games.", stack: ["HLSL", "ShaderGraph"], results: ["Community favorite"], challenges: "Mobile optimization for complex effects.", solutions: "Implemented LOD systems for shaders and baked lighting support." },
    media: [
      { type: 'video', aspect: 'aspect-video', caption: 'Water Shader Demo', color: 'bg-cyan-200' },
      { type: 'image', aspect: 'aspect-video', caption: 'Toon Shading', color: 'bg-blue-200' },
      { type: 'image', aspect: 'aspect-video', caption: 'Dissolve Effect', color: 'bg-red-200' }
    ]
  },
  {
    id: "p6", title: "Grid Sys", category: "Web", year: "2023", role: "Frontend", tags: ["CSS", "Design"], outcome: "Open Source", color: "catWeb", featured: false, oneLiner: "Brutalist CSS grid framework.",
    content: { overview: "Lightweight CSS Framework. Designed for brutalist and neo-brutalist layouts with heavy borders and hard shadows.", stack: ["SCSS", "Gulp"], results: ["Trending on GitHub"], challenges: "Cross-browser compatibility for subgrid.", solutions: "PostCSS automation and flexbox fallbacks." },
    media: [
      { type: 'image', aspect: 'aspect-video', caption: 'Documentation Site', color: 'bg-yellow-100' },
      { type: 'image', aspect: 'aspect-[4/3]', caption: 'Grid Inspector', color: 'bg-gray-200' },
      { type: 'image', aspect: 'aspect-square', caption: 'Logo', color: 'bg-yellow-400' }
    ]
  }
];

export const SKILLS: Skill[] = [
  { name: "Unity", desc: "Game Dev", bg: "bg-cat-unity", value: 90, category: "Dev" },
  { name: "React", desc: "Frontend", bg: "bg-cat-web", value: 85, category: "Dev" },
  { name: "TypeScript", desc: "Logic", bg: "bg-blue-200", value: 80, category: "Dev" },
  { name: "Blender", desc: "3D Art", bg: "bg-cat-3d", value: 70, category: "Art" },
  { name: "SwiftUI", desc: "Mobile", bg: "bg-cat-app", value: 65, category: "Dev" },
  { name: "Node.js", desc: "Backend", bg: "bg-green-200", value: 60, category: "Dev" },
];
