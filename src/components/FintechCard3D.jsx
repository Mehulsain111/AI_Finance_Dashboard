"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Text, useCursor, Float, MeshDistortMaterial, RoundedBox } from "@react-three/drei";
import * as THREE from "three";

function CreditCardMesh({ name, balance }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  // Animate parallax tilt on mouse move
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Base float + mouse parallax
      meshRef.current.rotation.x = THREE.MathUtils.lerp(
        meshRef.current.rotation.x,
        (state.pointer.y * Math.PI) / 10,
        0.1
      );
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y,
        (state.pointer.x * Math.PI) / 6,
        0.1
      );
    }
  });

  return (
    <group ref={meshRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Main Card Body */}
      <RoundedBox args={[3.4, 2.1, 0.05]} radius={0.1} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial 
          color={hovered ? "#1e293b" : "#0f172a"} 
          metalness={0.9} 
          roughness={0.2} 
          envMapIntensity={2.5} 
        />
      </RoundedBox>

      {/* Holographic Chip */}
      <mesh position={[-1.2, 0.4, 0.03]} castShadow>
        <planeGeometry args={[0.45, 0.35]} />
        <MeshDistortMaterial color="#fbbf24" metalness={1} roughness={0.1} distort={0} />
      </mesh>
      
      {/* Holographic / Glowing Accents */}
      <mesh position={[1.2, -0.6, 0.03]}>
        <circleGeometry args={[0.25, 32]} />
        <meshPhysicalMaterial color="#3b82f6" metalness={0.5} roughness={0.1} transmission={0.9} thickness={0.5} />
      </mesh>
      <mesh position={[0.85, -0.6, 0.03]}>
        <circleGeometry args={[0.25, 32]} />
        <meshPhysicalMaterial color="#ef4444" metalness={0.5} roughness={0.1} transmission={0.9} thickness={0.5} />
      </mesh>

      {/* Text overlays */}
      <Text
        position={[-1.4, -0.2, 0.04]}
        fontSize={0.28}
        color="#ffffff"
        anchorX="left"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
      >
        ${balance.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})}
      </Text>

      <Text
        position={[-1.4, -0.6, 0.04]}
        fontSize={0.12}
        color="#94a3b8"
        anchorX="left"
        letterSpacing={0.1}
      >
        {name ? name.toUpperCase() : "PREMIUM MEMBER"}
      </Text>

      <Text
        position={[-1.4, 0.8, 0.04]}
        fontSize={0.14}
        color="#cbd5e1"
        anchorX="left"
        letterSpacing={0.05}
      >
        AI FINANCE
      </Text>
    </group>
  );
}

export default function FintechCard3D({ name, balance }) {
  return (
    <div style={{ height: "100%", width: "100%", minHeight: "300px", cursor: "pointer" }}>
      <Canvas shadows camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <CreditCardMesh name={name} balance={balance} />
        </Float>
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
