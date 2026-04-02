import re

with open('soul-app-web/src/App.tsx', 'r') as f:
    content = f.read()

# Make sure posting a moment really goes to the backend
post_moment_replacement = """
  const handlePostMoment = (text: string, image: string | null) => {
    fetch('http://localhost:3001/api/moments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text, type: image ? 'image' : 'text', url: image })
    })
    .then(res => res.json())
    .then(() => {
        setIsEditorOpen(false);
        // Force refresh me page or explore page by reloading or triggering re-fetch
        // In this simple app, we can just switch back and forth or rely on useEffect to re-fetch on mount
    });
  };
"""

content = re.sub(r'const handlePostMoment =.*?setIsEditorOpen\(false\);\n  \};', post_moment_replacement, content, flags=re.DOTALL)


with open('soul-app-web/src/App.tsx', 'w') as f:
    f.write(content)
