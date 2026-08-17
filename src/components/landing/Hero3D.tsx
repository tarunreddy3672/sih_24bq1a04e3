'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Octahedron, Ring } from '@react-three/drei';
import * as THREE from 'three';

function IntelligenceCore() {
  const meshRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.25;
      meshRef.current.rotation.x = Math.sin(t * 0.15) * 0.2;
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.4;
      ringRef.current.rotation.y = t * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -t * 0.35;
      ring2Ref.current.rotation.z = t * 0.25;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Central Quantum Intelligence Sphere */}
      <Float speed={2} rotationIntensity={0.8} floatIntensity={1.2}>
        <Sphere args={[1.2, 64, 64]}>
          <MeshDistortMaterial
            color="#00F0FF"
            emissive="#005577"
            roughness={0.1}
            metalness={0.8}
            distort={0.35}
            speed={2}
          />
        </Sphere>
      </Float>

      {/* Outer Orbital Rings */}
      <mesh ref={ringRef}>
        <Torus args={[2.0, 0.03, 16, 100]}>
          <meshStandardMaterial color="#6366F1" emissive="#312E81" metalness={0.9} roughness={0.1} />
        </Torus>
      </mesh>

      <mesh ref={ring2Ref}>
        <Torus args={[2.5, 0.02, 16, 100]}>
          <meshStandardMaterial color="#38BDF8" emissive="#0369A1" metalness={0.9} roughness={0.2} />
        </Torus>
      </mesh>

      {/* Floating Knowledge Nodes */}
      {[-1.8, 1.8].map((x, i) => (
        <group key={i} position={[x, i % 2 === 0 ? 1.2 : -1.2, 0.5]}>
          <Octahedron args={[0.3, 0]}>
            <meshStandardMaterial color="#F59E0B" emissive="#B45309" metalness={0.8} roughness={0.2} />
          </Octahedron>
        </group>
      ))}
    </group>
  );
}

export default function Hero3D() {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    // Elegant CSS 3D fallback if WebGL is disabled or unsupported
    return (
      <div className="w-full h-full flex items-center justify-center relative">
        <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-cyan-500/30 to-indigo-600/30 blur-2xl animate-pulse" />
        <div className="absolute w-48 h-48 rounded-3xl border-2 border-cyan-400/40 rotate-12 flex items-center justify-center backdrop-blur-md">
          <div className="w-32 h-32 rounded-full border border-indigo-400/60 -rotate-45" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] sm:h-[500px] lg:h-[580px] relative">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        onError={() => setHasError(true)}
        className="cursor-grab active:cursor-grabbing"
      >
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00F0FF" />
        <pointLight position={[-10, -10, -10]} intensity={1.2} color="#6366F1" />
        <directionalLight position={[0, 5, 5]} intensity={0.8} />
        <IntelligenceCore />
      </Canvas>
    </div>
  );
}
