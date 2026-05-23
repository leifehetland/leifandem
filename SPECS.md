# Wedding Splash — Technical Specs

Companion to `CLAUDE.md` (operating rules) and `REQUIREMENTS.md` (product). This file is the source of truth for technical decisions: data shapes, component contracts, tier definitions, and asset formats.

---

## 1. Architecture overview

```
                ┌─────────────────────────────────────────┐
                │              page.tsx                    │
                │  ┌────────────────────────────────────┐  │
                │  │  <LoadingScreen />  (tap to enter) │  │
                │  └────────────────────────────────────┘  │
                │  ┌────────────────────────────────────┐  │
                │  │  HTML overlays (Tailwind/Framer)   │  │
                │  │  - Hero, AudioToggle, buttons      │  │
                │  │  - StoryPanel, GiftModal,          │  │
                │  │    FocusedCardModal                │  │
                │  └────────────────────────────────────┘  │
                │  ┌────────────────────────────────────┐  │
                │  │       <Canvas>  (R3F)              │  │
                │  │   ┌──────────────────────────────┐ │  │
                │  │   │ <Scene />                    │ │  │
                │  │   │  - CameraRig                 │ │  │
                │  │   │  - ParticleField             │ │  │
                │  │   │  - LightStreaks              │ │  │
                │  │   │  - PhotoCard × N             │ │  │
                │  │   │  - VideoCard × N             │ │  │
                │  │   │  - AudioOrb × N              │ │  │
                │  │   │  - Effects (Bloom etc.)      │ │  │
                │  │   └──────────────────────────────┘ │  │
                │  └────────────────────────────────────┘  │
                └─────────────────────────────────────────┘
                                    │
                                    ▼
                ┌─────────────────────────────────────────┐
                │   sceneStore (Zustand) — bridges both    │
                └─────────────────────────────────────────┘
```

The `<Canvas>` is dynamically imported with `next/dynamic({ ssr: false })` so it never ships in the initial bundle and never tries to render on the server.

---

## 2. Media manifest schema

`src/lib/media-manifest.ts`

```ts
export type MediaPosition = [x: number, y: number, z: number];
export type MediaRotation = [x: number, y: number, z: number];

export type MediaItem =
  | PhotoItem
  | VideoItem
  | AudioItem;

interface BaseItem {
  id: string;                // kebab-case, unique
  caption: string;           // shown in focused modal
  alt: string;               // accessibility, screen readers
  position: MediaPosition;   // world-space coordinates
  rotation?: MediaRotation;  // optional initial rotation
  scale?: number;            // default 1
  tier?: 'all' | 'mid+' | 'high'; // visibility per device tier
}

export interface PhotoItem extends BaseItem {
  type: 'photo';
  src: string;               // /media/images/foo.webp
  width: number;             // intrinsic pixel width
  height: number;            // intrinsic pixel height
}

export interface VideoItem extends BaseItem {
  type: 'video';
  src: string;               // /media/videos/foo.mp4
  poster: string;            // /media/images/foo-poster.webp (shown until video loads)
  hasAudio: boolean;         // whether to unmute in focused modal
}

export interface AudioItem extends BaseItem {
  type: 'audio';
  src: string;               // /media/audio/foo.mp3
  label: string;             // displayed on the orb's tooltip
  duration: number;          // seconds, used for scrubber
  color?: string;            // hex; orb tint, default cyan
}

export const mediaItems: readonly MediaItem[] = [
  // ...
];
```

**Position guidelines:** the camera looks down -Z from `[0, 0, 8]`. Cards should be in roughly `x: [-5, 5]`, `y: [-3, 3]`, `z: [-3, 3]`. The focal point of the particle flow is `[3, 0, 0]` (slight right-of-center to match the reference image).

---

## 3. Zustand store shape

`src/stores/sceneStore.ts`

```ts
interface SceneStore {
  // Focused state
  focusedCardId: string | null;
  setFocusedCard: (id: string | null) => void;

  // Panel state
  isStoryOpen: boolean;
  isGiftsOpen: boolean;
  openStory: () => void;
  closeStory: () => void;
  openGifts: () => void;
  closeGifts: () => void;

  // Audio
  isMuted: boolean;
  toggleMute: () => void;
  currentAudioId: string | null;       // which audio card is playing
  playAudio: (id: string) => void;
  stopAudio: () => void;

  // Lifecycle
  hasEntered: boolean;                 // true after loading-screen tap
  setHasEntered: (v: boolean) => void;

  // Device tier (set once at boot)
  tier: 'high' | 'mid' | 'low';
  setTier: (t: 'high' | 'mid' | 'low') => void;
}
```

Persist `isMuted` and `tier` to `sessionStorage`. Do not persist any other fields.

---

## 4. Device tier definitions

`src/hooks/useDeviceTier.ts` returns `'high' | 'mid' | 'low'` based on:

1. WebGL2 support (no support → `low`)
2. `navigator.hardwareConcurrency` (≤ 4 → `mid` ceiling)
3. `navigator.deviceMemory` if available (≤ 4 GB → `mid` ceiling)
4. `prefers-reduced-motion: reduce` → `low` (forced)
5. User-agent mobile flag (mobile → `mid` ceiling)
6. URL override `?tier=high|mid|low` for testing

| Setting | High | Mid | Low |
|---|---|---|---|
| Canvas rendered? | Yes | Yes | **No** — 2D fallback |
| Particle count | 5000 | 1500 | n/a |
| Light streak count | 60 | 20 | n/a |
| Postprocessing | Bloom + CA + Vignette | Bloom only | n/a |
| Bloom mipmap blur | Yes | Yes | n/a |
| Canvas DPR | min(devicePixelRatio, 2) | 1.5 | n/a |
| Shadow maps | No | No | n/a |
| Camera parallax | Yes | Yes | No |
| Card drift animation | Yes | Yes (slower) | No |
| Audio reactivity | Yes | No | No |
| Video card playback | Yes | First frame only until focused | Static poster |

The low-tier fallback is a CSS grid of static photo cards with the same modal interactions for focus, plus the story panel and gift modal. It is a real first-class experience, not an apology.

---

## 5. Component specs

### 5.1 Scene components (inside `<Canvas>`)

**`Scene.tsx`**
- Root of the 3D scene
- Loads the media manifest, filters by current tier, maps to card components
- Suspense boundary inside; loading fallback is a single black plane
- Mounts `CameraRig`, `ParticleField`, `LightStreaks`, `Effects`

**`CameraRig.tsx`**
- Drei `<PerspectiveCamera>` at `[0, 0, 8]`, fov 50
- Uses `usePointerParallax` hook to offset camera position by up to ±0.5 units on x/y based on pointer
- Smoothed with damping (lerp factor ~0.08)
- Disabled when tier is low or reduced-motion is set

**`ParticleField.tsx`**
- Instanced points with additive blending, vertex colors
- Custom shader from `src/lib/shaders/particle.{vert,frag}`
- Each particle has a per-instance lifetime; respawns near the focal point
- Count driven by tier

**`LightStreaks.tsx`**
- Catmull-Rom curves with `MeshLine` (or `TubeGeometry` if MeshLine bundle cost is a problem)
- Emanate from the focal point outward
- Animated by shifting UV coords along the tube
- Count driven by tier

**`PhotoCard.tsx`**
- Props: `item: PhotoItem`
- Plane geometry sized to aspect ratio of source image
- Texture loaded via Drei `useTexture` (handles disposal)
- Slight `meshStandardMaterial` emissive on the border, transparent center
- Hover/focus state managed via local state + store
- Drift animation: gentle sine on rotation + translation
- Invisible hit collider 1.5× the visible plane size for easier tapping

**`VideoCard.tsx`**
- Same as PhotoCard but texture is a `VideoTexture`
- Until focused, video is paused on the poster frame (mobile data conservation)
- On focus modal open, video plays unmuted (if `hasAudio`)

**`AudioOrb.tsx`**
- Icosphere geometry with custom emissive shader
- Bloom intensity tied to current audio amplitude (if reactivity enabled)
- Tooltip label appears on hover/long-press
- Color from `item.color` or store-default cyan

**`Effects.tsx`**
- `EffectComposer` with passes conditional on tier:
  - High: `Bloom` (intensity 1.5, threshold 0.4, mipmapBlur) + `ChromaticAberration` (offset 0.0005) + `Vignette` (offset 0.5, darkness 0.6)
  - Mid: `Bloom` only, intensity 1.2

### 5.2 UI components (outside `<Canvas>`)

**`LoadingScreen.tsx`**
- Full-screen, dark background, centered "Tap to enter" CTA
- Couple names visible above the CTA
- After tap: starts asset preloading, shows progress bar, sets `hasEntered: true` once ready
- Fades out over 800 ms

**`Hero.tsx`**
- Fixed top, couple names + wedding date
- Pointer-events: none except on its own contents
- Subtle text-shadow glow for legibility over the canvas

**`StoryPanel.tsx`**
- Right-side slide-in panel (desktop, max-width 480 px) or full-screen takeover (mobile, < 768 px)
- Renders `story.mdx` via `next-mdx-remote` or static MDX import
- Close button top-right, ESC support, focus trap while open

**`GiftModal.tsx`**
- Centered modal, max-width 520 px, blurred backdrop
- One CTA as a button: Honeyfund
- Short prose between them (editable in `constants.ts`)
- Close on background tap, ESC, or close button

**`FocusedCardModal.tsx`**
- Driven by `focusedCardId` in the store
- Centered, with the full-res media, caption, and (for video/audio) playback controls
- Backdrop dims the canvas to 30% opacity (CSS, not by touching the canvas)
- Close on background tap, ESC, swipe-down (mobile)

**`AudioToggle.tsx`**
- Fixed bottom-right, 44x44 px tap target
- Speaker icon (lucide-react); state from `isMuted`

**`WebGLFallback.tsx`**
- Used when tier is `low`
- CSS grid of cards, each opens the same `FocusedCardModal`
- Same Hero, Story, Gifts buttons

---

## 6. Asset specs

### Photos
- **Format:** `.webp`, quality 80
- **Max dimensions:** 1024 px on long edge (textures don't need to be bigger; they're displayed small)
- **Aspect ratios:** any, just record them accurately in the manifest
- **File size target:** < 150 kB each
- **Naming:** kebab-case matching the manifest `id`, e.g. `first-date.webp`

### Videos
- **Format:** `.mp4`, H.264 + AAC
- **Resolution:** 720p max, 1080p only if essential
- **Length:** ≤ 10 seconds (loops cleanly)
- **Bitrate:** ~2 Mbps
- **File size target:** < 3 MB each
- **Poster:** matching `.webp` at same aspect

### Audio
- **Format:** `.mp3`, 128 kbps mono
- **Length:** ≤ 15 seconds per clip
- **Loudness:** normalized to -16 LUFS
- **File size target:** < 250 kB each

### Background music (optional)
- **Format:** `.mp3`, 128 kbps stereo
- **Length:** ≥ 60 seconds, must loop seamlessly (use a crossfade tool)
- **Loudness:** -20 LUFS (sits below voice clips)
- **License:** must be cleared (royalty-free or owned). No commercial tracks.

### Textures
- Particle sprite: 64×64 px PNG with alpha, soft circular gradient

---

## 7. Shaders

`src/lib/shaders/particle.vert`
- Reads instance `position`, `velocity`, `lifetime`, `color` attributes
- Outputs varying for color and alpha based on lifetime

`src/lib/shaders/particle.frag`
- Samples the particle sprite texture
- Multiplies by varying color
- Premultiplied alpha for clean additive blending

Keep shaders short. If a shader exceeds ~50 lines either side, refactor or reconsider — Three.js built-in materials with `onBeforeCompile` injection may be simpler.

---

## 8. Routing and layout

- Single route: `/`
- All content on one page
- No client-side routing, no dynamic segments
- `app/layout.tsx` sets `lang`, fonts, and OG metadata

---

## 9. Dependencies (target versions)

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "three": "^0.170.0",
    "@react-three/fiber": "^9.0.0",
    "@react-three/drei": "^10.0.0",
    "@react-three/postprocessing": "^3.0.0",
    "postprocessing": "^6.36.0",
    "zustand": "^5.0.0",
    "howler": "^2.2.4",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.400.0",
    "next-mdx-remote": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/three": "^0.170.0",
    "@types/howler": "^2.2.0",
    "tailwindcss": "^4.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.3.0",
    "@next/bundle-analyzer": "^15.0.0"
  }
}
```

Lock these in `package.json` and `package-lock.json`. Bump deliberately, not casually.

---

## 10. Build order (recommended)

Phase 1 — foundations
1. Next.js + TypeScript + Tailwind scaffold, deploy to Vercel
2. Constants file with placeholder couple names, date, gift URLs
3. Hero + LoadingScreen + GiftModal (no canvas yet)
4. Verify OG tags unfurling on iMessage/WhatsApp

Phase 2 — scene
5. Add Canvas with one rotating cube, dynamically imported
6. ParticleField with bloom postprocessing — get the *look* before anything else
7. CameraRig with pointer parallax

Phase 3 — content
8. Media manifest schema + 3 placeholder photo cards
9. PhotoCard component with hover and focus modal
10. VideoCard variant
11. AudioOrb variant + Howler integration

Phase 4 — polish and edge cases
12. Device tier detection + low-tier 2D fallback
13. StoryPanel with MDX
14. Reduced-motion path
15. Accessibility pass (keyboard, screen reader, contrast)
16. Lighthouse pass, bundle analysis, asset compression
17. Real content swap-in, launch checklist

---

## 11. Testing approach

This is a small project; full unit test coverage is overkill. The expected testing is:

- **Type checks** via `tsc --noEmit` in CI
- **Lint** via ESLint in CI
- **Visual / manual** verification on:
  - Chrome desktop
  - Safari iOS (real device preferred, simulator acceptable)
  - Firefox desktop
  - One Android Chrome device
  - With `prefers-reduced-motion` enabled
  - With WebGL disabled (DevTools → Rendering → Disable WebGL)
- **Lighthouse mobile run** before launch, must hit performance budget

No Jest, no Playwright, unless a regression repeatedly bites.

---

## 12. Open questions for the couple

These need answers before launch but build can proceed with placeholders:

- Final Honeyfund URL
- Final story prose
- Final media selections (12–20 photos, 2–4 videos, 0–3 audio clips)
- Background music: yes/no, and which track if yes
- Custom domain (e.g. `firstname-and-firstname.com`) or default Vercel domain
- Whether to enable Vercel Web Analytics
