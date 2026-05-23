'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BookHeart, Gift, Images, Menu, Sparkles, X } from 'lucide-react';
import { useCallback, useState } from 'react';

import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useT } from '@/hooks/useT';
import { GIFT_LINKS } from '@/lib/constants';
import { useSceneStore } from '@/stores/sceneStore';

/**
 * Bottom-center nav with two responsive variants.
 *
 *   Desktop (sm+): the original horizontal pill — Our Story / Ceremony /
 *     Throwbacks / Registry — unchanged.
 *
 *   Mobile (<sm): a single hamburger button in the same position. Tapping it
 *     opens a bottom sheet with the locale toggle pinned to the top followed
 *     by the four full-text nav items. The desktop pill and the top-left
 *     `<LocaleToggle />` are both hidden on this breakpoint, so this is the
 *     one place mobile guests reach the locale switch and the panels.
 */
export function NavButtons() {
  return (
    <>
      <DesktopNav />
      <MobileNav />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Desktop pill — unchanged from the original NavButtons.            */
/* ------------------------------------------------------------------ */
function DesktopNav() {
  const hasEntered = useSceneStore((state) => state.hasEntered);
  const openStory = useSceneStore((state) => state.openStory);
  const openCeremony = useSceneStore((state) => state.openCeremony);
  const openThrowbacks = useSceneStore((state) => state.openThrowbacks);
  const t = useT();

  return (
    <motion.nav
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: hasEntered ? 1 : 0, y: hasEntered ? 0 : 12 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: hasEntered ? 0.6 : 0 }}
      className="fixed inset-x-0 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-30 hidden justify-center px-6 sm:flex"
      aria-hidden={!hasEntered}
      inert={!hasEntered}
    >
      <div className="pointer-events-auto flex gap-3 rounded-full border border-ink/10 bg-void/70 p-2.5 shadow-sm backdrop-blur-md sm:gap-4">
        <button
          type="button"
          onClick={openStory}
          className="rounded-full px-5 py-3 text-lg tracking-wide text-ink/80 transition hover:bg-ink/8 sm:px-7"
        >
          {t.ourStory}
        </button>
        <button
          type="button"
          onClick={openCeremony}
          className="rounded-full px-5 py-3 text-lg tracking-wide text-ink/80 transition hover:bg-ink/8 sm:px-7"
        >
          {t.ceremony}
        </button>
        <button
          type="button"
          onClick={openThrowbacks}
          className="rounded-full px-5 py-3 text-lg tracking-wide text-ink/80 transition hover:bg-ink/8 sm:px-7"
        >
          {t.throwbacks}
        </button>
        <a
          href={GIFT_LINKS.honeyfund}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto rounded-full bg-cyan-glow/15 px-5 py-3 text-lg tracking-wide text-cyan-glow transition hover:bg-cyan-glow/25 sm:px-7"
        >
          {t.registry}
        </a>
      </div>
    </motion.nav>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile hamburger button + bottom sheet.                           */
/* ------------------------------------------------------------------ */
function MobileNav() {
  const hasEntered = useSceneStore((state) => state.hasEntered);
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const t = useT();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: hasEntered ? 1 : 0, y: hasEntered ? 0 : 12 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: hasEntered ? 0.6 : 0 }}
        className="fixed inset-x-0 bottom-[calc(6.5rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-6 sm:hidden"
        aria-hidden={!hasEntered}
        inert={!hasEntered}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-haspopup="dialog"
          className="pointer-events-auto flex h-24 w-24 items-center justify-center rounded-full border border-ink/10 bg-void/70 text-ink/80 shadow-sm backdrop-blur-md transition hover:bg-void/90 hover:text-ink"
        >
          <Menu size={44} aria-hidden="true" />
        </button>
      </motion.div>

      <MobileNavSheet open={open} onClose={close} t={t} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Bottom sheet contents — locale row + four full-text nav items.    */
/* ------------------------------------------------------------------ */
function MobileNavSheet({
  open,
  onClose,
  t,
}: {
  open: boolean;
  onClose: () => void;
  t: ReturnType<typeof useT>;
}) {
  const locale = useSceneStore((state) => state.locale);
  const setLocale = useSceneStore((state) => state.setLocale);
  const openStory = useSceneStore((state) => state.openStory);
  const openCeremony = useSceneStore((state) => state.openCeremony);
  const openThrowbacks = useSceneStore((state) => state.openThrowbacks);
  const trapRef = useFocusTrap<HTMLDivElement>(open);

  useEscapeKey(onClose, open);

  // Close the sheet *before* opening the destination panel so the focus
  // restoration in useFocusTrap doesn't fight with the panel's own focus
  // management.
  const handleStory = () => {
    onClose();
    openStory();
  };
  const handleCeremony = () => {
    onClose();
    openCeremony();
  };
  const handleThrowbacks = () => {
    onClose();
    openThrowbacks();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="pointer-events-auto fixed inset-0 z-50 sm:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-void/70 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            ref={trapRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-x-0 bottom-0 flex flex-col rounded-t-2xl border-t border-ink/10 bg-void/95 shadow-2xl backdrop-blur-md"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 6.5rem)' }}
          >
            {/* Drag handle + close */}
            <div className="relative flex items-center justify-center pt-3">
              <span
                aria-hidden="true"
                className="h-1 w-10 rounded-full bg-ink/20"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label={t.close}
                className="absolute right-3 top-2 rounded-full p-2 text-ink/50 transition hover:bg-ink/8 hover:text-ink"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Locale toggle */}
            <div className="px-5 pt-4">
              <div className="flex items-center justify-center gap-1.5 rounded-full border border-ink/10 bg-void/60 px-3 py-1.5">
                <button
                  type="button"
                  onClick={() => setLocale('en')}
                  aria-label={t.switchToEnglish}
                  aria-pressed={locale === 'en'}
                  className={`text-sm tracking-wide transition-opacity ${
                    locale === 'en'
                      ? 'font-semibold opacity-100'
                      : 'opacity-40 hover:opacity-70'
                  }`}
                >
                  {locale === 'en' ? 'English' : 'Engelsk'}
                </button>
                <span aria-hidden="true" className="text-sm text-ink/40">
                  /
                </span>
                <button
                  type="button"
                  onClick={() => setLocale('no')}
                  aria-label={t.switchToNorwegian}
                  aria-pressed={locale === 'no'}
                  className={`text-sm tracking-wide transition-opacity ${
                    locale === 'no'
                      ? 'font-semibold opacity-100'
                      : 'opacity-40 hover:opacity-70'
                  }`}
                >
                  Norsk
                </button>
              </div>
            </div>

            {/* Nav items */}
            <nav className="flex flex-col gap-1.5 px-4 pb-5 pt-4">
              <SheetItem onClick={handleStory} icon={<BookHeart size={20} aria-hidden="true" />}>
                {t.ourStory}
              </SheetItem>
              <SheetItem onClick={handleCeremony} icon={<Sparkles size={20} aria-hidden="true" />}>
                {t.ceremony}
              </SheetItem>
              <SheetItem
                onClick={handleThrowbacks}
                icon={<Images size={20} aria-hidden="true" />}
              >
                {t.throwbacks}
              </SheetItem>
              <a
                href={GIFT_LINKS.honeyfund}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex items-center gap-3 rounded-2xl bg-cyan-glow/15 px-4 py-4 text-lg tracking-wide text-cyan-glow transition hover:bg-cyan-glow/25"
              >
                <Gift size={20} aria-hidden="true" />
                <span>{t.registry}</span>
              </a>
            </nav>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SheetItem({
  onClick,
  icon,
  children,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-lg tracking-wide text-ink/85 transition hover:bg-ink/8"
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}
