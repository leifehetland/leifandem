'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Mesh } from 'three';

/**
 * A single rotating cube. Phase 2 step 5 (SPECS.md §10) — exists to prove
 * the R3F wiring before any particles, cards, or postprocessing land.
 */
export function RotatingCube() {
  const ref = useRef<Mesh>(null);

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.rotation.x += delta * 0.4;
    mesh.rotation.y += delta * 0.6;
  });

  return (
    <mesh ref={ref} position={[2.5, 0, 0]}>
      <boxGeometry args={[1.4, 1.4, 1.4]} />
      <meshStandardMaterial color="#3ad6ff" emissive="#0b1d2e" roughness={0.4} metalness={0.2} />
    </mesh>
  );
}
