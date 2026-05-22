'use client';

import { mediaItems } from '@/lib/media-manifest';
import { useSceneStore } from '@/stores/sceneStore';
import type { PhotoItem, VideoItem } from '@/types';

import { MediaCarousel } from './MediaCarousel';

/**
 * Carousel restricted to media that lives in /media/images/throwbacks/.
 */

const throwbackItems = mediaItems.filter(
  (item): item is PhotoItem | VideoItem =>
    (item.type === 'photo' || item.type === 'video') &&
    item.src.startsWith('/media/images/throwbacks/'),
);

export function ThrowbacksPanel() {
  const isOpen = useSceneStore((state) => state.isThrowbacksOpen);
  const close = useSceneStore((state) => state.closeThrowbacks);

  return (
    <MediaCarousel
      items={throwbackItems}
      isOpen={isOpen}
      close={close}
      ariaLabel="Throwback photos"
    />
  );
}
