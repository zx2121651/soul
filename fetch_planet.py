import re

with open('soul-app-web/src/pages/PlanetPage.tsx', 'r') as f:
    content = f.read()

import_replacement = """
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Planet3D from '../components/Planet3D';
import type { NodeData } from '../components/Planet3D';
import * as THREE from 'three';
"""

content = content.replace("import { useState } from 'react';", import_replacement)


planet_page_state = """
export default function PlanetPage() {

  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);
  const [isRadarOpen, setRadarOpen] = useState(false);
  const [nodes, setNodes] = useState<NodeData[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/planet')
      .then(res => res.json())
      .then(data => {
        const fetchedNodes = data.nodes || [];
        const SPHERE_RADIUS = 3.5;
        const colors = ["#ff9a9e", "#fecfef", "#a1c4fd", "#c2e9fb", "#d4fc79", "#96e6a1"];

        const newNodes: NodeData[] = [];
        newNodes.push({
          id: 0,
          position: new THREE.Vector3(0, 0, SPHERE_RADIUS * 1.05),
          name: "自己",
          match: 100,
          color: "#ffffff",
          isSelf: true,
          phase: 0,
          speed: 1,
          amplitude: 0.1
        });

        const NUM_NODES = fetchedNodes.length + 1;
        const phi = Math.PI * (3 - Math.sqrt(5));

        fetchedNodes.forEach((n: any, idx: number) => {
          const i = idx + 1;
          const y = 1 - (i / (NUM_NODES - 1)) * 2;
          const radius = Math.sqrt(1 - y * y);
          const theta = phi * i;
          const jitterRadius = radius + (Math.random() - 0.5) * 0.8;
          const jitterTheta = theta + (Math.random() - 0.5) * 0.5;
          const jitterY = y + (Math.random() - 0.5) * 0.5;
          const x = Math.cos(jitterTheta) * jitterRadius;
          const z = Math.sin(jitterTheta) * jitterRadius;

          newNodes.push({
            id: n.id,
            position: new THREE.Vector3(x * SPHERE_RADIUS, jitterY * SPHERE_RADIUS, z * SPHERE_RADIUS),
            name: n.name,
            match: n.match,
            color: colors[Math.floor(Math.random() * colors.length)],
            phase: Math.random() * Math.PI * 2,
            speed: 0.5 + Math.random() * 1.5,
            amplitude: 0.05 + Math.random() * 0.15
          });
        });

        setNodes(newNodes);
      });
  }, []);
"""

content = re.sub(r'export default function PlanetPage\(\) \{[\s\S]*?const \[isRadarOpen, setRadarOpen\] = useState\(false\);', planet_page_state, content)

content = content.replace("<Planet3D onNodeClick={handleNodeClick} />", "<Planet3D onNodeClick={handleNodeClick} nodes={nodes} />")


with open('soul-app-web/src/pages/PlanetPage.tsx', 'w') as f:
    f.write(content)
