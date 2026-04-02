with open('soul-app-web/src/pages/PlanetPage.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.strip() in [
        "import { motion } from 'framer-motion';",
        "import Planet3D from '../components/Planet3D';",
        "import type { NodeData } from '../components/Planet3D';"
    ]:
        if not any(line.strip() in l for l in new_lines):
            new_lines.append(line)
    else:
        new_lines.append(line)

with open('soul-app-web/src/pages/PlanetPage.tsx', 'w') as f:
    f.writelines(new_lines)
