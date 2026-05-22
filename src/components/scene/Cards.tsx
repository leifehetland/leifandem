'use client';

import { Suspense } from 'react';

import { mediaItems } from '@/lib/media-manifest';
import { useSceneStore } from '@/stores/sceneStore';
import type { DeviceTier, MediaItem } from '@/types';

import { AudioOrb } from './AudioOrb';
import { PhotoCard } from './PhotoCard';
import { VideoCard } from './VideoCard';

/**
 * Maps the media manifest to scene components, filtered by tier.
 * Video and audio variants land in subsequent steps (SPECS §10 #10–11).
 */
export function Cards() {
  const tier = useSceneStore((state) => state.tier);

  const visible = mediaItems.filter((item) => isVisibleAtTier(item, tier));

  return (
    <Suspense fallback={null}>
      {visible.map((item) => {
        switch (item.type) {
          case 'photo':
            return <PhotoCard key={item.id} item={item} />;
          case 'video':
            return <VideoCard key={item.id} item={item} />;
          case 'audio':
            return <AudioOrb key={item.id} item={item} />;
        }
      })}
    </Suspense>
  );
}

function isVisibleAtTier(item: MediaItem, tier: DeviceTier): boolean {
  const gate = item.tier ?? 'all';
  if (gate === 'all') return true;
  if (gate === 'high') return tier === 'high';
  // 'mid+' means anything but low
  return tier !== 'low';
}
