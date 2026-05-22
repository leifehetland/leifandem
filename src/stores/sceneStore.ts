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
  isGalleryOpen: boolean;
  openStory: () => void;
  closeStory: () => void;
  openGifts: () => void;
  closeGifts: () => void;
  openGallery: () => void;
  closeGallery: () => void;

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
 */
export const useSceneStore = create<SceneStore>()(
  persist(
    (set) => ({
      focusedCardId: null,
      setFocusedCard: (id) => set({ focusedCardId: id }),

      isStoryOpen: false,
      isGiftsOpen: false,
      isGalleryOpen: false,
      openStory: () => set({ isStoryOpen: true }),
      closeStory: () => set({ isStoryOpen: false }),
      openGifts: () => set({ isGiftsOpen: true }),
      closeGifts: () => set({ isGiftsOpen: false }),
      openGallery: () => set({ isGalleryOpen: true }),
      closeGallery: () => set({ isGalleryOpen: false }),

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
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state): PersistedFields => ({
        isMuted: state.isMuted,
        tier: state.tier,
      }),
    },
  ),
);
