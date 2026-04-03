with open('soul-app-backend/src/routes.ts', 'r') as f:
    content = f.read()

# Fix syntax error from bad regex replacement earlier (extra `});`)
content = content.replace("});\n\n});\n\n// --- Explore Data ---", "});\n\n// --- Explore Data ---")

# Replace the hardcoded moment in /me
me_replacement = """
// --- Me Data ---
router.get('/me', (req, res) => {
  res.json({
    profile: {
      name: '一只小透明',
      id: 'soul_123456',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=me&backgroundColor=f4b6c2',
      followers: 128,
      following: 56,
      visitors: 342,
      bio: '寻找宇宙中的同频共振'
    },
    moments: globalMoments
  });
});
"""

import re
content = re.sub(r'// --- Me Data ---.*?}  \);\n}\);\n', me_replacement, content, flags=re.DOTALL)


with open('soul-app-backend/src/routes.ts', 'w') as f:
    f.write(content)
