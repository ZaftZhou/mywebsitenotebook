const fs = require('fs');

// 1. Get the AllProjectsOverlay code from PersonalWebsite
const pwText = fs.readFileSync('e:/WEB/PersonalWebsite/src/App.tsx', 'utf8');
const startIdx = pwText.indexOf('const AllProjectsOverlay =');
const endIdx = pwText.indexOf('export default function App() {');
const overlayCode = pwText.substring(startIdx, endIdx);

// 2. Inject it into mywebsitenotebook HomePage.tsx
let homeText = fs.readFileSync('e:/WEB/mywebsitenotebook/src/HomePage.tsx', 'utf8');

// Insert it right before App
homeText = homeText.replace(
  'export default function App() {',
  overlayCode + '\nexport default function App() {'
);

// Add the state variable
homeText = homeText.replace(
  'const [selectedArticle, setSelectedArticle] = useState<any | null>(null);',
  'const [selectedArticle, setSelectedArticle] = useState<any | null>(null);\n  const [showAllProjects, setShowAllProjects] = useState(false);'
);

// Restore the button
const targetButton = `<button 
                    onClick={() => navigate('/projects')}
                    className="group flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest text-ink hover:text-accent transition-colors px-6 py-3 border border-ink/20 rounded-full hover:border-accent/40"
                  >`;
const replaceButton = `<button 
                    onClick={() => setShowAllProjects(true)}
                    className="group flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest text-ink hover:text-accent transition-colors px-6 py-3 border border-ink/20 rounded-full hover:border-accent/40"
                  >`;
homeText = homeText.replace(targetButton, replaceButton);

// Restore the component render block at the bottom
const renderOverlay = `
      <AnimatePresence>
        {showAllProjects && (
          <AllProjectsOverlay
            projects={projects}
            onClose={() => setShowAllProjects(false)}
            onSelectProject={(p: any) => {
              setShowAllProjects(false);
              setTimeout(() => setSelectedProject(p), 300);
            }}
          />
        )}
      </AnimatePresence>
`;
homeText = homeText.replace(
  '<AnimatePresence>\n        {selectedArticle && (',
  renderOverlay + '\n      <AnimatePresence>\n        {selectedArticle && ('
);

fs.writeFileSync('e:/WEB/mywebsitenotebook/src/HomePage.tsx', homeText, 'utf8');

// 3. Remove ProjectListPage and route from App.tsx
if (fs.existsSync('e:/WEB/mywebsitenotebook/src/ProjectListPage.tsx')) {
  fs.unlinkSync('e:/WEB/mywebsitenotebook/src/ProjectListPage.tsx');
}

let appText = fs.readFileSync('e:/WEB/mywebsitenotebook/App.tsx', 'utf8');
appText = appText.replace("import ProjectListPage from './src/ProjectListPage';", "");
appText = appText.replace('<Route path="/projects" element={<ProjectListPage />} />', "");
fs.writeFileSync('e:/WEB/mywebsitenotebook/App.tsx', appText, 'utf8');
