'use client';

import { mediaItems } from '@/lib/media-manifest';
import { useSceneStore } from '@/stores/sceneStore';
import type { PhotoItem, VideoItem } from '@/types';

import { MediaGrid } from './MediaGrid';

/**
 * Grid restricted to media that lives in /media/images/atlceremony/.
 */

const ceremonyItems = mediaItems.filter(
  (item): item is PhotoItem | VideoItem =>
    (item.type === 'photo' || item.type === 'video') &&
    item.src.startsWith('/media/images/atlceremony/'),
);

export function CeremonyPanel() {
  const isOpen = useSceneStore((state) => state.isCeremonyOpen);
  const close = useSceneStore((state) => state.closeCeremony);

  return (
    <MediaGrid
      items={ceremonyItems}
      isOpen={isOpen}
      close={close}
      title="Ceremony"
      ariaLabel="Ceremony photos"
    />
  );
}
