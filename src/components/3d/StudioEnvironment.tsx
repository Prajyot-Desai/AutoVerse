import React from 'react';
import { ContactShadows } from '@react-three/drei';

interface StudioEnvironmentProps {
  preset?: 'studio' | 'night' | 'sunset' | 'neutral';
}

export const StudioEnvironment: React.FC<StudioEnvironmentProps> = ({
  preset = 'studio',
}) => {
  // Lighting configurations tuned for automotive presentation
  const lightingParams = {
    studio: {
      ambient: { color: '#ffffff', intensity: 0.7 },
      key: { color: '#ffffff', intensity: 1.8, pos: [6, 8, 6] as [number, number, number] },
      fill: { color: '#d8e4f0', intensity: 1.0, pos: [-6, 4, -5] as [number, number, number] },
      rim: { color: '#ffffff', intensity: 1.4, pos: [0, 7, -8] as [number, number, number] },
      bounce: { color: '#8fa2b8', intensity: 0.35, pos: [0, -2, 0] as [number, number, number] },
    },
    night: {
      ambient: { color: '#3b4252', intensity: 0.35 },
      key: { color: '#88c0d0', intensity: 1.2, pos: [6, 7, 5] as [number, number, number] },
      fill: { color: '#5e81ac', intensity: 0.6, pos: [-6, 3, -4] as [number, number, number] },
      rim: { color: '#eceff4', intensity: 1.8, pos: [0, 6, -7] as [number, number, number] },
      bounce: { color: '#2e3440', intensity: 0.2, pos: [0, -2, 0] as [number, number, number] },
    },
    sunset: {
      ambient: { color: '#ffb703', intensity: 0.5 },
      key: { color: '#fb8500', intensity: 2.0, pos: [7, 6, 6] as [number, number, number] },
      fill: { color: '#023047', intensity: 0.8, pos: [-6, 4, -5] as [number, number, number] },
      rim: { color: '#ffb703', intensity: 1.5, pos: [0, 6, -8] as [number, number, number] },
      bounce: { color: '#f3722c', intensity: 0.3, pos: [0, -2, 0] as [number, number, number] },
    },
    neutral: {
      ambient: { color: '#ffffff', intensity: 0.8 },
      key: { color: '#ffffff', intensity: 1.4, pos: [5, 8, 5] as [number, number, number] },
      fill: { color: '#ffffff', intensity: 0.8, pos: [-5, 5, -5] as [number, number, number] },
      rim: { color: '#ffffff', intensity: 1.0, pos: [0, 6, -6] as [number, number, number] },
      bounce: { color: '#ffffff', intensity: 0.25, pos: [0, -2, 0] as [number, number, number] },
    },
  }[preset];

  return (
    <>
      {/* Studio Lighting Rig */}
      <ambientLight color={lightingParams.ambient.color} intensity={lightingParams.ambient.intensity} />
      <directionalLight
        position={lightingParams.key.pos}
        color={lightingParams.key.color}
        intensity={lightingParams.key.intensity}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
      />
      <directionalLight
        position={lightingParams.fill.pos}
        color={lightingParams.fill.color}
        intensity={lightingParams.fill.intensity}
      />
      <directionalLight
        position={lightingParams.rim.pos}
        color={lightingParams.rim.color}
        intensity={lightingParams.rim.intensity}
      />
      <directionalLight
        position={lightingParams.bounce.pos}
        color={lightingParams.bounce.color}
        intensity={lightingParams.bounce.intensity}
      />

      {/* Ground Contact Shadows */}
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.7}
        scale={12}
        blur={2.0}
        far={4.0}
        resolution={512}
        color="#000000"
      />

      {/* Studio Floor Pedestal Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#090a0d" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Subtle Circular Studio Turntable Marking */}
      <group position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh>
          <ringGeometry args={[3.2, 3.22, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.06} />
        </mesh>
        <mesh>
          <ringGeometry args={[4.5, 4.515, 64]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.04} />
        </mesh>
      </group>
    </>
  );
};

