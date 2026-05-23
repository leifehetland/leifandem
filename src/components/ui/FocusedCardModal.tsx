'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useCallback, useMemo } from 'react';

import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useT } from '@/hooks/useT';
import { mediaItems } from '@/lib/media-manifest';
import { useSceneStore } from '@/stores/sceneStore';

/**
 * HTML overlay (outside <Canvas>) driven by `focusedCardId`.
 * Shows the full-res media + caption with the same shadow treatment as the
 * gift modal so the surfaces feel related.
 */
export function FocusedCardModal() {
  const focusedId = useSceneStore((state) => state.focusedCardId);
  const setFocusedCard = useSceneStore((state) => state.setFocusedCard);

  const item = useMemo(
    () => (focusedId ? mediaItems.find((entry) => entry.id === focusedId) ?? null : null),
    [focusedId],
  );

  const close = useCallback(() => setFocusedCard(null), [setFocusedCard]);
  const trapRef = useFocusTrap<HTMLDivElement>(item !== null);
  useEscapeKey(close, item !== null);
  const t = useT();

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="focused-card-caption"
          className="pointer-events-auto fixed inset-x-0 top-0 bottom-[var(--playlist-bar-offset)] z-[55] flex items-center justify-center px-4 py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            aria-label={t.close}
            onClick={close}
            className="absolute inset-0 bg-ink/25 backdrop-blur-md"
          />

          <motion.div
            ref={trapRef}
            initial={{ y: 16, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 16, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative flex max-h-full w-full max-w-[760px] flex-col items-center rounded-2xl border border-ink/10 bg-void/95 p-3 shadow-[0_8px_60px_-10px_rgba(196,114,78,0.2)]"
          >
            <button
              type="button"
              onClick={close}
              aria-label={t.close}
              className="absolute right-3 top-3 z-10 rounded-full bg-ink/8 p-2 text-ink/60 transition hover:bg-ink/15 hover:text-ink"
            >
              <X size={18} aria-hidden="true" />
            </button>

            {item.type === 'photo' && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                className="max-h-[70dvh] w-auto rounded-xl object-contain"
              />
            )}

            {item.type === 'video' && (
              <video
                src={item.src}
                poster={item.poster}
                controls={item.hasAudio}
                autoPlay
                loop
                muted={!item.hasAudio}
                playsInline
                aria-label={item.alt}
                className="max-h-[70dvh] w-auto rounded-xl"
              />
            )}

            {item.type === 'audio' && (
              <div className="flex w-full max-w-md flex-col items-center gap-4 px-6 py-10 text-center">
                <p className="text-glow-cyan text-lg">{item.label}</p>
                <audio src={item.src} controls aria-label={item.alt} className="w-full" />
              </div>
            )}

            <p
              id="focused-card-caption"
              className="mt-4 px-4 pb-2 text-center text-sm text-ink/80"
            >
              {item.caption}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
