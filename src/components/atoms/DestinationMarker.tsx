import * as React from 'react';
import { cn } from '@/lib/utils';

interface DestinationMarkerProps {
  /** Optional className */
  className?: string;
}

/**
 * DestinationMarker atom component.
 * Circular marker with red background and light red outer ring.
 * Used in pickup route to indicate destination point.
 */
export default function DestinationMarker({
  className,
}: DestinationMarkerProps): React.JSX.Element {
  return (
    <div className={cn('relative flex h-3 w-3 items-center justify-center', className)}>
      <div className="absolute h-4 w-4 flex items-center justify-center bg-red-50 rounded-full">
        <div className="h-3 w-3 rounded-full border border-gray-200 bg-primary-500" />
      </div>
    </div>
  );
}
