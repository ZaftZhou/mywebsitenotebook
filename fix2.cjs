const fs = require('fs');
let lines = fs.readFileSync('e:/WEB/mywebsitenotebook/src/HomePage.tsx', 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('const { scrollYProgress } = useScroll();'));
if (startIdx !== -1) {
  let endIdx = startIdx;
  while (endIdx < lines.length && !lines[endIdx].includes('useEffect(() => {')) {
    endIdx++;
  }
  
  if (endIdx > startIdx) {
    const replacement = [
      '  const { scrollYProgress } = useScroll();',
      '  const navigate = useNavigate();',
      '',
      '  const handleProjectClick = (project: any) => {',
      '    if (project.title === "Notebook OS") {',
      '      navigate("/os");',
      '    } else {',
      '      setSelectedProject(project);',
      '    }',
      '  };',
      ''
    ];
    lines.splice(startIdx, endIdx - startIdx, ...replacement);
    fs.writeFileSync('e:/WEB/mywebsitenotebook/src/HomePage.tsx', lines.join('\n'), 'utf8');
  }
}
