import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const Building = ({ position, color, label, isHighlighted, onClick }) => {
  return (
    <group position={position} onClick={onClick}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial 
            color={isHighlighted ? "#00f2ff" : color} 
            emissive={isHighlighted ? "#00f2ff" : "#000000"}
            emissiveIntensity={isHighlighted ? 0.5 : 0}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </Float>
    </group>
  );
};

const CampusMap = ({ highlightedLocation, onBuildingClick }) => {
  return (
    <div className="h-[360px] w-full overflow-hidden rounded-xl border border-white/10 bg-[#020c14] shadow-2xl sm:h-[420px] lg:h-[500px]">
      <Canvas shadows hover>
        <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={50} />
        <OrbitControls enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 2.1} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

        <Building 
          position={[-3, 1, 0]} 
          color="#3b82f6" 
          label="Library" 
          isHighlighted={highlightedLocation === 'Library'}
          onClick={() => onBuildingClick('Library')}
        />
        <Building 
          position={[0, 1, -3]} 
          color="#10b981" 
          label="Lab" 
          isHighlighted={highlightedLocation === 'Lab'}
          onClick={() => onBuildingClick('Lab')}
        />
        <Building 
          position={[3, 1, 0]} 
          color="#f59e0b" 
          label="Classroom" 
          isHighlighted={highlightedLocation === 'Classroom'}
          onClick={() => onBuildingClick('Classroom')}
        />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#051622" roughness={0.8} metalness={0.2} />
        </mesh>
        
        <gridHelper args={[20, 20, "#1e293b", "#0f172a"]} position={[0, 0.01, 0]} />
        
        <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.5} far={10} color="#000000" />
      </Canvas>
    </div>
  );
};

export default CampusMap;
