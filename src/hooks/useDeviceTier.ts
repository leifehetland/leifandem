'use client';

import { useEffect } from 'react';

import { useSceneStore } from '@/stores/sceneStore';
import type { DeviceTier } from '@/types';

/**
 * Picks a device tier once on mount and writes it to the store.
 * See SPECS.md §4 for the full decision table; this implementation
 * covers the common cases plus a `?tier=` URL override for testing.
 */
export function useDeviceTier(): DeviceTier {
  const tier = useSceneStore((state) => state.tier);
  const setTier = useSceneStore((state) => state.setTier);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const override = params.get('tier');
    if (override === 'high' || override === 'mid' || override === 'low') {
      setTier(override);
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTier('low');
      return;
    }

    const probe = document.createElement('canvas').getContext('webgl2');
    if (!probe) {
      setTier('low');
      return;
    }

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const cores = navigator.hardwareConcurrency ?? 8;
    // `navigator.deviceMemory` is a non-standard but widely-shipped API.
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

    if (isMobile || cores <= 4 || memory <= 4) {
      setTier('mid');
    } else {
      setTier('high');
    }
  }, [setTier]);

  return tier;
}
