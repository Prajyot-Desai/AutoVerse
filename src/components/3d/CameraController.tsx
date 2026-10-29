import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { CameraViewPreset } from '../../types/configurator';

interface CameraControllerProps {
  preset: CameraViewPreset;
  resetSignal: number;
  activeBayX?: number;
}

const PRESET_POSITIONS: Record<CameraViewPreset, [number, number, number]> = {
  'three-quarter': [4.8, 1.8, 4.8],
  'front': [0, 1.3, 6.2],
  'side': [6.2, 1.3, 0],
  'rear': [0, 1.4, -6.2],
  'interior': [0, 0.95, 0.2],
  'top': [0, 6.8, 0.01],
};

export const CameraController: React.FC<CameraControllerProps> = ({
  preset,
  resetSignal,
  activeBayX = 0,
}) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(activeBayX + 4.8, 1.8, 4.8));
  const isTransitioning = useRef<boolean>(false);
  const { camera } = useThree();

  // On preset change, vehicle bay change, or reset signal, trigger smooth transition
  useEffect(() => {
    const coords = PRESET_POSITIONS[preset] || PRESET_POSITIONS['three-quarter'];
    targetCamPos.current.set(coords[0] + activeBayX, coords[1], coords[2]);
    isTransitioning.current = true;
  }, [preset, resetSignal, activeBayX]);

  // Smooth lerp transition frame by frame
  useFrame((_, delta) => {
    if (!isTransitioning.current || !controlsRef.current) return;

    const lerpFactor = Math.min(1, delta * 4.5);
    camera.position.lerp(targetCamPos.current, lerpFactor);
    const bayTarget = new THREE.Vector3(activeBayX, 0.65, 0);
    controlsRef.current.target.lerp(bayTarget, lerpFactor);
    controlsRef.current.update();

    if (camera.position.distanceTo(targetCamPos.current) < 0.05) {
      camera.position.copy(targetCamPos.current);
      controlsRef.current.target.copy(bayTarget);
      controlsRef.current.update();
      isTransitioning.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableRotate={true}
      enableZoom={true}
      enablePan={false}
      minDistance={2.5}
      maxDistance={14}
      maxPolarAngle={Math.PI / 2 - 0.02} // Restrict camera from going beneath floor plane
      minPolarAngle={0.001} // Allow looking directly downward in Top view
      autoRotate={false}
      dampingFactor={0.06}
      enableDamping={true}
      target={[activeBayX, 0.65, 0]}
      makeDefault
    />
  );
};
