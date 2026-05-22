'use client';

import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';

import { useSceneStore } from '@/stores/sceneStore';

/**
 * Postprocessing stack tuned for a warm light scene.
 *
 * On a dark canvas, aggressive bloom and chromatic aberration create the
 * neon-glow look. On the ivory background we want the opposite — only the
 * very brightest particle highlights catch a gentle halo (high threshold),
 * and a barely-there vignette adds the warmth of an old photograph.
 *
 *   high → Bloom (soft, luminanceThreshold 0.85) + Vignette (subtle)
 *   mid  → Bloom only
 *   low  → no canvas, no effects
 */
export function Effects() {
  const tier = useSceneStore((state) => state.tier);

  if (tier === 'low') return null;

  if (tier === 'high') {
    return (
      <EffectComposer>
        <Bloom intensity={0.35} luminanceThreshold={0.85} luminanceSmoothing={0.9} mipmapBlur />
        <Vignette offset={0.3} darkness={0.12} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer>
      <Bloom intensity={0.2} luminanceThreshold={0.85} luminanceSmoothing={0.9} mipmapBlur />
    </EffectComposer>
  );
}
