import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { DeviceTier } from '@/types';

/**
 * Shared state across the canvas/HTML boundary.
 * See SPECS.md §3 for the canonical shape.
 */
interface SceneStore {
  // Focused state
  focusedCardId: string | null;
  setFocusedCard: (id: string | null) => void;

  // Panel state
  isStoryOpen: boolean;
  isGiftsOpen: boolean;
  isCeremonyOpen: boolean;
  isThrowbacksOpen: boolean;
  openStory: () => void;
  closeStory: () => void;
  openGifts: () => void;
  closeGifts: () => void;
  openCeremony: () => void;
  closeCeremony: () => void;
  openThrowbacks: () => void;
  closeThrowbacks: () => void;

  // Audio
  isMuted: boolean;
  toggleMute: () => void;
  currentAudioId: string | null;
  playAudio: (id: string) => void;
  stopAudio: () => void;

  // Lifecycle
  hasEntered: boolean;
  setHasEntered: (v: boolean) => void;

  // Device tier (set once at boot)
  tier: DeviceTier;
  setTier: (t: DeviceTier) => void;
}

type PersistedFields = Pick<SceneStore, 'isMuted' | 'tier'>;

/**
 * Persist only `isMuted` and `tier` to sessionStorage — per SPECS.md §3.
 *
 * `createJSONStorage` wraps the getter in try/catch, so a ReferenceError on
 * the server returns `undefined` and persist skips storage safely. The
 * explicit `typeof window` guard below makes the intent unambiguous and
 * avoids any edge-case differences across Zustand releases.
 */
export const useSceneStore = create<SceneStore>()(
  persist(
    (set) => ({
      focusedCardId: null,
      setFocusedCard: (id) => set({ focusedCardId: id }),

      isStoryOpen: false,
      isGiftsOpen: false,
      isCeremonyOpen: false,
      isThrowbacksOpen: false,
      openStory: () => set({ isStoryOpen: true }),
      closeStory: () => set({ isStoryOpen: false }),
      openGifts: () => set({ isGiftsOpen: true }),
      closeGifts: () => set({ isGiftsOpen: false }),
      openCeremony: () => set({ isCeremonyOpen: true }),
      closeCeremony: () => set({ isCeremonyOpen: false }),
      openThrowbacks: () => set({ isThrowbacksOpen: true }),
      closeThrowbacks: () => set({ isThrowbacksOpen: false }),

      isMuted: true,
      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
      currentAudioId: null,
      playAudio: (id) => set({ currentAudioId: id }),
      stopAudio: () => set({ currentAudioId: null }),

      hasEntered: false,
      setHasEntered: (v) => set({ hasEntered: v }),

      tier: 'high',
      setTier: (t) => set({ tier: t }),
    }),
    {
      name: 'wedding-splash:scene',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : (undefined as unknown as Storage)
      ),
      partialize: (state): PersistedFields => ({
        isMuted: state.isMuted,
        tier: state.tier,
      }),
    },
  ),
);
