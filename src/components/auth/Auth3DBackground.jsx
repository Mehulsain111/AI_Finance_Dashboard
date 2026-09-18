"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Sphere, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// A floating AI Core composed of particles
function AICore() {
  const ref = useRef(null);
  
  // Generate random points in a sphere
  const sphere = useMemo(() => {
    const p = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      const r = 2 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = r * Math.cos(phi);
    }
    return p;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    // Rotate slowly over time
    ref.current.rotation.y = state.clock.elapsedTime / 4;
    ref.current.rotation.x = state.clock.elapsedTime / 6;

    // React to mouse
    ref.current.rotation.y += (state.pointer.x * Math.PI) * 0.05;
    ref.current.rotation.x += (-state.pointer.y * Math.PI) * 0.05;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial 
          transparent 
          color="#3b82f6" 
          size={0.02} 
          sizeAttenuation={true} 
          depthWrite={false} 
          blending={THREE.AdditiveBlending}
        />
      </Points>
      {/* Central glowing orb */}
      <Sphere args={[0.5, 32, 32]}>
        <meshPhysicalMaterial 
          color="#10b981" 
          emissive="#10b981" 
          emissiveIntensity={2} 
          roughness={0.1} 
          metalness={1} 
          transparent 
          opacity={0.8}
        />
      </Sphere>
    </group>
  );
}

export default function Auth3DBackground() {
  return (
    <div className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none" style={{ zIndex: 0, overflow: "hidden", background: "#020617" }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <AICore />
        <Environment preset="city" />
      </Canvas>
      {/* Vignette Overlay for cinematic feel */}
      <div 
        className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none" 
        style={{ background: "radial-gradient(circle at center, transparent 0%, #020617 100%)", zIndex: 1 }}
      />
    </div>
  );
}
