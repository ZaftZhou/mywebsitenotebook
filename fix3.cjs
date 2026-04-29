const fs = require('fs');
let t = fs.readFileSync('e:/WEB/mywebsitenotebook/src/HomePage.tsx', 'utf8');
const lines = t.split('\n');
let found = false;
const newLines = lines.filter(line => {
  if (line.includes('import { useNavigate } from "react-router-dom";') || line.includes("import { useNavigate } from 'react-router-dom';")) {
    if (found) return false;
    found = true;
    return true;
  }
  return true;
});
fs.writeFileSync('e:/WEB/mywebsitenotebook/src/HomePage.tsx', newLines.join('\n'));
