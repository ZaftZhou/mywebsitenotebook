const fs = require('fs');

let text = fs.readFileSync('e:/WEB/mywebsitenotebook/src/HomePage.tsx', 'utf8');

// 1. Export BackgroundBlobs
text = text.replace(
  'const BackgroundBlobs = () => {',
  'export const BackgroundBlobs = () => {'
);

// 2. Export ProjectItem
text = text.replace(
  'const ProjectItem = ({ project, index, onClick }:',
  'export const ProjectItem = ({ project, index, onClick }:'
);

// 3. Map featured
text = text.replace(
  'results: p.content?.results || []',
  'results: p.content?.results || [], featured: p.featured || false'
);

// 4. Update the Work section rendering
// We need to render only featured projects in the homepage
const workSectionReplacement = `              <div className="lg:w-3/4 flex flex-col border-t border-ink/10 lg:border-t-0 mt-8 lg:mt-0">
                {projects.filter(p => p.featured).map((project, i) => (
                  <ProjectItem key={project.title} project={project} index={i} onClick={() => handleProjectClick(project)} />
                ))}
                
                <div className="mt-12 flex justify-start md:justify-end">
                  <button 
                    onClick={() => navigate('/projects')}
                    className="group flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest text-ink hover:text-accent transition-colors px-6 py-3 border border-ink/20 rounded-full hover:border-accent/40"
                  >
                    View All Projects
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>`;

text = text.replace(
  /<div className="lg:w-3\/4 flex flex-col border-t border-ink\/10 lg:border-t-0 mt-8 lg:mt-0">[\s\S]*?<\/div>/,
  workSectionReplacement
);

fs.writeFileSync('e:/WEB/mywebsitenotebook/src/HomePage.tsx', text, 'utf8');

// Modifying App.tsx
let appText = fs.readFileSync('e:/WEB/mywebsitenotebook/App.tsx', 'utf8');
appText = appText.replace(
  "import DesktopOS from './DesktopOS';",
  "import DesktopOS from './DesktopOS';\nimport ProjectListPage from './src/ProjectListPage';"
);
appText = appText.replace(
  '<Route path="/os" element={<DesktopOS />} />',
  '<Route path="/os" element={<DesktopOS />} />\n        <Route path="/projects" element={<ProjectListPage />} />'
);
fs.writeFileSync('e:/WEB/mywebsitenotebook/App.tsx', appText, 'utf8');
