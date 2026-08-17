'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Octahedron, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

function AcademicKnowledgeCore() {
  const meshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.2;
      meshRef.current.rotation.x = Math.sin(t * 0.12) * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.3;
      ringRef.current.rotation.y = t * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -t * 0.25;
      ring2Ref.current.rotation.z = t * 0.15;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Central Soothing Knowledge Prism */}
      <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1}>
        <Icosahedron args={[1.3, 0]}>
          <meshStandardMaterial
            color="#4F46E5"
            roughness={0.2}
            metalness={0.3}
            wireframe={false}
          />
        </Icosahedron>
      </Float>

      {/* Gentle Orbital Learning Rings */}
      <mesh ref={ringRef}>
        <Torus args={[2.1, 0.025, 16, 100]}>
          <meshStandardMaterial color="#818CF8" metalness={0.6} roughness={0.3} />
        </Torus>
      </mesh>

      <mesh ref={ring2Ref}>
        <Torus args={[2.5, 0.02, 16, 100]}>
          <meshStandardMaterial color="#0284C7" metalness={0.6} roughness={0.3} />
        </Torus>
      </mesh>

      {/* Satellite Knowledge Nodes */}
      {[-1.8, 1.8].map((x, i) => (
        <group key={i} position={[x, i % 2 === 0 ? 1.1 : -1.1, 0.4]}>
          <Octahedron args={[0.25, 0]}>
            <meshStandardMaterial color="#F59E0B" metalness={0.5} roughness={0.3} />
          </Octahedron>
        </group>
      ))}
    </group>
  );
}

export default function Hero3D() {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center relative">
        <div className="w-48 h-48 rounded-3xl bg-indigo-50 border-2 border-indigo-200 rotate-12 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border border-sky-300 -rotate-45" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[380px] sm:h-[460px] lg:h-[500px] relative">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        onError={() => setHasError(true)}
        className="cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={1.2} />
        <pointLight position={[10, 10, 10]} intensity={1.8} color="#EEF2FF" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#C7D2FE" />
        <directionalLight position={[0, 5, 5]} intensity={1} />
        <AcademicKnowledgeCore />
      </Canvas>
    </div>
  );
}
