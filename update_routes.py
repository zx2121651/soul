import re

with open('soul-app-backend/src/routes.ts', 'r') as f:
    content = f.read()

planet_data_replacement = """
// --- Planet Data ---
router.get('/planet', (req, res) => {
  // Generate some random node data for the planet view
  const nodes = [];
  const names = ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Mallory'];
  for (let i = 0; i < 20; i++) {
      nodes.push({
          id: i + 1,
          name: names[i % names.length] + (i > names.length ? i.toString() : ''),
          match: Math.floor(60 + Math.random() * 40)
      });
  }

  res.json({
    nodes
  });
});
"""

content = re.sub(r'// --- Planet Data ---.*?}\);', planet_data_replacement, content, flags=re.DOTALL)

moment_post_logic = """
// --- State for Moments ---
let globalMoments = [
  {
    id: 1,
    type: 'text',
    content: '保持热爱，奔赴山海'
  }
];

// --- Moment Post logic ---
router.post('/moments', (req, res) => {
    const { content, type, url } = req.body;
    const newMoment = {
        id: globalMoments.length + 1,
        type: type || 'text',
        content: content || '',
        url: url
    };
    globalMoments.unshift(newMoment);
    res.json({ success: true, moment: newMoment });
});
"""

# Insert moments list into memory instead of hardcoding
content = content.replace("export default router;", moment_post_logic + "\nexport default router;")

# Replace moments returned in me route
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

content = re.sub(r'// --- Me Data ---.*?}  \);\n}\);', me_replacement, content, flags=re.DOTALL)


with open('soul-app-backend/src/routes.ts', 'w') as f:
    f.write(content)
