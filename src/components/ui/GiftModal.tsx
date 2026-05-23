'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useT } from '@/hooks/useT';
import { GIFT_LINKS } from '@/lib/constants';
import { useSceneStore } from '@/stores/sceneStore';

export function GiftModal() {
  const isOpen = useSceneStore((state) => state.isGiftsOpen);
  const close = useSceneStore((state) => state.closeGifts);
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen);
  const t = useT();

  useEscapeKey(close, isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="gifts"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gift-modal-title"
          className="pointer-events-auto fixed inset-x-0 top-0 bottom-[var(--playlist-bar-offset)] z-40 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label={t.closeGiftOptions}
            onClick={close}
            className="absolute inset-0 bg-ink/25 backdrop-blur-md"
          />

          <motion.div
            ref={trapRef}
            initial={{ y: 16, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 16, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-[520px] rounded-2xl border border-ink/10 bg-void/95 p-8 shadow-[0_8px_60px_-10px_rgba(196,114,78,0.25)]"
          >
            <button
              type="button"
              onClick={close}
              aria-label={t.close}
              className="absolute right-4 top-4 rounded-full p-2 text-ink/50 transition hover:bg-ink/8 hover:text-ink"
            >
              <X size={18} aria-hidden="true" />
            </button>

            <h2
              id="gift-modal-title"
              className="text-glow-cyan text-balance text-center text-2xl font-light text-cyan-glow"
            >
              {t.giftHeading}
            </h2>

            <p className="mt-3 text-center text-sm leading-relaxed text-ink/60">
              {t.giftBody}
            </p>

            <div className="mt-8 flex justify-center">
              <a
                href={GIFT_LINKS.honeyfund}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-xs rounded-xl border border-magenta-glow/35 bg-magenta-glow/8 px-4 py-4 text-center text-sm font-medium tracking-wide text-magenta-glow transition hover:bg-magenta-glow/18"
              >
                Honeyfund
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
