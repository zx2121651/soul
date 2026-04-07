const fs = require('fs');
const file = 'soul-app-web/src/pages/VoiceRoomPage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'className="flex-1 flex flex-col w-full relative overflow-hidden"',
  'className="flex-1 flex flex-col w-full relative overflow-hidden"\n        onDisconnected={() => navigate(\'/explore\', { replace: true })}'
);

fs.writeFileSync(file, content);
