'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { COUPLE } from '@/lib/constants';
import { useSceneStore } from '@/stores/sceneStore';

/**
 * Tap-to-enter gate. Per REQUIREMENTS §4.1 the tap doubles as the
 * user gesture that unlocks audio playback — for now we just flip
 * `hasEntered`; audio wiring lands in Phase 3.
 */
export function LoadingScreen() {
  const hasEntered = useSceneStore((state) => state.hasEntered);
  const setHasEntered = useSceneStore((state) => state.setHasEntered);

  return (
    <AnimatePresence>
      {!hasEntered && (
        <motion.button
          type="button"
          onClick={() => setHasEntered(true)}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="pointer-events-auto bg-void-gradient fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
          aria-label="Tap to enter"
        >
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xs uppercase tracking-[0.4em] text-ink/50"
          >
            You&rsquo;re invited
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9 }}
            className="text-glow-cyan mt-6 text-balance text-5xl font-light leading-tight tracking-widest text-cyan-glow sm:text-7xl"
          >
            {COUPLE.partnerOne}
            <span className="mx-4 text-cyan-glow/40">&amp;</span>
            {COUPLE.partnerTwo}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1.4, repeat: Infinity, repeatType: 'reverse' }}
            className="mt-16 text-sm uppercase tracking-[0.35em] text-ink/40"
          >
            Tap to enter
          </motion.p>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
