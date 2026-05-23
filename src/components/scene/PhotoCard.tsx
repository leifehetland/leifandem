'use client';

import { Billboard, useTexture } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';

import { PALETTE } from '@/lib/constants';
import { useSceneStore } from '@/stores/sceneStore';
import type { PhotoItem, WithPosition } from '@/types';

const HOVER_SCALE = 1.12;
const BASE_HEIGHT = 1.7;
const SCALE_LERP = 0.14;

/**
 * Photo as a textured plane with a glowing cyan border behind it. The whole
 * group drifts on a slow sine and scales up on hover/focus. An invisible
 * 1.5× collider sits in front to make tapping forgiving on mobile.
 *
 * Per CLAUDE.md: no HTML, no Tailwind inside the canvas.
 */
export function PhotoCard({ item }: { item: WithPosition<PhotoItem> }) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useTexture(item.src);
  const setFocusedCard = useSceneStore((state) => state.setFocusedCard);
  const isFocused = useSceneStore((state) => state.focusedCardId === item.id);
  const [hovered, setHovered] = useState(false);

  const aspect = item.width / item.height;
  const height = BASE_HEIGHT * (item.scale ?? 1);
  const width = height * aspect;

  // Drift seed derived from initial position so each card bobs differently.
  const seedX = item.position[0];

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;

    const t = state.clock.elapsedTime;
    // Position bob is a local offset relative to the Billboard's world position.
    // Rotation is intentionally omitted — Billboard handles camera-facing.
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
        {/* Glowing border — sits behind the photo with additive blending. */}
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

        {/* The photo itself. */}
        <mesh>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>

        {/* Invisible enlarged hit collider for easier tapping. */}
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
