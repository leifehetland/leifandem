'use client';

import { motion } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';

import { useSceneStore } from '@/stores/sceneStore';

/**
 * Fixed bottom-right mute toggle. 44×44 px tap target per REQUIREMENTS §5.4.
 * Audio playback wiring lands in Phase 3; this component only flips state.
 */
export function AudioToggle() {
  const hasEntered = useSceneStore((state) => state.hasEntered);
  const isMuted = useSceneStore((state) => state.isMuted);
  const toggleMute = useSceneStore((state) => state.toggleMute);

  return (
    <motion.button
      type="button"
      onClick={toggleMute}
      aria-label={isMuted ? 'Unmute background audio' : 'Mute background audio'}
      aria-pressed={!isMuted}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: hasEntered ? 1 : 0,
        scale: hasEntered ? 1 : 0.9,
      }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: hasEntered ? 0.8 : 0 }}
      aria-hidden={!hasEntered}
      inert={!hasEntered}
      className="pointer-events-auto fixed bottom-[calc(9.5rem+env(safe-area-inset-bottom))] right-6 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-void/70 text-ink/60 shadow-sm backdrop-blur-md transition hover:bg-void/90 hover:text-ink"
    >
      {isMuted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
    </motion.button>
  );
}
