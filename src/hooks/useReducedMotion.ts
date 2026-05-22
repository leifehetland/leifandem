'use client';

import { useEffect, useState } from 'react';

/**
 * Reflects the `prefers-reduced-motion: reduce` media query.
 * Returns `false` on the server / before hydration so transitions
 * start enabled and downgrade once we know the user's preference.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}
