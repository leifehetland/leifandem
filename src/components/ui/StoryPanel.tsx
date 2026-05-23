'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useT } from '@/hooks/useT';
import { useSceneStore } from '@/stores/sceneStore';

/**
 * Slide-in story panel (right side on desktop, full-screen on mobile).
 *
 * Both locale versions are compiled server-side and passed in as separate
 * ReactNode props so the client can swap between them instantly without a
 * server round-trip.
 */
export function StoryPanel({
  enContent,
  noContent,
}: {
  enContent: ReactNode;
  noContent: ReactNode;
}) {
  const isOpen = useSceneStore((state) => state.isStoryOpen);
  const close = useSceneStore((state) => state.closeStory);
  const locale = useSceneStore((state) => state.locale);
  const trapRef = useFocusTrap<HTMLElement>(isOpen);
  const t = useT();

  useEscapeKey(close, isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          ref={trapRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="story-panel-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="pointer-events-auto fixed inset-0 z-50 flex flex-col bg-void/75 backdrop-blur-sm"
          style={{ paddingBottom: 'var(--playlist-bar-offset)' }}
        >
          {/* Header — tight newspaper masthead */}
          <div className="flex items-start justify-between border-b border-ink/10 px-5 py-3 sm:px-8 sm:py-4">
            <h2
              id="story-panel-title"
              className="text-glow-cyan font-bold leading-none tracking-tight text-[3.25rem] sm:text-[8rem]"
            >
              {t.ourStory}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label={t.close}
              className="mt-1 rounded-full p-2 text-ink/50 transition hover:bg-ink/8 hover:text-ink"
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>

          {/* Scrollable body — tighter newspaper gutters */}
          <div className="flex-1 overflow-y-auto">
            <div className="story-prose mx-auto w-full max-w-2xl px-4 py-4 sm:px-5 sm:py-5">
              {locale === 'en' ? enContent : noContent}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
