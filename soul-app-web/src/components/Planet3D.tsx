import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { animated, useSpring } from '@react-spring/three';
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

const mockNames = ["陈子豪", "半岛铁盒", "一只小橘猫", "夏天", "云吞面", "星空", "晚风", "林深见鹿", "迷路的小熊", "冰美式", "芥末可可", "无心", "小花", "月尊", "布丁", "大笨钟"];
const colors = ["#ff9a9e", "#fecfef", "#a1c4fd", "#c2e9fb", "#d4fc79", "#96e6a1"];

const generateNodes = (): NodeData[] => {
  const nodes: NodeData[] = [];

  nodes.push({
    id: 0,
    position: new THREE.Vector3(0, 0, SPHERE_RADIUS * 1.05),
    name: "自己",
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
  const [hovered, setHover] = useState(false);

  // Spring animation for scale and opacity on hover
  const { scale, opacity } = useSpring({
    scale: hovered ? 1.4 : 1,
    opacity: hovered ? 1 : 0.8,
    config: { mass: 1, tension: 280, friction: 20 }
  });

  useFrame(() => {
    if (textRef.current) {
      textRef.current.quaternion.copy(camera.quaternion);
    }
  });

  if (node.isSelf) {
    return (
      <animated.group position={node.position} scale={scale} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
        {/* Glow inner */}
        <mesh>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
        {/* Glow outer ring */}
        <mesh>
          <sphereGeometry args={[0.55, 32, 32]} />
          <animated.meshBasicMaterial color="#a1c4fd" transparent opacity={opacity.to(o => o * 0.4)} />
        </mesh>
        <group ref={textRef}>
          {/* Planet rings simulate icon */}
          <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
            <ringGeometry args={[0.45, 0.5, 32]} />
            <meshBasicMaterial color="#ff9a9e" side={THREE.DoubleSide} transparent opacity={0.8} />
          </mesh>
          <Text position={[0, -0.7, 0]} fontSize={0.2} color="#ffffff" font="https://fonts.gstatic.com/ea/notosanssc/v1/NotoSansSC-Regular.otf" anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#000">
            {node.name}
          </Text>
        </group>
      </animated.group>
    );
  }

  return (
    <animated.group
      position={node.position}
      scale={scale}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
      onPointerOut={() => setHover(false)}
      onClick={(e) => { e.stopPropagation(); alert(`点击了 ${node.name}，匹配度 ${node.match}%`); }}
    >
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={node.color} />
      </mesh>
      <group ref={textRef}>
        <animated.group>
          <Text position={[0, 0.18, 0]} fontSize={0.16} color="white" font="https://fonts.gstatic.com/ea/notosanssc/v1/NotoSansSC-Regular.otf" anchorX="center" anchorY="middle" fillOpacity={opacity} outlineWidth={0.015} outlineColor="#171822">
            {node.name}
          </Text>
          <Text position={[0, -0.15, 0]} fontSize={0.12} color={node.color} anchorX="center" anchorY="middle" fillOpacity={opacity}>
            {node.match}%
          </Text>
        </animated.group>
      </group>
    </animated.group>
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
      <Canvas camera={{ position: [0, 0, 8], fov: 55 }}>
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
