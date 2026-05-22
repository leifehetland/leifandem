'use client';

import { useEffect, useRef } from 'react';

export interface PointerParallax {
  /** -1..1, left to right */
  x: number;
  /** -1..1, bottom to top (screen-y is inverted) */
  y: number;
}

/**
 * Mutable pointer-parallax target. Updates a ref each pointermove so callers
 * can read the latest value inside `useFrame` without triggering re-renders.
 *
 * On touch devices that don't emit pointermove (older iOS) this stays at 0,0
 * which is fine — the rig just sits still.
 */
export function usePointerParallax(): PointerParallax {
  const ref = useRef<PointerParallax>({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (event: PointerEvent) => {
      ref.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      ref.current.y = -((event.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener('pointermove', handler, { passive: true });
    return () => window.removeEventListener('pointermove', handler);
  }, []);

  return ref.current;
}
