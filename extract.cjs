const fs = require('fs');

const srcText = fs.readFileSync('e:/WEB/PersonalWebsite/src/App.tsx', 'utf8');

// Find AllProjectsOverlay
const overlayIndex = srcText.indexOf('const AllProjectsOverlay =');
if (overlayIndex === -1) {
  console.log("Could not find AllProjectsOverlay");
  process.exit(1);
}

// Just substring to the next component (e.g. `const ArticleOverlay` or `const ProjectOverlay` or `export default function App`)
// Wait, in PersonalWebsite, what is the component after AllProjectsOverlay?
// Let's use regex or string split to find it safely.
// Or I can just write a script that does Babel parse, but that's overkill.
// Let's see what components are in PersonalWebsite.
