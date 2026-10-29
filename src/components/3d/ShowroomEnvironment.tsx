import React from 'react';
import { ContactShadows } from '@react-three/drei';

interface ShowroomEnvironmentProps {
  activeBayX?: number;
  hideCeiling?: boolean;
}

export const ShowroomEnvironment: React.FC<ShowroomEnvironmentProps> = ({
  activeBayX = 0,
  hideCeiling = false,
}) => {
  const bayPositions = [-7.5, 0, 7.5];

  return (
    <group>
      {/* =================================================================== */}
      {/* 1. ARCHITECTURAL SHOWROOM LIGHTING RIG                              */}
      {/* =================================================================== */}
      {/* Ambient Fill */}
      <ambientLight color="#f8fafc" intensity={0.65} />

      {/* Main Overhead Studio Lights for Each Bay */}
      {bayPositions.map((x, idx) => (
        <group key={`light-bay-${idx}`} position={[x, 6.0, 0]}>
          {/* Focused Key Spotlight */}
          <directionalLight
            position={[2.5, 4.0, 3.0]}
            color="#ffffff"
            intensity={1.2}
            target-position={[x, 0.5, 0]}
          />
          {/* Soft Rear/Rim Light */}
          <directionalLight
            position={[-2.5, 3.5, -3.5]}
            color="#e2e8f0"
            intensity={0.8}
            target-position={[x, 0.5, 0]}
          />
        </group>
      ))}

      {/* Front Aisle Fill Light */}
      <directionalLight
        position={[0, 4.5, 8.0]}
        color="#f1f5f9"
        intensity={0.9}
        target-position={[0, 0.5, 0]}
      />

      {/* Subtle Floor Underside Ambient Bounce */}
      <directionalLight
        position={[0, -3.0, 0]}
        color="#64748b"
        intensity={0.25}
      />

      {/* =================================================================== */}
      {/* 2. SHOWROOM FLOOR & CENTRAL AISLE                                   */}
      {/* =================================================================== */}
      {/* Main Architectural Floor Plane (Satin Dark Tiles) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
        <planeGeometry args={[44, 30]} />
        <meshStandardMaterial
          color="#0a0b10"
          roughness={0.32}
          metalness={0.2}
        />
      </mesh>

      {/* Floor Expansion Joints / Navigation Guide Lines */}
      <group position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Aisle Boundaries */}
        <mesh position={[0, -4.5, 0]}>
          <planeGeometry args={[36, 0.03]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.06} />
        </mesh>
        <mesh position={[0, 4.5, 0]}>
          <planeGeometry args={[36, 0.03]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.06} />
        </mesh>
        {/* Inter-bay divider lines */}
        {[-3.75, 3.75].map((dividerX, i) => (
          <mesh key={`divider-${i}`} position={[dividerX, 0, 0]}>
            <planeGeometry args={[0.03, 18]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.04} />
          </mesh>
        ))}
      </group>

      {/* =================================================================== */}
      {/* 3. THREE DISPLAY PODIUMS / BAYS (X = -7.5, 0, +7.5)                */}
      {/* =================================================================== */}
      {bayPositions.map((bx, idx) => {
        const isActive = Math.abs(bx - activeBayX) < 1.0;

        return (
          <group key={`bay-platform-${idx}`} position={[bx, 0, 0]}>
            {/* Raised Circular Platform (8cm height) */}
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[3.35, 3.45, 0.08, 64]} />
              <meshStandardMaterial
                color="#13151c"
                roughness={0.38}
                metalness={0.25}
              />
            </mesh>

            {/* Recessed Platform Base Perimeter Light Ribbon */}
            <mesh position={[0, 0.008, 0]}>
              <cylinderGeometry args={[3.46, 3.47, 0.015, 64]} />
              <meshBasicMaterial
                color={isActive ? '#38bdf8' : '#ffffff'}
                transparent
                opacity={isActive ? 0.6 : 0.2}
              />
            </mesh>

            {/* Turntable Floor Ring Accents on Platform Surface */}
            <group position={[0, 0.081, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <mesh>
                <ringGeometry args={[2.7, 2.715, 64]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.08} />
              </mesh>
              <mesh>
                <ringGeometry args={[3.15, 3.16, 64]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.05} />
              </mesh>
            </group>

            {/* Platform Ground Contact Shadow beneath each car */}
            <ContactShadows
              position={[0, 0.082, 0]}
              opacity={0.65}
              scale={7.5}
              blur={2.0}
              far={3.0}
              resolution={512}
              color="#000000"
            />
          </group>
        );
      })}

      {/* =================================================================== */}
      {/* 4. ARCHITECTURAL WALLS & STRUCTURE                                  */}
      {/* =================================================================== */}
      {/* Rear Feature Wall (Z = -9.2m) */}
      <group position={[0, 3.2, -9.2]}>
        {/* Wall Backing Plane */}
        <mesh>
          <planeGeometry args={[44, 6.5]} />
          <meshStandardMaterial color="#0c0e14" roughness={0.7} metalness={0.1} />
        </mesh>

        {/* Ambient Halo Glow Ribbon running across the rear wall */}
        <mesh position={[0, 1.2, 0.01]}>
          <planeGeometry args={[38, 0.04]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.4} />
        </mesh>

        {/* Minimalist Showroom Header Panel */}
        <group position={[0, 2.2, 0.02]}>
          <mesh>
            <planeGeometry args={[9.5, 0.55]} />
            <meshBasicMaterial color="#161922" />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[9.4, 0.02]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
          </mesh>
        </group>
      </group>

      {/* Side Architectural Structural Glass Walls */}
      {/* Left Wall (X = -18m) */}
      <group position={[-18, 3.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[26, 6.5]} />
          <meshPhysicalMaterial
            color="#08090d"
            roughness={0.1}
            metalness={0.1}
            transmission={0.6}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Vertical Structural Mullions */}
        {[-8, -4, 0, 4, 8].map((mz, i) => (
          <mesh key={`mullion-left-${i}`} position={[mz, 0, 0.02]}>
            <boxGeometry args={[0.08, 6.5, 0.08]} />
            <meshStandardMaterial color="#141720" roughness={0.4} metalness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Right Wall (X = +18m) */}
      <group position={[18, 3.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[26, 6.5]} />
          <meshPhysicalMaterial
            color="#08090d"
            roughness={0.1}
            metalness={0.1}
            transmission={0.6}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Vertical Structural Mullions */}
        {[-8, -4, 0, 4, 8].map((mz, i) => (
          <mesh key={`mullion-right-${i}`} position={[mz, 0, 0.02]}>
            <boxGeometry args={[0.08, 6.5, 0.08]} />
            <meshStandardMaterial color="#141720" roughness={0.4} metalness={0.6} />
          </mesh>
        ))}
      </group>

      {/* =================================================================== */}
      {/* 5. CEILING & SUSPENDED SOFTBOX LIGHTPANELS (Hidden in Top view)     */}
      {/* =================================================================== */}
      {!hideCeiling && (
        <>
          {/* Ceiling Plane (Y = 6.4m) */}
          <mesh position={[0, 6.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[44, 28]} />
            <meshStandardMaterial color="#08090c" roughness={0.9} />
          </mesh>

          {/* 3 Overhead Softbox Light Diffusers (One above each vehicle bay) */}
          {bayPositions.map((bx, idx) => (
            <group key={`softbox-${idx}`} position={[bx, 5.8, 0]}>
              {/* Light Box Housing */}
              <mesh position={[0, 0.05, 0]}>
                <boxGeometry args={[5.2, 0.1, 2.8]} />
                <meshStandardMaterial color="#12141a" roughness={0.5} />
              </mesh>
              {/* Emissive Diffuser Panel */}
              <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[5.0, 2.6]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
              </mesh>
            </group>
          ))}
        </>
      )}
    </group>
  );
};

