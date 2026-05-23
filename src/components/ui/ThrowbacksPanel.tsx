'use client';

import { mediaItems } from '@/lib/media-manifest';
import { useSceneStore } from '@/stores/sceneStore';
import type { PhotoItem, VideoItem } from '@/types';

import { MediaGrid } from './MediaGrid';

/**
 * Grid restricted to media that lives in /media/images/throwbacks/.
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
    <MediaGrid
      items={throwbackItems}
      isOpen={isOpen}
      close={close}
      title="Throwbacks"
      ariaLabel="Throwback photos"
    />
  );
}
