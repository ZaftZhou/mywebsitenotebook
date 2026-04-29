const fs = require('fs');

// Read the clean App.tsx from PersonalWebsite
let text = fs.readFileSync('e:/WEB/PersonalWebsite/src/App.tsx', 'utf8');

// 1. Add imports
text = text.replace(
  'import { useNavigate } from "react-router-dom";',
  `import { useNavigate } from "react-router-dom";\nimport { useProjects, usePosts, useSkills, useSettings } from './hooks/useContent';\nimport { TOOLS } from '../constants';`
);

// 2. Add data hooks and mapping inside App
const dataHooks = `  const { projects: rawProjects, loading: projectsLoading } = useProjects();
  const { posts: rawPosts, loading: postsLoading } = usePosts();
  const { skills: rawSkills, loading: skillsLoading } = useSkills();
  const { settings, loading: settingsLoading } = useSettings();

  const projects = rawProjects.map(p => ({
    id: p.id,
    title: p.title,
    category: p.category,
    tags: p.tags || [],
    image: p.coverImage || p.media?.[0]?.url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    color: p.themeColor || "bg-ink",
    desc: p.description || p.shortDescription || "A detailed project exploring new interfaces.",
    year: p.year || "2024",
    role: p.role || "Lead Developer",
    link: p.liveUrl || p.githubUrl,
    featured: p.featured || false
  }));

  const articles = rawPosts.map(p => ({
    id: p.id,
    title: p.title,
    category: p.category || "Post",
    date: p.date ? new Date(p.date).toLocaleDateString() : "Recent",
    readTime: p.readTime || "5 min read",
    content: p.content,
    coverImage: p.coverImage
  }));

  const tools = TOOLS;
  const resumeSkills = rawSkills;

  const loading = projectsLoading || postsLoading || skillsLoading || settingsLoading;
`;

// Replace the dummy arrays
text = text.replace(/const projects = \[([\s\S]*?)\];/, '');
text = text.replace(/const articles = \[([\s\S]*?)\];/, '');
text = text.replace(/const tools = \[([\s\S]*?)\];/, '');
text = text.replace(/const resumeSkills = \[([\s\S]*?)\];/, '');

// Insert the hooks and mapped data inside the App component
text = text.replace(
  'export default function App() {\n  const [loading, setLoading] = useState(true);',
  'export default function App() {\n' + dataHooks
);

// Remove the simulated loading effect
text = text.replace(
  `  useEffect(() => {\n    const timer = setTimeout(() => setLoading(false), 2000);\n    return () => clearTimeout(timer);\n  }, []);`,
  ''
);

// 3. Update the handleProjectClick logic
text = text.replace(
  '  const handleProjectClick = (project: any) => {\n    setSelectedProject(project);\n  };',
  `  const handleProjectClick = (project: any) => {
    if (project.title.toLowerCase().includes('notebook os') || project.title.toLowerCase().includes('personal site')) {
      navigate('/os');
    } else {
      setSelectedProject(project);
    }
  };`
);

// 4. Update the Work Section
const newWorkSection = `        {/* --- WORK SECTION --- */}
          <div className="w-full flex md:hidden items-center justify-center pt-8 pb-4">
             <div className="w-12 h-[2px] bg-ink/10 rounded-full"></div>
          </div>
          <section 
            id="work"
            className="pt-16 md:pt-40 px-6 md:px-20 lg:px-40 pb-40"
          >
            <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24 relative">
              <div className="lg:w-1/4 shrink-0 flex flex-row lg:flex-col justify-between items-start">
                <div className="lg:sticky lg:top-40 z-20 pt-4">
                  <div className="overflow-hidden">
                    <motion.p 
                      initial={{ y: "100%" }} whileInView={{ y: 0 }} viewport={{ once: false, margin: "-50px" }} transition={{ duration: 0.5, ease: "easeOut" }}
                      className="text-[12px] md:text-[14px] font-bold uppercase tracking-[0.2em] text-ink/70"
                    >
                      Selected Projects
                    </motion.p>
                  </div>
                </div>
                
                {/* Mobile Button - Shows only on small screens */}
                <div className="lg:hidden mt-2">
                  <button 
                    onClick={() => setShowAllProjects(true)}
                    className="group flex items-center gap-3 text-[10px] md:text-xs font-bold uppercase tracking-widest text-accent transition-all px-5 md:px-8 py-3 md:py-4 border border-accent/30 rounded-full hover:bg-accent hover:text-white"
                  >
                    SEE ALL CASES
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
              
              <div className="lg:w-3/4 flex flex-col relative mt-12 lg:mt-0">
                {/* Desktop Button - Absolutely positioned at top right of the projects column */}
                <div className="hidden lg:flex absolute -top-4 right-0 z-20">
                  <button 
                    onClick={() => setShowAllProjects(true)}
                    className="group flex items-center gap-3 text-[10px] md:text-xs font-bold uppercase tracking-widest text-accent transition-all px-6 md:px-8 py-3 md:py-4 border border-accent/30 rounded-full hover:bg-accent hover:text-white"
                  >
                    SEE ALL CASES
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>

                <div className="flex flex-col">
                  {projects.filter(p => p.featured).map((project, i) => (
                    <ProjectItem key={project.title} project={project} index={i} onClick={() => handleProjectClick(project)} />
                  ))}
                </div>
              </div>
            </div>
          </section>`;

text = text.replace(
  /\{\/\* --- WORK SECTION --- \*\/\}(.|\n)*?\{\/\* --- NOTEBOOK SECTION --- \*\/\}/,
  newWorkSection + '\n\n        {/* --- NOTEBOOK SECTION --- */}'
);

fs.writeFileSync('e:/WEB/mywebsitenotebook/src/HomePage.tsx', text, 'utf8');
