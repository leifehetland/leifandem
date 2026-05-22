/**
 * Shared types used in 2+ files.
 *
 * Media item shapes live in `src/lib/media-manifest.ts` and are re-exported
 * here so consumers can import everything from `@/types`.
 */

export type {
  MediaItem,
  MediaPosition,
  MediaRotation,
  PhotoItem,
  VideoItem,
  AudioItem,
} from '@/lib/media-manifest';

export type DeviceTier = 'high' | 'mid' | 'low';
