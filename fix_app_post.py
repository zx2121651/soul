with open('soul-app-web/src/App.tsx', 'r') as f:
    c = f.read()
import re
# Specifically fix App.tsx post moments
c = re.sub(r"api\.post\('/moments', \{[\s\S]*?\}", "api.post('/moments', { content: text, type: image ? 'image' : 'text', url: image }).then(() => setIsEditorOpen(false)).catch(console.error);\n  }", c)
with open('soul-app-web/src/App.tsx', 'w') as f:
    f.write(c)
