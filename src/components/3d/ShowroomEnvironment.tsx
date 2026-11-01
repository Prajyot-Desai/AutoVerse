import React, { useMemo, useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useConfiguratorStore } from '../../stores/useConfiguratorStore';

const VEHICLE_BAY_POSITIONS: Record<string, number> = {
  'ferrari-f40': -7.5,
  'porsche-718': 0,
  'bmw-i8': 7.5,
};

/**
 * Procedurally generates a high-resolution luxury architectural nameplate texture
 * for a vehicle in the showroom, dynamically displaying the brand, model, edition, and category.
 * Rendered at 2048x640 for razor-sharp legibility from normal showroom viewing distances.
 */
function createNameplateTexture(
  brand: string,
  name: string,
  edition: string,
  category: string
): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  // High-resolution canvas texture (2048 x 640) for crisp typography at all viewing distances
  canvas.width = 2048;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background: Deep architectural obsidian slate with subtle vertical gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 640);
  bgGrad.addColorStop(0, '#1c1e24');
  bgGrad.addColorStop(0.5, '#14161b');
  bgGrad.addColorStop(1, '#0e0f13');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 2048, 640);

  // Subtle outer hairline frame in warm champagne
  ctx.strokeStyle = 'rgba(200, 185, 159, 0.45)';
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, 2016, 608);

  // Secondary fine inner hairline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, 1992, 584);

  // Corner decorative luxury notches/brackets
  ctx.strokeStyle = '#c8a168';
  ctx.lineWidth = 3;
  const notchLen = 30;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(34, 34 + notchLen);
  ctx.lineTo(34, 34);
  ctx.lineTo(34 + notchLen, 34);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(2014 - notchLen, 34);
  ctx.lineTo(2014, 34);
  ctx.lineTo(2014, 34 + notchLen);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(34, 606 - notchLen);
  ctx.lineTo(34, 606);
  ctx.lineTo(34 + notchLen, 606);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(2014 - notchLen, 606);
  ctx.lineTo(2014, 606);
  ctx.lineTo(2014 - notchLen, 606);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 1. Manufacturer / Brand Heading (Champagne Gold #E5D7C3, prominent uppercase tracking)
  const trackedBrand = brand.toUpperCase().split('').join('  ');
  let brandFontSize = 54;
  ctx.font = `bold ${brandFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
  let brandWidth = ctx.measureText(trackedBrand).width;
  while (brandWidth > 1750 && brandFontSize > 32) {
    brandFontSize -= 2;
    ctx.font = `bold ${brandFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
    brandWidth = ctx.measureText(trackedBrand).width;
  }
  ctx.fillStyle = '#e5d7c3';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
  ctx.fillText(trackedBrand, 1024, 125);

  // 2. Vehicle Model Name (Massive, Bold Primary Heading in Crisp White #FFFFFF)
  let nameFontSize = 112;
  ctx.font = `900 ${nameFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
  let nameWidth = ctx.measureText(name.toUpperCase()).width;
  while (nameWidth > 1750 && nameFontSize > 64) {
    nameFontSize -= 4;
    ctx.font = `900 ${nameFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
    nameWidth = ctx.measureText(name.toUpperCase()).width;
  }
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;
  ctx.fillText(name.toUpperCase(), 1024, 275);

  // Reset shadow for fine vector divider
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // 3. Decorative Accent Divider in Warm Bronze
  const divGrad = ctx.createLinearGradient(624, 0, 1424, 0);
  divGrad.addColorStop(0, 'rgba(152, 118, 83, 0)');
  divGrad.addColorStop(0.2, 'rgba(200, 161, 104, 0.6)');
  divGrad.addColorStop(0.5, 'rgba(215, 180, 130, 0.95)');
  divGrad.addColorStop(0.8, 'rgba(200, 161, 104, 0.6)');
  divGrad.addColorStop(1, 'rgba(152, 118, 83, 0)');
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(624, 380);
  ctx.lineTo(1424, 380);
  ctx.stroke();

  // 4. Edition and Category Subtitle (Muted Warm Metallic Taupe #C8BEB3)
  const subtitle = `${edition.toUpperCase()}  •  ${category.toUpperCase()}`;
  let subFontSize = 46;
  ctx.font = `600 ${subFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
  let subWidth = ctx.measureText(subtitle).width;
  while (subWidth > 1750 && subFontSize > 28) {
    subFontSize -= 2;
    ctx.font = `600 ${subFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`;
    subWidth = ctx.measureText(subtitle).width;
  }
  ctx.fillStyle = '#c8beb3';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
  ctx.fillText(subtitle, 1024, 485);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  return texture;
}

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

  const vehicles = useConfiguratorStore((s) => s.vehicles);
  const activeVehicleId = useConfiguratorStore((s) => s.activeVehicleId);

  // Generate high-resolution procedural nameplate textures for all vehicles dynamically
  const nameplateTextures = useMemo(() => {
    if (typeof document === 'undefined') return {};
    const textures: Record<string, THREE.CanvasTexture> = {};

    vehicles.forEach((v) => {
      const tex = createNameplateTexture(v.brand, v.name, v.edition, v.category);
      if (tex) textures[v.id] = tex;
    });

    return textures;
  }, [vehicles]);

  // Clean up canvas textures on unmount or when vehicles change
  useEffect(() => {
    return () => {
      Object.values(nameplateTextures).forEach((tex) => tex.dispose());
    };
  }, [nameplateTextures]);

  // Calibrate tone mapping exposure for warm luxury architectural boutique showroom
  // Ensures vehicle paint finishes (black, dark blue, grey, white, red, yellow) remain spectrally accurate
  useEffect(() => {
    gl.toneMappingExposure = 1.1;
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

  // Procedural warm stone flooring texture (#A99E90) with micro-mineral aggregate
  const floorTextures = useMemo(() => {
    if (typeof document === 'undefined') {
      return { map: null, roughnessMap: null };
    }

    // 1. Color map: Warm stone flooring with subtle aggregate grain and architectural expansion seams
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return { map: null, roughnessMap: null };

    // Warm stone flooring base (#A99E90)
    ctx.fillStyle = '#a99e90';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle micro-mineral aggregate grain (champagne beige, warm ivory, and deeper taupe flecks)
    for (let i = 0; i < 3500; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const size = Math.random() * 2 + 0.8;
      const alpha = Math.random() * 0.055;
      const rand = Math.random();
      if (rand > 0.65) {
        ctx.fillStyle = `rgba(222, 212, 197, ${alpha * 1.5})`; // Warm ivory fleck (#DED4C5)
      } else if (rand > 0.3) {
        ctx.fillStyle = `rgba(200, 185, 159, ${alpha * 1.2})`; // Champagne beige fleck (#C8B99F)
      } else {
        ctx.fillStyle = `rgba(80, 51, 35, ${alpha * 0.9})`; // Dark walnut micro-speck (#503323)
      }
      ctx.fillRect(x, y, size, size);
    }

    // Architectural expansion slab seams (large-format 2x2 grid on 512px)
    ctx.strokeStyle = '#8a7f72';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(0, 0, 512, 512);
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.moveTo(0, 256);
    ctx.lineTo(512, 256);
    ctx.stroke();

    // Subtle beveled stone seam highlight edge (champagne specular reflectance)
    ctx.strokeStyle = 'rgba(238, 230, 218, 0.4)';
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

    // 2. Roughness map: satin polished stone with micro-specular sheen
    const rCanvas = document.createElement('canvas');
    rCanvas.width = 256;
    rCanvas.height = 256;
    const rCtx = rCanvas.getContext('2d');
    let roughnessMap: THREE.CanvasTexture | null = null;

    if (rCtx) {
      // Base satin roughness (~0.28 for crisp, elegant showroom reflections without mirror distraction)
      rCtx.fillStyle = '#4c4842';
      rCtx.fillRect(0, 0, 256, 256);

      // Micro-roughness variance for organic satin stone sheen
      for (let i = 0; i < 1200; i++) {
        const rx = Math.random() * 256;
        const ry = Math.random() * 256;
        const alpha = Math.random() * 0.08;
        rCtx.fillStyle = Math.random() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
        rCtx.fillRect(rx, ry, Math.random() * 3 + 1, Math.random() * 3 + 1);
      }

      // Seam grout lines are slightly more matte
      rCtx.strokeStyle = '#78726a';
      rCtx.lineWidth = 3.5;
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
      {/* 1. BALANCED HIGH-PERFORMANCE LIGHTING (5 LIGHTS TOTAL)              */}
      {/* =================================================================== */}
      {/* 1. Ambient Fill: High CRI neutral-warm daylight (illuminates dark paint & interiors cleanly) */}
      <ambientLight color="#f5f0e8" intensity={1.08} />

      {/* 2. Elevated Key Light: Clean neutral studio daylight (preserves exact car paint hues) */}
      <directionalLight
        position={[5.5, 8.0, 4.5]}
        color="#ffffff"
        intensity={1.45}
        target-position={[0, 0.4, 0]}
      />

      {/* 3. Soft Rear Rim Light: Warm champagne daylight (sculpts rooflines, spoilers and haunches) */}
      <directionalLight
        position={[-5.0, 6.5, -4.5]}
        color="#fff4e6"
        intensity={0.92}
        target-position={[0, 0.4, 0]}
      />

      {/* 4. Overhead Longitudinal Studio Skylight: Clean neutral highlight down hoods & roofs */}
      <directionalLight
        position={[0, 7.5, 0]}
        color="#ffffff"
        intensity={0.82}
        target-position={[0, 0, 0]}
      />

      {/* 5. Warm Stone Floor Bounce: Softens lower rocker panels, sills and wheels naturally */}
      <directionalLight
        position={[0, -3.0, 0]}
        color="#b8ada0"
        intensity={0.35}
      />

      {/* =================================================================== */}
      {/* 2. WARM STONE FLOORING & BRONZE ARCHITECTURAL INLAYS                */}
      {/* =================================================================== */}
      {/* Main Architectural Floor Plane (Warm Stone Flooring #A99E90) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]}>
        <planeGeometry args={[44, 30]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.28}
          metalness={0.08}
          map={floorTextures.map || undefined}
          roughnessMap={floorTextures.roughnessMap || undefined}
        />
      </mesh>

      {/* Architectural Floor Seams & Bronze Inlays (#987653) */}
      <group position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {/* Longitudinal Aisle Inlays (Bronze Detailing #987653) */}
        {[-4.5, 4.5].map((zPos, i) => (
          <mesh key={`aisle-inlay-${i}`} position={[0, zPos, 0]}>
            <planeGeometry args={[38, 0.04]} />
            <meshStandardMaterial color="#987653" roughness={0.28} metalness={0.68} />
          </mesh>
        ))}

        {/* Transverse Inter-bay Division Expansion Joints (Dark Bronze) */}
        {[-3.75, 3.75].map((dividerX, i) => (
          <mesh key={`divider-${i}`} position={[dividerX, 0, 0]}>
            <planeGeometry args={[0.03, 20]} />
            <meshStandardMaterial color="#7a5d3e" roughness={0.35} metalness={0.55} />
          </mesh>
        ))}

        {/* Subtle Podium Alignment Marks (Champagne Beige #C8B99F) */}
        {bayPositions.map((bx, i) => (
          <group key={`bay-mark-${i}`} position={[bx, 4.2, 0]}>
            <mesh>
              <planeGeometry args={[0.02, 0.35]} />
              <meshBasicMaterial color="#c8b99f" transparent opacity={0.4} />
            </mesh>
            <mesh>
              <planeGeometry args={[0.35, 0.02]} />
              <meshBasicMaterial color="#c8b99f" transparent opacity={0.4} />
            </mesh>
          </group>
        ))}
      </group>

      {/* =================================================================== */}
      {/* 3. GRAPHITE PLATFORMS WITH BRONZE & CHAMPAGNE DETAILS (#303139)     */}
      {/* =================================================================== */}
      {bayPositions.map((bx, idx) => {
        const isActive = Math.abs(bx - activeBayX) < 1.0;

        return (
          <group key={`bay-platform-${idx}`} position={[bx, 0, 0]}>
            {/* Layer 1: Recessed Base Plinth Shadow Reveal (Height 0.015m, Radius 3.48m, Dark Walnut) */}
            <mesh position={[0, 0.0075, 0]}>
              <cylinderGeometry args={[3.48, 3.48, 0.015, 48]} />
              <meshStandardMaterial color="#3a2418" roughness={0.7} metalness={0.2} />
            </mesh>

            {/* Layer 2: Concealed Base Accent Lighting Ribbon (Warm 2800K Champagne Gold LED) */}
            <mesh position={[0, 0.012, 0]}>
              <cylinderGeometry args={[3.465, 3.468, 0.012, 48]} />
              <meshStandardMaterial
                color={isActive ? '#f59e0b' : '#c8b99f'}
                emissive={isActive ? '#fbbf24' : '#c8b99f'}
                emissiveIntensity={isActive ? 1.0 : 0.4}
                roughness={0.2}
              />
            </mesh>

            {/* Layer 3: Main Platform Beveled Body (Graphite Platforms #303139, Height 0.065m) */}
            <mesh position={[0, 0.0475, 0]}>
              <cylinderGeometry args={[3.38, 3.45, 0.065, 48]} />
              <meshStandardMaterial
                color="#303139"
                roughness={0.36}
                metalness={0.45}
              />
            </mesh>

            {/* Layer 4: Stepped Edge Chamfer Bezel (0.0805m height, Machined Dark Bronze Finish #987653) */}
            <mesh position={[0, 0.0805, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[3.36, 3.38, 48]} />
              <meshStandardMaterial
                color="#987653"
                roughness={0.24}
                metalness={0.75}
              />
            </mesh>

            {/* Layer 5: Turntable Top Deck (Matte Graphite Slate Finish at Y = 0.081m) */}
            <group position={[0, 0.081, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              {/* Main Deck Circle (High-contrast graphite pedestal beneath car) */}
              <mesh>
                <circleGeometry args={[3.36, 48]} />
                <meshStandardMaterial
                  color="#282a32"
                  roughness={0.32}
                  metalness={0.25}
                />
              </mesh>

              {/* Concentric Precision Inlay Rings */}
              {/* Inner Turntable Circle (Champagne Beige Accent Ring #C8B99F) */}
              <mesh position={[0, 0, 0.001]}>
                <ringGeometry args={[2.84, 2.858, 48]} />
                <meshBasicMaterial
                  color={isActive ? '#fbbf24' : '#c8b99f'}
                  transparent
                  opacity={isActive ? 0.65 : 0.4}
                />
              </mesh>
              {/* Outer Perimeter Trim (Brushed Bronze Inlay #987653) */}
              <mesh position={[0, 0, 0.001]}>
                <ringGeometry args={[3.25, 3.265, 48]} />
                <meshBasicMaterial
                  color="#987653"
                  transparent
                  opacity={0.3}
                />
              </mesh>
            </group>

            {/* Platform Ground Contact Shadow: Baked ONCE on mount (frames={1}) for zero per-frame GPU load */}
            <ContactShadows
              position={[0, 0.082, 0]}
              opacity={0.6}
              scale={7.5}
              blur={2.2}
              far={3.0}
              resolution={256}
              frames={1}
              color="#1a1816"
            />
          </group>
        );
      })}

      {/* =================================================================== */}
      {/* 4. ARCHITECTURAL WALLS & DYNAMIC VEHICLE NAMEPLATES                */}
      {/* =================================================================== */}
      {/* Rear Feature Wall (Z = -9.2m) */}
      <group position={[0, 3.2, -9.2]}>
        {/* Base Wall Cladding: Warm Ivory Architectural Panels (#DED4C5) */}
        <mesh>
          <planeGeometry args={[44, 6.5]} />
          <meshStandardMaterial color="#ded4c5" roughness={0.7} metalness={0.05} />
        </mesh>

        {/* Unified Architectural Bay Backdrops: Champagne Beige Panels (#C8B99F) */}
        {bayPositions.map((bayX, idx) => (
          <group key={`bay-backdrop-${idx}`} position={[bayX, 0, 0.02]}>
            {/* Champagne Beige acoustic wall panel */}
            <mesh position={[0, 0, 0]}>
              <planeGeometry args={[7.2, 5.8]} />
              <meshStandardMaterial color="#c8b99f" roughness={0.55} metalness={0.12} />
            </mesh>
          </group>
        ))}

        {/* Dynamic Architectural Vehicle Nameplates Behind Every Vehicle Bay */}
        {vehicles.map((v, idx) => {
          const bayX = VEHICLE_BAY_POSITIONS[v.id] ?? (idx * 7.5 - ((vehicles.length - 1) * 7.5) / 2);
          const texture = nameplateTextures[v.id];
          const isActive = v.id === activeVehicleId;

          return (
            <group key={`nameplate-${v.id}`} position={[bayX, -0.50, 0.05]}>
              {/* Soft Warm Architectural LED Halo Backlight */}
              <mesh position={[0, 0, -0.015]}>
                <planeGeometry args={[4.48, 1.54]} />
                <meshBasicMaterial
                  color={isActive ? '#ffe8cc' : '#e2d4be'}
                  transparent
                  opacity={isActive ? 0.48 : 0.22}
                />
              </mesh>

              {/* Machined Brushed Bronze Perimeter Bezel Frame (#987653 / #C8A168) */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[4.28, 1.34, 0.025]} />
                <meshStandardMaterial
                  color={isActive ? '#c8a168' : '#987653'}
                  roughness={0.25}
                  metalness={0.7}
                />
              </mesh>

              {/* Architectural Obsidian Slate Backing Plate (#14161B) */}
              <mesh position={[0, 0, 0.014]}>
                <planeGeometry args={[4.22, 1.28]} />
                <meshStandardMaterial color="#14161b" roughness={0.45} metalness={0.15} />
              </mesh>

              {/* Dynamic Vehicle Identity Typography Faceplate (2048x640 CanvasTexture) */}
              {texture && (
                <mesh position={[0, 0, 0.018]}>
                  <planeGeometry args={[4.20, 1.26]} />
                  <meshBasicMaterial map={texture} transparent />
                </mesh>
              )}

              {/* Active Vehicle Subtle Champagne-Gold Indicator Accent Bar */}
              {isActive && (
                <mesh position={[0, -0.60, 0.022]}>
                  <planeGeometry args={[2.8, 0.025]} />
                  <meshBasicMaterial color="#ffe0b5" />
                </mesh>
              )}
            </group>
          );
        })}

        {/* Architectural Structural Pilasters / Dividing Columns (Primary Walnut Wood #805034) */}
        {[-11.5, -3.75, 3.75, 11.5].map((colX, i) => (
          <mesh key={`rear-pilaster-${i}`} position={[colX, 0, 0.09]}>
            <boxGeometry args={[0.38, 6.5, 0.18]} />
            <meshStandardMaterial color="#805034" roughness={0.4} metalness={0.1} />
          </mesh>
        ))}

        {/* Horizontal Recessed Accent Reveal Band (Champagne Beige #C8B99F) */}
        <mesh position={[0, 2.05, 0.035]}>
          <planeGeometry args={[38, 0.08]} />
          <meshStandardMaterial color="#c8b99f" roughness={0.5} metalness={0.2} />
        </mesh>

        {/* Integrated Linear Warm LED Cove Light Wash (2800K Warm Golden Glow) */}
        <mesh position={[0, 2.12, 0.04]}>
          <planeGeometry args={[38, 0.04]} />
          <meshBasicMaterial color="#ffe0b5" transparent opacity={0.95} />
        </mesh>

        {/* Recessed Baseboard Shadow Reveal in Dark Walnut (#503323) with Warm Floor Wash */}
        <mesh position={[0, -3.15, 0.04]}>
          <planeGeometry args={[40, 0.035]} />
          <meshBasicMaterial color="#ffebd0" transparent opacity={0.45} />
        </mesh>
      </group>

      {/* Side Architectural Structural Glass Walls & Bronze Detailing (X = ±18m) */}
      {/* Left Wall (X = -18m) */}
      <group position={[-18, 3.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Structural Acoustic Glass: Soft warm daylight architectural tint */}
        <mesh>
          <planeGeometry args={[26, 6.5]} />
          <meshStandardMaterial
            color="#e5dfd5"
            roughness={0.12}
            metalness={0.25}
            transparent
            opacity={0.42}
          />
        </mesh>
        {/* Vertical Bronze Structural Mullions (#987653) */}
        {[-8, -4, 0, 4, 8].map((mz, i) => (
          <mesh key={`mullion-left-${i}`} position={[mz, 0, 0.05]}>
            <boxGeometry args={[0.12, 6.5, 0.14]} />
            <meshStandardMaterial color="#987653" roughness={0.28} metalness={0.72} />
          </mesh>
        ))}
        {/* Horizontal Bronze Mid-Transoms */}
        {[-1.0, 1.2].map((ty, i) => (
          <mesh key={`transom-left-${i}`} position={[0, ty, 0.04]}>
            <boxGeometry args={[26, 0.06, 0.07]} />
            <meshStandardMaterial color="#7a5d3e" roughness={0.35} metalness={0.65} />
          </mesh>
        ))}
        {/* Flanking Walnut Pilasters on Glass Ends (#805034) */}
        {[-12.8, 12.8].map((pz, i) => (
          <mesh key={`glass-pilaster-left-${i}`} position={[pz, 0, 0.06]}>
            <boxGeometry args={[0.25, 6.5, 0.16]} />
            <meshStandardMaterial color="#805034" roughness={0.4} metalness={0.1} />
          </mesh>
        ))}
      </group>

      {/* Right Wall (X = +18m) */}
      <group position={[18, 3.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Structural Acoustic Glass: Soft warm daylight architectural tint */}
        <mesh>
          <planeGeometry args={[26, 6.5]} />
          <meshStandardMaterial
            color="#e5dfd5"
            roughness={0.12}
            metalness={0.25}
            transparent
            opacity={0.42}
          />
        </mesh>
        {/* Vertical Bronze Structural Mullions (#987653) */}
        {[-8, -4, 0, 4, 8].map((mz, i) => (
          <mesh key={`mullion-right-${i}`} position={[mz, 0, 0.05]}>
            <boxGeometry args={[0.12, 6.5, 0.14]} />
            <meshStandardMaterial color="#987653" roughness={0.28} metalness={0.72} />
          </mesh>
        ))}
        {/* Horizontal Bronze Mid-Transoms */}
        {[-1.0, 1.2].map((ty, i) => (
          <mesh key={`transom-right-${i}`} position={[0, ty, 0.04]}>
            <boxGeometry args={[26, 0.06, 0.07]} />
            <meshStandardMaterial color="#7a5d3e" roughness={0.35} metalness={0.65} />
          </mesh>
        ))}
        {/* Flanking Walnut Pilasters on Glass Ends (#805034) */}
        {[-12.8, 12.8].map((pz, i) => (
          <mesh key={`glass-pilaster-right-${i}`} position={[pz, 0, 0.06]}>
            <boxGeometry args={[0.25, 6.5, 0.16]} />
            <meshStandardMaterial color="#805034" roughness={0.4} metalness={0.1} />
          </mesh>
        ))}
      </group>

      {/* =================================================================== */}
      {/* 4B. FRONT ARCHITECTURAL WALL (WARM GREY / TAUPE FINISH #A39888)    */}
      {/* =================================================================== */}
      {/* Front Architectural Feature Wall (Z = +12.05m, facing showroom) */}
      <group position={[0, 3.2, 12.05]} rotation={[0, Math.PI, 0]}>
        {/* Continuous Architectural Wall Cladding: Solid Muted Warm Grey/Taupe (Calibrated to render visually as #A39888) */}
        <mesh>
          <planeGeometry args={[44, 6.5]} />
          <meshStandardMaterial
            color="#a39888"
            emissive="#88827a"
            emissiveIntensity={1.0}
            roughness={0.72}
            metalness={0.04}
          />
        </mesh>

        {/* Horizontal Recessed Accent Reveal Band */}
        <mesh position={[0, 2.05, 0.015]}>
          <planeGeometry args={[38, 0.08]} />
          <meshStandardMaterial
            color="#948a7b"
            emissive="#766f64"
            emissiveIntensity={0.85}
            roughness={0.6}
            metalness={0.08}
          />
        </mesh>

        {/* Clean, Continuous Linear Warm LED Accent Line (2800K Warm Golden Glow) */}
        <mesh position={[0, 2.12, 0.02]}>
          <planeGeometry args={[38, 0.04]} />
          <meshBasicMaterial color="#ffe0b5" transparent opacity={0.95} />
        </mesh>

        {/* Recessed Baseboard Shadow Reveal with Warm Floor Wash */}
        <mesh position={[0, -3.15, 0.02]}>
          <planeGeometry args={[40, 0.035]} />
          <meshBasicMaterial color="#ffebd0" transparent opacity={0.45} />
        </mesh>
      </group>

      {/* =================================================================== */}
      {/* 5. WARM WALNUT CEILING, CURVED FLOWING LOUVERS & LINEAR LED STRIPS  */}
      {/* =================================================================== */}
      {!hideCeiling && (
        <>
          {/* Main Architectural Ceiling (Warm Ivory/Champagne Base, Y = 6.4m) */}
          <mesh position={[0, 6.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <planeGeometry args={[44, 28]} />
            <meshStandardMaterial color="#ded4c5" roughness={0.82} />
          </mesh>

          {/* Longitudinal Architectural Walnut Beams (#805034) */}
          {[-4.5, 0, 4.5].map((zPos, i) => (
            <group key={`ceiling-beam-${i}`} position={[0, 6.36, zPos]}>
              <mesh>
                <boxGeometry args={[44, 0.07, 0.22]} />
                <meshStandardMaterial color="#805034" roughness={0.42} metalness={0.15} />
              </mesh>
              {/* Recessed Warm Linear LED Channel (2800K Warm Glow) */}
              <mesh position={[0, -0.036, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[40, 0.05]} />
                <meshBasicMaterial color="#ffe4c4" transparent opacity={0.85} />
              </mesh>
            </group>
          ))}

          {/* Flowing Curved Architectural Wooden Louvers / Ceiling Canopy (Inspired by Reference 1) */}
          {/* Sweeping walnut timber blades along the ceiling creating rhythm and warm sculptural depth */}
          {Array.from({ length: 11 }).map((_, i) => {
            const zArc = -5.0 + i * 1.0;
            // Elegant subtle vertical curvature: middle blades dip slightly (catenary arch feel)
            const yDrop = Math.cos((zArc / 5.5) * (Math.PI / 2)) * 0.14;
            return (
              <group key={`curved-louver-${i}`} position={[0, 6.32 - yDrop, zArc]}>
                <mesh>
                  <boxGeometry args={[36, 0.05, 0.06]} />
                  <meshStandardMaterial color="#805034" roughness={0.4} metalness={0.12} />
                </mesh>
                {/* Integrated warm LED strip on alternate louvers */}
                {i % 2 === 0 && (
                  <mesh position={[0, -0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[34, 0.015]} />
                    <meshBasicMaterial color="#ffdfc0" transparent opacity={0.75} />
                  </mesh>
                )}
              </group>
            );
          })}

          {/* Transverse Inter-Bay Dividing Structural Baffles in Dark Walnut (#503323) */}
          {[-11.5, -3.75, 3.75, 11.5].map((bx, i) => (
            <mesh key={`ceiling-baffle-${i}`} position={[bx, 6.3, 0]}>
              <boxGeometry args={[0.26, 0.18, 26]} />
              <meshStandardMaterial color="#503323" roughness={0.4} metalness={0.18} />
            </mesh>
          ))}

          {/* 3 Overhead Vehicle Luminaires / Softbox Diffusers (Above each bay at X = -7.5, 0, +7.5) */}
          {bayPositions.map((bx, idx) => (
            <group key={`softbox-${idx}`} position={[bx, 5.85, 0]}>
              {/* Softbox Housing Body in Dark Walnut (#503323) */}
              <mesh position={[0, 0.07, 0]}>
                <boxGeometry args={[5.4, 0.16, 3.0]} />
                <meshStandardMaterial color="#503323" roughness={0.42} metalness={0.15} />
              </mesh>
              {/* Perimeter Housing Bezel Trim in Bronze (#987653) */}
              <mesh position={[0, -0.015, 0]}>
                <boxGeometry args={[5.48, 0.025, 3.08]} />
                <meshStandardMaterial color="#987653" roughness={0.25} metalness={0.7} />
              </mesh>
              {/* Studio Emissive Diffuser Panel (Balanced neutral light down vehicle centerlines) */}
              <mesh position={[0, -0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[5.1, 2.7]} />
                <meshStandardMaterial
                  color="#ffffff"
                  emissive="#fffdfa"
                  emissiveIntensity={1.15}
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
