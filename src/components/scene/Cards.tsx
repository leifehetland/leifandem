'use client';

import { Suspense, useMemo } from 'react';

import { mediaItems } from '@/lib/media-manifest';
import { useSceneStore } from '@/stores/sceneStore';
import type {
  DeviceTier,
  MediaItem,
  MediaPosition,
  MediaRotation,
  WithPosition,
} from '@/types';

import { AudioOrb } from './AudioOrb';
import { PhotoCard } from './PhotoCard';
import { VideoCard } from './VideoCard';

const VISIBLE_COUNT_BY_TIER: Record<DeviceTier, number> = {
  high: 60,
  mid: 60,
  low: 24,
};

/**
 * Picks N unique items from the manifest each page-load and assigns each
 * one a position on a perturbed Fibonacci sphere around the origin, plus a
 * small random rotation. Selection is memoized for the lifetime of the
 * mount so cards don't shuffle on every store change — refresh the page
 * (or remount the canvas) to re-roll.
 */
export function Cards() {
  const tier = useSceneStore((state) => state.tier);

  const positioned = useMemo(() => {
    const tierCount = VISIBLE_COUNT_BY_TIER[tier];
    const eligible = mediaItems.filter((item) => isVisibleAtTier(item, tier));
    const count = Math.min(tierCount, eligible.length);
    const sampled = pickRandom(eligible, count);
    const positions = fibonacciCloud(count);
    return sampled.map<WithPosition<MediaItem>>((item, i) => ({
      ...item,
      position: positions[i] ?? [0, 0, 0],
      rotation: item.rotation ?? randomRotation(),
      scale: item.scale ?? randomScale(),
    }));
  }, [tier]);

  return (
    <>
      {positioned.map((item) => (
        // Each card owns its own Suspense boundary so cards appear as their
        // texture loads, rather than waiting on the slowest of all 60.
        <Suspense key={item.id} fallback={null}>
          {renderCard(item)}
        </Suspense>
      ))}
    </>
  );
}

function renderCard(item: WithPosition<MediaItem>) {
  switch (item.type) {
    case 'photo':
      return <PhotoCard item={item as WithPosition<typeof item>} />;
    case 'video':
      return <VideoCard item={item as WithPosition<typeof item>} />;
    case 'audio':
      return <AudioOrb item={item as WithPosition<typeof item>} />;
  }
}

function isVisibleAtTier(item: MediaItem, tier: DeviceTier): boolean {
  const gate = item.tier ?? 'all';
  if (gate === 'all') return true;
  if (gate === 'high') return tier === 'high';
  return tier !== 'low';
}

function pickRandom<T>(arr: readonly T[], n: number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i] as T;
    a[i] = a[j] as T;
    a[j] = tmp;
  }
  return a.slice(0, n);
}

/**
 * Fibonacci-sphere layout, squashed on Y to match the wider-than-tall
 * frustum, shifted slightly behind origin so the densest band sits in
 * mid-depth, and jittered so it doesn't read as a regular pattern. Cards
 * that would land too close to the camera get pushed back.
 */
function fibonacciCloud(n: number): MediaPosition[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const seed = Math.random() * Math.PI * 2;
  const center = { x: 0, y: 0, z: -1.5 };
  const baseR = 5.6;
  const ySquash = 0.7;
  const maxZ = 4.5;

  const out: MediaPosition[] = [];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const y = 1 - 2 * t;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i + seed;
    const ux = Math.cos(theta) * ring;
    const uz = Math.sin(theta) * ring;

    const r = baseR + (Math.random() - 0.5) * 1.6;
    const px = ux * r + center.x + (Math.random() - 0.5) * 0.6;
    const py = y * r * ySquash + center.y + (Math.random() - 0.5) * 0.5;
    let pz = uz * r + center.z + (Math.random() - 0.5) * 0.6;

    if (pz > maxZ) pz = maxZ - Math.random() * 1.2;

    out.push([px, py, pz]);
  }
  return out;
}

function randomRotation(): MediaRotation {
  return [
    (Math.random() - 0.5) * 0.12,
    (Math.random() - 0.5) * 0.6,
    (Math.random() - 0.5) * 0.08,
  ];
}

function randomScale(): number {
  return 0.85 + Math.random() * 0.35;
}
