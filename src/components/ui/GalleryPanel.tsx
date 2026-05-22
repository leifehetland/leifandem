'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useEscapeKey } from '@/hooks/useEscapeKey';
import { mediaItems } from '@/lib/media-manifest';
import { useSceneStore } from '@/stores/sceneStore';
import type { PhotoItem, VideoItem } from '@/types';

/**
 * Full-screen swipe carousel for photos and videos.
 *
 * Uses CSS scroll-snap for native touch swiping — no library needed.
 * Arrow keys also navigate. The counter and dot indicators stay in sync
 * by reading scroll position from the scroll event.
 */

const galleryItems = mediaItems.filter(
  (item): item is PhotoItem | VideoItem =>
    item.type === 'photo' || item.type === 'video',
);

export function GalleryPanel() {
  const isOpen = useSceneStore((state) => state.isGalleryOpen);
  const close = useSceneStore((state) => state.closeGallery);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const total = galleryItems.length;

  useEscapeKey(close, isOpen);

  // Reset to slide 0 whenever the panel opens
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = 0;
      }
    }
  }, [isOpen]);

  const scrollToIndex = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
  }, []);

  // Derives activeIndex from scroll position — handles both native swipe and button clicks.
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.max(0, Math.min(total - 1, index)));
  }, [total]);

  const goTo = useCallback(
    (index: number) => {
      scrollToIndex(Math.max(0, Math.min(total - 1, index)));
    },
    [total, scrollToIndex],
  );

  // Arrow key navigation
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goTo(activeIndex - 1);
      if (e.key === 'ArrowRight') goTo(activeIndex + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, activeIndex, goTo]);

  const item = galleryItems[activeIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
          className="pointer-events-auto fixed inset-0 z-50 flex flex-col bg-void/98 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header: counter + close */}
          <div className="flex flex-shrink-0 items-center justify-between px-5 py-4">
            <span className="text-xs uppercase tracking-[0.3em] text-ink/50">
              {activeIndex + 1} / {total}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close gallery"
              className="rounded-full p-2 text-ink/50 transition hover:bg-ink/8 hover:text-ink"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          {/* Slide strip — native CSS scroll snap */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            style={{ scrollbarWidth: 'none' } as React.CSSProperties}
            className="flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto"
          >
            {galleryItems.map((galleryItem, i) => (
              <div
                key={galleryItem.id}
                className="flex h-full w-full flex-shrink-0 snap-center items-center justify-center px-4"
              >
                {galleryItem.type === 'photo' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={galleryItem.src}
                    alt={galleryItem.alt}
                    width={galleryItem.width}
                    height={galleryItem.height}
                    loading={Math.abs(i - activeIndex) <= 1 ? 'eager' : 'lazy'}
                    className="max-h-full max-w-full rounded-xl object-contain"
                  />
                ) : (
                  <video
                    src={galleryItem.src}
                    poster={galleryItem.poster}
                    controls
                    muted={!galleryItem.hasAudio}
                    playsInline
                    aria-label={galleryItem.alt}
                    className="max-h-full max-w-full rounded-xl"
                  />
                )}
              </div>
            ))}
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
              disabled={activeIndex === galleryItems.length - 1}
              aria-label="Next photo"
              className="rounded-full p-2 text-ink/50 transition hover:bg-ink/8 hover:text-ink disabled:opacity-20"
            >
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex flex-shrink-0 justify-center gap-1.5 pb-6">
            {galleryItems.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to item ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-5 bg-cyan-glow'
                    : 'w-1.5 bg-ink/20 hover:bg-ink/40'
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
