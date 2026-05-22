'use client';

import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { PerspectiveCamera as ThreePerspectiveCamera } from 'three';

import { usePointerParallax } from '@/hooks/usePointerParallax';
import { useSceneStore } from '@/stores/sceneStore';

const PARALLAX_RANGE = 0.5;
const LERP = 0.08;

/**
 * Drei PerspectiveCamera at [0,0,8] fov 50. Each frame the rig lerps the
 * camera toward `pointer * PARALLAX_RANGE` (±0.5 units on x/y) and looks at
 * the origin. Disabled on tier 'low'.
 */
export function CameraRig() {
  const cameraRef = useRef<ThreePerspectiveCamera>(null);
  const pointer = usePointerParallax();
  const tier = useSceneStore((state) => state.tier);

  useFrame(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    if (tier === 'low') return;

    const targetX = pointer.x * PARALLAX_RANGE;
    const targetY = pointer.y * PARALLAX_RANGE;
    camera.position.x += (targetX - camera.position.x) * LERP;
    camera.position.y += (targetY - camera.position.y) * LERP;
    camera.lookAt(0, 0, 0);
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 8]} fov={50} />;
}
