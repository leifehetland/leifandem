'use client';

import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';

import { PALETTE } from '@/lib/constants';
import { useSceneStore } from '@/stores/sceneStore';
import type { AudioItem } from '@/types';

const HOVER_SCALE = 1.18;
const BASE_RADIUS = 0.42;
const SCALE_LERP = 0.14;
const PULSE_SPEED = 1.8;

/**
 * Glowing icosphere. Bloom does the heavy lifting visually — we just
 * modulate emissive intensity + scale on a sine so the orb breathes.
 *
 * Real audio-amplitude reactivity (SPECS §4 high-tier only) is wired in
 * Phase 4 alongside Howler playback. The current pulse is a stand-in.
 */
export function AudioOrb({ item }: { item: AudioItem }) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const setFocusedCard = useSceneStore((state) => state.setFocusedCard);
  const isFocused = useSceneStore((state) => state.focusedCardId === item.id);
  const [hovered, setHovered] = useState(false);

  const color = item.color ?? PALETTE.peach;
  const radius = BASE_RADIUS * (item.scale ?? 1);
  const seed = item.position[0] + item.position[1];

  useFrame((state) => {
    const group = groupRef.current;
    const material = matRef.current;
    if (!group || !material) return;

    const t = state.clock.elapsedTime;
    const pulse = 0.5 + 0.5 * Math.sin(t * PULSE_SPEED + seed);

    // Emissive breathes between 1.4 and 2.6 — bloom will catch the peaks.
    material.emissiveIntensity = 1.4 + pulse * 1.2;

    // Slight position bob so it doesn't feel pinned.
    group.position.y = item.position[1] + Math.sin(t * 0.6 + seed) * 0.05;

    const targetScale = (hovered || isFocused ? HOVER_SCALE : 1) * (0.96 + pulse * 0.08);
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
    <group ref={groupRef} position={item.position} rotation={item.rotation ?? [0, 0, 0]}>
      <mesh>
        <icosahedronGeometry args={[radius, 2]} />
        <meshStandardMaterial
          ref={matRef}
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          metalness={0.1}
          roughness={0.35}
          toneMapped={false}
        />
      </mesh>

      {/* Soft additive halo so the orb reads even at idle. */}
      <mesh>
        <sphereGeometry args={[radius * 1.5, 24, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Larger invisible hit collider. */}
      <mesh onPointerOver={handleOver} onPointerOut={handleOut} onClick={handleClick}>
        <sphereGeometry args={[radius * 2.2, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
