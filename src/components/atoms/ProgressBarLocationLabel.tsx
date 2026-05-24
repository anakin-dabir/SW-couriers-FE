import * as React from 'react';
import { Typography } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface ProgressBarLocationLabelProps {
  /** Location text */
  location: string;
  /** Whether this location is active */
  isActive: boolean;
  /** Whether this is the first location */
  isFirst: boolean;
  /** Whether this is the last location */
  isLast: boolean;
  /** Optional className */
  className?: string;
}

/**
 * ProgressBarLocationLabel atom component.
 * Displays a single location label above the progress bar.
 */
export default function ProgressBarLocationLabel({
  location,
  isActive,
  isFirst,
  isLast,
  className,
}: ProgressBarLocationLabelProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col items-center',
        isFirst && 'items-start',
        isLast && 'items-end',
        className
      )}
    >
      <Typography
        variant="caption"
        className={cn(
          'text-sm text-center',
          isActive ? 'text-gray-900 font-medium' : 'text-gray-500'
        )}
      >
        {location}
      </Typography>
    </div>
  );
}
