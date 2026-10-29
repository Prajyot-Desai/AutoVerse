import React, { useMemo, useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

interface ShowroomEnvironmentProps {
  activeBayX?: number;
  hideCeiling?: boolean;
}

export const ShowroomEnvironment: React.FC<ShowroomEnvironmentProps> = ({
  activeBayX = 0,
  hideCeiling = false,
}) => {
  const { gl } = useThree();
  const bayPositions = [-7.5, 0, 7.5];

  // Calibrate tone mapping exposure for high-end luxury dark graphite gallery
  useEffect(() => {
    gl.toneMappingExposure = 1.18;
  }, [gl]);

  // Rolling performance monitor to measure real browser FPS
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  useFrame(() => {
    frameCount.current++;
    const now = performance.now();
    if (now - lastTime.current >= 1500) {
      const fps = Math.round((frameCount.current * 1000) / (now - lastTime.current));
      console.log(`[AutoVerse Showroom Performance] FPS: ${fps}`);
      frameCount.current = 0;
      lastTime.current = now;
    }
  });

  // Procedural dark graphite architectural stone slab texture (zero network assets, generated once)
  const floorTextures = useMemo(() => {
    if (typeof document === 'undefined') {
      return { map: null, roughnessMap: null };
    }

    // 1. Color map: handsome dark charcoal / graphite architectural stone
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { map: null, roughnessMap: null };

    // Rich graphite base tone (PBR calibrated ~0.035 linear reflectance)
    ctx.fillStyle = '#2d313c';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle micro-mineral grain variation
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 2 + 1;
      const alpha = Math.random() * 0.055;
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha * 1.5})`;
      ctx.fillRect(x, y, size, size);
    }

    // Architectural slab seams (large format 2x2 grid on 512px)
    ctx.strokeStyle = '#181a22';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, 512, 512);
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.moveTo(0, 256);
    ctx.lineTo(512, 256);
    ctx.stroke();

    // Subtle beveled stone seam highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(258, 0);
    ctx.lineTo(258, 512);
    ctx.moveTo(0, 258);
    ctx.lineTo(512, 258);
    ctx.stroke();

    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = THREE.RepeatWrapping;
    map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(11, 7.5);

    // 2. Roughness map: satin polished stone with micro-variation
    const rCanvas = document.createElement('canvas');
    rCanvas.width = 256;
    rCanvas.height = 256;
    const rCtx = rCanvas.getContext('2d');
    let roughnessMap: THREE.CanvasTexture | null = null;

    if (rCtx) {
      // Base satin roughness (~0.33)
      rCtx.fillStyle = '#555555';
      rCtx.fillRect(0, 0, 256, 256);

      // Micro-roughness variance for organic satin sheen
      for (let i = 0; i < 1000; i++) {
        const rx = Math.random() * 256;
        const ry = Math.random() * 256;
        const alpha = Math.random() * 0.07;
        rCtx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
        rCtx.fillRect(rx, ry, Math.random() * 3 + 1, Math.random() * 3 + 1);
      }

      // Seam grout lines are slightly more matte
      rCtx.strokeStyle = '#7e7e7e';
      rCtx.lineWidth = 4;
      rCtx.strokeRect(0, 0, 256, 256);
      rCtx.beginPath();
      rCtx.moveTo(128, 0);
      rCtx.lineTo(128, 256);
      rCtx.moveTo(0, 128);
      rCtx.lineTo(256, 128);
      rCtx.stroke();

      roughnessMap = new THREE.CanvasTexture(rCanvas);
      roughnessMap.wrapS = THREE.RepeatWrapping;
      roughnessMap.wrapT = THREE.RepeatWrapping;
      roughnessMap.repeat.set(11, 7.5);
    }

    return { map, roughnessMap };
  }, []);

  return (
    <group>
      {/* =================================================================== */}
      {/* 1. HIGH-PERFORMANCE BALANCED AUTOMOTIVE LIGHTING (5 LIGHTS TOTAL)   */}
      {/* =================================================================== */}
      {/* 1. Ambient Fill: High CRI neutral daylight for dark paint & interior clarity */}
      <ambientLight color="#f1f5f9" intensity={1.0} />

      {/* 2. Unified Elevated Key Light: Sweeps across all 3 bays from 3/4 perspective */}
      <directionalLight
        position={[5.0, 7.5, 4.0]}
        color="#ffffff"
        intensity={1.4}
        target-position={[0, 0.4, 0]}
      />

      {/* 3. Unified Soft Rear Rim Light: Balances haunches, spoilers, and rooflines */}
      <directionalLight
        position={[-4.5, 6.0, -4.5]}
        color="#e2e8f0"
        intensity={0.9}
        target-position={[0, 0.4, 0]}
      />

      {/* 4. Overhead Longitudinal Studio Skylight: Studio highlight line down roofs & hoods */}
      <directionalLight
        position={[0, 7.0, 0]}
        color="#fffcf5"
        intensity={0.8}
        target-position={[0, 0, 0]}
      />

      {/* 5. Floor Underside Bounce: Softens deep undercarriage shadows naturally */}
      <directionalLight
        position={[0, -3.0, 0]}
        color="#475569"
        intensity={0.25}
      />

      {/* =================================================================== */}
      {/* 2. REFINED GRAPHITE STONE FLOOR & ARCHITECTURAL INLAYS             */}
      {/* =================================================================== */}
      {/* Main Architectural Floor Plane (Dark Graphite Stone) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <planeGeometry args={[44, 30]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.28}
          metalness={0.12}
          map={floorTextures.map || undefined}
          roughnessMap={floorTextures.roughnessMap || undefined}
        />
      </mesh>

      {/* Architectural Floor Seams & Navigation Guide Inlays */}
      <group position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Longitudinal Aisle Inlays */}
        {[-4.5, 4.5].map((zPos, i) => (
          <mesh key={`aisle-inlay-${i}`} position={[0, zPos, 0]}>
            <planeGeometry args={[38, 0.04]} />
            <meshStandardMaterial color="#2c303e" roughness={0.35} metalness={0.4} />
          </mesh>
        ))}

        {/* Transverse Inter-bay Division Expansion Joints */}
        {[-3.75, 3.75].map((dividerX, i) => (
          <mesh key={`divider-${i}`} position={[dividerX, 0, 0]}>
            <planeGeometry args={[0.03, 20]} />
            <meshStandardMaterial color="#252834" roughness={0.4} metalness={0.3} />
          </mesh>
        ))}

        {/* Subtle Podium Alignment Marks */}
        {bayPositions.map((bx, i) => (
          <group key={`bay-mark-${i}`} position={[bx, 4.2, 0]}>
            <mesh>
              <planeGeometry args={[0.02, 0.35]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
            </mesh>
            <mesh>
              <planeGeometry args={[0.35, 0.02]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* =================================================================== */}
      {/* 3. THREE DISPLAY PODIUMS / BAYS (X = -7.5, 0, +7.5)                */}
      {/* =================================================================== */}
      {bayPositions.map((bx, idx) => {
        const isActive = Math.abs(bx - activeBayX) < 1.0;

        return (
          <group key={`bay-platform-${idx}`} position={[bx, 0, 0]}>
            {/* Layer 1: Recessed Base Plinth Shadow Reveal (Height 0.015m, Radius 3.48m) */}
            <mesh position={[0, 0.0075, 0]}>
              <cylinderGeometry args={[3.48, 3.48, 0.015, 48]} />
              <meshStandardMaterial color="#161820" roughness={0.7} metalness={0.3} />
            </mesh>

            {/* Layer 2: Concealed Base Accent Lighting Ribbon (Warm Platinum / Champagne Accent) */}
            <mesh position={[0, 0.012, 0]}>
              <cylinderGeometry args={[3.465, 3.468, 0.012, 48]} />
              <meshStandardMaterial
                color={isActive ? '#fef3c7' : '#cbd5e1'}
                emissive={isActive ? '#fef3c7' : '#cbd5e1'}
                emissiveIntensity={isActive ? 1.0 : 0.3}
                roughness={0.2}
              />
            </mesh>

            {/* Layer 3: Main Platform Beveled Body (Height 0.065m, total platform Y reaches 0.08m) */}
            <mesh position={[0, 0.0475, 0]}>
              <cylinderGeometry args={[3.38, 3.45, 0.065, 48]} />
              <meshStandardMaterial
                color="#2c303c"
                roughness={0.36}
                metalness={0.4}
              />
            </mesh>

            {/* Layer 4: Stepped Edge Chamfer Bezel (0.0805m height) */}
            <mesh position={[0, 0.0805, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[3.36, 3.38, 48]} />
              <meshStandardMaterial
                color="#3f4556"
                roughness={0.25}
                metalness={0.6}
              />
            </mesh>

            {/* Layer 5: Turntable Top Deck (Carbon-Slate Finish at Y = 0.081m) */}
            <group position={[0, 0.081, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              {/* Main Deck Circle */}
              <mesh>
                <circleGeometry args={[3.36, 48]} />
                <meshStandardMaterial
                  color="#222530"
                  roughness={0.32}
                  metalness={0.22}
                />
              </mesh>

              {/* Concentric Precision Inlay Rings */}
              {/* Inner Turntable Circle */}
              <mesh position={[0, 0, 0.001]}>
                <ringGeometry args={[2.84, 2.858, 48]} />
                <meshBasicMaterial
                  color={isActive ? '#fde68a' : '#94a3b8'}
                  transparent
                  opacity={isActive ? 0.35 : 0.15}
                />
              </mesh>
              {/* Outer Perimeter Trim */}
              <mesh position={[0, 0, 0.001]}>
                <ringGeometry args={[3.25, 3.265, 48]} />
                <meshBasicMaterial
                  color="#e2e8f0"
                  transparent
                  opacity={0.12}
                />
              </mesh>
            </group>

            {/* Platform Ground Contact Shadow: Baked ONCE on mount (frames={1}) for zero per-frame GPU load */}
            <ContactShadows
              position={[0, 0.082, 0]}
              opacity={0.65}
              scale={7.5}
              blur={2.0}
              far={3.0}
              resolution={256}
              frames={1}
              color="#000000"
            />
          </group>
        );
      })}

      {/* =================================================================== */}
      {/* 4. ARCHITECTURAL WALLS & GALLERY STRUCTURE                          */}
      {/* =================================================================== */}
      {/* Rear Feature Wall (Z = -9.2m) */}
      <group position={[0, 3.2, -9.2]}>
        {/* Wall Main Cladding (Dark Basalt Matte Architectural Panels) */}
        <mesh>
          <planeGeometry args={[44, 6.5]} />
          <meshStandardMaterial color="#262934" roughness={0.6} metalness={0.15} />
        </mesh>

        {/* Architectural Structural Pilasters / Columns Framing Bays */}
        {[-11.5, -3.75, 3.75, 11.5].map((colX, i) => (
          <mesh key={`rear-pilaster-${i}`} position={[colX, 0, 0.09]}>
            <boxGeometry args={[0.38, 6.5, 0.18]} />
            <meshStandardMaterial color="#363b49" roughness={0.32} metalness={0.45} />
          </mesh>
        ))}

        {/* Concealed Architectural Linear Cove Light Wash (Warm-White) */}
        <mesh position={[0, 2.0, 0.03]}>
          <planeGeometry args={[38, 0.06]} />
          <meshBasicMaterial color="#fff4df" transparent opacity={0.85} />
        </mesh>

        {/* Recessed Baseboard Shadow Reveal & Floor Wash */}
        <mesh position={[0, -3.15, 0.03]}>
          <planeGeometry args={[40, 0.035]} />
          <meshBasicMaterial color="#fffaed" transparent opacity={0.35} />
        </mesh>

        {/* Minimalist Gallery Header / Atelier Signet Panel */}
        <group position={[0, 2.4, 0.04]}>
          {/* Header Backing Bar */}
          <mesh>
            <planeGeometry args={[11.5, 0.48]} />
            <meshStandardMaterial color="#2d323e" roughness={0.3} metalness={0.5} />
          </mesh>
          {/* Subtle Titanium Accent Bevel */}
          <mesh position={[0, -0.23, 0.01]}>
            <planeGeometry args={[11.4, 0.018]} />
            <meshBasicMaterial color="#fde68a" transparent opacity={0.65} />
          </mesh>
        </group>
      </group>

      {/* Side Architectural Structural Glass Walls (High-Performance standard transparency, NO transmission pass) */}
      {/* Left Wall (X = -18m) */}
      <group position={[-18, 3.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Structural Acoustic Glass: Uses standard fast alpha blending */}
        <mesh>
          <planeGeometry args={[26, 6.5]} />
          <meshStandardMaterial
            color="#181b24"
            roughness={0.15}
            metalness={0.3}
            transparent
            opacity={0.82}
          />
        </mesh>
        {/* Vertical Gunmetal Mullions */}
        {[-8, -4, 0, 4, 8].map((mz, i) => (
          <mesh key={`mullion-left-${i}`} position={[mz, 0, 0.05]}>
            <boxGeometry args={[0.12, 6.5, 0.14]} />
            <meshStandardMaterial color="#303544" roughness={0.3} metalness={0.55} />
          </mesh>
        ))}
        {/* Horizontal Mid-Transoms */}
        {[-1.0, 1.2].map((ty, i) => (
          <mesh key={`transom-left-${i}`} position={[0, ty, 0.04]}>
            <boxGeometry args={[26, 0.06, 0.07]} />
            <meshStandardMaterial color="#2a2e3b" roughness={0.35} metalness={0.5} />
          </mesh>
        ))}
      </group>

      {/* Right Wall (X = +18m) */}
      <group position={[18, 3.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Structural Acoustic Glass: Uses standard fast alpha blending */}
        <mesh>
          <planeGeometry args={[26, 6.5]} />
          <meshStandardMaterial
            color="#181b24"
            roughness={0.15}
            metalness={0.3}
            transparent
            opacity={0.82}
          />
        </mesh>
        {/* Vertical Gunmetal Mullions */}
        {[-8, -4, 0, 4, 8].map((mz, i) => (
          <mesh key={`mullion-right-${i}`} position={[mz, 0, 0.05]}>
            <boxGeometry args={[0.12, 6.5, 0.14]} />
            <meshStandardMaterial color="#303544" roughness={0.3} metalness={0.55} />
          </mesh>
        ))}
        {/* Horizontal Mid-Transoms */}
        {[-1.0, 1.2].map((ty, i) => (
          <mesh key={`transom-right-${i}`} position={[0, ty, 0.04]}>
            <boxGeometry args={[26, 0.06, 0.07]} />
            <meshStandardMaterial color="#2a2e3b" roughness={0.35} metalness={0.5} />
          </mesh>
        ))}
      </group>

      {/* =================================================================== */}
      {/* 5. CEILING & INTEGRATED STUDIO LIGHT BANKS (Hidden in Top view)     */}
      {/* =================================================================== */}
      {!hideCeiling && (
        <>
          {/* Main Coffered Architectural Ceiling (Y = 6.4m) */}
          <mesh position={[0, 6.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[44, 28]} />
            <meshStandardMaterial color="#1a1d26" roughness={0.88} />
          </mesh>

          {/* Longitudinal Architectural Ceiling Beams / Track Light Slots */}
          {[-4.5, 0, 4.5].map((zPos, i) => (
            <group key={`ceiling-beam-${i}`} position={[0, 6.36, zPos]}>
              <mesh>
                <boxGeometry args={[44, 0.07, 0.2]} />
                <meshStandardMaterial color="#2d313e" roughness={0.35} metalness={0.4} />
              </mesh>
              {/* Recessed Linear Track Light */}
              <mesh position={[0, -0.036, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[40, 0.045]} />
                <meshBasicMaterial color="#fffbf2" transparent opacity={0.6} />
              </mesh>
            </group>
          ))}

          {/* Transverse Inter-Bay Dividing Structural Baffles */}
          {[-11.5, -3.75, 3.75, 11.5].map((bx, i) => (
            <mesh key={`ceiling-baffle-${i}`} position={[bx, 6.32, 0]}>
              <boxGeometry args={[0.24, 0.15, 26]} />
              <meshStandardMaterial color="#343948" roughness={0.35} metalness={0.5} />
            </mesh>
          ))}

          {/* 3 Overhead Styling Studio Softbox Diffusers (One above each vehicle bay) */}
          {bayPositions.map((bx, idx) => (
            <group key={`softbox-${idx}`} position={[bx, 5.85, 0]}>
              {/* Softbox Housing Body */}
              <mesh position={[0, 0.07, 0]}>
                <boxGeometry args={[5.4, 0.16, 3.0]} />
                <meshStandardMaterial color="#222632" roughness={0.35} metalness={0.3} />
              </mesh>
              {/* Perimeter Housing Bezel Trim */}
              <mesh position={[0, -0.015, 0]}>
                <boxGeometry args={[5.48, 0.025, 3.08]} />
                <meshStandardMaterial color="#3a4050" roughness={0.25} metalness={0.6} />
              </mesh>
              {/* Large Format Studio Emissive Diffuser Panel */}
              <mesh position={[0, -0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[5.1, 2.7]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive="#fffcf5"
                  emissiveIntensity={1.3}
                  roughness={0.2}
                />
              </mesh>
            </group>
          ))}
        </>
      )}
    </group>
  );
};
