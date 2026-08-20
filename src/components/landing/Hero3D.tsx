'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Icosahedron, OrbitControls, MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

/* ── Orbiting particle ring ── */
function ParticleRing({ radius, count, color, speed, yOffset = 0 }: {
  radius: number; count: number; color: string; speed: number; yOffset?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) groupRef.current.rotation.y = clock.getElapsedTime() * speed;
  });
  const positions = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    return [Math.cos(angle) * radius, yOffset + Math.sin(i * 0.8) * 0.3, Math.sin(angle) * radius] as [number, number, number];
  });
  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Torus ring ── */
function Ring({ radius, tube, color, rotX, rotZ, speed }: {
  radius: number; tube: number; color: string; rotX: number; rotZ: number; speed: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * speed;
  });
  return (
    <mesh ref={ref} rotation={[rotX, 0, rotZ]}>
      <torusGeometry args={[radius, tube, 16, 120]} />
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.05} emissive={color} emissiveIntensity={0.4} transparent opacity={0.85} />
    </mesh>
  );
}

/* ── Satellite node ── */
function SatNode({ pos, color, speed }: { pos: [number, number, number]; color: string; speed: number }) {
  return (
    <Float speed={speed} floatIntensity={0.9} rotationIntensity={0.6}>
      <mesh position={pos}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.15} emissive={color} emissiveIntensity={0.7} />
      </mesh>
    </Float>
  );
}

/* ── Core ── */
function Core() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15;
      groupRef.current.rotation.x = Math.sin(t * 0.08) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central sphere */}
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1.0}>
        <Icosahedron args={[1.3, 1]}>
          <MeshDistortMaterial
            color="#4F46E5"
            distort={0.22}
            speed={2.5}
            roughness={0.05}
            metalness={0.8}
            emissive="#3730A3"
            emissiveIntensity={0.5}
          />
        </Icosahedron>
      </Float>

      {/* Inner glow sphere */}
      <Sphere args={[1.0, 32, 32]}>
        <meshStandardMaterial color="#818CF8" transparent opacity={0.12} emissive="#6366F1" emissiveIntensity={0.8} />
      </Sphere>

      {/* Torus rings */}
      <Ring radius={2.0} tube={0.025} color="#818CF8" rotX={Math.PI / 2} rotZ={0}           speed={0.3} />
      <Ring radius={2.5} tube={0.018} color="#38BDF8" rotX={0.4}         rotZ={0.3}          speed={-0.22} />
      <Ring radius={2.9} tube={0.013} color="#10B981" rotX={-0.3}        rotZ={-0.5}         speed={0.18} />

      {/* Particle rings */}
      <ParticleRing radius={1.7} count={18} color="#A78BFA" speed={0.5}  yOffset={0} />
      <ParticleRing radius={2.3} count={24} color="#38BDF8" speed={-0.3} yOffset={0.1} />

      {/* Satellite nodes */}
      <SatNode pos={[-2.0,  1.2,  0.5]} color="#F59E0B" speed={2.2} />
      <SatNode pos={[ 2.0, -1.2,  0.5]} color="#10B981" speed={2.5} />
      <SatNode pos={[ 0.0,  2.2, -0.5]} color="#38BDF8" speed={1.8} />
      <SatNode pos={[ 0.0, -2.2, -0.5]} color="#A78BFA" speed={2.8} />
    </group>
  );
}

export default function Hero3D() {
  const [err, setErr] = useState(false);

  if (err) return (
    <div className="w-full h-[460px] flex items-center justify-center">
      <div className="w-48 h-48 rounded-3xl bg-indigo-100 border border-indigo-300 rotate-12" />
    </div>
  );

  return (
    <div className="w-full h-[400px] sm:h-[480px] lg:h-[520px] relative rounded-3xl overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0F0C29 0%, #1a1040 50%, #0a1628 100%)' }}
    >
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <Canvas camera={{ position: [0, 0, 6.5], fov: 44 }} onError={() => setErr(true)}>
        <ambientLight intensity={0.5} />
        <pointLight position={[8, 8, 8]}   intensity={4}   color="#818CF8" />
        <pointLight position={[-8,-8,-8]}  intensity={2}   color="#38BDF8" />
        <pointLight position={[0, 6, -4]}  intensity={2.5} color="#A78BFA" />
        <pointLight position={[4, -4, 4]}  intensity={1.5} color="#10B981" />
        <spotLight   position={[0, 10, 0]} intensity={3}   angle={0.4} penumbra={1} color="#ffffff" />
        <Core />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  );
}
