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
 * Eleven warm pastel tones — a full wedding garden palette.
 * Each tuple is [THREE.Color, per-color weight (must sum to 1.0)].
 *
 * The lightest, most neutral tones carry the most weight so the overall field
 * reads as warm luminous mist. The richer hues (terra, mauve, sage, blue) are
 * accents that catch the eye without dominating.
 *
 *   Warm neutrals  → cream, golden cream, soft peach      ~35 %
 *   Peach family   → terracotta, blush, dusty rose        ~25 %
 *   Cool accents   → lavender, dusty blue, soft sky       ~20 %
 *   Earth / nature → reddish brown, sage                  ~12 %
 *   Warm amber     → amber                                ~ 8 %
 */
const COLOR_TABLE: ReadonlyArray<readonly [THREE.Color, number]> = [
  // ── Peach family (~65 %) ─────────────────────────────────────────────────
  [new THREE.Color('#F5C4A8'), 0.18] as const, // soft peach (hero tone)
  [new THREE.Color('#F0A882'), 0.13] as const, // mid peach
  [new THREE.Color('#E8B8B0'), 0.13] as const, // blush peach
  [new THREE.Color('#C4724E'), 0.12] as const, // terracotta / deep peach
  [new THREE.Color('#C48A80'), 0.09] as const, // dusty rose-peach
  // ── Warm neutrals (~20 %) ────────────────────────────────────────────────
  [new THREE.Color('#F2DBC8'), 0.11] as const, // warm cream
  [new THREE.Color('#EDD5B8'), 0.09] as const, // golden cream
  // ── Cool accents (~12 %) — counterpoint that makes the peach pop ─────────
  [new THREE.Color('#C4B0D4'), 0.06] as const, // soft lavender
  [new THREE.Color('#8FADBF'), 0.04] as const, // dusty blue
  [new THREE.Color('#A8C4D0'), 0.02] as const, // soft sky
  // ── Earth accents (~3 %) ─────────────────────────────────────────────────
  [new THREE.Color('#8A3E2A'), 0.02] as const, // reddish brown
  [new THREE.Color('#D4A85A'), 0.01] as const, // warm amber
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
    <points ref={pointsRef} frustumCulled={false}>
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
       * NormalBlending on a light background: additive blending washes to
       * white on ivory. Normal blending lets the six warm tones show through
       * as soft semi-transparent motes drifting across the ivory canvas.
       */}
      <pointsMaterial
        size={0.14}
        sizeAttenuation
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
        map={sprite}
        opacity={0.55}
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
