'use client';

import { Billboard, useVideoTexture } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';

import { PALETTE } from '@/lib/constants';
import { useSceneStore } from '@/stores/sceneStore';
import type { VideoItem, WithPosition } from '@/types';

const HOVER_SCALE = 1.12;
const BASE_HEIGHT = 1.7;
const SCALE_LERP = 0.14;

/**
 * Looping muted video on a textured plane — visually the same as PhotoCard
 * but the texture is a VideoTexture that plays in-place. On focus, the
 * FocusedCardModal opens with full controls and unmutes when `hasAudio`.
 *
 * SPECS.md §5.1 prescribes "paused on poster until focused" for mobile data
 * conservation; that polish lands in Phase 4 — for now the video autoplays
 * muted, which all browsers permit without a user gesture.
 */
export function VideoCard({ item }: { item: WithPosition<VideoItem> }) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useVideoTexture(item.src, {
    muted: true,
    loop: true,
    start: true,
    crossOrigin: 'anonymous',
    playsInline: true,
  });
  const setFocusedCard = useSceneStore((state) => state.setFocusedCard);
  const isFocused = useSceneStore((state) => state.focusedCardId === item.id);
  const [hovered, setHovered] = useState(false);

  // Video has no intrinsic width/height in our manifest — use a 16:9
  // default unless the item declares its own via `scale` (we treat scale as
  // an extra multiplier on a fixed landscape aspect for now).
  const aspect = 16 / 9;
  const height = BASE_HEIGHT * (item.scale ?? 1);
  const width = height * aspect;

  const seedX = item.position[0];

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;
    const t = state.clock.elapsedTime;
    // Position bob is a local offset relative to the Billboard's world position.
    // Rotation intentionally omitted — Billboard handles camera-facing.
    group.position.y = Math.sin(t * 0.4 + seedX) * 0.08;

    const targetScale = hovered || isFocused ? HOVER_SCALE : 1;
    const current = group.scale.x;
    const next = current + (targetScale - current) * SCALE_LERP;
    group.scale.setScalar(next);
  });

  const handleOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handleOut = () => {
    setHovered(false);
    document.body.style.cursor = '';
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    setFocusedCard(item.id);
  };

  return (
    // Billboard keeps the card facing the camera even as CloudRig rotates.
    <Billboard position={item.position}>
      <group ref={groupRef}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[width + 0.09, height + 0.09]} />
          <meshBasicMaterial
            color={PALETTE.peach}
            transparent
            opacity={hovered || isFocused ? 0.85 : 0.45}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        <mesh>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>

        <mesh
          position={[0, 0, 0.01]}
          onPointerOver={handleOver}
          onPointerOut={handleOut}
          onClick={handleClick}
        >
          <planeGeometry args={[width * 1.5, height * 1.5]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </Billboard>
  );
}
