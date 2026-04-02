with open('soul-app-backend/src/routes.ts', 'r') as f:
    content = f.read()

import re

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

# Hard replace since regex was failing
content = re.sub(r"// --- Me Data ---[\s\S]*?// --- State for Moments ---", me_replacement + "\n\n// --- State for Moments ---", content)

with open('soul-app-backend/src/routes.ts', 'w') as f:
    f.write(content)
