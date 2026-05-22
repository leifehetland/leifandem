'use client';

import { Canvas } from '@react-three/fiber';

import { useSceneStore } from '@/stores/sceneStore';

import { CameraRig } from './CameraRig';
import { Cards } from './Cards';
import { Effects } from './Effects';
import { ParticleField } from './ParticleField';

/**
 * Root of the 3D scene. Lives inside <Canvas>; no HTML elements past
 * this boundary (CLAUDE.md §"The Canvas / HTML boundary").
 *
 * SPECS.md §10 progress: steps 5–7 done (canvas wired, particle field,
 * camera rig, postprocessing). Media cards land next.
 */
export function Scene() {
  const tier = useSceneStore((state) => state.tier);
  const dpr: [number, number] | number = tier === 'high' ? [1, 2] : 1.5;

  return (
    <Canvas dpr={dpr} gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}>
      <color attach="background" args={['#e8dccb']} />
      <CameraRig />
      <ambientLight intensity={0.9} />
      <ParticleField />
      <Cards />
      <Effects />
    </Canvas>
  );
}
