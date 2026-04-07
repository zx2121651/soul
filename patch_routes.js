const fs = require('fs');
const file = 'soul-app-backend/src/routes/index.ts';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import adminRoutes')) {
  content = content.replace(
    "import voiceroomRoutes from './voiceroom.routes';",
    "import voiceroomRoutes from './voiceroom.routes';\nimport adminRoutes from './admin.routes';"
  );
  content = content.replace(
    "// Other domains",
    "router.use('/admin', adminRoutes);\n\n// Other domains"
  );
  fs.writeFileSync(file, content);
}
