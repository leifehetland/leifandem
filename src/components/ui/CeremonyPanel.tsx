'use client';

import { useT } from '@/hooks/useT';
import { mediaItems } from '@/lib/media-manifest';
import { useSceneStore } from '@/stores/sceneStore';
import type { PhotoItem, VideoItem } from '@/types';

import { MediaGrid } from './MediaGrid';

/**
 * Deterministic Fisher-Yates shuffle using a linear congruential generator.
 * Same seed → same order every time, no runtime randomness.
 */
function seededShuffle<T>(arr: readonly T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

/**
 * Grid that combines ceremony shots with the scanned polaroids so they're
 * shuffled into the same flow rather than living in a separate panel.
 * Order is shuffled once with a fixed seed (wedding date) so landscape,
 * portrait, and polaroid shots are interleaved rather than clustered by
 * source folder or filename.
 */
const ceremonyItems = seededShuffle(
  mediaItems.filter(
    (item): item is PhotoItem | VideoItem =>
      (item.type === 'photo' || item.type === 'video') &&
      (item.src.startsWith('/media/images/atlceremony/') ||
        item.src.startsWith('/media/images/polaroidscans/')),
  ),
  20260516, // seed = ceremony date, YYYYMMDD
);

export function CeremonyPanel() {
  const isOpen = useSceneStore((state) => state.isCeremonyOpen);
  const close = useSceneStore((state) => state.closeCeremony);
  const t = useT();

  return (
    <MediaGrid
      items={ceremonyItems}
      isOpen={isOpen}
      close={close}
      title={t.ceremonyTitle}
      ariaLabel={t.ceremonyAriaLabel}
    />
  );
}
