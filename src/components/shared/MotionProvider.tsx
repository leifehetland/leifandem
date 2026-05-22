'use client';

import { MotionConfig } from 'framer-motion';

/**
 * Wraps the app so every framer-motion component honors the user's
 * `prefers-reduced-motion` OS setting. Transforms are disabled when set;
 * opacity transitions still work, which is what we want for fades.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
