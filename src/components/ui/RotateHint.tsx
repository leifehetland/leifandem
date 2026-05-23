'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSceneStore } from '@/stores/sceneStore';

/**
 * Brief fading hint that appears after the visitor enters the scene, letting
 * them know the cloud is keyboard-navigable.
 *
 * - Gated on `hasEntered` so it never overlaps the loading screen.
 * - Hidden when prefers-reduced-motion is set (auto-rotation is also off in
 *   that case, so the hint would be misleading).
 * - Purely decorative; aria-hidden so screen readers skip it.
 */
export function RotateHint() {
  const hasEntered = useSceneStore((state) => state.hasEntered);
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasEntered || reducedMotion) return;
    const show = setTimeout(() => setVisible(true), 1200);
    const hide = setTimeout(() => setVisible(false), 5500);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [hasEntered, reducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.p
          aria-hidden="true"
          className="pointer-events-none fixed bottom-8 left-1/2 z-30 -translate-x-1/2 text-xs tracking-[0.25em] uppercase text-stone-400/70"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.9 }}
        >
          WASD · rotate
        </motion.p>
      )}
    </AnimatePresence>
  );
}
