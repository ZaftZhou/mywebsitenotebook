const fs = require('fs');
let text = fs.readFileSync('e:/WEB/mywebsitenotebook/src/HomePage.tsx', 'utf8');

const target = `  const { scrollYProgress } = useScroll();
  const navigate = useNavigate();

  const handleProjectClick = (project: any) => {
    if (project.title === "Notebook OS") {
      navigate("/os");
    } else {
      handleProjectClick(project);
    }
  };
  const navigate = useNavigate();

  const handleProjectClick = (project: any) => {
    if (project.title === "Notebook OS") {
      navigate('/os');
    } else {
      handleProjectClick(project);
    }
  };`;

const replacement = `  const { scrollYProgress } = useScroll();
  const navigate = useNavigate();

  const handleProjectClick = (project: any) => {
    if (project.title === "Notebook OS") {
      navigate("/os");
    } else {
      setSelectedProject(project);
    }
  };`;

text = text.replace(target, replacement);
text = text.replace(target.replace(/\r\n/g, '\n'), replacement);
text = text.replace(target.replace(/\n/g, '\r\n'), replacement);

fs.writeFileSync('e:/WEB/mywebsitenotebook/src/HomePage.tsx', text, 'utf8');
