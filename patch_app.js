const fs = require('fs');
const file = 'soul-app-web/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import TopBar")) {
  content = content.replace(
    "import BottomNavBar from './components/BottomNavBar';",
    "import BottomNavBar from './components/BottomNavBar';\nimport TopBar from './components/TopBar';"
  );
}

if (!content.includes("<TopBar")) {
  content = content.replace(
    '<div className="flex-1 overflow-hidden relative">',
    '<TopBar />\n        <div className="flex-1 overflow-hidden relative">'
  );
}

fs.writeFileSync(file, content);
