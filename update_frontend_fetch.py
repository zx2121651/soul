import os
import glob
import re

pages_dir = 'soul-app-web/src/pages/'
for file in glob.glob(pages_dir + '*.tsx'):
    with open(file, 'r') as f: content = f.read()

    # We need to change .then(data => {...}) to .then(res => res.data).then(data => {...})
    # Since they use res.json() -> data, data is now { code, message, data: {...} }
    # Let's replace res.json() with res.json().then(r => r.data)

    content = content.replace("res.json())\n      .then(data =>", "res.json())\n      .then(resJson => resJson.data)\n      .then(data =>")
    content = content.replace("res.json())\n    .then(() =>", "res.json())\n    .then(() =>") # for App.tsx usually but just in case

    with open(file, 'w') as f: f.write(content)

# Fix App.tsx
with open('soul-app-web/src/App.tsx', 'r') as f: content = f.read()
content = content.replace("res.json())\n    .then(() => {", "res.json())\n    .then(resJson => {\n        if(resJson.code !== 0) console.error(resJson.message);\n")
with open('soul-app-web/src/App.tsx', 'w') as f: f.write(content)
