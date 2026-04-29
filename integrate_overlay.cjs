const fs = require('fs');

// 1. Export ProjectOverlay from HomePage.tsx
let homeText = fs.readFileSync('e:/WEB/mywebsitenotebook/src/HomePage.tsx', 'utf8');
homeText = homeText.replace(
  'const ProjectOverlay = ({',
  'export const ProjectOverlay = ({'
);
fs.writeFileSync('e:/WEB/mywebsitenotebook/src/HomePage.tsx', homeText, 'utf8');

// 2. Add ProjectOverlay to ProjectListPage.tsx
let listText = fs.readFileSync('e:/WEB/mywebsitenotebook/src/ProjectListPage.tsx', 'utf8');

// Import ProjectOverlay
listText = listText.replace(
  "import { BackgroundBlobs, ProjectItem } from './HomePage';",
  "import { BackgroundBlobs, ProjectItem, ProjectOverlay } from './HomePage';\nimport { AnimatePresence } from 'framer-motion';"
);

// Add state
listText = listText.replace(
  '  const { projects: rawProjects, loading } = useProjects();',
  '  const { projects: rawProjects, loading } = useProjects();\n  const [selectedProject, setSelectedProject] = React.useState<any | null>(null);'
);

// Update handleProjectClick
listText = listText.replace(
  /const handleProjectClick = \(project: any\) => \{[\s\S]*?\};/,
  `const handleProjectClick = (project: any) => {
    if (project.title === "Notebook OS" || project.title === "Personal Site" || project.id === "p5") {
      navigate("/os");
    } else {
      setSelectedProject(project);
    }
  };`
);

// Add the ProjectOverlay to render
listText = listText.replace(
  '    </main>',
  `      <AnimatePresence>
        {selectedProject && (
          <ProjectOverlay 
            project={selectedProject} 
            projects={projects} 
            onClose={() => setSelectedProject(null)} 
            onSelectProject={setSelectedProject} 
          />
        )}
      </AnimatePresence>
    </main>`
);

fs.writeFileSync('e:/WEB/mywebsitenotebook/src/ProjectListPage.tsx', listText, 'utf8');
