'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import { useSceneStore } from '@/stores/sceneStore';
import type { DeviceTier } from '@/types';

const COUNTS: Record<DeviceTier, number> = {
  high: 5000,
  mid: 1500,
  low: 0,
};

/** Units per second each particle drifts outward. */
const FLOW_SPEED = 0.6;

/**
 * Spawn band — particles respawn anywhere in this ring.
 * Keeping SPAWN_R_MIN well away from 0 ensures no particle density ever
 * builds up near the origin, which previously caused a bright white patch.
 */
const SPAWN_R_MIN = 3.5;
const SPAWN_R_MAX = 6.5;

/** Particles exit and respawn when they cross this radius. */
const EXIT_R = 10.5;
const EXIT_R_SQ = EXIT_R * EXIT_R; // precomputed — avoids sqrt per particle per frame

/**
 * Saturated bouquet palette — sixteen wedding-celebration tones.
 * Each tuple is [THREE.Color, per-color weight (must sum to 1.0)].
 *
 * Tuned for "louder": deeper saturation across the warm spectrum, with jewel
 * cools and bright greens as accents so the field reads as a confetti of
 * colour rather than a single warm mist. The hot-tones still dominate so the
 * field stays anchored in the wedding's terracotta-and-cream identity.
 *
 *   Hot warm tones → coral, peach, magenta, rose, pink     ~42 %
 *   Gold / orange  → marigold, amber, sunset               ~18 %
 *   Jewel cools    → violet, periwinkle, teal, aqua        ~20 %
 *   Greens         → sage, mint                            ~ 9 %
 *   Highlights     → cream, garnet                         ~11 %
 */
const COLOR_TABLE: ReadonlyArray<readonly [THREE.Color, number]> = [
  // ── Hot warm tones (~42 %) ───────────────────────────────────────────────
  [new THREE.Color('#FF6B47'), 0.10] as const, // coral red
  [new THREE.Color('#FF8A65'), 0.09] as const, // hot peach
  [new THREE.Color('#F09060'), 0.08] as const, // saturated peach
  [new THREE.Color('#E6447D'), 0.08] as const, // magenta rose
  [new THREE.Color('#FF7BA3'), 0.07] as const, // pink rose
  // ── Gold / orange (~18 %) ────────────────────────────────────────────────
  [new THREE.Color('#F5A623'), 0.07] as const, // marigold
  [new THREE.Color('#E8B43A'), 0.06] as const, // amber gold
  [new THREE.Color('#FF9248'), 0.05] as const, // sunset orange
  // ── Jewel cools (~20 %) — counterpoint that makes the warms pop ──────────
  [new THREE.Color('#B07FFF'), 0.06] as const, // bright lavender (additive-safe)
  [new THREE.Color('#7B8DDB'), 0.05] as const, // periwinkle
  [new THREE.Color('#3FB8AF'), 0.05] as const, // teal
  [new THREE.Color('#5BC9D6'), 0.04] as const, // aqua
  // ── Greens (~9 %) ────────────────────────────────────────────────────────
  [new THREE.Color('#9ACB78'), 0.05] as const, // sage green
  [new THREE.Color('#7FD9B0'), 0.04] as const, // mint
  // ── Highlights (~11 %) ───────────────────────────────────────────────────
  [new THREE.Color('#F9E5C7'), 0.06] as const, // warm cream sparkle
  [new THREE.Color('#FF4D6D'), 0.05] as const, // bright crimson (additive-safe)
];

/** Cumulative thresholds for weighted random color selection. */
const CUM: ReadonlyArray<number> = COLOR_TABLE.reduce<number[]>((acc, [, w]) => {
  acc.push((acc[acc.length - 1] ?? 0) + w);
  return acc;
}, []);

function pickColor(): THREE.Color {
  const r = Math.random();
  for (let i = 0; i < CUM.length; i++) {
    const threshold = CUM[i];
    const entry = COLOR_TABLE[i];
    if (threshold !== undefined && entry !== undefined && r < threshold) {
      return entry[0];
    }
  }
  return COLOR_TABLE[0]![0];
}

/**
 * Builds a soft circular alpha sprite procedurally. Avoids shipping a texture
 * asset for something this small — the gradient compresses to near nothing.
 */
function buildParticleSprite(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.7)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Centered outward-radiating particle field.
 *
 * All particles drift away from the scene origin [0,0,0] and respawn inside
 * the soft inner cloud (radius 1–2.5) when they exit the outer shell.
 * The distributed spawn radius is what hides the origin — there is no single
 * point, just a fuzzy glowing region from which particles emerge.
 *
 * The field is disk-shaped (z compressed to ~40% of x/y) so it fans out
 * laterally like a nebula, keeping the camera-axis depth subtle.
 *
 * On first mount particles are scattered throughout the full radial range so
 * the field looks fully populated from frame 1 — no visible "explosion" burst.
 *
 * Render budget per SPECS §4: 5000 / 1500 / 0 by tier.
 */
export function ParticleField() {
  const tier = useSceneStore((state) => state.tier);
  const count = COUNTS[tier];

  const pointsRef = useRef<THREE.Points>(null);
  const sprite = useMemo(buildParticleSprite, []);

  useEffect(() => {
    return () => {
      sprite?.dispose();
    };
  }, [sprite]);

  const { positions, velocities, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Volume-weighted scatter across the full field (SPAWN_R_MIN → EXIT_R).
      // Linear-in-radius distribution over-concentrates particles near the inner
      // edge (small r = smaller shell volume). Cube-root weighting gives uniform
      // density per unit volume, so the field looks evenly spread on load.
      const u = Math.random();
      const r = Math.cbrt(u * (EXIT_R ** 3 - SPAWN_R_MIN ** 3) + SPAWN_R_MIN ** 3);
      placeOutward(i, positions, velocities, r);

      const color = pickColor();
      colors[i * 3 + 0] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, velocities, colors };
  }, [count]);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    if (!points || count === 0) return;

    const posAttr = points.geometry.attributes.position;
    if (!posAttr) return;
    const arr = posAttr.array as Float32Array;
    const step = delta * FLOW_SPEED;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3 + 0] = (arr[i3 + 0] ?? 0) + (velocities[i3 + 0] ?? 0) * step;
      arr[i3 + 1] = (arr[i3 + 1] ?? 0) + (velocities[i3 + 1] ?? 0) * step;
      arr[i3 + 2] = (arr[i3 + 2] ?? 0) + (velocities[i3 + 2] ?? 0) * step;

      const px = arr[i3 + 0] ?? 0;
      const py = arr[i3 + 1] ?? 0;
      const pz = arr[i3 + 2] ?? 0;

      // Respawn in the inner cloud once the particle exits the outer shell.
      if (px * px + py * py + pz * pz > EXIT_R_SQ) {
        const r = SPAWN_R_MIN + Math.random() * (SPAWN_R_MAX - SPAWN_R_MIN);
        placeOutward(i, arr, velocities, r);
      }
    }

    posAttr.needsUpdate = true;
  });

  if (count === 0 || !sprite) return null;

  return (
    <points ref={pointsRef} frustumCulled={false} renderOrder={1}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      {/*
       * AdditiveBlending: each particle adds light to what's behind it,
       * producing a genuine glow against the ivory canvas. Darker palette
       * entries were replaced with brighter equivalents so every hue stays
       * visible under additive math (dark + ivory ≈ invisible). Opacity
       * tuned so the field reads as vivid but doesn't wash out the cards.
       */}
      <pointsMaterial
        size={0.2}
        sizeAttenuation
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        map={sprite}
        opacity={0.85}
      />
    </points>
  );
}

/**
 * Places particle `i` at the given radius on a disk-biased sphere, with
 * outward velocity. Called both at init (full-field radius) and on respawn
 * (inner-cloud radius).
 *
 * Disk bias: z-axis spread clamped to ±45° elevation and then further
 * compressed to 40% — the field fans out laterally rather than as a full 3D
 * sphere, which keeps the camera-facing depth axis subtle and avoids particles
 * flying directly toward or away from the viewer too obviously.
 */
function placeOutward(
  i: number,
  positions: Float32Array,
  velocities: Float32Array,
  radius: number,
): void {
  const theta = Math.random() * Math.PI * 2; // full azimuth
  const phi = (Math.random() - 0.5) * Math.PI * 0.5; // ±45° elevation

  const x = Math.cos(phi) * Math.cos(theta) * radius;
  const y = Math.cos(phi) * Math.sin(theta) * radius;
  const z = Math.sin(phi) * radius * 0.4; // compress depth axis

  const i3 = i * 3;
  positions[i3 + 0] = x;
  positions[i3 + 1] = y;
  positions[i3 + 2] = z;

  // Velocity: outward along the spawn direction, with gentle random jitter so
  // nearby particles don't travel in perfect lockstep.
  const mag = Math.hypot(x, y, z) || 1;
  const speed = 0.4 + Math.random() * 0.8;
  velocities[i3 + 0] = (x / mag) * speed + (Math.random() - 0.5) * 0.12;
  velocities[i3 + 1] = (y / mag) * speed + (Math.random() - 0.5) * 0.12;
  velocities[i3 + 2] = (z / mag) * speed * 0.4 + (Math.random() - 0.5) * 0.05;
}
