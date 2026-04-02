with open('soul-app-web/src/components/Planet3D.tsx', 'r') as f:
    content = f.read()
import re
content = re.sub(r'const mockNames = \[.*?\];', '', content)
content = re.sub(r'const colors = \[.*?\];', '', content)
content = re.sub(r'const generateNodes = \(\): NodeData\[\] => \{[\s\S]*?return nodes;\n\};', '', content)
content = content.replace("import { useRef, useMemo, useState } from 'react';", "import { useRef, useState } from 'react';")
with open('soul-app-web/src/components/Planet3D.tsx', 'w') as f:
    f.write(content)
