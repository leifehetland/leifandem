'use client';

import { motion } from 'framer-motion';

import { PLAYLIST } from '@/lib/constants';
import { useSceneStore } from '@/stores/sceneStore';

/**
 * Bottom-pinned Spotify embed.
 *
 * Visible on every view once the user has entered (i.e. past the loading
 * screen). Sits above the full-screen panels (Gallery, Ceremony, Throwbacks,
 * Story) so guests can keep the playlist accessible while browsing.
 *
 * The 80px embed is Spotify's compact playlist player — short enough to
 * read as a footer chrome rather than a content block.
 */
export function PlaylistBar() {
  const hasEntered = useSceneStore((state) => state.hasEntered);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: hasEntered ? 1 : 0, y: hasEntered ? 0 : 12 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: hasEntered ? 0.7 : 0 }}
      aria-hidden={!hasEntered}
      inert={!hasEntered}
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-[60] border-t border-ink/10 bg-void/80 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-md"
    >
      <iframe
        title={PLAYLIST.title}
        src={PLAYLIST.embedUrl}
        width="100%"
        height={80}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        style={{ borderRadius: 12, border: 0, display: 'block' }}
      />
    </motion.div>
  );
}
