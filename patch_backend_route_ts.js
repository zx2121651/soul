const fs = require('fs');

const rf1 = 'soul-app-backend/src/routes/moment.routes.ts';
let c1 = fs.readFileSync(rf1, 'utf8');
c1 = c1.replace(
  `const momentId = parseInt(req.params.id, 10);`,
  `const momentId = parseInt(req.params.id as string, 10);`
);
c1 = c1.replace(
  `const momentId = parseInt(req.params.id, 10);`,
  `const momentId = parseInt(req.params.id as string, 10);`
);
fs.writeFileSync(rf1, c1);

const rf2 = 'soul-app-backend/src/routes/user.routes.ts';
let c2 = fs.readFileSync(rf2, 'utf8');
c2 = c2.replace(
  `const targetId = parseInt(req.params.id, 10);`,
  `const targetId = parseInt(req.params.id as string, 10);`
);
fs.writeFileSync(rf2, c2);
