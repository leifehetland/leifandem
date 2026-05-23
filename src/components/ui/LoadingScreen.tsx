'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { COUPLE } from '@/lib/constants';
import { useSceneStore } from '@/stores/sceneStore';

/**
 * Six polaroid scans used as the loading-screen background collage.
 * Swap any src to show different photos; order determines grid position.
 */
const POLAROIDS = [
  '/media/images/primaryphotos/img_0388.webp',
  '/media/images/primaryphotos/img_0408.webp',
  '/media/images/primaryphotos/img_0410.webp',
  '/media/images/primaryphotos/img_0414.webp',
  '/media/images/primaryphotos/img_0416.webp',
  '/media/images/primaryphotos/img_0422.webp',
] as const;

/** Subtle per-card tilt — alternating directions so the grid feels natural. */
const ROTATIONS = [-2.5, 1.8, -1.2, 1.5, -2.0, 2.2] as const;

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
          {/* Polaroid collage — 2 rows × 3 cols, scaled slightly so rotated
              corners never expose the background. */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
            <div
              className="grid h-full w-full grid-cols-3 grid-rows-2 gap-3 p-4 sm:gap-4 sm:p-6"
              style={{ transform: 'scale(1.14)' }}
            >
              {POLAROIDS.map((src, i) => (
                <div
                  key={src}
                  className="overflow-hidden bg-white p-2 pb-8 shadow-2xl"
                  style={{ transform: `rotate(${ROTATIONS[i]}deg)` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Warm cream wash — keeps photos visible but text readable. */}
          <div aria-hidden="true" className="absolute inset-0 bg-void/62" />

          {/* Text content sits above both layers. */}
          <div className="relative flex flex-col items-center">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-shadow-warm font-accent text-lg uppercase tracking-[0.4em] text-ink sm:text-xl"
            >
              Surprise! We tied the knot...
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
              className="text-shadow-warm font-accent mt-16 text-xl uppercase tracking-[0.35em] text-ink sm:text-2xl"
            >
              Tap to enter
            </motion.p>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
