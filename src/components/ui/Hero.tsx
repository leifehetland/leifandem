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
        className="pointer-events-auto text-center"
      >
        <h1 className="text-glow-cyan text-balance text-2xl font-light tracking-widest sm:text-3xl">
          {COUPLE.partnerOne}
          <span className="mx-3 text-cyan-glow/50">&amp;</span>
          {COUPLE.partnerTwo}
        </h1>
        <p className="mt-1 text-xs uppercase tracking-[0.4em] text-ink/50">{COUPLE.dateDisplay}</p>
      </motion.div>
    </header>
  );
}
