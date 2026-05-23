import { translations } from '@/lib/i18n';
import { useSceneStore } from '@/stores/sceneStore';

/**
 * Returns the translation object for the current locale.
 * Drop-in replacement for hardcoded strings in client components.
 *
 * @example
 * const t = useT();
 * return <button>{t.close}</button>;
 */
export function useT() {
  const locale = useSceneStore((state) => state.locale);
  return translations[locale];
}
