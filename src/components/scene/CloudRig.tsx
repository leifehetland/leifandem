'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { useReducedMotion } from '@/hooks/useReducedMotion';

import { Cards } from './Cards';

/** Radians per frame auto-rotation on Y — one full revolution ≈ 175 s at 60 fps. */
const AUTO_SPEED = 0.0006;
/** Radians per frame added when a direction key is held. */
const KEY_SPEED = 0.012;
/** Maximum X-axis tilt in either direction (45°). */
const MAX_TILT = Math.PI / 4;

/**
 * Wraps the card cloud in a rotating group.
 *
 * - Auto-rotates slowly on Y so back-row cards drift into view naturally.
 *   Disabled when prefers-reduced-motion is set.
 * - WASD / arrow keys let visitors manually spin (Y) and tilt (X) the cloud
 *   to bring any card into view.
 * - X tilt is clamped to ±45° so the cloud never flips upside-down.
 * - Key state lives in a ref (not useState) to avoid React re-renders on
 *   every keydown event.
 */
export function CloudRig() {
  const groupRef = useRef<THREE.Group>(null);
  const keys = useRef<Set<string>>(new Set());
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      // Prevent arrow keys from scrolling the page while interacting with the scene.
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      keys.current.add(e.key);
    };
    const onUp = (e: KeyboardEvent) => keys.current.delete(e.key);

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
    };
  }, []);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    const k = keys.current;
    // Base auto-rotation; suppressed when the user prefers reduced motion.
    let dy = reducedMotion ? 0 : AUTO_SPEED;
    let dx = 0;

    if (k.has('a') || k.has('A') || k.has('ArrowLeft'))  dy -= KEY_SPEED;
    if (k.has('d') || k.has('D') || k.has('ArrowRight')) dy += KEY_SPEED;
    if (k.has('w') || k.has('W') || k.has('ArrowUp'))    dx -= KEY_SPEED;
    if (k.has('s') || k.has('S') || k.has('ArrowDown'))  dx += KEY_SPEED;

    group.rotation.y += dy;
    group.rotation.x = THREE.MathUtils.clamp(
      group.rotation.x + dx,
      -MAX_TILT,
      MAX_TILT,
    );
  });

  return (
    <group ref={groupRef}>
      <Cards />
    </group>
  );
}
