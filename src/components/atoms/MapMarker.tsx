import * as React from 'react';
import { cn } from '@/lib/utils';

interface MapMarkerProps {
  /** Whether this marker is active (uses accent color) */
  isActive?: boolean;
  /** Optional className */
  className?: string;
}

/**
 * MapMarker atom component.
 * Circular marker with white inner fill and dark outer ring.
 * Active markers use the accent color (primary-500).
 * Matches Figma design 3838-22127.
 */
export default function MapMarker({
  isActive = false,
  className,
}: MapMarkerProps): React.JSX.Element {
  return (
    <div className={cn('relative flex h-4 w-4 items-center justify-center', className)}>
      {/* Outer ring */}
      <div
        className={cn(
          'absolute h-4 w-4 rounded-full border-2',
          isActive ? 'border-primary-500' : 'border-gray-900'
        )}
      />
      {/* Inner white fill */}
      <div className="absolute h-2 w-2 rounded-full bg-white" />
    </div>
  );
}
