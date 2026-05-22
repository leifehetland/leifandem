/**
 * Canonical media manifest. The 3D scene and the 2D fallback both map over
 * this list — components do not hardcode `/media/...` paths.
 *
 * To add a memory: append an entry below.
 * To rearrange the layout: edit `position`.
 *
 * Schema is from SPECS.md §2.
 */

export type MediaPosition = [x: number, y: number, z: number];
export type MediaRotation = [x: number, y: number, z: number];

interface BaseItem {
  /** kebab-case, unique within the manifest */
  id: string;
  /** Shown in the focused-card modal. */
  caption: string;
  /** Alt text for screen readers and the 2D fallback. */
  alt: string;
  /** World-space coordinates. Camera looks down -Z from [0,0,8]. */
  position: MediaPosition;
  rotation?: MediaRotation;
  scale?: number;
  /** Visibility per device tier. Defaults to `'all'`. */
  tier?: 'all' | 'mid+' | 'high';
}

export interface PhotoItem extends BaseItem {
  type: 'photo';
  /** e.g. /media/images/first-date.webp */
  src: string;
  width: number;
  height: number;
}

export interface VideoItem extends BaseItem {
  type: 'video';
  /** e.g. /media/videos/proposal.mp4 */
  src: string;
  /** Poster image shown until the video texture loads. */
  poster: string;
  /** Whether the focused modal should unmute the video. */
  hasAudio: boolean;
}

export interface AudioItem extends BaseItem {
  type: 'audio';
  /** e.g. /media/audio/voicemail.mp3 */
  src: string;
  label: string;
  /** Seconds — used by the focused-modal scrubber. */
  duration: number;
  /** Hex tint for the orb. Defaults to PALETTE.cyan. */
  color?: string;
}

export type MediaItem = PhotoItem | VideoItem | AudioItem;

/**
 * Placeholder content for Phase 3 development.
 *
 * TODO before launch:
 *   - Replace each `src` with a local `/media/images/*.webp` path.
 *   - Tune `position` per the real card layout from the reference image.
 *   - Update `caption` and `alt` with the real story for each photo.
 *
 * Picsum URLs are stable, CORS-friendly, and let the scene render real
 * imagery during build. They are NOT acceptable for production.
 */
export const mediaItems: readonly MediaItem[] = [
  {
    id: 'placeholder-1',
    type: 'photo',
    src: 'https://picsum.photos/seed/leifem-1/640/800',
    width: 640,
    height: 800,
    caption: 'Placeholder — replace with a real moment from us.',
    alt: 'Placeholder portrait, vertical aspect.',
    position: [-3.6, 1.2, 0.4],
    rotation: [0, 0.22, 0.04],
    scale: 1,
  },
  {
    id: 'placeholder-2',
    type: 'photo',
    src: 'https://picsum.photos/seed/leifem-2/720/540',
    width: 720,
    height: 540,
    caption: 'Placeholder — replace with a real moment from us.',
    alt: 'Placeholder landscape, horizontal aspect.',
    position: [-1.6, -1.4, 1.2],
    rotation: [0, 0.1, -0.05],
    scale: 1.05,
  },
  {
    id: 'placeholder-3',
    type: 'photo',
    src: 'https://picsum.photos/seed/leifem-3/640/640',
    width: 640,
    height: 640,
    caption: 'Placeholder — replace with a real moment from us.',
    alt: 'Placeholder square format.',
    position: [-3.8, -0.6, -0.6],
    rotation: [0, 0.18, 0.02],
    scale: 0.95,
  },
  {
    id: 'placeholder-4',
    type: 'photo',
    src: 'https://picsum.photos/seed/leifem-4/540/720',
    width: 540,
    height: 720,
    caption: 'Placeholder — replace with a real moment from us.',
    alt: 'Placeholder portrait, slightly off-center.',
    position: [-2.2, 0.6, -1.2],
    rotation: [0, 0.12, -0.03],
    scale: 0.9,
  },
];
