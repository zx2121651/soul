import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

const NUM_NODES = 80;
const SPHERE_RADIUS = 3.5;

interface NodeData {
  id: number;
  position: THREE.Vector3;
  name: string;
  match: number;
  color: string;
  isSelf?: boolean;
}

const mockNames = ["Angel", "Yao", "Stephen", "Xiin", "陈子豪", "BLUE", "Kristy", "tuan", "Obito", "布丁", "月尊", "My Age 40"];
const colors = ["#ff9a9e", "#fecfef", "#a1c4fd", "#c2e9fb", "#d4fc79", "#96e6a1"];

const generateNodes = (): NodeData[] => {
  const nodes: NodeData[] = [];

  nodes.push({
    id: 0,
    position: new THREE.Vector3(0, 0, SPHERE_RADIUS * 1.05),
    name: "Me",
    match: 100,
    color: "#ffffff",
    isSelf: true
  });

  const phi = Math.PI * (3 - Math.sqrt(5));

  for (let i = 1; i < NUM_NODES; i++) {
    const y = 1 - (i / (NUM_NODES - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = phi * i;

    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;

    nodes.push({
      id: i,
      position: new THREE.Vector3(x * SPHERE_RADIUS, y * SPHERE_RADIUS, z * SPHERE_RADIUS),
      name: mockNames[Math.floor(Math.random() * mockNames.length)],
      match: Math.floor(60 + Math.random() * 39),
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
  return nodes;
};

const UserNode = ({ node }: { node: NodeData }) => {
  const { camera } = useThree();
  const textRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (textRef.current) {
      textRef.current.quaternion.copy(camera.quaternion);
    }
  });

  if (node.isSelf) {
    return (
      <group position={node.position}>
        {/* Glow inner */}
        <mesh>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
        {/* Glow outer ring */}
        <mesh>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshBasicMaterial color="#a1c4fd" transparent opacity={0.4} />
        </mesh>
        <group ref={textRef}>
          {/* Planet rings simulate icon */}
          <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
            <ringGeometry args={[0.45, 0.5, 32]} />
            <meshBasicMaterial color="#ff9a9e" side={THREE.DoubleSide} transparent opacity={0.7} />
          </mesh>
        </group>
      </group>
    );
  }

  return (
    <group position={node.position}>
      <mesh>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshBasicMaterial color={node.color} />
      </mesh>
      <group ref={textRef}>
        <Text position={[0, 0.15, 0]} fontSize={0.16} color="white" anchorX="center" anchorY="middle" fillOpacity={0.9} outlineWidth={0.01} outlineColor="#000">
          {node.name}
        </Text>
        <Text position={[0, -0.15, 0]} fontSize={0.12} color="#888" anchorX="center" anchorY="middle">
          {node.match}%
        </Text>
      </group>
    </group>
  );
};

const Galaxy = () => {
  const groupRef = useRef<THREE.Group>(null);
  const nodes = useMemo(() => generateNodes(), []);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08; // slow rotation
      groupRef.current.rotation.x += delta * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map(node => (
        <UserNode key={node.id} node={node} />
      ))}
    </group>
  );
};

export default function Planet3D() {
  return (
    <div className="w-full h-full absolute inset-0 z-0 bg-transparent">
      <Canvas camera={{ position: [0, 0, 8.5], fov: 60 }}>
        {/* Deep blue/black background color */}
        <color attach="background" args={['#171822']} />
        {/* Fog to hide back nodes and create depth */}
        <fog attach="fog" args={['#171822', 5, 12]} />
        <ambientLight intensity={0.5} />
        <Galaxy />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.6}
        />
      </Canvas>
    </div>
  );
}
