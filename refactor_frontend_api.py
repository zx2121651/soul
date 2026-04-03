import glob
import re

pages_dir = 'soul-app-web/src/pages/'
app_file = 'soul-app-web/src/App.tsx'

def refactor_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Add api client import
    if "import { api }" not in content:
        content = content.replace("import { useState", "import { api } from '../api/client';\nimport { useState")

    # Replace fetch logic (App.tsx / POST moments)
    if "fetch('http://localhost:3001/api/moments'" in content:
        content = re.sub(
            r"fetch\('http://localhost:3001/api/moments'[\s\S]*?body: JSON.stringify\(\{ content: text, type: image \? 'image' : 'text', url: image \}\)\n    \}\)\n    \.then.*?resJson \=> \{\n        if\(resJson\.code !== 0\) console\.error\(resJson\.message\);\n\n        setIsEditorOpen\(false\);\n        // Force refresh[\s\S]*?\}\);",
            "api.post('/moments', { content: text, type: image ? 'image' : 'text', url: image }).then(() => setIsEditorOpen(false)).catch(console.error);",
            content
        )
        # fallback fix if regex misses
        content = content.replace("fetch('http://localhost:3001/api/moments', {", "api.post('/moments', {")

    # Replace fetch logic (GET endpoints)
    endpoints = {
        'planet': '/planet',
        'explore': '/explore',
        'chat': '/chat',
        'me': '/users/me' # Updated path per requirement
    }

    for key, endpoint in endpoints.items():
        if f"fetch('http://localhost:3001/api/{key}')" in content:
            # Complex block replace
            pattern = rf"fetch\('http://localhost:3001/api/{key}'\)\s*\.then\([^)]+\)\s*\.then\([^)]+\)\s*\.then\([^)]+\s*=>\s*\{{(.*?)\}}\)"
            match = re.search(pattern, content, re.DOTALL)
            if match:
                inner_logic = match.group(1)
                replacement = f"api.get<any>('{endpoint}').then(data => {{{inner_logic}}}).catch(console.error);"
                content = content[:match.start()] + replacement + content[match.end():]

            # Simple fallback replace
            content = content.replace(f"fetch('http://localhost:3001/api/{key}')\n      .then(res => res.json())\n      .then(resJson => resJson.data)\n      .then(data =>", f"api.get<any>('{endpoint}').then(data =>")
            content = content.replace(f"fetch('http://localhost:3001/api/{key}')", f"api.get<any>('{endpoint}')")

    with open(filepath, 'w') as f:
        f.write(content)

for file in glob.glob(pages_dir + '*.tsx'):
    refactor_file(file)

refactor_file(app_file)
