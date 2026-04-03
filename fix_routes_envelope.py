import os
import glob

routes_dir = 'soul-app-backend/src/routes/'

# Fix User Routes
user_file = routes_dir + 'user.routes.ts'
with open(user_file, 'r') as f: content = f.read()
if "sendSuccess(res," not in content:
    content = content.replace("res.json({", "sendSuccess(res, {")
    content = content.replace("res.json(req.body)", "sendSuccess(res, req.body)")
    # Fallback to simple replace for the rest
    content = content.replace("res.json({ success: true, message: 'Followed' })", "sendSuccess(res, null, 'Followed')")
    content = content.replace("res.json({ success: true, message: 'Unfollowed' })", "sendSuccess(res, null, 'Unfollowed')")
    content = content.replace("res.json({ followers:", "sendSuccess(res, { followers:")
    content = content.replace("res.json({ following:", "sendSuccess(res, { following:")
    content = content.replace("res.json({ success: true, message: 'User blocked' })", "sendSuccess(res, null, 'User blocked')")
    content = content.replace("res.json({ success: true, message: 'User unblocked' })", "sendSuccess(res, null, 'User unblocked')")
    content = content.replace("res.json({ blockedUsers: [] })", "sendSuccess(res, { blockedUsers: [] })")
    content = content.replace("res.json({ success: true, message: 'Report submitted successfully' })", "sendSuccess(res, null, 'Report submitted successfully')")
    content = content.replace("res.json({ id: req.params.id", "sendSuccess(res, { id: req.params.id")
    # Fix the double closing from the first replace
    content = content.replace("});\n  } catch", "});\n  } catch")
with open(user_file, 'w') as f: f.write(content)


# Fix Moment Routes
moment_file = routes_dir + 'moment.routes.ts'
with open(moment_file, 'r') as f: content = f.read()
if "import { sendSuccess" not in content:
    content = content.replace("import { sendError }", "import { sendSuccess, sendError }")
content = content.replace("res.json({ success: true, moment: insertResult.rows[0] });", "sendSuccess(res, { moment: insertResult.rows[0] });")
content = content.replace("res.json({ success: true, message: `Liked post ${req.params.id}`, newLikesCount: Math.floor(Math.random() * 100) })", "sendSuccess(res, { newLikesCount: Math.floor(Math.random() * 100) }, `Liked post ${req.params.id}`)")
content = content.replace("res.json({ comments: [{ id: 1, user: '夏天🌿', content: '哈哈，太有意思了！', time: '10分钟前' }] })", "sendSuccess(res, { comments: [{ id: 1, user: '夏天🌿', content: '哈哈，太有意思了！', time: '10分钟前' }] })")
content = content.replace("res.json({ success: true, comment: { id: Date.now(), user: '自己 (Me)', content: req.body.content, time: '刚刚' } })", "sendSuccess(res, { comment: { id: Date.now(), user: '自己 (Me)', content: req.body.content, time: '刚刚' } })")
content = content.replace("res.json({ success: true, message: 'Post deleted' })", "sendSuccess(res, null, 'Post deleted')")
content = content.replace("res.json({ success: true, shareUrl: 'https://soul.app/p/123' })", "sendSuccess(res, { shareUrl: 'https://soul.app/p/123' })")
with open(moment_file, 'w') as f: f.write(content)

# Fix Content Routes
content_file = routes_dir + 'content.routes.ts'
with open(content_file, 'r') as f: content = f.read()
if "import { sendSuccess" not in content:
    content = content.replace("import { Router }", "import { Router }\nimport { sendSuccess } from '../utils/response';")
content = content.replace("res.json({ nodes });", "sendSuccess(res, { nodes });")
content = content.replace("res.json({", "sendSuccess(res, {")
content = content.replace("res.json({ posts: [] })", "sendSuccess(res, { posts: [] })")
# Quick fix for explore replace mismatch
content = content.replace("    posts: [ { id: 1, user: { name: 'Alice', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alice&backgroundColor=b6e3f4' }, content: '今天天气真好，适合出去走走。', type: 'text', tags: ['日常'], likes: 12 } ]\n  });", "    posts: [ { id: 1, user: { name: 'Alice', avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alice&backgroundColor=b6e3f4' }, content: '今天天气真好，适合出去走走。', type: 'text', tags: ['日常'], likes: 12 } ]\n  });")
with open(content_file, 'w') as f: f.write(content)

# Fix Social Routes
social_file = routes_dir + 'social.routes.ts'
with open(social_file, 'r') as f: content = f.read()
if "import { sendSuccess" not in content:
    content = content.replace("import { Router }", "import { Router }\nimport { sendSuccess } from '../utils/response';")
content = content.replace("res.json({", "sendSuccess(res, {")
content = content.replace("res.json({ success: true, message: { id: Date.now(), senderId: 1, text: req.body.text, time: '刚刚', isSelf: true } })", "sendSuccess(res, { message: { id: Date.now(), senderId: 1, text: req.body.text, time: '刚刚', isSelf: true } })")
content = content.replace("res.json({ success: true, matchUser:", "sendSuccess(res, { matchUser:")
with open(social_file, 'w') as f: f.write(content)

# Fix System Routes
system_file = routes_dir + 'system.routes.ts'
with open(system_file, 'r') as f: content = f.read()
if "import { sendSuccess" not in content:
    content = content.replace("import { Router }", "import { Router }\nimport { sendSuccess } from '../utils/response';")
content = content.replace("res.json({ success: true, groupId: 2, message: 'Group created' })", "sendSuccess(res, { groupId: 2 }, 'Group created')")
content = content.replace("res.json({", "sendSuccess(res, {")
with open(system_file, 'w') as f: f.write(content)


# Fix Index Fallback
index_file = routes_dir + 'index.ts'
with open(index_file, 'r') as f: content = f.read()
if "import { sendSuccess" not in content:
    content = content.replace("import { getDb }", "import { getDb }\nimport { sendSuccess, sendError } from '../utils/response';")

content = content.replace("return res.json({ profile: { name: '一只小透明(Mock Mode)' }, moments: [] });", "return sendSuccess(res, { profile: { name: '一只小透明(Mock Mode)' }, moments: [] });")
content = content.replace("return res.status(404).json({ error: 'User not found' });", "return sendError(res, 404, 'User not found');")
content = content.replace("res.json({", "sendSuccess(res, {")
content = content.replace("});\n  } catch", ");\n  } catch") # Fix paranthesis
with open(index_file, 'w') as f: f.write(content)
