const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('soul-app-backend/package.json', 'utf8'));
pkg.scripts = {
  start: "node dist/index.js",
  dev: "nodemon src/index.ts",
  build: "tsc"
};
fs.writeFileSync('soul-app-backend/package.json', JSON.stringify(pkg, null, 2));
