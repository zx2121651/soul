import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

interface TagProps {
  text: string;
  position: THREE.Vector3;
  isSelected: boolean;
  onClick: () => void;
}

const Tag = ({ text, position, isSelected, onClick }: TagProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Html position={position} center distanceFactor={10}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        className={`
          px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-300 cursor-pointer
          ${isSelected
            ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.6)]'
            : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white border border-white/5'}
          ${hovered && !isSelected ? 'border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : ''}
        `}
      >
        {text}
      </motion.button>
    </Html>
  );
};

interface CloudProps {
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}

const Cloud = ({ tags, selectedTags, onToggleTag }: CloudProps) => {
  const groupRef = useRef<THREE.Group>(null);

  const tagData = useMemo(() => {
    const data = [];
    const count = tags.length;
    const radius = 5;

    for (let i = 0; i < count; i++) {
      // Fibonacci sphere algorithm for even distribution
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      data.push({
        text: tags[i],
        position: new THREE.Vector3(x, y, z),
      });
    }
    return data;
  }, [tags]);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
      groupRef.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {tagData.map((data, index) => (
        <Tag
          key={index}
          text={data.text}
          position={data.position}
          isSelected={selectedTags.includes(data.text)}
          onClick={() => onToggleTag(data.text)}
        />
      ))}
    </group>
  );
};

export default function InterestTagCloud({ tags, selectedTags, onToggleTag }: CloudProps) {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 12], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Cloud tags={tags} selectedTags={selectedTags} onToggleTag={onToggleTag} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          autoRotate={false} // We handle rotation in useFrame, but OrbitControls allows manual drag
        />
      </Canvas>
    </div>
  );
}
