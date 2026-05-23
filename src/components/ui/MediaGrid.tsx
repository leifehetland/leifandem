'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useSceneStore } from '@/stores/sceneStore';
import type { PhotoItem, VideoItem } from '@/types';

/**
 * Full-screen photo grid.
 *
 * 1 column on phones (each tile breathes), 2 on tablets, 4 on desktops.
 * Tapping a tile sets `focusedCardId` in the store, which makes the existing
 * <FocusedCardModal> open the full-resolution photo on top of this grid.
 *
 * The grid lives at z-50 (same layer as StoryPanel) and stops above the
 * playlist bar via the `--playlist-bar-offset` CSS var.
 */
interface MediaGridProps {
  items: ReadonlyArray<PhotoItem | VideoItem>;
  isOpen: boolean;
  close: () => void;
  title: string;
  ariaLabel: string;
}

export function MediaGrid({ items, isOpen, close, title, ariaLabel }: MediaGridProps) {
  const setFocusedCard = useSceneStore((state) => state.setFocusedCard);

  useEscapeKey(close, isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          className="pointer-events-auto fixed inset-x-0 top-0 bottom-[var(--playlist-bar-offset)] z-50 flex flex-col bg-void/98 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header: title + close */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-ink/10 px-5 py-4">
            <h2 className="text-glow-cyan text-lg font-light tracking-wide">
              {title}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label={`Close ${ariaLabel}`}
              className="rounded-full p-2 text-ink/50 transition hover:bg-ink/8 hover:text-ink"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          {/* Scrollable grid */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
            <ul className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setFocusedCard(item.id)}
                    aria-label={`Open ${item.alt}`}
                    className="group block w-full overflow-hidden rounded-xl border border-ink/10 bg-void/40 shadow-sm transition hover:border-cyan-glow/40 hover:shadow-[0_8px_40px_-12px_rgba(166,56,56,0.25)] focus-visible:border-cyan-glow/60"
                  >
                    {item.type === 'photo' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.src}
                        alt={item.alt}
                        width={item.width}
                        height={item.height}
                        loading="lazy"
                        className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <video
                        src={item.src}
                        poster={item.poster}
                        muted
                        playsInline
                        preload="metadata"
                        aria-label={item.alt}
                        className="aspect-[4/5] w-full object-cover"
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
