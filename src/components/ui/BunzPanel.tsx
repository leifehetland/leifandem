'use client';

import { useT } from '@/hooks/useT';
import { bunzItems } from '@/lib/bunz-manifest';
import { useSceneStore } from '@/stores/sceneStore';

import { MediaGrid } from './MediaGrid';

/**
 * Secret gallery for Bunz 🐱 — triggered by the subtle link in Our Story.
 * Media items come from /public/media/images/bunz/ via bunz-manifest.ts.
 */
export function BunzPanel() {
  const isOpen = useSceneStore((state) => state.isBunzOpen);
  const close = useSceneStore((state) => state.closeBunz);
  const t = useT();

  return (
    <MediaGrid
      items={bunzItems}
      isOpen={isOpen}
      close={close}
      title={t.bunzTitle}
      ariaLabel={t.bunzAriaLabel}
    />
  );
}
