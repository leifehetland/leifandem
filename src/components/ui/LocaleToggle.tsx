'use client';

import { useEffect } from 'react';

import { useT } from '@/hooks/useT';
import { useSceneStore } from '@/stores/sceneStore';

/**
 * Fixed top-left locale switcher.
 *
 * Renders 🇬🇧 / 🇳🇴 — the active flag is full opacity, the inactive one is
 * dimmed. Also syncs document.documentElement.lang so screen readers announce
 * the correct language.
 */
export function LocaleToggle() {
  const locale = useSceneStore((state) => state.locale);
  const setLocale = useSceneStore((state) => state.setLocale);
  const t = useT();

  useEffect(() => {
    document.documentElement.lang = locale === 'no' ? 'nb' : 'en';
  }, [locale]);

  return (
    <div className="pointer-events-auto fixed left-4 top-4 z-30 flex items-center gap-1.5 rounded-full border border-ink/10 bg-void/70 px-3 py-1.5 shadow-sm backdrop-blur-md">
      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-label={t.switchToEnglish}
        aria-pressed={locale === 'en'}
        className={`text-sm tracking-wide transition-opacity ${locale === 'en' ? 'font-semibold opacity-100' : 'opacity-35 hover:opacity-60'}`}
      >
        {locale === 'en' ? 'English' : 'Engelsk'}
      </button>
      <span className="text-sm text-ink/40">/</span>
      <button
        type="button"
        onClick={() => setLocale('no')}
        aria-label={t.switchToNorwegian}
        aria-pressed={locale === 'no'}
        className={`text-sm tracking-wide transition-opacity ${locale === 'no' ? 'font-semibold opacity-100' : 'opacity-35 hover:opacity-60'}`}
      >
        Norsk
      </button>
    </div>
  );
}
