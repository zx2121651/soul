const fs = require('fs');
const file = 'soul-app-web/src/pages/VoiceRoomPage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace standard back button behavior to disconnect first
content = content.replace(
  'onClick={() => navigate(-1)}',
  'onClick={() => navigate(\'/explore\', { replace: true })}'
);

fs.writeFileSync(file, content);
