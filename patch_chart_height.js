const fs = require('fs');
const file = 'soul-app-admin/src/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// The chart wrapper has fixed height: 200, which might be too small for ResponsiveContainer
// causing the chart to not show up properly or look broken
content = content.replace(
  `height: 200, color: '#6b7280' }}>`,
  `height: 350, color: '#6b7280', width: '100%' }}>`
);

fs.writeFileSync(file, content);
