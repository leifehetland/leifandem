/**
 * lucide-react@0.400.0 ships without declaration files. The icons we use
 * are typed minimally here so consumers get prop completion without us
 * having to vendor the upstream types.
 *
 * If/when we bump lucide-react past a version that ships its own `.d.ts`,
 * this file can be deleted.
 */
declare module 'lucide-react' {
  import type { ComponentType, SVGProps } from 'react';

  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
  }

  export type LucideIcon = ComponentType<LucideProps>;

  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Music: LucideIcon;
  export const Volume2: LucideIcon;
  export const VolumeX: LucideIcon;
  export const X: LucideIcon;
}
