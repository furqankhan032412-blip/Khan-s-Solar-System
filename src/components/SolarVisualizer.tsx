import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Suspense, useMemo, useRef } from 'react';
import type { Group, Mesh } from 'three';

type SolarVisualizerProps = {
  panelCount: number;
};

export function SolarVisualizer({ panelCount }: SolarVisualizerProps) {
  return (
    <motion.div
      className="h-full min-h-[360px] w-full overflow-hidden bg-[#e8f3f0]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Canvas shadows dpr={[1, 2]}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[6, 5, 8]} fov={42} />
          <color attach="background" args={['#e8f3f0']} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[5, 7, 3]} intensity={1.8} castShadow shadow-mapSize={1024} />
          <House panelCount={panelCount} />
          <EnergyFlow panelCount={panelCount} />
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
            <planeGeometry args={[18, 14]} />
            <meshStandardMaterial color="#d8eee6" />
          </mesh>
          <OrbitControls enablePan={false} minDistance={6} maxDistance={12} maxPolarAngle={Math.PI / 2.15} />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}

function House({ panelCount }: { panelCount: number }) {
  const panels = useMemo(() => buildPanelLayout(panelCount), [panelCount]);

  return (
    <group rotation={[0, -0.45, 0]} position={[0, 0, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[4.6, 1.8, 3.6]} />
        <meshStandardMaterial color="#f4f7f5" roughness={0.8} />
      </mesh>
      <mesh castShadow receiveShadow position={[-1.6, 0.9, 1.84]}>
        <boxGeometry args={[0.82, 1.0, 0.08]} />
        <meshStandardMaterial color="#2f6f73" />
      </mesh>
      <mesh castShadow receiveShadow position={[0.65, 0.65, 1.84]}>
        <boxGeometry args={[1.45, 0.64, 0.08]} />
        <meshStandardMaterial color="#f8c56b" />
      </mesh>
      <group position={[0, 2.06, 0]} rotation={[0, 0, 0]}>
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 4]} position={[-1.18, 0, 0]}>
          <boxGeometry args={[3.35, 0.18, 3.95]} />
          <meshStandardMaterial color="#294048" roughness={0.65} />
        </mesh>
        <mesh castShadow receiveShadow rotation={[0, 0, -Math.PI / 4]} position={[1.18, 0, 0]}>
          <boxGeometry args={[3.35, 0.18, 3.95]} />
          <meshStandardMaterial color="#37515a" roughness={0.65} />
        </mesh>
      </group>
      <group position={[-1.6, 2.43, 0]} rotation={[0, 0, Math.PI / 4]}>
        {panels.map((panel, index) => (
          <SolarPanel key={`${panel.x}-${panel.z}-${index}`} index={index} x={panel.x} z={panel.z} />
        ))}
      </group>
      <mesh castShadow position={[3.1, 0.85, -0.65]}>
        <boxGeometry args={[0.55, 1.15, 0.42]} />
        <meshStandardMaterial color="#102a43" />
      </mesh>
      <mesh castShadow position={[3.25, 0.45, 0.3]}>
        <boxGeometry args={[0.88, 0.72, 0.52]} />
        <meshStandardMaterial color="#1f7a5c" />
      </mesh>
    </group>
  );
}

function SolarPanel({ x, z, index }: { x: number; z: number; index: number }) {
  const ref = useRef<Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    const target = 1;
    ref.current.scale.x += (target - ref.current.scale.x) * 0.08;
    ref.current.scale.y += (target - ref.current.scale.y) * 0.08;
    ref.current.scale.z += (target - ref.current.scale.z) * 0.08;
  });

  return (
    <mesh
      ref={ref}
      castShadow
      receiveShadow
      position={[x, 0.13, z]}
      scale={[0.01, 0.01, 0.01]}
      userData={{ appearDelay: index * 0.02 }}
    >
      <boxGeometry args={[0.54, 0.06, 0.86]} />
      <meshStandardMaterial color="#102f55" metalness={0.25} roughness={0.38} emissive="#06172b" emissiveIntensity={0.08} />
    </mesh>
  );
}

function EnergyFlow({ panelCount }: { panelCount: number }) {
  const groupRef = useRef<Group>(null);
  const beadCount = Math.min(9, Math.max(3, Math.ceil(panelCount / 3)));

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, index) => {
        child.position.y = 1.5 + Math.sin(clock.elapsedTime * 2.2 + index) * 0.08;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: beadCount }, (_, index) => (
        <mesh key={index} position={[1.7 + index * 0.22, 1.5, -0.42 + Math.sin(index) * 0.12]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={1.5} />
        </mesh>
      ))}
    </group>
  );
}

function buildPanelLayout(panelCount: number) {
  const columns = 4;
  const visible = Math.min(panelCount, 24);

  return Array.from({ length: visible }, (_, index) => ({
    x: -0.85 + (index % columns) * 0.62,
    z: -1.25 + Math.floor(index / columns) * 0.52
  }));
}
