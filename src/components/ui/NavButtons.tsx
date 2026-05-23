'use client';

import { motion } from 'framer-motion';

import { useSceneStore } from '@/stores/sceneStore';

/**
 * Bottom-center pill nav: Our Story + Ceremony + Throwbacks + How To Support.
 * All buttons simply flip store flags; the modals/panels react.
 */
export function NavButtons() {
  const hasEntered = useSceneStore((state) => state.hasEntered);
  const openStory = useSceneStore((state) => state.openStory);
  const openCeremony = useSceneStore((state) => state.openCeremony);
  const openThrowbacks = useSceneStore((state) => state.openThrowbacks);
  const openGifts = useSceneStore((state) => state.openGifts);

  return (
    <motion.nav
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: hasEntered ? 1 : 0, y: hasEntered ? 0 : 12 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: hasEntered ? 0.6 : 0 }}
      className="fixed inset-x-0 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-6"
      aria-hidden={!hasEntered}
      inert={!hasEntered}
    >
      <div className="pointer-events-auto flex gap-2 rounded-full border border-ink/10 bg-void/70 p-1.5 shadow-sm backdrop-blur-md sm:gap-3">
        <button
          type="button"
          onClick={openStory}
          className="rounded-full px-3 py-2 text-sm tracking-wide text-ink/80 transition hover:bg-ink/8 sm:px-5"
        >
          Our Story
        </button>
        <button
          type="button"
          onClick={openCeremony}
          className="rounded-full px-3 py-2 text-sm tracking-wide text-ink/80 transition hover:bg-ink/8 sm:px-5"
        >
          Ceremony
        </button>
        <button
          type="button"
          onClick={openThrowbacks}
          className="rounded-full px-3 py-2 text-sm tracking-wide text-ink/80 transition hover:bg-ink/8 sm:px-5"
        >
          Throwbacks
        </button>
        <button
          type="button"
          onClick={openGifts}
          className="rounded-full bg-cyan-glow/15 px-3 py-2 text-sm tracking-wide text-cyan-glow transition hover:bg-cyan-glow/25 sm:px-5"
        >
          How To Support
        </button>
      </div>
    </motion.nav>
  );
}
