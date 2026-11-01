import React, { useEffect, useRef, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useConfiguratorStore } from '../../stores/useConfiguratorStore';

interface FirstPersonExplorerProps {
  activeBayX?: number;
  onNearVehicleChange?: (vehicleId: string | null) => void;
}

// Physical player collision cylinder/capsule radius on horizontal plane
const PLAYER_RADIUS = 0.45;

// Showroom boundary limits for player center (accounting for wall coordinates in ShowroomEnvironment)
// Rear feature wall is at Z = -9.2m (header/ribbon at -9.18m) -> minZ = -8.70m
// Left architectural glass wall is at X = -18.0m (mullions inward at -17.94m) -> minX = -17.45m
// Right architectural glass wall is at X = +18.0m (mullions inward at +17.94m) -> maxX = 17.45m
// Front walkable floor threshold (floor ends at Z = 15m; lighting comfort zone up to Z = 12m) -> maxZ = 11.50m
const WALL_BOUNDS = {
  minX: -17.45,
  maxX: 17.45,
  minZ: -8.70,
  maxZ: 11.50,
};

// Vehicle definitions with exact physical half-extents computed from GLTF geometry
// Ferrari F40: width 1.97m, length 4.38m -> hx = 1.04, hz = 2.24
// Porsche 718 Cayman GT4: width 2.00m, length 4.45m -> hx = 1.05, hz = 2.26
// BMW i8: width 2.16m, length 4.69m -> hx = 1.12, hz = 2.38
const VEHICLE_OBSTACLES = [
  { id: 'ferrari-f40', cx: -7.5, cz: 0, hx: 1.04, hz: 2.24, defaultRotY: 0 },
  { id: 'porsche-718', cx: 0, cz: 0, hx: 1.05, hz: 2.26, defaultRotY: 0 },
  { id: 'bmw-i8', cx: 7.5, cz: 0, hx: 1.12, hz: 2.38, defaultRotY: 0 },
];

const PLATFORM_CENTERS = [
  { id: 'ferrari-f40', x: -7.5, z: 0 },
  { id: 'porsche-718', x: 0, z: 0 },
  { id: 'bmw-i8', x: 7.5, z: 0 },
];

/**
 * Resolves horizontal collision between a player circle (center px, pz, radius r)
 * and an oriented vehicle bounding box (center cx, cz, half-width hx, half-length hz, orientation theta).
 * If colliding, returns the corrected position (newX, newZ) pushed out along the surface normal.
 */
function resolveCarCollision(
  px: number,
  pz: number,
  cx: number,
  cz: number,
  theta: number,
  hx: number,
  hz: number,
  r: number
): { x: number; z: number; collided: boolean } {
  const relX = px - cx;
  const relZ = pz - cz;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  // Transform world relative position into car's local coordinates
  const localX = relX * cosT - relZ * sinT;
  const localZ = relX * sinT + relZ * cosT;

  // Clamped closest point on local axis-aligned box
  const clampX = Math.max(-hx, Math.min(hx, localX));
  const clampZ = Math.max(-hz, Math.min(hz, localZ));

  const diffX = localX - clampX;
  const diffZ = localZ - clampZ;
  const distSq = diffX * diffX + diffZ * diffZ;

  if (distSq < r * r) {
    let localPushX = 0;
    let localPushZ = 0;

    if (distSq > 1e-8) {
      // Circle intersects box boundary from outside
      const dist = Math.sqrt(distSq);
      const overlap = r - dist;
      localPushX = (diffX / dist) * overlap;
      localPushZ = (diffZ / dist) * overlap;
    } else {
      // Deep penetration / inside box: find closest edge to push out
      const dLeft = localX + hx;
      const dRight = hx - localX;
      const dBack = localZ + hz;
      const dFront = hz - localZ;
      const minD = Math.min(dLeft, dRight, dBack, dFront);

      if (minD === dLeft) localPushX = -(dLeft + r);
      else if (minD === dRight) localPushX = (dRight + r);
      else if (minD === dBack) localPushZ = -(dBack + r);
      else localPushZ = (dFront + r);
    }

    // Convert local push vector back to world space
    const pushX = localPushX * cosT + localPushZ * sinT;
    const pushZ = -localPushX * sinT + localPushZ * cosT;

    return {
      x: px + pushX,
      z: pz + pushZ,
      collided: true,
    };
  }

  return { x: px, z: pz, collided: false };
}

export const FirstPersonExplorer: React.FC<FirstPersonExplorerProps> = ({
  activeBayX = 0,
  onNearVehicleChange,
}) => {
  const { camera, gl, scene } = useThree();
  const { setActiveVehicle, setIsExploring } = useConfiguratorStore();

  // Internal state refs to avoid React re-renders on movement frames
  const pos = useRef<THREE.Vector3>(new THREE.Vector3(activeBayX, 1.65, 4.8));
  const yaw = useRef<number>(0);
  const pitch = useRef<number>(-0.08);
  const keys = useRef<Record<string, boolean>>({});
  const isPointerLocked = useRef<boolean>(false);
  const isMouseDown = useRef<boolean>(false);
  const nearVehicleRef = useRef<string | null>(null);

  // Cached turntable & vehicle rotation group references from the Three.js scene
  const carNodesRef = useRef<
    {
      id: string;
      bayX: number;
      turntableGroup: THREE.Object3D | null;
      baseRotGroup: THREE.Object3D | null;
    }[]
  >([
    { id: 'ferrari-f40', bayX: -7.5, turntableGroup: null, baseRotGroup: null },
    { id: 'porsche-718', bayX: 0, turntableGroup: null, baseRotGroup: null },
    { id: 'bmw-i8', bayX: 7.5, turntableGroup: null, baseRotGroup: null },
  ]);

  // Track previous activeBayX to react to external vehicle switcher changes (e.g. Header)
  const lastActiveBayX = useRef<number>(activeBayX);

  // Dedicated vehicle interaction handler for Explore Mode
  const handleConfigureVehicle = useCallback(
    (targetVehicleId: string) => {
      const targetPlat = PLATFORM_CENTERS.find((p) => p.id === targetVehicleId);
      const bayX = targetPlat ? targetPlat.x : activeBayX;

      lastActiveBayX.current = bayX;

      // 1. Synchronize the active vehicle in the configurator store
      setActiveVehicle(targetVehicleId);

      // 2. Position and frame the camera directly facing the vehicle
      pos.current.set(bayX, 1.65, 4.8);
      yaw.current = 0;
      pitch.current = -0.08;
      camera.rotation.order = 'YXZ';
      camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ');
      camera.position.copy(pos.current);

      // 3. Exit pointer lock so mouse is available to interact with configuration options
      if (document.pointerLockElement) {
        document.exitPointerLock?.();
      }
      isPointerLocked.current = false;
    },
    [activeBayX, camera, setActiveVehicle]
  );

  const handleConfigureVehicleRef = useRef(handleConfigureVehicle);
  handleConfigureVehicleRef.current = handleConfigureVehicle;

  // React to external vehicle switcher changes (e.g. clicking a car tab in Header)
  useEffect(() => {
    if (activeBayX !== lastActiveBayX.current) {
      lastActiveBayX.current = activeBayX;
      pos.current.set(activeBayX, 1.65, 4.8);
      yaw.current = 0;
      pitch.current = -0.08;
      camera.rotation.order = 'YXZ';
      camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ');
      camera.position.copy(pos.current);
    }
  }, [activeBayX, camera]);

  // Initialize camera position, orientation, and input handlers once on mount
  useEffect(() => {
    pos.current.set(activeBayX, 1.65, 4.8);
    yaw.current = 0;
    pitch.current = -0.08;
    camera.rotation.order = 'YXZ';
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ');
    camera.position.copy(pos.current);

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      keys.current[e.code] = true;

      // [E] key: configure nearby vehicle
      if (e.code === 'KeyE' && nearVehicleRef.current) {
        handleConfigureVehicleRef.current(nearVehicleRef.current);
      }

      // [Escape] key: exit explore mode
      if (e.code === 'Escape') {
        setIsExploring(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    const handleBlur = () => {
      keys.current = {};
    };

    // Mouse look handlers
    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === gl.domElement;
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Rotate look direction when pointer is locked OR during mouse drag
      if (isPointerLocked.current || isMouseDown.current) {
        const sensitivity = 0.0022;
        yaw.current -= e.movementX * sensitivity;
        pitch.current -= e.movementY * sensitivity;

        // Clamp vertical look between -82 deg and +82 deg
        pitch.current = Math.max(-1.42, Math.min(1.42, pitch.current));
        camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ');
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDown.current = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        isMouseDown.current = false;
      }
    };

    const handleCanvasClick = () => {
      if (!isPointerLocked.current) {
        gl.domElement.requestPointerLock?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    gl.domElement.addEventListener('click', handleCanvasClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      gl.domElement.removeEventListener('click', handleCanvasClick);

      // Clean up pointer lock
      if (document.pointerLockElement === gl.domElement) {
        document.exitPointerLock?.();
      }
    };
  }, [camera, gl, setIsExploring]);

  // Movement & physics loop runs smoothly per animation frame
  useFrame((_, delta) => {
    const dt = Math.min(0.08, delta);

    // Compute camera horizontal viewing directions on XZ plane
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    // Collect directional key inputs
    let moveForward = 0;
    let moveRight = 0;

    if (keys.current['KeyW'] || keys.current['ArrowUp']) moveForward += 1;
    if (keys.current['KeyS'] || keys.current['ArrowDown']) moveForward -= 1;
    if (keys.current['KeyD'] || keys.current['ArrowRight']) moveRight += 1;
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) moveRight -= 1;

    // Normalize diagonal movement
    const moveLen = Math.hypot(moveForward, moveRight);
    if (moveLen > 0) {
      moveForward /= moveLen;
      moveRight /= moveLen;
    }

    // Move speed: 3.8 m/s walk, 5.8 m/s sprint with Shift
    const isSprint = keys.current['ShiftLeft'] || keys.current['ShiftRight'];
    const walkSpeed = isSprint ? 5.8 : 3.8;

    const moveDeltaX = (forward.x * moveForward + right.x * moveRight) * walkSpeed * dt;
    const moveDeltaZ = (forward.z * moveForward + right.z * moveRight) * walkSpeed * dt;

    // Dynamically retrieve live car rotation (accounting for turntable and base orientation)
    const getCarRotation = (carId: string, bayX: number, defaultRot: number): number => {
      const node = carNodesRef.current.find((n) => n.id === carId);
      if (!node) return defaultRot;

      // Lazy cache resolution
      if (!node.turntableGroup || !node.baseRotGroup) {
        for (const child of scene.children) {
          if (
            Math.abs(child.position.x - bayX) < 0.1 &&
            Math.abs(child.position.z) < 0.1
          ) {
            node.turntableGroup = child.children?.[0] || null;
            node.baseRotGroup = node.turntableGroup?.children?.[0] || null;
            break;
          }
        }
      }

      if (node.turntableGroup && node.baseRotGroup) {
        return node.turntableGroup.rotation.y + node.baseRotGroup.rotation.y;
      }
      return defaultRot;
    };

    const cur = pos.current;
    const moveDist = Math.hypot(moveDeltaX, moveDeltaZ);

    if (moveDist > 0.0001) {
      // Sub-step movement (max 0.08m per step) to eliminate high-speed tunneling
      const subSteps = Math.max(1, Math.ceil(moveDist / 0.08));
      const stepX = moveDeltaX / subSteps;
      const stepZ = moveDeltaZ / subSteps;

      for (let s = 0; s < subSteps; s++) {
        cur.x += stepX;
        cur.z += stepZ;

        // 1. Resolve vehicle collisions (sliding along oriented boundaries)
        for (const car of VEHICLE_OBSTACLES) {
          const theta = getCarRotation(car.id, car.cx, car.defaultRotY);
          const res = resolveCarCollision(
            cur.x,
            cur.z,
            car.cx,
            car.cz,
            theta,
            car.hx,
            car.hz,
            PLAYER_RADIUS
          );
          cur.x = res.x;
          cur.z = res.z;
        }

        // 2. Clamp strictly within showroom perimeter walls
        cur.x = Math.max(WALL_BOUNDS.minX, Math.min(WALL_BOUNDS.maxX, cur.x));
        cur.z = Math.max(WALL_BOUNDS.minZ, Math.min(WALL_BOUNDS.maxZ, cur.z));
      }
    } else {
      // Stationary frame: still resolve against rotating turntable cars if they turn into the player
      for (const car of VEHICLE_OBSTACLES) {
        const theta = getCarRotation(car.id, car.cx, car.defaultRotY);
        const res = resolveCarCollision(
          cur.x,
          cur.z,
          car.cx,
          car.cz,
          theta,
          car.hx,
          car.hz,
          PLAYER_RADIUS
        );
        cur.x = res.x;
        cur.z = res.z;
      }
      cur.x = Math.max(WALL_BOUNDS.minX, Math.min(WALL_BOUNDS.maxX, cur.x));
      cur.z = Math.max(WALL_BOUNDS.minZ, Math.min(WALL_BOUNDS.maxZ, cur.z));
    }

    // Step-up height on circular platforms (radius = 3.45m, height = 0.08m)
    let onPlatform = false;
    for (const plat of PLATFORM_CENTERS) {
      if (Math.hypot(pos.current.x - plat.x, pos.current.z - plat.z) <= 3.45) {
        onPlatform = true;
        break;
      }
    }

    const groundY = onPlatform ? 0.08 : 0.0;
    const targetEyeY = groundY + 1.65;
    pos.current.y = THREE.MathUtils.lerp(pos.current.y, targetEyeY, Math.min(1, dt * 10));

    // Update Three.js camera position directly
    camera.position.copy(pos.current);

    // Check proximity to vehicle podiums
    let nearestId: string | null = null;
    let minDistance = Infinity;

    for (const plat of PLATFORM_CENTERS) {
      const dist = Math.hypot(pos.current.x - plat.x, pos.current.z - plat.z);
      if (dist < 3.8 && dist < minDistance) {
        minDistance = dist;
        nearestId = plat.id;
      }
    }

    if (nearestId !== nearVehicleRef.current) {
      nearVehicleRef.current = nearestId;
      onNearVehicleChange?.(nearestId);
    }
  });

  return null;
};
