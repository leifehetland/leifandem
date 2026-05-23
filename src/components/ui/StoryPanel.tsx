'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useSceneStore } from '@/stores/sceneStore';

/**
 * Slide-in story panel (right side on desktop, full-screen on mobile).
 *
 * The compiled MDX content is passed in as `children` from a server
 * component (`StoryContent`) so this file stays purely client/visual.
 */
export function StoryPanel({ children }: { children: ReactNode }) {
  const isOpen = useSceneStore((state) => state.isStoryOpen);
  const close = useSceneStore((state) => state.closeStory);
  const trapRef = useFocusTrap<HTMLElement>(isOpen);

  useEscapeKey(close, isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close story"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm"
          />

          <motion.aside
            ref={trapRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="story-panel-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="pointer-events-auto fixed top-0 right-0 bottom-[var(--playlist-bar-offset)] z-50 flex w-full max-w-[480px] flex-col border-l border-ink/10 bg-void/97 shadow-[0_0_60px_-10px_rgba(196,114,78,0.2)]"
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
              <h2
                id="story-panel-title"
                className="text-glow-cyan text-lg font-light tracking-wide"
              >
                Our Story
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="rounded-full p-2 text-ink/50 transition hover:bg-ink/8 hover:text-ink"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="story-prose flex-1 overflow-y-auto px-6 py-6">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
