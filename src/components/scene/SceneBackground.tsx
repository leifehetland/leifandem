'use client';

import dynamic from 'next/dynamic';

import { useDeviceTier } from '@/hooks/useDeviceTier';
import { useSceneStore } from '@/stores/sceneStore';

/**
 * Client wrapper around <Scene>. Performs two jobs:
 *   1. Dynamically imports the Three.js scene so it never lands in the
 *      initial JS bundle (per CLAUDE.md performance budget).
 *   2. Gates the canvas behind `hasEntered` and the device tier — low-tier
 *      users get the 2D fallback (TODO Phase 4).
 */
const Scene = dynamic(() => import('./Scene').then((mod) => mod.Scene), {
  ssr: false,
  loading: () => null,
});

export function SceneBackground() {
  const hasEntered = useSceneStore((state) => state.hasEntered);
  const tier = useDeviceTier();

  if (!hasEntered || tier === 'low') {
    return null;
  }

  // No `pointer-events-none` here — the canvas needs to receive clicks so
  // PhotoCard/VideoCard/AudioOrb hit-tests work. <main> above is
  // `pointer-events-none` to let clicks fall through.
  return (
    <div aria-hidden="true" className="fixed inset-0">
      <Scene />
    </div>
  );
}
