import glob
for file in glob.glob('soul-app-backend/src/routes/*.ts'):
    with open(file, 'r') as f:
        content = f.read()
    content = content.replace("import { Router }\n", "import { Router } from 'express';\n")
    content = content.replace("});\n  } catch", "  } catch")
    with open(file, 'w') as f:
        f.write(content)
