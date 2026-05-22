'use client';

import { useEffect } from 'react';

/**
 * Calls `onEscape` when the user presses Escape, but only while `active`.
 * Used by every modal/panel to keep their close logic identical.
 */
export function useEscapeKey(onEscape: () => void, active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [active, onEscape]);
}
