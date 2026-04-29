const fs = require('fs');

let text = fs.readFileSync('e:/WEB/mywebsitenotebook/src/HomePage.tsx', 'utf8');

text = text.replace(
  '"{settings?.profile?.email || \\"zhoubowen.skyhouse@gmail.com\\"}"',
  'settings?.profile?.email || "zhoubowen.skyhouse@gmail.com"'
);

text = text.replace(
  'text: "{settings?.profile?.email || "zhoubowen.skyhouse@gmail.com"}",',
  'text: settings?.profile?.email || "zhoubowen.skyhouse@gmail.com",'
);

fs.writeFileSync('e:/WEB/mywebsitenotebook/src/HomePage.tsx', text, 'utf8');
