import re

with open('soul-app-web/src/components/Planet3D.tsx', 'r') as f:
    content = f.read()

# We need to replace the local mock generation with a prop, or fetch it directly.
# Let's change Planet3D and Galaxy to accept nodes from props instead of generating.

galaxy_replacement = """
const Galaxy = ({ onNodeClick, nodes }: { onNodeClick?: (node: NodeData) => void, nodes: NodeData[] }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Entrance animation for the entire galaxy
  const { entranceScale } = useSpring({
    from: { entranceScale: 0.01 },
    to: { entranceScale: 1 },
    config: { mass: 1, tension: 180, friction: 12 } // Bouncy
  });


  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08; // slow rotation
      groupRef.current.rotation.x += delta * 0.03;
    }
  });

  return (
    <animated.group scale={entranceScale}>
    <group ref={groupRef}>
      {nodes.map(node => (
        <UserNode key={node.id} node={node} onClick={() => onNodeClick && onNodeClick(node)} />
      ))}
    </group>
    </animated.group>
  );
};

interface Planet3DProps { onNodeClick?: (node: NodeData) => void; nodes?: NodeData[]; }

export default function Planet3D({ onNodeClick, nodes = [] }: Planet3DProps) {
  return (
    <div className="w-full h-full absolute inset-0 z-0 bg-transparent">
      <Canvas camera={{ position: [0, 0, 8], fov: 55 }}>
        {/* Deep blue/black background color */}
        <color attach="background" args={['#171822']} />
        {/* Fog to hide back nodes and create depth */}
        <fog attach="fog" args={['#171822', 5, 12]} />
        <ambientLight intensity={0.5} />
        <Galaxy onNodeClick={onNodeClick} nodes={nodes} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.8}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}
"""

content = re.sub(r'const Galaxy =.*?Planet3DProps \{ onNodeClick\?: \(node: NodeData\) => void; \}\n\nexport default function Planet3D.*$', galaxy_replacement, content, flags=re.DOTALL)

with open('soul-app-web/src/components/Planet3D.tsx', 'w') as f:
    f.write(content)
