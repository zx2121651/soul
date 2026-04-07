const fs = require('fs');
const file = 'soul-app-backend/src/routes/admin.routes.ts';
let content = fs.readFileSync(file, 'utf8');

// The issue is sendError(res, ErrorCode.SYSTEM_ERROR, ...)
// ErrorCode.SYSTEM_ERROR is 5000, which is an invalid HTTP status code
// It should be sendError(res, 500, ...)

content = content.replace(
  /sendError\(res, ErrorCode\.SYSTEM_ERROR/g,
  "sendError(res, 500"
);

fs.writeFileSync(file, content);
