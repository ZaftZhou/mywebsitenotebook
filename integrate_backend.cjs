const fs = require('fs');

let text = fs.readFileSync('e:/WEB/mywebsitenotebook/src/HomePage.tsx', 'utf8');

// 1. Add Imports
text = text.replace(
  'import { useState, useEffect, useRef, type ReactNode } from "react";\nimport { useNavigate } from "react-router-dom";',
  `import { useState, useEffect, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects, usePosts, useSkills, useSettings } from './hooks/useContent';
import { TOOLS } from '../constants';`
);

// 2. Remove hardcoded data except lifeItems and experiences
// Let's just remove the const projects = [ ... ]; entirely up to const lifeItems = ...
const dataStart = text.indexOf('// --- Data ---');
const lifeItemsStart = text.indexOf('const lifeItems = [');
if (dataStart !== -1 && lifeItemsStart !== -1) {
  text = text.substring(0, dataStart) + text.substring(lifeItemsStart);
}

// 3. Inject hooks into App component
const appStart = text.indexOf('export default function App() {');
if (appStart !== -1) {
  const hooksCode = `
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
    gallery: p.media?.map(m => m.url).filter(Boolean) || [],
    overview: p.content?.overview || "",
    challenges: p.content?.challenges || "",
    solutions: p.content?.solutions || "",
    results: p.content?.results || []
  }));

  const articles = rawPosts.map(p => ({
    title: p.title,
    date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    category: p.type === 'devlog' ? 'Devlog' : p.type === 'tech_note' ? 'Tech Note' : 'Postmortem',
    readTime: "5 min",
    tags: p.tags || [],
    sections: p.sections || []
  }));

  const tools = TOOLS;

  const groupedSkills = rawSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill.name);
    return acc;
  }, {});
  const resumeSkills = Object.keys(groupedSkills).map(cat => ({
    category: cat,
    items: groupedSkills[cat].join(" · ")
  }));

  const isLoadingData = projectsLoading || postsLoading || skillsLoading || settingsLoading;
`;

  text = text.replace(
    'export default function App() {',
    `export default function App() {\n${hooksCode}`
  );
  
  // Also we need to sync `loading` state to include `isLoadingData`
  // Currently loading is true initially. Let's change the loader logic:
  // We can just wait for `isLoadingData` to be false to finish loading.
  
  text = text.replace(
    'const [loading, setLoading] = useState(true);',
    'const [loading, setLoading] = useState(true);'
  );

  text = text.replace(
    '<AnimatePresence>\n        {loading && <Loader key="loader" onComplete={() => setLoading(false)} />}\n      </AnimatePresence>',
    '<AnimatePresence>\n        {(loading || isLoadingData) && <Loader key="loader" onComplete={() => setLoading(false)} />}\n      </AnimatePresence>'
  );
  
  // Use settings data where appropriate
  // "Turku / FI" -> "{settings?.profile?.location || 'Turku / FI'}"
  text = text.replace(
    '<p className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Turku / FI</p>',
    '<p className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">{settings?.profile?.location || "Turku / FI"}</p>'
  );
  
  text = text.replace(
    'Available for new opportunities in Finland',
    '{settings?.profile?.status || "Available for new opportunities in Finland"}'
  );
  
  text = text.replace(
    'zhoubowen.skyhouse@gmail.com',
    '{settings?.profile?.email || "zhoubowen.skyhouse@gmail.com"}'
  );
  
  // Also fix the ProjectOverlay and ArticleOverlay to handle new data structures
  text = text.replace(
    'This is a detailed view of the {project.title} project. It beautifully expands from the list using smoothly interpolated geometry, and now features a full-page reading experience.',
    '{project.overview || "This is a detailed view of the project."}'
  );
  
  text = text.replace(
    'Pellentesque sodales congue ex a vulputate. Morbi at ex ac est tempus eleifend. Vivamus vehicula libero eu turpis tristique euismod. Suspendisse eu ipsum libero.',
    ''
  );

}

fs.writeFileSync('e:/WEB/mywebsitenotebook/src/HomePage.tsx', text, 'utf8');
