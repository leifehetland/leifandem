'use client';

import { motion } from 'framer-motion';

import { COUPLE } from '@/lib/constants';
import { useSceneStore } from '@/stores/sceneStore';

/**
 * Persistent top-center hero. Pointer-events are off on the wrapper so the
 * canvas underneath stays clickable; only the inner text takes hits.
 */
export function Hero() {
  const hasEntered = useSceneStore((state) => state.hasEntered);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-center px-6 pt-8 sm:pt-12">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: hasEntered ? 1 : 0, y: hasEntered ? 0 : -8 }}
        transition={{ duration: 0.9, ease: 'easeOut', delay: hasEntered ? 0.4 : 0 }}
        className="pointer-events-auto rounded-2xl border border-ink/10 bg-void/75 px-6 py-3 text-center shadow-sm backdrop-blur-md sm:px-10 sm:py-4"
      >
        <h1 className="text-glow-cyan text-shadow-warm text-balance text-3xl font-light tracking-widest sm:text-5xl">
          {COUPLE.partnerOne}
          <span className="mx-3 text-cyan-glow/60">+</span>
          {COUPLE.partnerTwo}
        </h1>
        <p className="text-shadow-warm mt-2 text-sm uppercase tracking-[0.4em] text-ink/75 sm:text-base">
          {COUPLE.dateDisplay}
        </p>
      </motion.div>
    </header>
  );
}
