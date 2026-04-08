const fs = require('fs');
const file = 'soul-app-admin/src/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `{stats.genderData.map((entry, index) => (`,
  `{stats.genderData.map((_entry, index) => (`
);

content = content.replace(
  `{stats.momentTypeData.map((entry, index) => (`,
  `{stats.momentTypeData.map((_entry, index) => (`
);

fs.writeFileSync(file, content);
