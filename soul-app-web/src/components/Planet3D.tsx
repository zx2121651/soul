import { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { animated, useSpring } from '@react-spring/three';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';


export interface NodeData {
  id: number;
  position: THREE.Vector3;
  name: string;
  match: number;
  color: string;
  isSelf?: boolean;
  phase: number;
  speed: number;
  amplitude: number;
}






const UserNode = ({ node, onClick }: { node: NodeData; onClick?: () => void }) => {

  const { camera } = useThree();

  const textRef = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);

  // Spring animation for scale and opacity on hover
  const { scale, opacity } = useSpring({
    scale: hovered ? 1.4 : 1,
    opacity: hovered ? 1 : 0.8,
    config: { mass: 1, tension: 280, friction: 20 }
  });

  useFrame((_state) => {
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
        {/* HTML CSS Sprite for the Saturn Center */}
        <Html position={[0, 0, 0]} center transform sprite zIndexRange={[100, 0]}>
          <div className="relative flex items-center justify-center pointer-events-none" style={{ width: '120px', height: '120px' }}>
            <div className="absolute w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF9A9E] via-[#FECFEF] to-[#a1c4fd] shadow-[0_0_20px_#a1c4fd]"></div>
            <div className="absolute w-20 h-6 border-[3px] border-white/80 rounded-[50%] -rotate-12 shadow-[0_0_10px_#ffffff]"></div>
            <div className="absolute top-6 left-6 w-1 h-1 bg-white rounded-full animate-pulse shadow-[0_0_5px_white]"></div>
            <div className="absolute bottom-6 right-6 w-1 h-1 bg-white rounded-full animate-pulse shadow-[0_0_5px_white]"></div>
          </div>
        </Html>
        <group ref={textRef}>
          <Text position={[0, -0.7, 0]} fontSize={0.2} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#000">
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
      onClick={(e) => { e.stopPropagation(); if(onClick) onClick(); }}
    >
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={node.color} />
      </mesh>
      <group ref={textRef}>
        <animated.group>
          <Text position={[0, 0.18, 0]} fontSize={0.16} color="white" anchorX="center" anchorY="middle" fillOpacity={opacity.get() as any} outlineWidth={0.015} outlineColor="#171822">
            {node.name}
          </Text>
          <Text position={[0, -0.15, 0]} fontSize={0.12} color={node.color} anchorX="center" anchorY="middle" fillOpacity={opacity.get() as any}>
            {node.match}%
          </Text>
        </animated.group>
      </group>
    </animated.group>
  );

};



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
