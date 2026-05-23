# CLAUDE.md

Agent operating guide for the Wedding Splash project. Read this first before making changes.

---

## What this is

A single-page wedding announcement site with an interactive 3D photo/video/audio gallery inspired by *Child of Eden*. Visitors land, explore floating media cards in a glowing particle field, read the couple's story, browse the Ceremony and Throwbacks photo grids, and click through to the Honeyfund gift link. The site must work on phones, look intentional, and feel magical rather than templated.

Pair this file with `REQUIREMENTS.md` (product) and `SPECS.md` (technical detail).

---

## Stack

- **Next.js 15** — App Router, TypeScript strict
- **React Three Fiber** + `@react-three/drei` + `@react-three/postprocessing`
- **Tailwind CSS v4** for 2D overlays
- **Zustand** for shared state across the canvas/HTML boundary
- **Howler.js** for audio playback
- **Framer Motion** for HTML overlay transitions
- **MDX** for the couple's story copy
- Deployment target: **Vercel**

Node version: 20.x LTS. Use `npm`, not `pnpm` or `yarn` (lockfile consistency).

---

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server on :3000 |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier write |

Before declaring any task complete, run `npm run typecheck && npm run lint && npm run build`. Do not commit if any of those fail.

---

## Folder map

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # root layout, OG tags, fonts
│   ├── page.tsx            # the only route
│   ├── globals.css         # Tailwind + tiny custom layer
│   └── opengraph-image.tsx # dynamic OG image
├── components/
│   ├── scene/              # everything that renders inside <Canvas>
│   ├── ui/                 # HTML overlays (outside <Canvas>)
│   └── shared/             # primitives reused by both
├── hooks/                  # custom React hooks
│   ├── useAudio.ts
│   ├── useDeviceTier.ts
│   ├── useReducedMotion.ts
│   └── usePointerParallax.ts
├── stores/
│   └── sceneStore.ts       # Zustand: focused card, audio state, panels
├── lib/
│   ├── media-manifest.ts   # canonical list of all media items
│   ├── constants.ts        # names, date, gift URLs, colors
│   ├── shaders/            # GLSL for particles
│   └── utils.ts
├── content/
│   └── story.mdx           # the couple's narrative
└── types/
    └── index.ts            # shared types

public/
└── media/
    ├── images/             # webp, max 1024px on the long edge
    ├── videos/             # mp4 h.264, muted-autoplay safe
    ├── audio/              # mp3, normalized
    ├── textures/           # particle sprites, bokeh
    └── models/             # .glb if any
```

---

## Architectural rules

### 1. The Canvas / HTML boundary

React Three Fiber components inside `<Canvas>` **cannot** render HTML elements. No `<div>`, no Tailwind classes inside scene components. HTML overlays live in `src/components/ui/` and render *outside* `<Canvas>`, layered above it with `position: fixed` / `z-index`.

The two worlds communicate **only** through the Zustand store. When a `PhotoCard` in the scene is clicked, it calls `setFocusedCard(id)`. The HTML modal reads `focusedCard` from the store and renders. Never try to bridge this gap any other way.

### 2. Media manifest is the source of truth

All photo, video, and audio entries live in `src/lib/media-manifest.ts`. Scene components map over this manifest; they do not hardcode paths or captions. To add a memory: append an entry. To remove one: delete the entry. To rearrange the scene layout: edit the `position` fields in the manifest.

Never hardcode `/media/...` paths in components.

### 3. Device tiering

`useDeviceTier()` returns `'high' | 'mid' | 'low'`. Tier governs:

- particle count
- postprocessing passes
- canvas DPR
- whether to render `<Canvas>` at all

Low tier falls back to a 2D CSS-animated layout. Always test changes at all three tiers (the hook accepts an override for local testing).

### 4. Site copy lives in constants/MDX, not JSX

Couple names, wedding date, link URLs → `src/lib/constants.ts`.
The narrative story → `src/content/story.mdx`.
Card captions/alt text → in each manifest entry.

A non-developer should be able to update content by editing these three files without touching React code.

---

## Conventions

- **TypeScript strict.** No `any` without a `// reason:` comment.
- **Component files:** PascalCase, one component per file, named export matching the filename.
- **Hooks:** camelCase, prefixed `use`, in `src/hooks/`.
- **Imports:** absolute via `@/` alias (configured in `tsconfig.json`).
- **Styling:** Tailwind utility classes preferred. Custom CSS only in `globals.css` or via CSS Modules for one-off animations.
- **Three.js objects:** always `dispose()` geometries/materials/textures in cleanup. Use Drei's `useTexture` + `useGLTF` which handle this for you.

---

## Performance budget

- Initial JS bundle (gzipped, excluding Three.js chunk): **< 200 kB**
- Three.js chunk is dynamically imported, not in the initial bundle
- **LCP** on mid-tier mobile (throttled 4G, Moto G4-class CPU): **< 2.5 s**
- Sustained framerate: **60 fps desktop**, **30 fps mobile** minimum
- Asset budget: total `/public/media` under **40 MB** across all tiers

Profile with `next build` bundle analyzer and Chrome DevTools Performance tab before merging anything that touches the scene.

---

## Do not

- Add HTML elements inside `<Canvas>`
- Hardcode media paths outside the manifest
- Ship the full Three.js bundle to low-tier users
- Use any image format other than `.webp` or `.avif` for photos
- Add new dependencies without first checking bundle-size impact (use bundlephobia)
- Autoplay audio without a user gesture — the loading screen tap is the unlock
- Use `next/image` for textures inside the canvas (it interferes with R3F loaders)
- Commit anything to `/public/media/` larger than the asset spec in `SPECS.md`

---

## Where to put things

| If you are adding... | Put it in... |
|---|---|
| A new scene component | `src/components/scene/` |
| A new HTML overlay or modal | `src/components/ui/` |
| Shared state (across canvas/HTML) | `src/stores/sceneStore.ts` |
| A custom hook | `src/hooks/` |
| A new media item | `/public/media/{images\|videos\|audio}/`, then register in manifest |
| Story prose | `src/content/story.mdx` |
| Couple names, date, gift URLs | `src/lib/constants.ts` |
| A GLSL shader | `src/lib/shaders/` |
| A type used in 2+ files | `src/types/index.ts` |

---

## Acceptance criteria for any change

A pull request is ready when:

1. `npm run typecheck && npm run lint && npm run build` all pass
2. The change works on Chrome desktop, Safari iOS (real device or simulator), and respects `prefers-reduced-motion`
3. New media is registered in the manifest with alt text
4. No regression in bundle size or LCP beyond the budget
5. If the change touches the scene, it's been verified at all three device tiers
