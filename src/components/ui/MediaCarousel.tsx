'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useEscapeKey } from '@/hooks/useEscapeKey';
import type { PhotoItem, VideoItem } from '@/types';

/**
 * Full-screen carousel for photos and videos.
 *
 * Renders only the active slide so the DOM stays small regardless of how
 * many items are passed in. Navigation via prev/next buttons, arrow keys,
 * or touch swipe.
 *
 * This is the reusable engine behind GalleryPanel, CeremonyPanel, and
 * ThrowbacksPanel — each just supplies a different filtered item list and
 * its own open/close store wiring.
 */

/** Minimum swipe distance (px) to trigger slide change. */
const SWIPE_THRESHOLD = 50;

interface MediaCarouselProps {
  items: ReadonlyArray<PhotoItem | VideoItem>;
  isOpen: boolean;
  close: () => void;
  ariaLabel: string;
}

export function MediaCarousel({ items, isOpen, close, ariaLabel }: MediaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = items.length;

  // Touch tracking refs — no state so swipe doesn't trigger re-renders.
  const touchStartX = useRef<number | null>(null);

  useEscapeKey(close, isOpen);

  // Reset to slide 0 whenever the panel opens.
  useEffect(() => {
    if (isOpen) setActiveIndex(0);
  }, [isOpen]);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(Math.max(0, Math.min(total - 1, index)));
    },
    [total],
  );

  // Arrow key navigation.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goTo(activeIndex - 1);
      if (e.key === 'ArrowRight') goTo(activeIndex + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, activeIndex, goTo]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) >= SWIPE_THRESHOLD) goTo(activeIndex + (dx > 0 ? -1 : 1));
  };

  const item = items[activeIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          className="pointer-events-auto fixed inset-0 z-50 flex flex-col bg-void/98 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header: counter + close */}
          <div className="flex flex-shrink-0 items-center justify-between px-5 py-4">
            <span className="text-xs uppercase tracking-[0.3em] text-ink/50">
              {total === 0 ? '0 / 0' : `${activeIndex + 1} / ${total}`}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label={`Close ${ariaLabel}`}
              className="rounded-full p-2 text-ink/50 transition hover:bg-ink/8 hover:text-ink"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          {/*
           * Slide viewport — position:relative, overflow:hidden.
           *
           * Only the active slide is in the DOM. It cross-fades via opacity
           * + a small x-translate so the transition feels like a slide
           * without requiring every item to occupy layout space.
           */}
          <div
            className="relative min-h-0 flex-1 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                className="absolute inset-0 flex items-center justify-center px-4"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
              >
                {item?.type === 'photo' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    loading="eager"
                    className="max-h-full max-w-full rounded-xl object-contain"
                  />
                ) : item?.type === 'video' ? (
                  <video
                    src={item.src}
                    poster={item.poster}
                    controls
                    muted={!item.hasAudio}
                    playsInline
                    aria-label={item.alt}
                    className="max-h-full max-w-full rounded-xl"
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer: prev arrow / caption / next arrow */}
          <div className="flex flex-shrink-0 items-center gap-3 px-5 py-4">
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous photo"
              className="rounded-full p-2 text-ink/50 transition hover:bg-ink/8 hover:text-ink disabled:opacity-20"
            >
              <ChevronLeft size={22} aria-hidden="true" />
            </button>

            <p className="flex-1 text-center text-sm leading-relaxed text-ink/70">
              {item?.caption}
            </p>

            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex >= total - 1}
              aria-label="Next photo"
              className="rounded-full p-2 text-ink/50 transition hover:bg-ink/8 hover:text-ink disabled:opacity-20"
            >
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
