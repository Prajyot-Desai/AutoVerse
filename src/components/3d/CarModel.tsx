import React, { useMemo, useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vehicle } from '../../types/vehicle';
import { VehicleConfiguration } from '../../types/configurator';

interface CarModelProps {
  vehicle: Vehicle;
  config: VehicleConfiguration;
  platformPosition?: [number, number, number];
  isRotating?: boolean;
  resetSignal?: number;
}

export const CarModel: React.FC<CarModelProps> = ({
  vehicle,
  config,
  platformPosition = [0, 0, 0],
  isRotating = false,
  resetSignal = 0,
}) => {
  // Load GLTF model
  const { scene } = useGLTF(vehicle.modelPath);

  // Turntable inner rotation group ref
  const turntableRef = useRef<THREE.Group>(null);

  // Rotate smoothly in-place around own vertical Y axis when Turntable is active
  useFrame((_, delta) => {
    if (isRotating && turntableRef.current) {
      turntableRef.current.rotation.y += delta * 0.45;
    }
  });

  // Reset in-place orientation when reset signal fires
  useEffect(() => {
    if (turntableRef.current) {
      turntableRef.current.rotation.y = 0;
    }
  }, [resetSignal]);

  // Clone scene & isolate materials to prevent shared-cache side effects
  const { clonedScene, finalScale, finalPosition, finalRotation } = useMemo(() => {
    const cloned = scene.clone(true);

    // Dedicated material instances for Ferrari F40 decomposition
    let ferrariRimMaterial: THREE.Material | null = null;
    let ferrariTyreMaterial: THREE.Material | null = null;
    let ferrariBrakeDiscMaterial: THREE.Material | null = null;
    let ferrariSeatMaterial: THREE.Material | null = null;
    let ferrariHarnessMaterial: THREE.Material | null = null;

    // Dedicated material instances for Porsche 718 decomposition
    let porscheSeatMaterial: THREE.Material | null = null;
    let porscheSeatbeltMaterial: THREE.Material | null = null;
    let porscheCaliperMaterial: THREE.Material | null = null;
    let porscheStitchingMaterial: THREE.Material | null = null;

    // Deferred mesh additions (e.g. split seat meshes) added after traversal
    const deferredAdditions: { parent: THREE.Object3D; mesh: THREE.Mesh }[] = [];

    cloned.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          // Special handling for Ferrari F40:
          // The 758 wheel primitives originally share 'FFerrari_F40RewardRecycled_1987_Wheel1A_3D_3DWheel2A_Material1'.
          // We separate them into Rim (606 meshes), Tyre (144 meshes), and Brake Disc (8 meshes)
          // based on their precise geometry UV attributes.
          if (vehicle.id === 'ferrari-f40') {
            const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
            if (mat && mat.name.includes('Wheel1A')) {
              const uvAttr = mesh.geometry.attributes.uv;
              if (uvAttr) {
                let uMin = Infinity;
                let uMax = -Infinity;
                let vMin = Infinity;
                let vMax = -Infinity;

                for (let i = 0; i < uvAttr.count; i++) {
                  const u = uvAttr.getX(i);
                  const v = uvAttr.getY(i);
                  if (u < uMin) uMin = u;
                  if (u > uMax) uMax = u;
                  if (v < vMin) vMin = v;
                  if (v > vMax) vMax = v;
                }

                // Tyre: tread blocks (vMin > 0.85) or sidewalls (full circle span > 0.5)
                const isTyre = vMin > 0.85 || (uMax - uMin > 0.5 && vMax - vMin > 0.5);

                // Brake disc: centered circle in middle
                const isBrakeDisc =
                  !isTyre &&
                  uMin > 0.25 &&
                  uMax < 0.75 &&
                  vMin > 0.25 &&
                  vMax < 0.75 &&
                  uMax - uMin < 0.5;

                if (isTyre) {
                  if (!ferrariTyreMaterial) {
                    ferrariTyreMaterial = mat.clone();
                    ferrariTyreMaterial.name = 'FFerrari_F40_Tyre';
                  }
                  mesh.material = ferrariTyreMaterial;
                  return;
                } else if (isBrakeDisc) {
                  if (!ferrariBrakeDiscMaterial) {
                    ferrariBrakeDiscMaterial = mat.clone();
                    ferrariBrakeDiscMaterial.name = 'FFerrari_F40_BrakeDisc';
                  }
                  mesh.material = ferrariBrakeDiscMaterial;
                  return;
                } else {
                  // This is the Rim assembly (spokes, barrel, outer lip, lug nuts, center cap)
                  if (!ferrariRimMaterial) {
                    ferrariRimMaterial = mat.clone();
                    ferrariRimMaterial.name = 'FFerrari_F40_Rim';
                  }
                  mesh.material = ferrariRimMaterial;
                  return;
                }
              }
            }

            // 2. Ferrari F40 Seat isolation from InteriorA mesh
            if (mat && mat.name.includes('InteriorA') && mesh.geometry && mesh.geometry.index) {
              const geom = mesh.geometry;
              const index = geom.index;
              const pos = geom.attributes.position;

              if (index && pos) {
                const isSeatVertex = (x: number, y: number, z: number) => {
                  const isX = (x >= -0.62 && x <= -0.04) || (x >= 0.04 && x <= 0.62);
                  const isY = y >= 0.12 && y <= 0.88;
                  const isZ = z >= -0.32 && z <= 0.52;
                  return isX && isY && isZ;
                };

                const seatIndices: number[] = [];
                const cabinIndices: number[] = [];

                for (let i = 0; i < index.count; i += 3) {
                  const a = index.getX(i);
                  const b = index.getX(i + 1);
                  const c = index.getX(i + 2);
                  const isSeat =
                    isSeatVertex(pos.getX(a), pos.getY(a), pos.getZ(a)) &&
                    isSeatVertex(pos.getX(b), pos.getY(b), pos.getZ(b)) &&
                    isSeatVertex(pos.getX(c), pos.getY(c), pos.getZ(c));

                  if (isSeat) {
                    seatIndices.push(a, b, c);
                  } else {
                    cabinIndices.push(a, b, c);
                  }
                }

                if (seatIndices.length > 0) {
                  const IndexArrayType = index.array instanceof Uint32Array ? Uint32Array : Uint16Array;
                  mesh.geometry = geom.clone();
                  mesh.geometry.setIndex(new THREE.BufferAttribute(new IndexArrayType(cabinIndices), 1));

                  const seatGeom = geom.clone();
                  seatGeom.setIndex(new THREE.BufferAttribute(new IndexArrayType(seatIndices), 1));

                  if (!ferrariSeatMaterial) {
                    ferrariSeatMaterial = new THREE.MeshStandardMaterial({
                      name: 'FFerrari_F40_Seat',
                      roughness: 0.82,
                      metalness: 0.05,
                    });
                  }
                  const seatMesh = new THREE.Mesh(seatGeom, ferrariSeatMaterial);
                  seatMesh.name = 'FFerrari_F40_Seats';
                  seatMesh.castShadow = true;
                  seatMesh.receiveShadow = true;
                  if (mesh.parent) {
                    deferredAdditions.push({ parent: mesh.parent, mesh: seatMesh });
                  }
                }
              }
            }

            // 3. Harness / seatbelt material isolation
            if (mat && mat.name.includes('Coloured')) {
              if (!ferrariHarnessMaterial) {
                ferrariHarnessMaterial = mat.clone();
                ferrariHarnessMaterial.name = 'FFerrari_F40RewardRecycled_1987Coloured_Material1';
              }
              mesh.material = ferrariHarnessMaterial;
              return;
            }
          }

          // Special handling for Porsche 718:
          // Isolate seat leather, seatbelts, calipers, and interior stitching
          if (vehicle.id === 'porsche-718') {
            const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
            if (mat) {
              if (mat.name === 'Leather') {
                const isSteeringWheel =
                  mesh.name === 'Object_186' ||
                  mesh.name === 'Object_128' ||
                  Boolean(mesh.parent?.name.includes('Steering'));
                if (!isSteeringWheel) {
                  if (!porscheSeatMaterial) {
                    porscheSeatMaterial = mat.clone();
                    porscheSeatMaterial.name = 'Porsche_Seat_Leather';
                  }
                  mesh.material = porscheSeatMaterial;
                  return;
                }
              }

              if (mat.name === 'ceinture_s.001') {
                if (!porscheSeatbeltMaterial) {
                  porscheSeatbeltMaterial = mat.clone();
                  porscheSeatbeltMaterial.name = 'Porsche_Seatbelt_Stitching';
                }
                mesh.material = porscheSeatbeltMaterial;
                return;
              }

              // Decouple brake calipers from interior stitching ribbons/accents
              if (mat.name === 'vehicle_generic_smallspecmap__PAINT_2_.001') {
                const isCaliper =
                  mesh.name === 'Object_88' ||
                  mesh.name === 'Object_103' ||
                  mesh.name === 'Object_161' ||
                  mesh.name === 'Object_174' ||
                  Boolean(mesh.parent?.name.includes('hub_'));

                if (isCaliper) {
                  if (!porscheCaliperMaterial) {
                    porscheCaliperMaterial = mat.clone();
                    porscheCaliperMaterial.name = 'Porsche_Brake_Caliper';
                  }
                  mesh.material = porscheCaliperMaterial;
                  return;
                } else {
                  if (!porscheStitchingMaterial) {
                    porscheStitchingMaterial = mat.clone();
                    porscheStitchingMaterial.name = 'Porsche_Interior_Stitching';
                  }
                  mesh.material = porscheStitchingMaterial;
                  return;
                }
              }
            }
          }

          // Standard deep cloning for all other meshes/materials
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((m) => m.clone());
          } else {
            mesh.material = mesh.material.clone();
          }

          // Ensure transparent glass materials render cleanly with depth write
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            if (m.transparent) {
              m.depthWrite = true;
            }
          });
        }
      }
    });

    // Attach deferred isolated meshes (e.g. split seat geometry)
    deferredAdditions.forEach(({ parent, mesh }) => {
      parent.add(mesh);
    });

    // Compute bounding box after transforms
    cloned.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Determine natural length along horizontal plane (X or Z)
    const naturalLength = Math.max(size.x, size.z);
    const computedScale =
      vehicle.manualScale || (naturalLength > 0 ? vehicle.targetLength / naturalLength : 1);

    // Center horizontal position (X & Z) and place tire contact point at ground level (Y = 0)
    const offsetX = -center.x * computedScale;
    const offsetY = -box.min.y * computedScale + (vehicle.manualYOffset || 0);
    const offsetZ = -center.z * computedScale;

    return {
      clonedScene: cloned,
      finalScale: computedScale,
      finalPosition: [offsetX, offsetY, offsetZ] as [number, number, number],
      finalRotation: [0, vehicle.rotationY, 0] as [number, number, number],
    };
  }, [scene, vehicle]);

  // Apply verified paint, wheel, and caliper customizations to the cloned scene
  useEffect(() => {
    if (!clonedScene) return;

    const bodyMatNames = vehicle.meshBindings.bodyMaterials || [];
    const wheelMatNames = vehicle.meshBindings.wheelMaterials || [];
    const caliperMatNames = vehicle.meshBindings.caliperMaterials || [];
    const seatMatNames = vehicle.meshBindings.seatMaterials || [];
    const stitchingMatNames = vehicle.meshBindings.stitchingMaterials || [];

    const paintColor = new THREE.Color(config.selectedPaint.hex);
    const wheelColor = new THREE.Color(config.selectedWheel.colorHex);
    const caliperColor = new THREE.Color(config.selectedCaliper.hex);
    const interiorColor = new THREE.Color(config.selectedInterior.hex);
    const interiorAccentColor = new THREE.Color(config.selectedInterior.accentHex);

    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (!mesh.material) return;

        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

        mats.forEach((mat) => {
          // 1. Exterior body paint
          if (bodyMatNames.includes(mat.name)) {
            if ('color' in mat && mat.color instanceof THREE.Color) {
              mat.color.copy(paintColor);
            }
            if ('roughness' in mat && typeof mat.roughness === 'number') {
              mat.roughness = config.selectedPaint.roughness;
            }
            if ('metalness' in mat && typeof mat.metalness === 'number') {
              mat.metalness = config.selectedPaint.metalness;
            }
            if ('clearcoat' in mat && typeof mat.clearcoat === 'number') {
              mat.clearcoat = config.selectedPaint.clearcoat ?? 1.0;
            }
            mat.needsUpdate = true;
          }

          // 2. Wheel rims (protects tyres and brake discs)
          if (wheelMatNames.includes(mat.name)) {
            if ('color' in mat && mat.color instanceof THREE.Color) {
              if (mat.name === 'bhrome_d') {
                // Secondary turbine pockets get contrasting darker tone
                mat.color.copy(wheelColor).multiplyScalar(0.35);
              } else {
                mat.color.copy(wheelColor);
              }
            }
            if ('roughness' in mat && typeof mat.roughness === 'number') {
              mat.roughness = config.selectedWheel.roughness;
            }
            if ('metalness' in mat && typeof mat.metalness === 'number') {
              mat.metalness = config.selectedWheel.metalness;
            }
            mat.needsUpdate = true;
          }

          // 3. Brake calipers
          if (
            caliperMatNames.includes(mat.name) ||
            mat.name === 'Porsche_Brake_Caliper'
          ) {
            if ('color' in mat && mat.color instanceof THREE.Color) {
              mat.color.copy(caliperColor);
            }
            if ('roughness' in mat && typeof mat.roughness === 'number') {
              mat.roughness = 0.22;
            }
            if ('metalness' in mat && typeof mat.metalness === 'number') {
              mat.metalness = 0.25;
            }
            mat.needsUpdate = true;
          }

          // 4. Interior seat upholstery
          if (
            seatMatNames.includes(mat.name) ||
            mat.name === 'FFerrari_F40_Seat' ||
            mat.name === 'Porsche_Seat_Leather'
          ) {
            if ('color' in mat && mat.color instanceof THREE.Color) {
              mat.color.copy(interiorColor);
            }
            if ('roughness' in mat && typeof mat.roughness === 'number') {
              mat.roughness = 0.82;
            }
            if ('metalness' in mat && typeof mat.metalness === 'number') {
              mat.metalness = 0.05;
            }
            mat.needsUpdate = true;
          }

          // 5. Interior stitching, seatbelts & door pull straps
          if (
            stitchingMatNames.includes(mat.name) ||
            mat.name === 'Porsche_Interior_Stitching' ||
            mat.name === 'Porsche_Seatbelt_Stitching' ||
            (vehicle.id === 'porsche-718' && mat.name === 'ceinture_s.001') ||
            (vehicle.id === 'ferrari-f40' && mat.name === 'FFerrari_F40RewardRecycled_1987Coloured_Material1')
          ) {
            if ('color' in mat && mat.color instanceof THREE.Color) {
              mat.color.copy(interiorAccentColor);
            }
            if ('roughness' in mat && typeof mat.roughness === 'number') {
              mat.roughness = 0.55;
            }
            if ('metalness' in mat && typeof mat.metalness === 'number') {
              mat.metalness = 0.15;
            }
            mat.needsUpdate = true;
          }
        });
      }
    });
  }, [
    clonedScene,
    config.selectedPaint,
    config.selectedWheel,
    config.selectedCaliper,
    config.selectedInterior,
    vehicle.meshBindings,
    vehicle.id,
  ]);

  return (
    <group position={platformPosition}>
      {/* Turntable spin group (controlled smoothly by useFrame, invariant to React re-renders) */}
      <group ref={turntableRef}>
        {/* Base vehicle orientation group */}
        <group rotation={finalRotation}>
          <group position={finalPosition} scale={finalScale}>
            <primitive object={clonedScene} />
          </group>
        </group>
      </group>
    </group>
  );
};
