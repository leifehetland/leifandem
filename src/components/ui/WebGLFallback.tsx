'use client';

import { Music } from 'lucide-react';

import { mediaItems } from '@/lib/media-manifest';
import { useSceneStore } from '@/stores/sceneStore';
import type { MediaItem } from '@/types';

/**
 * 2D CSS-grid fallback for `tier === 'low'`. Renders only photo/video
 * posters as plain `<img>` cards and audio items as gradient buttons.
 * Every card opens the same FocusedCardModal that the canvas uses, so
 * the experience is parallel — not an apology.
 *
 * Returns null on `'high' | 'mid'` so the canvas owns the screen.
 */
export function WebGLFallback() {
  const tier = useSceneStore((state) => state.tier);
  const setFocusedCard = useSceneStore((state) => state.setFocusedCard);

  if (tier !== 'low') return null;

  return (
    <section
      aria-label="Photo gallery"
      className="relative z-10 mx-auto grid w-full max-w-5xl gap-4 px-4 py-32 sm:grid-cols-2 lg:grid-cols-3"
    >
      {mediaItems.map((item) => (
        <FallbackCard
          key={item.id}
          item={item}
          onOpen={() => setFocusedCard(item.id)}
        />
      ))}
    </section>
  );
}

function FallbackCard({ item, onOpen }: { item: MediaItem; onOpen: () => void }) {
  const label =
    item.type === 'audio' ? item.label : item.caption.replace(/—.*$/, '').trim() || item.alt;

  if (item.type === 'audio') {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Play ${item.label}`}
        className="group flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-cyan-glow/25 bg-gradient-to-br from-cyan-glow/8 via-transparent to-magenta-glow/8 p-6 text-cyan-glow transition hover:border-cyan-glow/50"
      >
        <Music size={28} aria-hidden="true" />
        <span className="text-sm tracking-wide">{item.label}</span>
      </button>
    );
  }

  // Photos and videos use the same visual card: a poster image + caption.
  const posterSrc = item.type === 'video' ? item.poster : item.src;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative overflow-hidden rounded-2xl border border-ink/10 bg-ink/[3%] text-left shadow-sm transition hover:border-cyan-glow/35"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterSrc}
        alt={item.alt}
        className="aspect-[4/5] w-full object-cover transition group-hover:scale-[1.03]"
        loading="lazy"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-void/90 via-void/30 to-transparent p-3">
        <p className="text-sm text-ink/80">{label}</p>
      </div>
    </button>
  );
}
