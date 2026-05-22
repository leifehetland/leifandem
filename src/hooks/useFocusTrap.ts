'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Minimal focus trap. While `active`:
 *   - Saves the previously-focused element and restores it on close.
 *   - Moves focus to the first focusable child of the trap container.
 *   - Wraps Tab / Shift-Tab between first and last focusable elements.
 *
 * Attach the returned ref to the dialog content container.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  active: boolean,
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hasAttribute('aria-hidden'),
      );

    // Focus the first element so keyboard users start inside the dialog.
    const initial = focusables()[0];
    initial?.focus();

    const handler = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const list = focusables();
      if (list.length === 0) {
        event.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      if (!first || !last) return;

      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey && (active === first || !container.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container.addEventListener('keydown', handler);
    return () => {
      container.removeEventListener('keydown', handler);
      previouslyFocused?.focus?.();
    };
  }, [active]);

  return ref;
}
