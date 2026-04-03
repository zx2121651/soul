sed -i "s/import { Router }/import { Router } from 'express';/g" soul-app-backend/src/routes/content.routes.ts
sed -i "s/from 'express';\nfrom 'express';//g" soul-app-backend/src/routes/content.routes.ts
sed -i "s/import { Router } from 'express'; from 'express';/import { Router } from 'express';/g" soul-app-backend/src/routes/content.routes.ts

sed -i "s/import { Router } from 'express';\nimport { sendSuccess } from '..\/utils\/response'; from 'express';/import { Router } from 'express';\nimport { sendSuccess } from '..\/utils\/response';/g" soul-app-backend/src/routes/content.routes.ts

cat soul-app-backend/src/routes/content.routes.ts
