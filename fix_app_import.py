with open('soul-app-web/src/App.tsx', 'r') as f:
    c = f.read()

if "useEffect" not in c and "localStorage.getItem" in c:
    c = c.replace("import { useState }", "import { useState, useEffect }")
with open('soul-app-web/src/App.tsx', 'w') as f:
    f.write(c)
