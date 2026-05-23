'use client';

import type { ReactNode } from 'react';

import { useSceneStore } from '@/stores/sceneStore';

/**
 * Inline clickable trigger for the secret Bunz gallery.
 * Used as an MDX component: <BunzLink>Bunz 🐱</BunzLink>
 *
 * Styled in the site's magenta-glow / rose tone — warm enough to catch the eye
 * of a curious reader, but subtle enough that it doesn't scream "click me."
 */
export function BunzLink({ children }: { children: ReactNode }) {
  const openBunz = useSceneStore((state) => state.openBunz);

  return (
    <button
      type="button"
      onClick={openBunz}
      className="inline cursor-pointer rounded px-0.5 font-medium text-magenta-glow/75 underline decoration-magenta-glow/40 decoration-dotted underline-offset-2 transition hover:text-magenta-glow hover:decoration-magenta-glow/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-magenta-glow/50"
      aria-label="Open Bunz gallery"
    >
      {children}
    </button>
  );
}
