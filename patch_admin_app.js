const fs = require('fs');
const file = 'soul-app-admin/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import VoiceRooms')) {
  content = content.replace(
    "import Moments from './pages/Moments';",
    "import Moments from './pages/Moments';\nimport VoiceRooms from './pages/VoiceRooms';"
  );
  content = content.replace(
    '<Route path="moments" element={<Moments />} />',
    '<Route path="moments" element={<Moments />} />\n            <Route path="voicerooms" element={<VoiceRooms />} />'
  );
  fs.writeFileSync(file, content);
}
