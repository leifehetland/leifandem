'use client';

import { mediaItems } from '@/lib/media-manifest';
import { useSceneStore } from '@/stores/sceneStore';
import type { PhotoItem, VideoItem } from '@/types';

import { MediaCarousel } from './MediaCarousel';

/**
 * Full-screen gallery — every photo and video in the manifest.
 *
 * Just a thin wrapper that hands the full media list to MediaCarousel.
 * See MediaCarousel.tsx for the carousel implementation notes.
 */

const galleryItems = mediaItems.filter(
  (item): item is PhotoItem | VideoItem =>
    item.type === 'photo' || item.type === 'video',
);

export function GalleryPanel() {
  const isOpen = useSceneStore((state) => state.isGalleryOpen);
  const close = useSceneStore((state) => state.closeGallery);

  return (
    <MediaCarousel
      items={galleryItems}
      isOpen={isOpen}
      close={close}
      ariaLabel="Photo gallery"
    />
  );
}
