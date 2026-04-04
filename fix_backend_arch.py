import re

# 1. Fix db.ts fail-fast strategy
with open('soul-app-backend/src/db.ts', 'r') as f:
    content = f.read()

db_error_handling = """    console.error('❌ Could not connect to PostgreSQL database. Exiting process.');
    console.error('   Please make sure PostgreSQL is running (e.g. docker-compose up -d).');
    process.exit(1);"""

content = re.sub(r"console\.warn\('⚠️ Could not connect to PostgreSQL database.*?;", db_error_handling, content, flags=re.DOTALL)

# Ensure fallback logic doesn't bypass db failure now since we crash
# We will leave the fallback out since we want it to crash if DB is not there for "Real" endpoints.

with open('soul-app-backend/src/db.ts', 'w') as f:
    f.write(content)

# 2. Add Auth Middleware to User Routes
with open('soul-app-backend/src/routes/user.routes.ts', 'r') as f:
    content = f.read()

if "import { authMiddleware }" not in content:
    content = content.replace("import { sendSuccess, sendError } from '../utils/response';", "import { sendSuccess, sendError } from '../utils/response';\nimport { authMiddleware } from '../middlewares/auth.middleware';")

content = content.replace("router.get('/me', async", "router.get('/me', authMiddleware, async")
content = content.replace("router.put('/me/profile', (req", "router.put('/me/profile', authMiddleware, (req")

# We remove the old try/catch fallback in me because DB is now strict
me_strict = """router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const db = getDb();

    // Auth context injected by middleware
    const userId = req.user?.id || 1;
    const userUuid = req.user?.uuid || 'soul_123456';

    const userResult = await db.query(`SELECT * FROM users WHERE uuid = $1`, [userUuid]);
    if (userResult.rowCount === 0) return sendError(res, 404, 'User not found');

    const user = userResult.rows[0];
    const momentsResult = await db.query(`SELECT id, type, content, url, created_at FROM moments WHERE user_id = $1 ORDER BY id DESC`, [user.id]);

    sendSuccess(res, {
      profile: {
        name: user.name, id: user.uuid, avatar: user.avatar,
        followers: user.followers, following: user.following, visitors: user.visitors, bio: user.bio
      },
      moments: momentsResult.rows
    });
  } catch (error) {
    next(error);
  }
});"""

content = re.sub(r"router\.get\('/me', authMiddleware, async \(req, res, next\) => \{.*?  \} catch \(error\) \{\n    next\(error\);\n  \}\n\}\);", me_strict, content, flags=re.DOTALL)

with open('soul-app-backend/src/routes/user.routes.ts', 'w') as f:
    f.write(content)


# 3. Add Auth Middleware to Moment Routes
with open('soul-app-backend/src/routes/moment.routes.ts', 'r') as f:
    content = f.read()

if "import { authMiddleware }" not in content:
    content = content.replace("import { sendSuccess, sendError } from '../utils/response';", "import { sendSuccess, sendError } from '../utils/response';\nimport { authMiddleware } from '../middlewares/auth.middleware';")

content = content.replace("router.post('/', async", "router.post('/', authMiddleware, async")

moment_strict = """router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { content, type, url } = req.body;
    const db = getDb();
    const userUuid = req.user?.uuid || 'soul_123456';

    const userResult = await db.query(`SELECT id FROM users WHERE uuid = $1`, [userUuid]);
    if (userResult.rowCount === 0) return sendError(res, 404, 'User not found');

    const insertResult = await db.query(`
      INSERT INTO moments (user_id, type, content, url)
      VALUES ($1, $2, $3, $4)
      RETURNING id, type, content, url, created_at
    `, [userResult.rows[0].id, type || 'text', content || '', url || null]);

    sendSuccess(res, { moment: insertResult.rows[0] });
  } catch (error) {
    next(error);
  }
});"""

content = re.sub(r"router\.post\('/', authMiddleware, async \(req, res, next\) => \{.*?  \} catch \(error\) \{\n    next\(error\);\n  \}\n\}\);", moment_strict, content, flags=re.DOTALL)

with open('soul-app-backend/src/routes/moment.routes.ts', 'w') as f:
    f.write(content)
